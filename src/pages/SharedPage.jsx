
import React from 'react';
import { Loader2, Share2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const SharedPage = () => {
  const loading = false; 
  const sharedItems = []; 

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold flex items-center">
        <Share2 className="mr-3 h-7 w-7 text-primary" />
        Compartidos Conmigo
      </h1>

      {sharedItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed min-h-[300px]"
        >
          <AlertTriangle className="w-20 h-20 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium">Nada compartido contigo todavía</h3>
          <p className="text-muted-foreground mt-1">Cuando alguien comparta archivos o carpetas contigo, aparecerán aquí.</p>
        </motion.div>
      ) : (
        <div className="file-grid">
          {/* Aquí se mapearían los items compartidos */}
        </div>
      )}
    </div>
  );
};

export default SharedPage;
