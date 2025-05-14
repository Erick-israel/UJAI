
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  X as CloseIcon, 
  Save, 
  Edit2, 
  AlertTriangle, 
  Star, 
  Trash2 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useFiles } from '@/contexts/FileContext'; 
import { formatDistanceToNow } from '@/lib/date';

const PreviewHeader = ({ file, isEditingName, editableName, setEditableName, handleSaveName, setIsEditingName, onClose, onDownload, canDownload }) => {
  return (
    <DialogHeader className="p-4 border-b">
      <div className="flex justify-between items-center">
        {isEditingName ? (
          <div className="flex items-center gap-2 flex-1">
            <Input 
              value={editableName} 
              onChange={(e) => setEditableName(e.target.value)} 
              className="h-9 text-lg"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setIsEditingName(false); if (file) setEditableName(file.name);}}}
            />
            <Button size="icon" variant="ghost" onClick={handleSaveName} className="h-9 w-9"><Save className="h-5 w-5 text-green-500" /></Button>
            <Button size="icon" variant="ghost" onClick={() => { setIsEditingName(false); if (file) setEditableName(file.name); }} className="h-9 w-9"><CloseIcon className="h-5 w-5 text-red-500" /></Button>
          </div>
        ) : (
          <DialogTitle className="truncate flex-1 text-lg" title={file?.name}>
            {file?.name}
            <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} className="ml-2 h-7 w-7">
              <Edit2 className="h-4 w-4" />
            </Button>
          </DialogTitle>
        )}
        <div className="flex items-center gap-2 flex-shrink-0">
          {canDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          )}
        </div>
      </div>
    </DialogHeader>
  );
};

const PreviewContentArea = ({ file, previewUrl, isImage, isPdf, errorLoadingPreview, setErrorLoadingPreview }) => {
  if (errorLoadingPreview) {
    return (
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center h-full text-muted-foreground text-center">
        <AlertTriangle className="w-16 h-16 mb-4 text-destructive" />
        <p className="text-lg font-semibold">Error al cargar la vista previa</p>
        <p className="text-sm">No se pudo obtener la URL para la previsualización.</p>
      </div>
    );
  }
  if (!previewUrl || (!isImage && !isPdf)) {
    return (
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center h-full text-muted-foreground text-center">
        <AlertTriangle className="w-16 h-16 mb-4 text-yellow-500" />
        <p className="text-lg font-semibold">Previsualización no disponible</p>
        <p className="text-sm">La previsualización para este tipo de archivo no está disponible.</p>
      </div>
    );
  }
  if (isImage) {
    return <img src={previewUrl} alt={`Vista previa de ${file.name}`} className="max-w-full max-h-full mx-auto object-contain" onError={() => setErrorLoadingPreview(true)} />;
  }
  if (isPdf) {
    return (
      <iframe
        src={previewUrl}
        title={`Vista previa de ${file.name}`}
        className="w-full h-full border-0"
        onError={() => setErrorLoadingPreview(true)}
      />
    );
  }
  return null;
};

const PreviewSidebar = ({ file, onToggleStar, onDelete }) => {
  if (!file) return null;

  const handleStar = (e) => {
    e.stopPropagation();
    onToggleStar(file.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(file.id, file.storage_path);
  };

  return (
    <aside className="w-72 border-l p-4 space-y-4 overflow-y-auto bg-background">
      <h3 className="text-md font-semibold">Detalles del archivo</h3>
      <div>
        <Label htmlFor="preview-filename" className="text-xs text-muted-foreground">Nombre</Label>
        <p id="preview-filename" className="text-sm truncate" title={file.name}>{file.name}</p>
      </div>
      <div>
        <Label htmlFor="preview-filetype" className="text-xs text-muted-foreground">Tipo</Label>
        <p id="preview-filetype" className="text-sm">{file.type || 'Desconocido'}</p>
      </div>
      {file.size > 0 && (
        <div>
          <Label htmlFor="preview-filesize" className="text-xs text-muted-foreground">Tamaño</Label>
          <p id="preview-filesize" className="text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}
      <div>
        <Label htmlFor="preview-filecreated" className="text-xs text-muted-foreground">Creado</Label>
        <p id="preview-filecreated" className="text-sm">{formatDistanceToNow(file.created_at)}</p>
      </div>
      <div>
        <Label htmlFor="preview-fileupdated" className="text-xs text-muted-foreground">Modificado</Label>
        <p id="preview-fileupdated" className="text-sm">{formatDistanceToNow(file.updated_at || file.created_at)}</p>
      </div>
      {file.folder_id && (
        <div>
          <Label htmlFor="preview-filefolder" className="text-xs text-muted-foreground">Carpeta</Label>
          <p id="preview-filefolder" className="text-sm">En carpeta (ID: ...{String(file.folder_id).slice(-6)})</p>
        </div>
      )}

      <div className="pt-4 border-t">
        <h3 className="text-md font-semibold mb-2">Acciones</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleStar}>
            <Star className={`h-4 w-4 mr-2 ${file.starred ? 'text-yellow-400 fill-yellow-400' : ''}`} />
            {file.starred ? 'Quitar estrella' : 'Destacar'}
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>
    </aside>
  );
};


const FilePreviewDialog = ({ file: initialFile, isOpen, onClose, bucketName }) => {
  const { toast } = useToast();
  const { renameFile, allFiles, toggleStarFile, deleteFile, trashFile } = useFiles(); 
  const [file, setFile] = useState(initialFile);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState(initialFile?.name || '');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isImage, setIsImage] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const [errorLoadingPreview, setErrorLoadingPreview] = useState(false);

  useEffect(() => {
    if (isOpen && initialFile) {
      const currentFileState = allFiles.find(f => f.id === initialFile.id) || initialFile;
      setFile(currentFileState);
      setEditableName(currentFileState?.name || '');
      
      let tempPreviewUrl = null;
      let tempIsImage = false;
      let tempIsPdf = false;
      let tempErrorLoading = false;

      if (!bucketName) {
        tempErrorLoading = true;
      } else if (currentFileState?.is_uploaded && currentFileState?.storage_path) {
        const { data: publicUrlData, error: publicUrlError } = supabase.storage.from(bucketName).getPublicUrl(currentFileState.storage_path);
        
        if (publicUrlError || !publicUrlData?.publicUrl) {
          tempErrorLoading = true;
        } else {
          const timestamp = currentFileState.updated_at || currentFileState.created_at;
          tempPreviewUrl = `${publicUrlData.publicUrl}?t=${new Date(timestamp || Date.now()).getTime()}`;
        }
      } else if (currentFileState?.content) { 
        tempPreviewUrl = currentFileState.content;
      } else {
         tempErrorLoading = true;
      }
      
      if (tempPreviewUrl && currentFileState?.type) {
        tempIsImage = currentFileState.type.startsWith('image/');
        tempIsPdf = currentFileState.type === 'application/pdf';
      } else if (tempPreviewUrl && !currentFileState?.type) {
        if (tempPreviewUrl.startsWith('data:image/')) tempIsImage = true;
      }

      setPreviewUrl(tempPreviewUrl);
      setIsImage(tempIsImage);
      setIsPdf(tempIsPdf);
      setErrorLoadingPreview(tempErrorLoading);

    } else if (!isOpen) {
      setPreviewUrl(null);
      setIsImage(false);
      setIsPdf(false);
      setErrorLoadingPreview(false);
    }
    if (isOpen) setIsEditingName(false); 
  }, [initialFile, isOpen, allFiles, bucketName]);


  const handleDownload = useCallback(async (e) => {
    if (e) e.stopPropagation();
    if (!file || !bucketName) {
      if (!bucketName) toast({ title: "Error de configuración", description: "Nombre del bucket no definido.", variant: "destructive" });
      return;
    }
    if (file.is_uploaded && file.storage_path) {
      const { data, error } = await supabase.storage.from(bucketName).download(file.storage_path);
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
      toast({ title: "Descarga no disponible", description: "Este archivo no se puede descargar o no tiene contenido.", variant: "default" });
    }
  }, [file, bucketName, toast]);

  const handleSaveName = useCallback(async () => {
    if (!file || !editableName.trim() || editableName.trim() === file.name) {
      setIsEditingName(false);
      if (file) setEditableName(file.name);
      return;
    }
    const { error } = await renameFile(file.id, editableName.trim());
    if (!error) {
      toast({ title: "Nombre actualizado", description: "El nombre del archivo ha sido actualizado." });
    }
    setIsEditingName(false);
  }, [file, editableName, renameFile, toast]);

  const handleToggleStar = useCallback(async (fileId) => {
    await toggleStarFile(fileId);
  }, [toggleStarFile]);

  const handleDeleteFile = useCallback(async (fileId, storagePath) => {
    if (!file) return;
    trashFile(file); 
    onClose(); 
    toast({ title: "Archivo movido a la papelera", description: `${file.name} ha sido movido a la papelera.`});
  }, [file, trashFile, onClose, toast]);


  if (!isOpen || !file) {
    return null;
  }
  
  const canDownload = (isImage || isPdf || (file.is_uploaded && file.storage_path && !errorLoadingPreview)) || file.content;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-full h-[90vh] p-0 flex flex-col bg-background shadow-2xl"
        onInteractOutside={(e) => {
          if (isEditingName) {
            e.preventDefault(); 
          }
        }}
      >
        <PreviewHeader 
          file={file} 
          isEditingName={isEditingName}
          editableName={editableName}
          setEditableName={setEditableName}
          handleSaveName={handleSaveName}
          setIsEditingName={setIsEditingName}
          onClose={onClose}
          onDownload={handleDownload}
          canDownload={canDownload}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto p-0 bg-muted/20 flex items-center justify-center">
            <PreviewContentArea 
              file={file}
              previewUrl={previewUrl}
              isImage={isImage}
              isPdf={isPdf}
              errorLoadingPreview={errorLoadingPreview}
              setErrorLoadingPreview={setErrorLoadingPreview}
            />
          </div>
          <PreviewSidebar 
            file={file} 
            onToggleStar={handleToggleStar} 
            onDelete={handleDeleteFile} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewDialog;
