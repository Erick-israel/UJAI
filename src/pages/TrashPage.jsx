
import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, X, Folder as FolderIcon, File as FileIcon, AlertTriangle } from 'lucide-react';
import { useFiles } from '@/contexts/FileContext';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from '@/lib/date';

const TrashItem = ({ item, onRestore, onDelete }) => {
  const icon = item.itemType === 'folder' ? 
    <FolderIcon className="h-8 w-8 text-yellow-500" /> : 
    <FileIcon className="h-8 w-8 text-primary" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <h3 className="font-medium truncate" title={item.name}>{item.name}</h3>
          <p className="text-xs text-muted-foreground">
            Eliminado {formatDistanceToNow(item.deletedAt)}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => onRestore(item.id)} aria-label="Restaurar">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} aria-label="Eliminar permanentemente" className="text-destructive hover:text-destructive">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

const TrashPage = () => {
  const { trash, restoreItem, deleteItemPermanently } = useFiles();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <Trash2 className="mr-3 h-7 w-7 text-destructive" />
          Papelera
        </h1>
      </div>

      <div className="space-y-4">
        {trash.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed min-h-[300px]"
          >
            <AlertTriangle className="w-20 h-20 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">La papelera está vacía</h3>
            <p className="text-muted-foreground mt-1">Los elementos eliminados aparecerán aquí</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {trash.map(item => (
              <TrashItem 
                key={item.id} 
                item={item} 
                onRestore={restoreItem}
                onDelete={deleteItemPermanently}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashPage;
