
import React from 'react';
import { FileText, UploadCloud, Loader2, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const ResumeSection = ({ editing, editedProfile, uploadingResume, saving, uploadingAvatar, onResumeUpload, onRemoveResume }) => {
  return (
    <div className="space-y-4">
      {editing && (
        <div className="space-y-2">
          <Label htmlFor="resume-upload" className="flex items-center text-sm text-muted-foreground cursor-pointer">
            <UploadCloud className="h-4 w-4 mr-2"/> Sube tu currículum (PDF)
          </Label>
          <div className="flex items-center gap-3">
            <input 
              id="resume-upload" 
              type="file" 
              accept=".pdf" 
              onChange={onResumeUpload} 
              disabled={uploadingResume || saving || uploadingAvatar}
              className="block w-full text-sm text-muted-foreground
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0
                         file:text-sm file:font-semibold
                         file:bg-primary file:text-primary-foreground
                         hover:file:bg-primary/90
                         file:cursor-pointer
                         disabled:opacity-70 disabled:pointer-events-none"
            />
             {uploadingResume && <Loader2 className="h-5 w-5 animate-spin text-primary"/>}
          </div>
        </div>
      )}

      {editedProfile.resume_url ? (
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-muted/30 border border-border rounded-lg">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="h-8 w-8 text-primary flex-shrink-0"/>
            <div className="flex flex-col min-w-0">
                <span className="font-medium text-foreground truncate">{editedProfile.resume_filename || "Currículum.pdf"}</span>
                <a 
                    href={editedProfile.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-500 hover:underline hover:text-blue-400 flex items-center gap-1"
                >
                    <Download size={12} /> Ver / Descargar
                </a>
            </div>
          </div>
          {editing && (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRemoveResume} 
                disabled={uploadingResume || saving || uploadingAvatar} 
                className="text-destructive hover:text-destructive hover:bg-destructive/10 self-start sm:self-center"
            >
              <Trash2 className="h-4 w-4 mr-1 sm:mr-2"/> Eliminar
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic py-2">
          {editing ? "No has subido un currículum." : "Currículum no disponible."}
        </p>
      )}
    </div>
  );
};

export default ResumeSection;
