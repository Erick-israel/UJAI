
import { useState, useMemo, useCallback, useEffect } from 'react';

export const useFileFiltering = (allFiles, allFolders, currentFolderId = null) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState({
    type: 'all', 
    dateRange: { start: null, end: null },
  });

  const applyFilters = useCallback((newFilters) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const searchFilesAndFolders = useCallback((query, filters) => {
    setSearchQuery(query.toLowerCase());
    if (filters) {
      applyFilters(filters);
    }
  }, [applyFilters]);

  const filteredFiles = useMemo(() => {
    let tempFiles = allFiles;

    if (currentFolderId) {
      tempFiles = tempFiles.filter(file => file.folder_id === currentFolderId);
    } else {
      tempFiles = tempFiles.filter(file => !file.folder_id); 
    }
    
    if (currentFilters.type !== 'all') {
      tempFiles = tempFiles.filter(file => {
        if (currentFilters.type === 'image') return file.type?.startsWith('image/');
        if (currentFilters.type === 'document') return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type);
        if (currentFilters.type === 'video') return file.type?.startsWith('video/');
        if (currentFilters.type === 'audio') return file.type?.startsWith('audio/');
        return true;
      });
    }
    
    if (currentFilters.dateRange.start) {
        tempFiles = tempFiles.filter(file => new Date(file.created_at) >= new Date(currentFilters.dateRange.start));
    }
    if (currentFilters.dateRange.end) {
        tempFiles = tempFiles.filter(file => new Date(file.created_at) <= new Date(currentFilters.dateRange.end));
    }

    if (!searchQuery) return tempFiles;
    return tempFiles.filter(file => 
      file.name.toLowerCase().includes(searchQuery)
    );
  }, [allFiles, searchQuery, currentFilters, currentFolderId]);

  const filteredFolders = useMemo(() => {
    let tempFolders = allFolders;

    if (currentFolderId) {
      tempFolders = tempFolders.filter(folder => folder.parent_folder_id === currentFolderId);
    } else {
      tempFolders = tempFolders.filter(folder => !folder.parent_folder_id);
    }
    
    if (currentFilters.dateRange.start) {
        tempFolders = tempFolders.filter(folder => new Date(folder.created_at) >= new Date(currentFilters.dateRange.start));
    }
    if (currentFilters.dateRange.end) {
        tempFolders = tempFolders.filter(folder => new Date(folder.created_at) <= new Date(currentFilters.dateRange.end));
    }
    
    if (!searchQuery) return tempFolders;
    return tempFolders.filter(folder =>
      folder.name.toLowerCase().includes(searchQuery)
    );
  }, [allFolders, searchQuery, currentFilters, currentFolderId]);
  
  useEffect(() => {
    if (!currentFolderId) {
      setSearchQuery('');
      setCurrentFilters({ type: 'all', dateRange: { start: null, end: null } });
    }
  }, [currentFolderId]);

  return {
    filteredFiles,
    filteredFolders,
    searchQuery,
    setSearchQuery,
    searchFilesAndFolders,
    currentFilters,
    applyFilters,
  };
};
