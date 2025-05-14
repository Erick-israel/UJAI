
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  fetchFilesAndFolders as apiFetchFilesAndFolders,
  createFile as apiCreateFile,
  createFolder as apiCreateFolder,
  removeFile as apiRemoveFile,
  removeFolder as apiRemoveFolder,
  starItem as apiStarItem,
  updateFileName as apiUpdateFileName,
  updateFolderName as apiUpdateFolderName,
  moveFilesToFolder as apiMoveFilesToFolder,
} from '@/contexts/fileActions';

const TRASH_LOCAL_STORAGE_KEY = 'appTrash';

export const useFileManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) {
      setFiles([]);
      setFolders([]);
      setTrash([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { files: fetchedFiles, filesError, folders: fetchedFolders, foldersError } = await apiFetchFilesAndFolders(user.id);
    
    if (filesError) toast({ title: "Error al cargar archivos", description: filesError.message, variant: "destructive" });
    if (foldersError) toast({ title: "Error al cargar carpetas", description: foldersError.message, variant: "destructive" });
    
    setFiles(fetchedFiles || []);
    setFolders(fetchedFolders || []);
    
    try {
      const storedTrash = localStorage.getItem(TRASH_LOCAL_STORAGE_KEY);
      if (storedTrash) {
        const parsedTrash = JSON.parse(storedTrash);
        if (Array.isArray(parsedTrash)) {
          setTrash(parsedTrash);
        } else {
          setTrash([]);
        }
      } else {
        setTrash([]);
      }
    } catch (e) {
      console.error("Error parsing trash from localStorage during initial load", e);
      localStorage.removeItem(TRASH_LOCAL_STORAGE_KEY);
      setTrash([]);
    }

    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (trash !== undefined && trash !== null) {
      localStorage.setItem(TRASH_LOCAL_STORAGE_KEY, JSON.stringify(trash));
    }
  }, [trash]);

  const addFile = async (fileData) => {
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para añadir archivos.", variant: "destructive" });
      return { data: null, error: { message: "User not authenticated" } };
    }
    const { data, error } = await apiCreateFile(fileData, user.id);
    if (error) {
      toast({ title: "Error al añadir archivo", description: error.message, variant: "destructive" });
    } else if (data) {
      setFiles(prev => [data, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      toast({ title: "Archivo añadido", description: `${data.name} ha sido añadido.` });
    }
    return { data, error };
  };

  const addFolder = async (folderData) => {
     if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para añadir carpetas.", variant: "destructive" });
      return { data: null, error: { message: "User not authenticated" } };
    }
    const { data, error } = await apiCreateFolder(folderData, user.id);
    if (error) {
      toast({ title: "Error al añadir carpeta", description: error.message, variant: "destructive" });
    } else if (data) {
      setFolders(prev => [data, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      toast({ title: "Carpeta añadida", description: `${data.name} ha sido añadida.` });
    }
    return { data, error };
  };

  const deleteFileFromSupabase = async (fileId, storagePath) => {
    const { error } = await apiRemoveFile(fileId, storagePath);
    if (error) {
      toast({ title: "Error al eliminar archivo de Supabase", description: error.message, variant: "destructive" });
    }
    return { error };
  };
  
  const deleteFolderFromSupabase = async (folderId) => {
    const { error } = await apiRemoveFolder(folderId);
    if (error) {
      toast({ title: "Error al eliminar carpeta de Supabase", description: error.message, variant: "destructive" });
    }
    return { error };
  };

  const toggleStarFile = async (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return {error: {message: "File not found"}};
    const { data, error } = await apiStarItem(fileId, 'file', file.starred);
    if (error) {
      toast({ title: "Error al destacar archivo", description: error.message, variant: "destructive" });
    } else if (data) {
      setFiles(prev => prev.map(f => f.id === fileId ? data : f));
      toast({ title: data.starred ? "Archivo destacado" : "Archivo no destacado" });
    }
    return {data, error};
  };

  const toggleStarFolder = async (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return {error: {message: "Folder not found"}};
    const { data, error } = await apiStarItem(folderId, 'folder', folder.starred);
    if (error) {
      toast({ title: "Error al destacar carpeta", description: error.message, variant: "destructive" });
    } else if (data) {
      setFolders(prev => prev.map(f => f.id === folderId ? data : f));
      toast({ title: data.starred ? "Carpeta destacada" : "Carpeta no destacada" });
    }
    return {data, error};
  };
  
  const renameFile = async (fileId, newName) => {
    const fileToRename = files.find(f => f.id === fileId);
    if (!fileToRename) return { error: { message: "File not found for renaming."}};

    const { data, error } = await apiUpdateFileName(fileId, newName);
    if (error) {
      toast({ title: "Error al renombrar archivo", description: error.message, variant: "destructive" });
    } else if (data) {
      setFiles(prev => prev.map(f => f.id === fileId ? {...f, ...data} : f).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      toast({ title: "Archivo renombrado", description: `El archivo ha sido renombrado a ${data.name}.` });
    }
    return {data, error};
  };

  const renameFolder = async (folderId, newName) => {
    const folderToRename = folders.find(f => f.id === folderId);
    if (!folderToRename) return { error: { message: "Folder not found for renaming."}};

    const { data, error } = await apiUpdateFolderName(folderId, newName);
    if (error) {
      toast({ title: "Error al renombrar carpeta", description: error.message, variant: "destructive" });
    } else if (data) {
      setFolders(prev => prev.map(f => f.id === folderId ? {...f, ...data} : f).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      toast({ title: "Carpeta renombrada", description: `La carpeta ha sido renombrada a ${data.name}.` });
    }
    return {data, error};
  };

  const moveFilesToFolder = async (fileIds, targetFolderId) => {
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para mover archivos.", variant: "destructive" });
      return { data: null, error: { message: "User not authenticated" } };
    }
    const { data, error } = await apiMoveFilesToFolder(fileIds, targetFolderId, user.id);
    if (error) {
      toast({ title: "Error al mover archivos", description: error.message, variant: "destructive" });
    } else if (data && data.length > 0) {
      setFiles(prevFiles => 
        prevFiles.map(file => 
          fileIds.includes(file.id) ? { ...file, folder_id: targetFolderId, updated_at: data.find(d => d.id === file.id)?.updated_at || new Date().toISOString() } : file
        )
      );
      toast({ title: "Archivos movidos", description: `${data.length} archivo(s) movido(s) exitosamente.` });
    } else if (data && data.length === 0 && !error) {
        toast({ title: "Archivos no movidos", description: "Ningún archivo fue afectado. Puede que ya estuvieran en la carpeta o no se encontraron.", variant: "default" });
    }
    return { data, error };
  };

  return {
    files,
    setFiles,
    folders,
    setFolders,
    trash,
    setTrash,
    loading,
    addFile,
    addFolder,
    deleteFileFromSupabase,
    deleteFolderFromSupabase,
    toggleStarFile,
    toggleStarFolder,
    renameFile,
    renameFolder,
    moveFilesToFolder,
  };
};
