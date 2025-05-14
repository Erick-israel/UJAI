
import React from 'react';

export const useTrashInteractions = (trash, setTrash, setFiles, setFolders, toast) => {
  const moveToTrashHandler = (item, type) => {
    const trashItem = { ...item, itemType: type, deletedAt: new Date().toISOString() };
    setTrash(prevTrash => [trashItem, ...(prevTrash || [])]);
    if (type === 'file') {
      setFiles(prev => prev.filter(f => f.id !== item.id));
    } else {
      setFolders(prev => prev.filter(f => f.id !== item.id));
    }
    toast({ title: `${type === 'file' ? 'Archivo' : 'Carpeta'} movido a la papelera`, description: `${item.name} está en la papelera.` });
  };

  const restoreItemHandler = (itemId) => {
    const currentTrash = trash || [];
    const itemToRestore = currentTrash.find(item => item.id === itemId);
    if (!itemToRestore) return;

    const { itemType, ...restoredData } = itemToRestore;
    delete restoredData.deletedAt; 
    delete restoredData.itemType;

    if (itemType === 'file') {
      setFiles(prevFiles => [...prevFiles, restoredData].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    } else if (itemType === 'folder') {
      setFolders(prevFolders => [...prevFolders, restoredData].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    }
    setTrash(prevTrash => (prevTrash || []).filter(item => item.id !== itemId));
    toast({ title: "Elemento restaurado", description: `${itemToRestore.name} ha sido restaurado.` });
  };

  const deleteItemPermanentlyHandler = (itemId) => {
    const currentTrash = trash || [];
    const itemToDelete = currentTrash.find(item => item.id === itemId);
    if (!itemToDelete) return;

    setTrash(prevTrash => (prevTrash || []).filter(item => item.id !== itemId));
    toast({ title: "Elemento eliminado permanentemente", description: `${itemToDelete.name} ha sido eliminado.` });
  };

  return {
    moveToTrashHandler,
    restoreItemHandler,
    deleteItemPermanentlyHandler,
  };
};
