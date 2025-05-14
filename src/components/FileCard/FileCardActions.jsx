
import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MoreVertical, Star, Trash2, Download, Share2, Edit, Eye } from 'lucide-react';
import { useFiles } from '@/contexts/FileContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const BUCKET_NAME = 'user_files_bucket';

const FileCardActions = ({ file, onRename, onPreview }) => {
  const { deleteFile, toggleStarFile } = useFiles();
  const { toast } = useToast();

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteFile(file.id);
  };

  const handleToggleStar = (e) => {
    e.stopPropagation();
    toggleStarFile(file.id);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (file.is_uploaded && file.storage_path) {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(file.storage_path);
      
      if (error) {
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

  const canPreview = (file.is_uploaded && file.storage_path && (file.type?.startsWith('image/') || file.type === 'application/pdf')) || 
                     (file.content && (file.type?.startsWith('image/') || file.type === 'application/pdf'));

  return (
    <Popover>
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
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            disabled={!canPreview}
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
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={(e) => { e.stopPropagation(); onRename();}}>
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
  );
};

export default FileCardActions;
