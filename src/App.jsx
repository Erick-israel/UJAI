
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import FilesPage from '@/pages/FilesPage';
import FoldersPage from '@/pages/FoldersPage';
import FolderViewPage from '@/pages/FolderViewPage';
import TrashPage from '@/pages/TrashPage';
import ProfilePage from '@/pages/ProfilePage';
import StarredPage from '@/pages/StarredPage';
import RecentPage from '@/pages/RecentPage';
import SharedPage from '@/pages/SharedPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import { FileProvider } from '@/contexts/FileContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  const { session } = useAuth();

  return (
    <ThemeProvider>
      <FileProvider>
        <Router>
          {session ? (
            <Layout>
              <Routes>
                <Route path="/files" element={<ProtectedRoute><FilesPage /></ProtectedRoute>} />
                <Route path="/folders" element={<ProtectedRoute><FoldersPage /></ProtectedRoute>} />
                <Route path="/folders/:folderId" element={<ProtectedRoute><FolderViewPage /></ProtectedRoute>} />
                <Route path="/trash" element={<ProtectedRoute><TrashPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/starred" element={<ProtectedRoute><StarredPage /></ProtectedRoute>} />
                <Route path="/recent" element={<ProtectedRoute><RecentPage /></ProtectedRoute>} />
                <Route path="/shared" element={<ProtectedRoute><SharedPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/login" element={<Navigate to="/files" replace />} />
                <Route path="/" element={<Navigate to="/files" replace />} />
                <Route path="*" element={<Navigate to="/files" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
          <Toaster />
        </Router>
      </FileProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
