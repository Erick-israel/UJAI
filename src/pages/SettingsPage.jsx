
import React from 'react';
import { Settings, Palette, Bell, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center">
        <Settings className="mr-3 h-7 w-7 text-primary" />
        Ajustes
      </h1>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card p-6 rounded-lg border shadow-sm"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Palette className="mr-2 h-5 w-5 text-primary" />
          Apariencia
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Tema de la aplicación</p>
          <Button onClick={toggleTheme} variant="outline">
            {theme === 'dark' ? 'Cambiar a Claro' : 'Cambiar a Oscuro'}
          </Button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card p-6 rounded-lg border shadow-sm"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Bell className="mr-2 h-5 w-5 text-primary" />
          Notificaciones
        </h2>
        <p className="text-muted-foreground">
          Ajustes de notificaciones (funcionalidad no implementada).
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card p-6 rounded-lg border shadow-sm"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Seguridad y Privacidad
        </h2>
        <p className="text-muted-foreground">
          Ajustes de seguridad y privacidad (funcionalidad no implementada).
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card p-6 rounded-lg border shadow-sm"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <HelpCircle className="mr-2 h-5 w-5 text-primary" />
          Ayuda y Soporte
        </h2>
        <p className="text-muted-foreground">
          Contacta con soporte o visita nuestra sección de FAQ (funcionalidad no implementada).
        </p>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
