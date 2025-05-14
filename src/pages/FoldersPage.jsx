
import React from 'react';
import { motion } from 'framer-motion';
import { useFiles } from '@/contexts/FileContext';
import FolderCard from '@/components/FolderCard';
import CreateFolderDialog from '@/components/CreateFolderDialog';
import { Separator } from '@/components/ui/separator';
import { Loader2, Folder, AlertTriangle } from 'lucide-react';

const FoldersPage = () => {
  const { folders, loading } = useFiles();

  const starredFolders = folders.filter(folder => folder.starred);
  const recentFolders = [...folders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <Folder className="mr-3 h-7 w-7 text-primary" />
          Mis Carpetas
        </h1>
        <CreateFolderDialog />
      </div>

      {starredFolders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Destacadas</h2>
          <div className="file-grid">
            {starredFolders.map(folder => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
          <Separator className="my-6" />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recientes</h2>
        {folders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed"
          >
            <AlertTriangle className="w-20 h-20 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No tienes carpetas</h3>
            <p className="text-muted-foreground mt-1 mb-4">Crea tu primera carpeta para organizar tus archivos</p>
            <CreateFolderDialog />
          </motion.div>
        ) : (
          <div className="file-grid">
            {recentFolders.map(folder => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoldersPage;
