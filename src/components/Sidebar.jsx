
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Folder, 
  Trash2, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Clock,
  Share2,
  Settings,
  Briefcase 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar = ({ open, toggleSidebar }) => {
  const sidebarVariants = {
    open: { width: '240px', transition: { duration: 0.3 } },
    closed: { width: '72px', transition: { duration: 0.3 } }
  };

  const navItems = [
    { path: '/files', icon: <FileText className="h-5 w-5" />, label: 'Archivos' },
    { path: '/folders', icon: <Folder className="h-5 w-5" />, label: 'Carpetas' },
    { path: '/trash', icon: <Trash2 className="h-5 w-5" />, label: 'Papelera' },
    { path: '/profile', icon: <User className="h-5 w-5" />, label: 'Perfil' },
  ];

  const secondaryNavItems = [
    { path: '/starred', icon: <Star className="h-5 w-5" />, label: 'Destacados' },
    { path: '/recent', icon: <Clock className="h-5 w-5" />, label: 'Recientes' },
    { path: '/shared', icon: <Share2 className="h-5 w-5" />, label: 'Compartidos' },
    { path: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Ajustes' },
  ];

  return (
    <motion.aside
      variants={sidebarVariants}
      initial={open ? 'open' : 'closed'}
      animate={open ? 'open' : 'closed'}
      className={cn(
        "relative h-full border-r bg-background flex flex-col",
        open ? "w-60" : "w-18"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Portafy</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className={cn("ml-auto", !open && "mx-auto")}>
          {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "sidebar-item",
                isActive && "active"
              )}
            >
              {item.icon}
              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-8 pt-4 border-t">
          <h3 className={cn(
            "px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
            !open && "text-center text-[10px] leading-none" 
          )}>
            {open ? "Más opciones" : "Más"}
          </h3>
          <nav className="mt-2 space-y-1">
            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "sidebar-item",
                  isActive && "active"
                )}
              >
                {item.icon}
                <AnimatePresence>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
