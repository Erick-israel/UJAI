
import React from 'react';
import { motion } from 'framer-motion';
import { useFiles } from '@/contexts/FileContext';
import FileCard from '@/components/FileCard';
import CreateFileDialog from '@/components/CreateFileDialog';
import { Separator } from '@/components/ui/separator';
import { Loader2, FileText, AlertTriangle } from 'lucide-react';

const FilesPage = () => {
  const { files, loading } = useFiles();

  const starredFiles = files.filter(file => file.starred);
  const recentFiles = [...files].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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
          <FileText className="mr-3 h-7 w-7 text-primary" />
          Mis Archivos
        </h1>
        <CreateFileDialog />
      </div>

      {starredFiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Destacados</h2>
          <div className="file-grid">
            {starredFiles.map(file => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
          <Separator className="my-6" />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recientes</h2>
        {files.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed"
          >
            <AlertTriangle className="w-20 h-20 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No tienes archivos</h3>
            <p className="text-muted-foreground mt-1 mb-4">Crea tu primer archivo para comenzar</p>
            <CreateFileDialog />
          </motion.div>
        ) : (
          <div className="file-grid">
            {recentFiles.map(file => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesPage;
