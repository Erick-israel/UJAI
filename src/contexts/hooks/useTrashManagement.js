
import { useState, useEffect } from 'react';

const TRASH_LOCAL_STORAGE_KEY = 'appTrash';

export const useTrashManagement = (initialFiles, initialFolders, initialTrash, setFilesState, setFoldersState, setTrashState, toast) => {
  const [trash, setInternalTrash] = useState(() => {
    const storedTrash = localStorage.getItem(TRASH_LOCAL_STORAGE_KEY);
    if (storedTrash) {
      try {
        const parsedTrash = JSON.parse(storedTrash);
        return Array.isArray(parsedTrash) ? parsedTrash : (initialTrash || []);
      } catch (e) {
        console.error("Error parsing trash from localStorage in hook:", e);
        localStorage.removeItem(TRASH_LOCAL_STORAGE_KEY);
        return initialTrash || [];
      }
    }
    return initialTrash || [];
  });

  useEffect(() => {
    if (trash) {
      localStorage.setItem(TRASH_LOCAL_STORAGE_KEY, JSON.stringify(trash.map(t => ({...t, content: null}))));
    }
    if (setTrashState && typeof setTrashState === 'function') {
      setTrashState(trash);
    }
  }, [trash, setTrashState]);


  const moveToTrash = (item, type) => {
    const trashItem = { ...item, itemType: type, deletedAt: new Date().toISOString() };
    setInternalTrash(prevTrash => [trashItem, ...(prevTrash || [])]);
    if (type === 'file' && setFilesState) {
      setFilesState(prev => prev.filter(f => f.id !== item.id));
    } else if (type === 'folder' && setFoldersState) {
      setFoldersState(prev => prev.filter(f => f.id !== item.id));
    }
    if (toast) {
      toast({ title: `${type === 'file' ? 'Archivo' : 'Carpeta'} movido a la papelera`, description: `${item.name} está en la papelera.` });
    }
  };


  const restoreItem = (itemId) => {
    const currentTrash = trash || [];
    const itemToRestore = currentTrash.find(item => item.id === itemId);
    if (!itemToRestore) return;

    const { itemType, ...restoredData } = itemToRestore;
    delete restoredData.deletedAt; 
    delete restoredData.itemType;


    if (itemType === 'file' && setFilesState) {
      setFilesState(prevFiles => [...prevFiles, restoredData].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    } else if (itemType === 'folder' && setFoldersState) {
      setFoldersState(prevFolders => [...prevFolders, restoredData].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    }
    setInternalTrash(prevTrash => (prevTrash || []).filter(item => item.id !== itemId));
    if (toast) {
      toast({ title: "Elemento restaurado", description: `${itemToRestore.name} ha sido restaurado.` });
    }
  };

  const deleteItemPermanently = (itemId) => {
    const currentTrash = trash || [];
    const itemToDelete = currentTrash.find(item => item.id === itemId);
    if (!itemToDelete) return;

    setInternalTrash(prevTrash => (prevTrash || []).filter(item => item.id !== itemId));
    if (toast) {
      toast({ title: "Elemento eliminado permanentemente", description: `${itemToDelete.name} ha sido eliminado.` });
    }
  };
  
  return {
    trash,
    setTrash: setInternalTrash, 
    moveToTrash, 
    restoreItem,
    deleteItemPermanently,
  };
};
