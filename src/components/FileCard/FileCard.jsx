
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FileIconDisplay from './FileIconDisplay';
import FileCardActions from './FileCardActions';
import FileCardRenameForm from './FileCardRenameForm';
import FilePreviewDialog from '@/components/FilePreviewDialog';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from '@/lib/date';
import { BUCKET_NAME } from '@/contexts/fileActions'; 

const FileCard = ({ file }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  const handleCardClick = (e) => {
    if (isRenaming) return; 
    
    const targetIsButtonOrAction = e.target.closest('button, [role="menuitem"], input, a');
    if (targetIsButtonOrAction) return;

    if (file.is_uploaded && file.storage_path) {
      if (file.type?.startsWith('image/') || file.type === 'application/pdf') {
        setIsPreviewOpen(true);
      } else {
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.storage_path);
        if (data.publicUrl) {
          window.open(data.publicUrl, '_blank');
        } else {
          toast({ title: "Error", description: "No se pudo obtener la URL pública del archivo.", variant: "destructive" });
        }
      }
    } else if (file.content && (file.type?.startsWith('image/') || file.type === 'application/pdf')) {
      setIsPreviewOpen(true);
    } else {
      toast({ title: "Previsualización no disponible", description: "Este tipo de archivo no se puede previsualizar directamente o no es un archivo subido.", variant: "default" });
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="file-card cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="p-4 flex items-center justify-center bg-muted/50 h-32 overflow-hidden">
          <FileIconDisplay file={file} bucketName={BUCKET_NAME} />
        </div>
        <div className="file-card-content">
          {isRenaming ? (
            <FileCardRenameForm
              file={file}
              onSave={() => setIsRenaming(false)}
              onCancel={() => setIsRenaming(false)}
            />
          ) : (
            <div className="flex items-start justify-between p-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate" title={file.name}>{file.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {file.created_at ? formatDistanceToNow(file.created_at) : 'Fecha desconocida'}
                </p>
                {file.size > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <FileCardActions 
                file={file} 
                onRename={() => setIsRenaming(true)} 
                onPreview={() => setIsPreviewOpen(true)}
                bucketName={BUCKET_NAME}
              />
            </div>
          )}
        </div>
      </motion.div>
      {isPreviewOpen && (
        <FilePreviewDialog
          file={file}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          bucketName={BUCKET_NAME}
        />
      )}
    </>
  );
};

export default FileCard;
