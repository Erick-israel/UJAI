
import React from 'react';
import { motion } from 'framer-motion';

const ProfileSection = ({ title, children, className = "", hideTitle = false }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-card rounded-lg border shadow-sm overflow-hidden ${!hideTitle ? 'p-6' : ''} ${className}`}
  >
    {!hideTitle && <h2 className="text-xl font-semibold mb-4 text-foreground">{title}</h2>}
    {children}
  </motion.div>
);

export default ProfileSection;
