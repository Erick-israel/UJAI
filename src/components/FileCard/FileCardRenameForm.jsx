
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X as CancelIcon } from 'lucide-react';
import { useFiles } from '@/contexts/FileContext';

const FileCardRenameForm = ({ file, onSave, onCancel }) => {
  const [newName, setNewName] = useState(file.name);
  const { renameFile } = useFiles();

  const handleSaveRename = async (e) => {
    e.stopPropagation();
    if (newName.trim() === '' || newName.trim() === file.name) {
      onCancel(); 
      return;
    }
    await renameFile(file.id, newName.trim());
    onSave();
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    onCancel();
  };

  return (
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
  );
};

export default FileCardRenameForm;
