
import React from 'react';
import { useFiles } from '@/contexts/FileContext';
import FileCard from '@/components/FileCard';
import FolderCard from '@/components/FolderCard';
import { Loader2, Star, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const StarredPage = () => {
  const { files, folders, loading } = useFiles();

  const starredFiles = files.filter(file => file.starred);
  const starredFolders = folders.filter(folder => folder.starred);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const isEmpty = starredFiles.length === 0 && starredFolders.length === 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold flex items-center">
        <Star className="mr-3 h-7 w-7 text-yellow-400 fill-yellow-400" />
        Destacados
      </h1>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed min-h-[300px]"
        >
          <AlertTriangle className="w-20 h-20 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium">Nada destacado todavía</h3>
          <p className="text-muted-foreground mt-1">Marca archivos o carpetas como destacados para verlos aquí.</p>
        </motion.div>
      ) : (
        <>
          {starredFiles.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Archivos Destacados</h2>
              <div className="file-grid">
                {starredFiles.map(file => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            </div>
          )}

          {starredFolders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Carpetas Destacadas</h2>
              <div className="file-grid">
                {starredFolders.map(folder => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StarredPage;
