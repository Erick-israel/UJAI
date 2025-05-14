
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFiles } from '@/contexts/FileContext';
import { useToast } from '@/components/ui/use-toast';
import { FilePlus2, Loader2 } from 'lucide-react';
import FileIconDisplay from '@/components/FileCard/FileIconDisplay'; 

const AddExistingFilesToFolderDialog = ({ targetFolderId }) => {
  const { allFiles, moveFilesToFolder, loading: contextLoading } = useFiles();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const filesNotInAnyFolder = allFiles.filter(file => !file.folder_id);
      setAvailableFiles(filesNotInAnyFolder);
      setSelectedFiles([]);
    }
  }, [open, allFiles]);

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev =>
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'Ningún archivo seleccionado',
        description: 'Por favor, selecciona al menos un archivo para añadir a la carpeta.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await moveFilesToFolder(selectedFiles, targetFolderId);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error al mover archivos',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Archivos añadidos',
        description: `${selectedFiles.length} archivo(s) añadido(s) a la carpeta exitosamente.`,
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FilePlus2 className="h-4 w-4" />
          Añadir existentes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Añadir archivos existentes a esta carpeta</DialogTitle>
        </DialogHeader>
        {contextLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : availableFiles.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center">
            No hay archivos disponibles fuera de carpetas para añadir.
          </p>
        ) : (
          <ScrollArea className="h-72 my-4 pr-6">
            <div className="space-y-3">
              {availableFiles.map(file => (
                <div
                  key={file.id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleSelectFile(file.id)}
                >
                  <Checkbox
                    id={`file-${file.id}`}
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={() => handleSelectFile(file.id)}
                  />
                  <div className="w-8 h-8 flex items-center justify-center">
                     <FileIconDisplay file={file} bucketName="user_files_bucket" smallIcon={true} />
                  </div>
                  <label
                    htmlFor={`file-${file.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading || selectedFiles.length === 0 || availableFiles.length === 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Añadir seleccionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExistingFilesToFolderDialog;
