
import React, { useState, useEffect } from 'react';
import { 
  FileText, Image as ImageIcon, FileCode, FileSpreadsheet, FileType as FilePdfIcon, 
  FileAudio, FileVideo, File as GenericFile, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const FileIconDisplay = ({ file, bucketName }) => {
  const [iconSrc, setIconSrc] = useState(null);
  const [loadingIcon, setLoadingIcon] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchIcon = async () => {
      setLoadingIcon(true);
      if (file.is_uploaded && file.storage_path && file.type && file.type.startsWith('image/')) {
        const { data } = supabase.storage.from(bucketName).getPublicUrl(file.storage_path);
        if (isMounted) {
          setIconSrc(data?.publicUrl ? `${data.publicUrl}?t=${new Date().getTime()}` : null);
        }
      } else if (file.content && file.type && file.type.startsWith('image/')) {
        if (isMounted) {
          setIconSrc(file.content);
        }
      } else {
        if (isMounted) {
          setIconSrc(null); 
        }
      }
      if (isMounted) {
        setLoadingIcon(false);
      }
    };
    fetchIcon();
    return () => { isMounted = false; };
  }, [file, bucketName]);

  if (loadingIcon) {
    return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
  }

  if (iconSrc) {
    return <img  src={iconSrc} alt={file.name} class="object-contain h-full w-full" src="https://images.unsplash.com/photo-1658204212985-e0126040f88f" />;
  }

  switch (file.type?.toLowerCase()) {
    case 'image/jpeg': case 'image/png': case 'image/gif': case 'image/webp': case 'image/svg+xml': case 'image':
      return <ImageIcon className="file-icon" />;
    case 'application/msword': case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': case 'document':
      return <FileText className="file-icon" />;
    case 'text/javascript': case 'text/html': case 'text/css': case 'application/json': case 'code':
      return <FileCode className="file-icon" />;
    case 'application/vnd.ms-excel': case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': case 'spreadsheet':
      return <FileSpreadsheet className="file-icon" />;
    case 'application/pdf': case 'pdf':
      return <FilePdfIcon className="file-icon" />;
    case 'audio/mpeg': case 'audio/wav': case 'audio/ogg': case 'audio':
      return <FileAudio className="file-icon" />;
    case 'video/mp4': case 'video/quicktime': case 'video/webm': case 'video':
      return <FileVideo className="file-icon" />;
    default:
      return <GenericFile className="file-icon" />;
  }
};

export default FileIconDisplay;
