import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { useUserStore } from './store/userStore';

export default function App() {
  const initializeAdmin = useUserStore(state => state.login);

  // Initialize admin user on first load
  useEffect(() => {
    const initAdmin = async () => {
      try {
        await initializeAdmin('admin@example.com', 'admin');
      } catch (error) {
        console.error('Failed to initialize admin:', error);
      }
    };
    initAdmin();
  }, [initializeAdmin]);

  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<Dashboard />} />
          </Routes>
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}