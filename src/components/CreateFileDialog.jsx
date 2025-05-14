
import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Image, FileCode, FileSpreadsheet, FilePlus as FilePdf, Upload } from 'lucide-react';
import { useFiles } from '@/contexts/FileContext';
import { useToast } from '@/components/ui/use-toast';

const fileTypes = [
  { id: 'document', name: 'Documento', icon: <FileText className="h-6 w-6" /> },
  { id: 'image', name: 'Imagen', icon: <Image className="h-6 w-6" /> },
  { id: 'code', name: 'Código', icon: <FileCode className="h-6 w-6" /> },
  { id: 'spreadsheet', name: 'Hoja de cálculo', icon: <FileSpreadsheet className="h-6 w-6" /> },
  { id: 'pdf', name: 'PDF', icon: <FilePdf className="h-6 w-6" /> },
];

const CreateFileDialog = ({ parentFolderId = null }) => {
  const [fileName, setFileName] = useState('');
  const [selectedType, setSelectedType] = useState('document');
  const [open, setOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const { addFile } = useFiles();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setFileName(file.name);
      
      const extension = file.name.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'txt':
        case 'doc':
        case 'docx':
          setSelectedType('document');
          break;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
          setSelectedType('image');
          break;
        case 'js':
        case 'jsx':
        case 'html':
        case 'css':
          setSelectedType('code');
          break;
        case 'csv':
        case 'xls':
        case 'xlsx':
          setSelectedType('spreadsheet');
          break;
        case 'pdf':
          setSelectedType('pdf');
          break;
        default:
          setSelectedType('document'); 
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!fileName.trim() && !fileToUpload) {
      toast({
        title: "Error",
        description: "El nombre del archivo no puede estar vacío o selecciona un archivo para subir.",
        variant: "destructive",
      });
      return;
    }
    
    const fileData = {
      name: fileName || (fileToUpload ? fileToUpload.name : 'Nuevo Archivo'),
      type: selectedType,
      parent_folder_id: parentFolderId,
    };

    if (fileToUpload) {
      fileData.uploadedFile = fileToUpload;
      fileData.size = fileToUpload.size;
      fileData.type = fileToUpload.type || selectedType; 
    }
    
    addFile(fileData);
    
    toast({
      title: fileToUpload ? "Archivo subido" : "Archivo creado",
      description: `${fileData.name} ha sido ${fileToUpload ? 'subido' : 'creado'} exitosamente.`,
    });
    
    setFileName('');
    setSelectedType('document');
    setFileToUpload(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setFileName('');
        setSelectedType('document');
        setFileToUpload(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo archivo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear o subir archivo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label 
                htmlFor="fileUpload" 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-1 text-sm text-muted-foreground">
                    <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cualquier tipo de archivo (MAX. 5MB)
                  </p>
                </div>
                <input id="fileUpload" type="file" className="hidden" onChange={handleFileChange} ref={fileInputRef}/>
              </label>
              {fileToUpload && (
                <p className="text-sm text-muted-foreground mt-1">
                  Archivo seleccionado: {fileToUpload.name} ({(fileToUpload.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O crear manualmente
                </span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="fileName" className="text-sm font-medium">
                Nombre del archivo
              </label>
              <input
                id="fileName"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Mi archivo"
                disabled={!!fileToUpload}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Tipo de archivo
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {fileTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => !fileToUpload && setSelectedType(type.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                      selectedType === type.id
                        ? 'border-primary bg-primary/10'
                        : 'border-input'
                    } ${fileToUpload ? 'cursor-not-allowed opacity-50' : ''}`}
                    disabled={!!fileToUpload}
                  >
                    {type.icon}
                    <span className="mt-2 text-xs">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setOpen(false); 
              setFileToUpload(null); 
              setFileName('');
              if(fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}>
              Cancelar
            </Button>
            <Button type="submit">{fileToUpload ? "Subir archivo" : "Crear archivo"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFileDialog;
