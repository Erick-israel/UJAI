
import React from 'react';
import { useFiles } from '@/contexts/FileContext';
import FileCard from '@/components/FileCard';
import FolderCard from '@/components/FolderCard';
import { Loader2, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const RecentPage = () => {
  const { files, folders, loading } = useFiles();

  const recentFiles = [...files].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20);
  const recentFolders = [...folders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const isEmpty = recentFiles.length === 0 && recentFolders.length === 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold flex items-center">
        <Clock className="mr-3 h-7 w-7 text-primary" />
        Recientes
      </h1>

      {isEmpty ? (
         <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed min-h-[300px]"
        >
          <AlertTriangle className="w-20 h-20 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium">No hay actividad reciente</h3>
          <p className="text-muted-foreground mt-1">Crea o modifica archivos y carpetas para verlos aquí.</p>
        </motion.div>
      ) : (
        <>
          {recentFiles.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Archivos Recientes</h2>
              <div className="file-grid">
                {recentFiles.map(file => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            </div>
          )}

          {recentFolders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Carpetas Recientes</h2>
              <div className="file-grid">
                {recentFolders.map(folder => (
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

export default RecentPage;
