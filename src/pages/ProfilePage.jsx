
import React from 'react';
import { Edit, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ProfileSection from '@/components/Profile/ProfileSection';
import ProfileInfoDisplay from '@/components/Profile/ProfileInfoDisplay';
import ResumeSection from '@/components/Profile/ResumeSection';
import PasswordChangeSection from '@/components/Profile/PasswordChangeSection';
import { useProfilePage } from '@/hooks/useProfilePage';

const ProfilePage = () => {
  const {
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
  } = useProfilePage();
  
  if (loadingData && (!user || !profile.email)) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
        {!editing ? (
          <Button onClick={() => setEditing(true)} disabled={loadingData || saving || uploadingAvatar || uploadingResume}>
            <Edit className="h-4 w-4 mr-2" />
            Editar perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving || uploadingAvatar || uploadingResume}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || uploadingAvatar || uploadingResume}>
              { saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" /> }
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>

      <ProfileSection hideTitle={true}>
        <ProfileInfoDisplay
            profile={profile}
            editing={editing}
            editedProfile={editedProfile}
            onProfileChange={setEditedProfile}
            saving={saving}
            uploadingAvatar={uploadingAvatar}
            uploadingResume={uploadingResume}
            onAvatarUpload={handleAvatarUpload}
        />
      </ProfileSection>

      <ProfileSection title="Currículum Vitae (PDF)">
        <ResumeSection 
            editing={editing}
            editedProfile={editedProfile}
            uploadingResume={uploadingResume}
            saving={saving}
            uploadingAvatar={uploadingAvatar}
            onResumeUpload={handleResumeUpload}
            onRemoveResume={handleRemoveResume}
        />
      </ProfileSection>

      <ProfileSection title="Seguridad de la Cuenta">
        <PasswordChangeSection 
            changingPassword={changingPassword}
            onChangePassword={handleChangePassword}
        />
      </ProfileSection>

      <ProfileSection title="Estadísticas de almacenamiento" className="hidden">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-foreground">Espacio utilizado</span>
              <span className="text-sm font-medium text-muted-foreground">Próximamente</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
          <Separator className="my-4" />
          <p className="text-muted-foreground text-sm">
            Las estadísticas detalladas de almacenamiento estarán disponibles pronto.
          </p>
        </div>
      </ProfileSection>
    </div>
  );
};

export default ProfilePage;
