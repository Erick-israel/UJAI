
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFiles } from '@/contexts/FileContext';
import FileCard from '@/components/FileCard';
import FolderCard from '@/components/FolderCard';
import CreateFileDialog from '@/components/CreateFileDialog';
import CreateFolderDialog from '@/components/CreateFolderDialog';
import AddExistingFilesToFolderDialog from '@/components/AddExistingFilesToFolderDialog';
import { Loader2, Folder as FolderIcon, AlertTriangle, ArrowLeft, Home, FilePlus2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Breadcrumbs = ({ currentFolder, allFolders }) => {
  const navigate = useNavigate();
  const path = [];
  let tempFolder = currentFolder;

  while (tempFolder) {
    path.unshift(tempFolder);
    tempFolder = tempFolder.parent_folder_id ? allFolders.find(f => f.id === tempFolder.parent_folder_id) : null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link to="/folders" className="hover:text-primary transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {path.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <span>/</span>
          {index === path.length - 1 ? (
            <span className="font-medium text-foreground">{folder.name}</span>
          ) : (
            <Link to={`/folders/${folder.id}`} className="hover:text-primary transition-colors">
              {folder.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};


const FolderViewPage = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { 
    allFiles, 
    allFolders, 
    loading, 
    setCurrentFolderId, 
    currentFolderId,
    getFolderById,
    getFilesByFolderId,
    getSubfoldersByFolderId
  } = useFiles();

  const [currentFolder, setCurrentFolder] = useState(null);
  const [childFiles, setChildFiles] = useState([]);
  const [childFolders, setChildFolders] = useState([]);

  useEffect(() => {
    setCurrentFolderId(folderId);
    return () => setCurrentFolderId(null); 
  }, [folderId, setCurrentFolderId]);

  useEffect(() => {
    if (currentFolderId) {
      const folder = getFolderById(currentFolderId);
      setCurrentFolder(folder);
      if (folder) {
        setChildFiles(getFilesByFolderId(currentFolderId));
        setChildFolders(getSubfoldersByFolderId(currentFolderId));
      } else if (!loading) {
        // navigate('/folders'); // Or show a "Folder not found" message
      }
    } else {
      setCurrentFolder(null);
      setChildFiles([]);
      setChildFolders([]);
    }
  }, [currentFolderId, allFiles, allFolders, loading, getFolderById, getFilesByFolderId, getSubfoldersByFolderId, navigate]);


  if (loading && !currentFolder) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentFolder && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <AlertTriangle className="w-16 h-16 mb-4 text-destructive" />
        <h2 className="text-xl font-semibold mb-2">Carpeta no encontrada</h2>
        <p className="text-muted-foreground mb-4">La carpeta que estás buscando no existe o ha sido eliminada.</p>
        <Button onClick={() => navigate('/folders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Carpetas
        </Button>
      </div>
    );
  }
  
  const parentFolderId = currentFolder?.parent_folder_id;

  return (
    <div className="space-y-8">
      {currentFolder && <Breadcrumbs currentFolder={currentFolder} allFolders={allFolders} />}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {parentFolderId && (
             <Button variant="outline" size="icon" onClick={() => navigate(`/folders/${parentFolderId}`)} aria-label="Volver a carpeta padre">
               <ArrowLeft className="h-5 w-5" />
             </Button>
          )}
           {!parentFolderId && currentFolderId && (
             <Button variant="outline" size="icon" onClick={() => navigate(`/folders`)} aria-label="Volver a todas las carpetas">
               <Home className="h-5 w-5" />
             </Button>
          )}
          <h1 className="text-2xl font-bold flex items-center">
            <FolderIcon className="mr-3 h-7 w-7 text-primary" />
            {currentFolder ? currentFolder.name : 'Cargando...'}
          </h1>
        </div>
        <div className="flex gap-2">
          <AddExistingFilesToFolderDialog targetFolderId={currentFolderId} />
          <CreateFolderDialog parentFolderId={currentFolderId} />
          <CreateFileDialog parentFolderId={currentFolderId} />
        </div>
      </div>

      {childFolders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Subcarpetas</h2>
          <div className="file-grid">
            {childFolders.map(folder => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </div>
      )}

      {childFiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Archivos</h2>
          <div className="file-grid">
            {childFiles.map(file => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}

      {childFiles.length === 0 && childFolders.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed min-h-[200px]"
        >
          <AlertTriangle className="w-16 h-16 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">Esta carpeta está vacía</h3>
          <p className="text-muted-foreground mt-1 mb-4">Añade archivos o crea nuevas carpetas aquí.</p>
          <div className="flex gap-2">
             <AddExistingFilesToFolderDialog targetFolderId={currentFolderId} />
             <CreateFolderDialog parentFolderId={currentFolderId} />
             <CreateFileDialog parentFolderId={currentFolderId} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FolderViewPage;
