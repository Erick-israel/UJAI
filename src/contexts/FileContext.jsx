
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useFileManagement } from './hooks/useFileManagement';
import { useFileFiltering } from './hooks/useFileFiltering';
import { useTrashInteractions } from './hooks/useTrashInteractions';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const FileContext = createContext();

export const useFiles = () => useContext(FileContext);

const TRASH_LOCAL_STORAGE_KEY = 'appTrash';

export const FileProvider = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentFolderId, setCurrentFolderIdState] = useState(null); 
  
  const {
    files,
    setFiles,
    folders,
    setFolders,
    trash, 
    setTrash, 
    loading,
    addFile: apiAddFile,
    addFolder: apiAddFolder,
    deleteFileFromSupabase,
    deleteFolderFromSupabase,
    toggleStarFile,
    toggleStarFolder,
    renameFile: apiRenameFile,
    renameFolder: apiRenameFolder,
    moveFilesToFolder: apiMoveFilesToFolder,
  } = useFileManagement();

  const {
    filteredFiles,
    filteredFolders,
    searchQuery,
    setSearchQuery,
    searchFilesAndFolders,
    currentFilters,
    applyFilters,
  } = useFileFiltering(files, folders, currentFolderId);


  const {
    moveToTrashHandler,
    restoreItemHandler,
    deleteItemPermanentlyHandler,
  } = useTrashInteractions(trash, setTrash, setFiles, setFolders, toast);


  useEffect(() => {
    const storedTrash = localStorage.getItem(TRASH_LOCAL_STORAGE_KEY);
    if (storedTrash) {
      try {
        const parsedTrash = JSON.parse(storedTrash);
        if (Array.isArray(parsedTrash)) {
          setTrash(parsedTrash);
        } else {
          setTrash([]);
        }
      } catch (e) {
        console.error("Error parsing trash from localStorage", e);
        localStorage.removeItem(TRASH_LOCAL_STORAGE_KEY);
        setTrash([]);
      }
    } else {
      setTrash([]);
    }
  }, [setTrash]);

  useEffect(() => {
    if (trash !== undefined && trash !== null) {
      localStorage.setItem(TRASH_LOCAL_STORAGE_KEY, JSON.stringify(trash));
    }
  }, [trash]);

  const actualDeleteFileHandler = async (id) => {
    const fileToDelete = files.find(file => file.id === id);
    if (!fileToDelete) return;
    
    const { error } = await deleteFileFromSupabase(id, fileToDelete.storage_path);
    if (!error) {
      moveToTrashHandler(fileToDelete, 'file');
    } else {
      toast({ title: "Error al eliminar archivo de Supabase", description: error.message, variant: "destructive" });
    }
  };

  const actualDeleteFolderHandler = async (id) => {
    const folderToDelete = folders.find(folder => folder.id === id);
    if (!folderToDelete) return;

    const { error } = await deleteFolderFromSupabase(id);
    if (!error) {
      moveToTrashHandler(folderToDelete, 'folder');
    } else {
      toast({ title: "Error al eliminar carpeta de Supabase", description: error.message, variant: "destructive" });
    }
  };

  const addFile = useCallback(async (fileData) => {
    if (!user) return { error: { message: "User not authenticated" } };
    const filePayload = { ...fileData, parent_folder_id: currentFolderId };
    return await apiAddFile(filePayload);
  }, [apiAddFile, currentFolderId, user]);

  const addFolder = useCallback(async (folderData) => {
    if (!user) return { error: { message: "User not authenticated" } };
    const folderPayload = { ...folderData, parent_folder_id: currentFolderId };
    return await apiAddFolder(folderPayload);
  }, [apiAddFolder, currentFolderId, user]);

  const renameFile = useCallback(async (fileId, newName) => {
    return await apiRenameFile(fileId, newName);
  }, [apiRenameFile]);

  const renameFolder = useCallback(async (folderId, newName) => {
    return await apiRenameFolder(folderId, newName);
  }, [apiRenameFolder]);

  const moveFilesToFolder = useCallback(async (fileIds, targetFolderId) => {
    if (!user) return { error: { message: "User not authenticated" } };
    return await apiMoveFilesToFolder(fileIds, targetFolderId, user.id);
  }, [apiMoveFilesToFolder, user]);


  const getFolderById = useCallback((id) => {
    return folders.find(f => f.id === id);
  }, [folders]);

  const getFilesByFolderId = useCallback((folderId) => {
    return files.filter(f => f.folder_id === folderId);
  }, [files]);

  const getSubfoldersByFolderId = useCallback((folderId) => {
    return folders.filter(f => f.parent_folder_id === folderId);
  }, [folders]);
  
  const setCurrentFolderId = useCallback((id) => {
    setCurrentFolderIdState(id);
  }, []);


  return (
    <FileContext.Provider
      value={{
        files: filteredFiles, 
        folders: filteredFolders, 
        allFiles: files, 
        allFolders: folders, 
        trash,
        loading,
        addFile,
        addFolder,
        deleteFile: actualDeleteFileHandler,
        deleteFolder: actualDeleteFolderHandler,
        toggleStarFile,
        toggleStarFolder,
        renameFile,
        renameFolder,
        moveFilesToFolder,
        searchQuery,
        setSearchQuery,
        searchFilesAndFolders,
        currentFilters,
        applyFilters,
        restoreItem: restoreItemHandler,
        deleteItemPermanently: deleteItemPermanentlyHandler,
        currentFolderId,
        setCurrentFolderId,
        getFolderById,
        getFilesByFolderId,
        getSubfoldersByFolderId,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};
