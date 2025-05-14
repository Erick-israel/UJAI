
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Image as ImageIcon, FileCode, FileSpreadsheet, FilePlus as FilePdf, 
  FileAudio, FileVideo, File as GenericFile, MoreVertical, Star, Trash2, 
  Download, Share2, Edit, Check, X as CancelIcon, Eye
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useFiles } from '@/contexts/FileContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import FilePreviewDialog from '@/components/FilePreviewDialog';

const BUCKET_NAME = 'user_files_bucket';

const getFileIcon = (file) => {
  if (file.is_uploaded && file.storage_path && file.type && file.type.startsWith('image/')) {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.storage_path);
    if (data && data.publicUrl) {
      return <img  src={data.publicUrl} alt={file.name} class="object-contain h-full w-full" src="https://images.unsplash.com/photo-1595872018818-97555653a011" />;
    }
  }
  if (file.content && file.type && file.type.startsWith('image/')) {
     return <img  src={file.content} alt={file.name} class="object-contain h-full w-full" src="https://images.unsplash.com/photo-1595872018818-97555653a011" />;
  }

  switch (file.type) {
    case 'image': case 'image/jpeg': case 'image/png': case 'image/gif':
      return <ImageIcon className="file-icon" />;
    case 'document': case 'application/msword': case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return <FileText className="file-icon" />;
    case 'code': case 'text/javascript': case 'text/html': case 'text/css':
      return <FileCode className="file-icon" />;
    case 'spreadsheet': case 'application/vnd.ms-excel': case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return <FileSpreadsheet className="file-icon" />;
    case 'pdf': case 'application/pdf':
      return <FilePdf className="file-icon" />;
    case 'audio': case 'audio/mpeg': case 'audio/wav':
      return <FileAudio className="file-icon" />;
    case 'video': case 'video/mp4': case 'video/quicktime':
      return <FileVideo className="file-icon" />;
    default:
      return <GenericFile className="file-icon" />;
  }
};

const FileCard = ({ file }) => {
  const { deleteFile, toggleStarFile, renameFile } = useFiles();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteFile(file.id);
  };

  const handleToggleStar = (e) => {
    e.stopPropagation();
    toggleStarFile(file.id);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    setIsRenaming(true);
    setNewName(file.name); 
  };

  const handleSaveRename = async (e) => {
    e.stopPropagation();
    if (newName.trim() === '' || newName.trim() === file.name) {
      setIsRenaming(false);
      setNewName(file.name);
      return;
    }
    await renameFile(file.id, newName.trim());
    setIsRenaming(false);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setIsRenaming(false);
    setNewName(file.name);
  };
  
  const handleDownload = async (e) => {
    e.stopPropagation();
    if (file.is_uploaded && file.storage_path) {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(file.storage_path);
      
      if (error) {
        console.error("Error downloading file:", error);
        toast({ title: "Error al descargar", description: error.message, variant: "destructive" });
        return;
      }
      
      const blob = data;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } else if (file.content) { 
        const link = document.createElement('a');
        link.href = file.content;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
      toast({ title: "Descarga no disponible", description: "Este archivo no se puede descargar o no tiene contenido.", variant: "destructive" });
    }
  };

  const handleCardClick = () => {
    if (isRenaming) return; 

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
          {getFileIcon(file)}
        </div>
        <div className="file-card-content">
          {isRenaming ? (
            <div className="flex items-center gap-2 p-2">
              <Input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                className="h-8 text-sm"
                autoFocus
                onClick={(e) => e.stopPropagation()} 
                onKeyDown={(e) => { 
                  if (e.key === 'Enter') handleSaveRename(e); 
                  if (e.key === 'Escape') handleCancelRename(e);
                }}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveRename}><Check className="h-4 w-4 text-green-500" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelRename}><CancelIcon className="h-4 w-4 text-red-500" /></Button>
            </div>
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
              <Popover onOpenChange={(open) => { if (!open && isRenaming) setIsRenaming(false); }}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="space-y-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(true); }}
                      disabled={!(file.is_uploaded && file.storage_path && (file.type?.startsWith('image/') || file.type === 'application/pdf')) && !(file.content && (file.type?.startsWith('image/') || file.type === 'application/pdf'))}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Previsualizar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={handleToggleStar}
                    >
                      <Star className={`h-4 w-4 mr-2 ${file.starred ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                      {file.starred ? 'Quitar estrella' : 'Destacar'}
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleDownload} disabled={!file.is_uploaded && !file.content}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleRename}>
                      <Edit className="h-4 w-4 mr-2" />
                      Renombrar
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" disabled>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </motion.div>
      {isPreviewOpen && (
        <FilePreviewDialog
          file={file}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  );
};

export default FileCard;
