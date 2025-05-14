
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { sanitizeFileName } from '@/lib/stringUtils';

export const BUCKET_NAME = 'user_files_bucket';

export const fetchFilesAndFolders = async (userId) => {
  if (!userId) return { files: [], filesError: null, folders: [], foldersError: null };

  const { data: files, error: filesError } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', userId) 
    .order('created_at', { ascending: false });

  const { data: folders, error: foldersError } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { files: files || [], filesError, folders: folders || [], foldersError };
};

export const createFile = async (fileData, userId) => {
  if (!userId) return { error: { message: "User not authenticated" } };
  let storagePath = null;
  let publicURL = null;
  let fileContentForPreview = null;
  let actualFileToUpload = null;

  if (fileData.uploadedFile instanceof File) {
    actualFileToUpload = fileData.uploadedFile;
  }

  const originalName = actualFileToUpload ? actualFileToUpload.name : fileData.name;
  
  if (!originalName || originalName.trim() === "") {
    return { error: { message: "File name cannot be empty." } };
  }
  const sanitizedOriginalName = sanitizeFileName(originalName);


  if (actualFileToUpload) {
    const file = actualFileToUpload;
    const fileNameInStorage = `${userId}/${uuidv4()}-${sanitizedOriginalName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileNameInStorage, file);

    if (uploadError) {
      console.error('Error uploading file to Supabase Storage:', uploadError);
      return { error: uploadError };
    }
    storagePath = uploadData.path;

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    publicURL = urlData.publicUrl;
    
    if (file.type.startsWith('image/')) {
      fileContentForPreview = publicURL;
    } else if (file.type === 'application/pdf') {
      fileContentForPreview = publicURL;
    }
  }

  const newFile = {
    name: sanitizedOriginalName,
    type: actualFileToUpload ? actualFileToUpload.type : fileData.type,
    size: actualFileToUpload ? actualFileToUpload.size : 0,
    is_uploaded: !!actualFileToUpload,
    storage_path: storagePath,
    user_id: userId,
    folder_id: fileData.parent_folder_id || null,
  };

  const { data: insertedFile, error } = await supabase
    .from('files')
    .insert([newFile])
    .select()
    .single();

  if (error) {
    console.error('Error adding file to Supabase:', error);
    if (storagePath) { 
      await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    }
    return { error };
  }
  return { data: { ...insertedFile, content: fileContentForPreview } };
};

export const createFolder = async (folderData, userId) => {
  if (!userId) return { error: { message: "User not authenticated" } };
  if (!folderData.name || folderData.name.trim() === "") {
    return { error: { message: "Folder name cannot be empty." } };
  }
  const newFolder = {
    name: folderData.name,
    user_id: userId,
    parent_folder_id: folderData.parent_folder_id || null,
  };
  const { data: insertedFolder, error } = await supabase
    .from('folders')
    .insert([newFolder])
    .select()
    .single();

  if (error) {
    console.error('Error adding folder to Supabase:', error);
    return { error };
  }
  return { data: insertedFolder };
};

export const removeFile = async (fileId, storagePathToDelete) => {
  if (storagePathToDelete) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePathToDelete]);
    if (storageError) {
      console.error('Error deleting file from Supabase Storage:', storageError);
    }
  }

  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

  if (dbError) {
    console.error('Error deleting file from Supabase DB:', dbError);
    return { error: dbError };
  }
  return { data: { id: fileId } };
};

export const removeFolder = async (folderId) => {
  const { data: filesInFolder, error: filesError } = await supabase
    .from('files')
    .select('id, storage_path')
    .eq('folder_id', folderId);

  if (filesError) {
    console.error('Error fetching files in folder for deletion:', filesError);
    return { error: filesError };
  }

  if (filesInFolder && filesInFolder.length > 0) {
    const fileIdsToDelete = filesInFolder.map(f => f.id);
    const storagePathsToDelete = filesInFolder.filter(f => f.storage_path).map(f => f.storage_path);
    
    if (storagePathsToDelete.length > 0) {
      const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove(storagePathsToDelete);
      if (storageError) console.error('Error deleting files from storage during folder deletion:', storageError);
    }
    
    const { error: dbFilesError } = await supabase.from('files').delete().in('id', fileIdsToDelete);
    if (dbFilesError) console.error('Error deleting files from DB during folder deletion:', dbFilesError);
  }

  const { data: subfolders, error: subfoldersError } = await supabase
    .from('folders')
    .select('id')
    .eq('parent_folder_id', folderId);

  if (subfoldersError) {
    console.error('Error fetching subfolders for deletion:', subfoldersError);
    return { error: subfoldersError };
  }

  if (subfolders && subfolders.length > 0) {
    for (const subfolder of subfolders) {
      await removeFolder(subfolder.id); 
    }
  }

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId);

  if (error) {
    console.error('Error deleting folder from Supabase:', error);
    return { error };
  }
  return { data: { id: folderId } };
};

export const starItem = async (id, type, currentStarredState) => {
  const tableName = type === 'file' ? 'files' : 'folders';
  const newStarredState = !currentStarredState;

  const { data, error } = await supabase
    .from(tableName)
    .update({ starred: newStarredState })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error toggling star for ${type}:`, error);
    return { error };
  }
  return { data };
};

export const updateFileName = async (fileId, newName) => {
  if (!newName || newName.trim() === "") {
    return { error: { message: "File name cannot be empty." } };
  }
  const { data, error } = await supabase
    .from('files')
    .update({ name: newName })
    .eq('id', fileId)
    .select()
    .single();
  
  if (error) {
    console.error('Error renaming file in Supabase:', error);
    return { error };
  }
  return { data };
};

export const updateFolderName = async (folderId, newName) => {
  if (!newName || newName.trim() === "") {
    return { error: { message: "Folder name cannot be empty." } };
  }
  const { data, error } = await supabase
    .from('folders')
    .update({ name: newName })
    .eq('id', folderId)
    .select()
    .single();

  if (error) {
    console.error('Error renaming folder in Supabase:', error);
    return { error };
  }
  return { data };
};

export const moveFilesToFolder = async (fileIds, targetFolderId, userId) => {
  if (!fileIds || fileIds.length === 0) {
    return { error: { message: "No files selected to move." } };
  }
  if (!userId) {
    return { error: { message: "User not authenticated for moving files."}};
  }

  const results = [];
  let overallError = null;

  for (const fileId of fileIds) {
    const { data, error } = await supabase
      .from('files')
      .update({ folder_id: targetFolderId })
      .eq('id', fileId)
      .eq('user_id', userId) 
      .select()
      .single(); 
      
    if (error) {
      console.error(`Error moving file ${fileId} to folder:`, error);
      overallError = error; 
    } else if (data) {
      results.push(data);
    }
  }

  if (overallError && results.length === 0) {
    return { error: overallError };
  }
  
  return { data: results, error: overallError ? { message: "Some files could not be moved. Check console for details." } : null };
};
