
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { sanitizeFileName } from '@/lib/stringUtils';
import { v4 as uuidv4 } from 'uuid';

const AVATAR_BUCKET_NAME = 'avatars';
const RESUME_BUCKET_NAME = 'resumes';

const initialProfileState = {
  name: '', email: '', avatar_url: '',
  bio: '', location: '', website_url: '',
  linkedin_url: '', github_url: '', resume_url: '', resume_filename: ''
};

export const useProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState(initialProfileState);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(initialProfileState);
  
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (user) {
      setLoadingData(true);
      const { data, error, status } = await supabase
        .from('profiles')
        .select('name, avatar_url, bio, location, website_url, linkedin_url, github_url, resume_url')
        .eq('id', user.id)
        .maybeSingle();

      let userProfile = { ...initialProfileState, email: user.email || '' };

      if (error && status !== 406 && error.code !== 'PGRST116') { // 406 for ambiguous schema, PGRST116 for no rows
        toast({ title: "Error al cargar perfil", description: `Código: ${error.code || 'N/A'}, Mensaje: ${error.message}`, variant: "destructive" });
        userProfile.name = user.email?.split('@')[0] || 'Usuario';
      } else if (data) {
        userProfile = {
          ...userProfile,
          name: data.name || user.email?.split('@')[0] || 'Usuario',
          avatar_url: data.avatar_url ? `${data.avatar_url}?t=${new Date().getTime()}` : '',
          bio: data.bio || '',
          location: data.location || '',
          website_url: data.website_url || '',
          linkedin_url: data.linkedin_url || '',
          github_url: data.github_url || '',
          resume_url: data.resume_url ? `${data.resume_url}?t=${new Date().getTime()}` : '',
          resume_filename: data.resume_url ? data.resume_url.substring(data.resume_url.lastIndexOf('/') + 1).split('?t=')[0].split('/').pop() : ''
        };
      } else { 
        userProfile.name = user.email?.split('@')[0] || 'Usuario Anónimo';
         // If no data and no error, it might be a new user, or columns are missing.
         // Let's check if specific common columns like 'bio' are missing from the response
         // even if 'data' itself is not null but an empty object or missing keys.
         if (data && typeof data.bio === 'undefined') {
           console.warn("La columna 'bio' y posiblemente otras columnas del perfil no se encontraron en la respuesta de la base de datos. Por favor, verifica la estructura de la tabla 'profiles'.");
         }
      }
      setProfile(userProfile);
      setEditedProfile(userProfile);
      setLoadingData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    let avatarUrlToSave = editedProfile.avatar_url;
    if (avatarUrlToSave && avatarUrlToSave.includes('?t=')) {
      avatarUrlToSave = avatarUrlToSave.split('?t=')[0];
    }
    
    let resumeUrlToSave = editedProfile.resume_url;
    if (resumeUrlToSave && resumeUrlToSave.includes('?t=')) {
      resumeUrlToSave = resumeUrlToSave.split('?t=')[0];
    }

    const updates = {
      id: user.id, 
      name: editedProfile.name,
      avatar_url: avatarUrlToSave,
      bio: editedProfile.bio,
      location: editedProfile.location,
      website_url: editedProfile.website_url,
      linkedin_url: editedProfile.linkedin_url,
      github_url: editedProfile.github_url,
      resume_url: resumeUrlToSave,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' });

    if (error) {
      toast({ title: "Error al actualizar perfil", description: `Código: ${error.code || 'N/A'}, Mensaje: ${error.message}`, variant: "destructive" });
    } else {
      await fetchProfile(); 
      toast({ title: "Perfil actualizado", description: "Tu información de perfil ha sido guardada." });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setEditing(false);
  };

  const handleAvatarUpload = async (event) => {
    if (!user) return;
    const file = event.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const sanitizedOriginalName = sanitizeFileName(file.name);
    const fileExt = sanitizedOriginalName.split('.').pop();
    const fileName = `${user.id}/${uuidv4()}.${fileExt}`; 
    
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET_NAME)
      .upload(fileName, file, { upsert: true, cacheControl: '3600' });

    if (uploadError) {
      toast({ title: "Error al subir avatar", description: uploadError.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from(AVATAR_BUCKET_NAME).getPublicUrl(fileName);
      const newAvatarUrl = `${publicUrl}?t=${new Date().getTime()}`;
      setEditedProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));
      toast({ title: "Avatar subido", description: "El avatar se ha actualizado. Guarda los cambios para aplicarlo." });
    }
    setUploadingAvatar(false);
  };

  const handleResumeUpload = async (event) => {
    if (!user) return;
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      toast({ title: "Archivo inválido", description: "Por favor, sube un archivo PDF.", variant: "destructive" });
      return;
    }
    setUploadingResume(true);
    const sanitizedOriginalName = sanitizeFileName(file.name);
    const fileName = `${user.id}/${sanitizedOriginalName}`;

    const { error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET_NAME)
      .upload(fileName, file, { upsert: true, cacheControl: '3600' });
    
    if (uploadError) {
      toast({ title: "Error al subir currículum", description: uploadError.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from(RESUME_BUCKET_NAME).getPublicUrl(fileName);
      const newResumeUrl = `${publicUrl}?t=${new Date().getTime()}`;
      setEditedProfile(prev => ({ ...prev, resume_url: newResumeUrl, resume_filename: sanitizedOriginalName }));
      toast({ title: "Currículum subido", description: "El currículum se ha actualizado. Guarda los cambios para aplicarlo." });
    }
    setUploadingResume(false);
  };

  const handleRemoveResume = async () => {
    if (!user || !editedProfile.resume_url) return;
    setUploadingResume(true); 
    const filePath = `${user.id}/${editedProfile.resume_filename}`;
    const { error: deleteError } = await supabase.storage.from(RESUME_BUCKET_NAME).remove([filePath]);

    if (deleteError) {
      toast({ title: "Error al eliminar currículum", description: deleteError.message, variant: "destructive" });
    } else {
      setEditedProfile(prev => ({ ...prev, resume_url: '', resume_filename: '' }));
      toast({ title: "Currículum eliminado", description: "Guarda los cambios para confirmar." });
    }
    setUploadingResume(false);
  };

  const handleChangePassword = async (newPasswordValue) => {
    setChangingPassword(true);
    try {
        const { error } = await supabase.auth.updateUser({ password: newPasswordValue });
        if (error) {
            throw error;
        }
        toast({ title: "Contraseña actualizada", description: "Tu contraseña ha sido cambiada exitosamente." });
    } catch (error) {
        toast({ title: "Error al cambiar contraseña", description: error.message, variant: "destructive" });
    } finally {
        setChangingPassword(false);
    }
  };

  return {
    user,
    profile,
    editing,
    setEditing,
    editedProfile,
    setEditedProfile,
    loadingData,
    saving,
    uploadingAvatar,
    uploadingResume,
    changingPassword,
    handleSave,
    handleCancel,
    handleAvatarUpload,
    handleResumeUpload,
    handleRemoveResume,
    handleChangePassword,
  };
};
