
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  fetchFilesAndFolders,
  createFile,
  createFolder,
  removeFile,
  removeFolder,
  starItem,
  updateFileName,
  updateFolderName,
} from './fileActions';
import { useAuth } from './AuthContext';

export const useFileManagement = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadData = useCallback(async () => {
    if (!user) {
      setFiles([]);
      setFolders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { files: fetchedFiles, filesError, folders: fetchedFolders, foldersError } = await fetchFilesAndFolders(user.id);

    if (filesError) {
      toast({ title: "Error al cargar archivos", description: filesError.message, variant: "destructive" });
    } else {
      setFiles(fetchedFiles || []);
    }

    if (foldersError) {
      toast({ title: "Error al cargar carpetas", description: foldersError.message, variant: "destructive" });
    } else {
      setFolders(fetchedFolders || []);
    }
    setLoading(false);
  }, [toast, user]);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setFiles([]);
      setFolders([]);
      setLoading(false);
    }
    const savedTrash = localStorage.getItem('trash');
    if (savedTrash) {
      try {
        setTrash(JSON.parse(savedTrash));
      } catch (e) {
        localStorage.removeItem('trash');
      }
    }
  }, [loadData, user]);
  
  useEffect(() => {
    if (trash.length > 0) {
      localStorage.setItem('trash', JSON.stringify(trash.map(t => ({...t, content: null}))));
    } else {
      localStorage.removeItem('trash');
    }
  }, [trash]);

  const addFileHandler = async (fileData) => {
    if (!user) return;
    const { data: insertedFile, error } = await createFile(fileData, user.id);
    if (error) {
      toast({ title: "Error al crear archivo", description: error.message, variant: "destructive" });
    } else if (insertedFile) {
      setFiles(prevFiles => [insertedFile, ...prevFiles].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      toast({ title: "Archivo creado", description: "El archivo se ha guardado." });
    }
  };

  const addFolderHandler = async (folderData) => {
    if (!user) return;
    const { data: insertedFolder, error } = await createFolder(folderData, user.id);
    if (error) {
      toast({ title: "Error al crear carpeta", description: error.message, variant: "destructive" });
    } else if (insertedFolder) {
      setFolders(prevFolders => [insertedFolder, ...prevFolders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      toast({ title: "Carpeta creada", description: "La carpeta se ha guardado." });
    }
  };

  const deleteFileHandler = async (id) => {
    const fileToDelete = files.find(file => file.id === id);
    if (!fileToDelete) return;

    const { data, error } = await removeFile(id, fileToDelete.storage_path);
    if (error) {
      toast({ title: "Error al eliminar archivo", description: error.message, variant: "destructive" });
    } else if (data) {
      setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
      setTrash(prevTrash => [{ ...fileToDelete, deletedAt: new Date().toISOString(), itemType: 'file' }, ...prevTrash]);
      toast({ title: "Archivo eliminado", description: "Movido a la papelera (local)." });
    }
  };

  const deleteFolderHandler = async (id) => {
    const folderToDelete = folders.find(folder => folder.id === id);
    if (!folderToDelete) return;

    const { data, error } = await removeFolder(id);
    if (error) {
      toast({ title: "Error al eliminar carpeta", description: error.message, variant: "destructive" });
    } else if (data) {
      setFolders(prevFolders => prevFolders.filter(folder => folder.id !== id));
      setTrash(prevTrash => [{ ...folderToDelete, deletedAt: new Date().toISOString(), itemType: 'folder' }, ...prevTrash]);
      toast({ title: "Carpeta eliminada", description: "Movida a la papelera (local)." });
    }
  };
  
  const toggleStarHandler = async (id, type) => {
    const collection = type === 'file' ? files : folders;
    const setCollection = type === 'file' ? setFiles : setFolders;
    
    const item = collection.find(i => i.id === id);
    if (!item) return;

    const { data: updatedItem, error } = await starItem(id, type, item.starred);
    if (error) {
      toast({ title: `Error al ${item.starred ? 'quitar destaque' : 'destacar'}`, description: error.message, variant: "destructive" });
    } else if (updatedItem) {
      setCollection(prevItems => prevItems.map(i => i.id === id ? updatedItem : i));
      toast({ title: `${type === 'file' ? 'Archivo' : 'Carpeta'} ${updatedItem.starred ? 'destacado/a' : 'sin destacar'}` });
    }
  };

  const renameFileHandler = async (id, newName) => {
    const fileToUpdate = files.find(f => f.id === id);
    if (!fileToUpdate) return;

    const { data: updatedFile, error } = await updateFileName(id, newName);
    if (error) {
      toast({ title: "Error al renombrar archivo", description: error.message, variant: "destructive" });
    } else if (updatedFile) {
      setFiles(prevFiles => prevFiles.map(f => f.id === id ? {...fileToUpdate, ...updatedFile, name: newName} : f));
      toast({ title: "Archivo renombrado", description: `El archivo ahora se llama "${updatedFile.name}".` });
    }
  };

  const renameFolderHandler = async (id, newName) => {
    const folderToUpdate = folders.find(f => f.id === id);
    if (!folderToUpdate) return;

    const { data: updatedFolder, error } = await updateFolderName(id, newName);
    if (error) {
      toast({ title: "Error al renombrar carpeta", description: error.message, variant: "destructive" });
    } else if (updatedFolder) {
      setFolders(prevFolders => prevFolders.map(f => f.id === id ? {...folderToUpdate, ...updatedFolder, name: newName} : f));
      toast({ title: "Carpeta renombrada", description: `La carpeta ahora se llama "${updatedFolder.name}".` });
    }
  };

  return {
    files,
    setFiles,
    folders,
    setFolders,
    trash,
    setTrash,
    loading,
    addFile: addFileHandler,
    addFolder: addFolderHandler,
    deleteFile: deleteFileHandler,
    deleteFolder: deleteFolderHandler,
    toggleStarFile: (id) => toggleStarHandler(id, 'file'),
    toggleStarFolder: (id) => toggleStarHandler(id, 'folder'),
    renameFile: renameFileHandler,
    renameFolder: renameFolderHandler,
  };
};

export const useFileFiltering = (files, folders) => {
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [filteredFolders, setFilteredFolders] = useState(folders);

  useEffect(() => {
    setFilteredFiles(files);
  }, [files]);

  useEffect(() => {
    setFilteredFolders(folders);
  }, [folders]);

  const searchFilesAndFolders = (query) => {
    if (!query) {
      setFilteredFiles(files);
      setFilteredFolders(folders);
      return;
    }
    const lowercaseQuery = query.toLowerCase();
    setFilteredFiles(files.filter(file => file.name.toLowerCase().includes(lowercaseQuery)));
    setFilteredFolders(folders.filter(folder => folder.name.toLowerCase().includes(lowercaseQuery)));
  };

  return {
    filteredFiles,
    filteredFolders,
    searchFilesAndFolders,
  };
};

export const useTrashManagement = (trash, setTrash, setFiles, setFolders, toast) => {
  const restoreItem = (id) => {
    const itemToRestore = trash.find(item => item.id === id);
    if (itemToRestore) {
      const { deletedAt, itemType, ...restoredItemData } = itemToRestore;
      if (itemType === 'file') {
        setFiles(prev => [restoredItemData, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))); 
      } else if (itemType === 'folder') {
        setFolders(prev => [restoredItemData, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      }
      setTrash(currentTrash => currentTrash.filter(item => item.id !== id));
      toast({ title: "Elemento restaurado localmente", description: "La restauración completa a la base de datos requiere una implementación más avanzada." });
    }
  };

  const deleteItemPermanently = (id) => {
    setTrash(currentTrash => currentTrash.filter(item => item.id !== id));
    toast({ title: "Eliminación permanente (local)", description: "El elemento ha sido eliminado de la papelera local." });
  };

  return {
    restoreItem,
    deleteItemPermanently,
  };
};
