
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  MoreVertical,
  Star,
  Trash2,
  Share2,
  Edit
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useFiles } from '@/contexts/FileContext';
import { useNavigate } from 'react-router-dom';

const FolderCard = ({ folder }) => {
  const { deleteFolder, toggleStarFolder, renameFolder } = useFiles();
  const navigate = useNavigate();
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [newName, setNewName] = React.useState(folder.name);


  const handleDelete = (e) => {
    e.stopPropagation();
    deleteFolder(folder.id);
  };

  const handleToggleStar = (e) => {
    e.stopPropagation();
    toggleStarFolder(folder.id);
  };

  const handleCardClick = () => {
    if (isRenaming) return;
    navigate(`/folders/${folder.id}`);
  };
  
  const handleRename = (e) => {
    e.stopPropagation();
    setIsRenaming(true);
    setNewName(folder.name);
  };

  const handleSaveRename = async (e) => {
    e.stopPropagation();
    if (newName.trim() === '' || newName.trim() === folder.name) {
      setIsRenaming(false);
      setNewName(folder.name);
      return;
    }
    await renameFolder(folder.id, newName.trim());
    setIsRenaming(false);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setIsRenaming(false);
    setNewName(folder.name);
  };


  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="file-card cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-4 flex items-center justify-center bg-muted/50 h-32">
        <Folder className="folder-icon" />
      </div>
      <div className="file-card-content">
      {isRenaming ? (
          <div className="flex items-center gap-1 p-2">
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              className="h-8 text-sm flex-grow rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              onClick={(e) => e.stopPropagation()} 
              onKeyDown={(e) => { 
                if (e.key === 'Enter') handleSaveRename(e); 
                if (e.key === 'Escape') handleCancelRename(e);
              }}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveRename} aria-label="Guardar nombre">
              <Edit className="h-4 w-4 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelRename} aria-label="Cancelar renombrar">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ) : (
        <div className="flex items-start justify-between p-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate" title={folder.name}>{folder.name}</h3>
            <p className="text-xs text-muted-foreground">
              {folder.created_at ? formatDistanceToNow(folder.created_at) : 'Fecha desconocida'}
            </p>
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
                  onClick={handleToggleStar}
                >
                  <Star className={`h-4 w-4 mr-2 ${folder.starred ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                  {folder.starred ? 'Quitar estrella' : 'Destacar'}
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
  );
};

export default FolderCard;
