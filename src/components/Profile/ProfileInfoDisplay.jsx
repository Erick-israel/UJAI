
import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Edit, Loader2, Briefcase, Link as LinkIcon, Linkedin, Github, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ProfileInfoDisplay = ({ profile, editing, editedProfile, onProfileChange, saving, uploadingAvatar, uploadingResume, onAvatarUpload }) => {
  const renderInputField = (id, label, value, onChange, icon, placeholder = '', type = 'text') => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center text-sm text-muted-foreground">
        {React.createElement(icon, { className: "h-4 w-4 mr-2 flex-shrink-0"})}
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-background/80 border-border focus:ring-primary disabled:opacity-70"
        disabled={!editing || saving || uploadingAvatar || uploadingResume}
      />
    </div>
  );

  const renderTextareaField = (id, label, value, onChange, icon, placeholder = '') => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center text-sm text-muted-foreground">
        {React.createElement(icon, { className: "h-4 w-4 mr-2 flex-shrink-0"})}
        {label}
      </Label>
      <Textarea
        id={id}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-background/80 border-border focus:ring-primary min-h-[100px] disabled:opacity-70"
        disabled={!editing || saving || uploadingAvatar || uploadingResume}
      />
    </div>
  );

  return (
    <div className="relative rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 opacity-50"></div>
      <div className="relative px-6 py-8 md:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 mb-8">
          <motion.div whileHover={{ scale: 1.05 }} className="relative group">
            <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full bg-card/80 backdrop-blur-sm border-4 border-background/50 flex items-center justify-center overflow-hidden shadow-xl">
              {editedProfile.avatar_url ? (
                <img src={editedProfile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-16 w-16 text-muted-foreground" />
              )}
              {uploadingAvatar && <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full"><Loader2 className="h-10 w-10 animate-spin text-white"/></div>}
            </div>
            {editing && (
              <label className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 shadow-md transition-all opacity-0 group-hover:opacity-100">
                <Edit className="h-5 w-5" />
                <input type="file" className="hidden" accept="image/*" onChange={onAvatarUpload} disabled={uploadingAvatar || saving || uploadingResume}/>
              </label>
            )}
          </motion.div>
          <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0 sm:pb-2">
            {editing ? (
              <Input
                type="text"
                value={editedProfile.name || ''}
                onChange={(e) => onProfileChange({ ...editedProfile, name: e.target.value })}
                className="text-2xl md:text-3xl font-bold bg-transparent border-0 border-b-2 border-input focus:border-primary rounded-none px-1 py-1 mb-1 w-full text-foreground placeholder-muted-foreground disabled:opacity-70"
                placeholder="Tu Nombre"
                disabled={saving || uploadingAvatar || uploadingResume}
              />
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">{profile.name || 'Usuario Anónimo'}</h2>
            )}
            <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mt-1.5">
              <Mail className="h-4 w-4" />
              <span>{profile.email}</span>
            </div>
          </div>
        </div>
        
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {renderTextareaField("bio", "Biografía", editedProfile.bio, (e) => onProfileChange({ ...editedProfile, bio: e.target.value }), Briefcase, "Una breve descripción sobre ti...")}
            {renderInputField("location", "Ubicación", editedProfile.location, (e) => onProfileChange({ ...editedProfile, location: e.target.value }), MapPin, "Ciudad, País")}
            {renderInputField("website_url", "Sitio Web", editedProfile.website_url, (e) => onProfileChange({ ...editedProfile, website_url: e.target.value }), LinkIcon, "https://tuportafolio.com")}
            {renderInputField("linkedin_url", "LinkedIn", editedProfile.linkedin_url, (e) => onProfileChange({ ...editedProfile, linkedin_url: e.target.value }), Linkedin, "https://linkedin.com/in/tuperfil")}
            {renderInputField("github_url", "GitHub", editedProfile.github_url, (e) => onProfileChange({ ...editedProfile, github_url: e.target.value }), Github, "https://github.com/tuusuario")}
          </div>
        ) : (
          <div className="mt-6 space-y-4 text-sm">
            {profile.bio && <div className="flex items-start"><Briefcase className="h-5 w-5 mr-3 mt-0.5 text-primary flex-shrink-0"/><p className="text-foreground/90">{profile.bio}</p></div>}
            {profile.location && <div className="flex items-center"><MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0"/><p className="text-foreground/90">{profile.location}</p></div>}
            {profile.website_url && <div className="flex items-center"><LinkIcon className="h-5 w-5 mr-3 text-primary flex-shrink-0"/><a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline hover:text-blue-400 transition-colors break-all">{profile.website_url}</a></div>}
            {profile.linkedin_url && <div className="flex items-center"><Linkedin className="h-5 w-5 mr-3 text-primary flex-shrink-0"/><a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline hover:text-blue-400 transition-colors break-all">{profile.linkedin_url}</a></div>}
            {profile.github_url && <div className="flex items-center"><Github className="h-5 w-5 mr-3 text-primary flex-shrink-0"/><a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline hover:text-blue-400 transition-colors break-all">{profile.github_url}</a></div>}
            
            {(!profile.bio && !profile.location && !profile.website_url && !profile.linkedin_url && !profile.github_url) && (
                <p className="text-muted-foreground italic">No hay información adicional para mostrar. Edita tu perfil para añadir más detalles.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfoDisplay;
