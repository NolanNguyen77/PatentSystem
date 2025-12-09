import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { TitleListPage } from './components/TitleListPage';
import { HomePage } from './components/HomePage';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';

type ViewState = 'landing' | 'login' | 'dashboard';

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUsername = localStorage.getItem('username');

    if (token && savedUsername) {
      // Verify token is still valid (optional)
      setUsername(savedUsername);
      setView('dashboard');
    } else {
      setView('landing');
    }
    setIsChecking(false);
  }, []);

  const handleLogin = (user: string) => {
    setUsername(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setView('landing');
    setUsername('');
  };

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {view === 'dashboard' && (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <TitleListPage username={username} onLogout={handleLogout} />
        </motion.div>
      )}

      {view === 'login' && (
        <motion.div
          key="login"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <LoginPage onLogin={handleLogin} />
        </motion.div>
      )}

      {view === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <HomePage onNavigateToLogin={() => setView('login')} />
        </motion.div>
      )}
      <Toaster />
    </AnimatePresence>
  );
}
