import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Session from './components/Session';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Welcome from './components/Welcome';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import Ranking from './components/Ranking';
import Progress from './components/Progress';
import { UserSettings, UserStats } from './types';
import { DEFAULT_SETTINGS, INITIAL_STATS } from './constants';
import { Layout } from './components/Layout';
import { AppContext } from './context/AppContext';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

const RootRoute = () => {
  const navigate = useNavigate();
  const { user } = React.useContext(AppContext);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/home');
    }
  }, [user, navigate]);

  if (user) return null;

  return <Welcome onLogin={(user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    window.location.reload(); // Simple reload to update context
  }} />;
}

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<Navigate to="/" replace />} />

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><UserManagement /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/home" element={
        <ProtectedRoute>
          <Layout><Home /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/ranking" element={
        <ProtectedRoute>
          <Layout><Ranking /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/session/:scenarioId" element={
        <ProtectedRoute>
          <Session />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout><Settings /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout><Profile /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/progress" element={
        <ProtectedRoute>
          <Layout><Progress /></Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('lingua_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('lingua_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [user, setUser] = useState<any>(() => {
    return JSON.parse(localStorage.getItem('user') || 'null');
  });

  useEffect(() => {
    localStorage.setItem('lingua_settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('lingua_stats', JSON.stringify(stats));
  }, [stats]);

  // Sync stars from user profile if available
  useEffect(() => {
    if (user && typeof user.stars === 'number') {
      setStats(prev => {
        if (prev.stars !== user.stars) {
          return { ...prev, stars: user.stars };
        }
        return prev;
      });
    }
  }, [user]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateStats = (newStats: Partial<UserStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ settings, stats, updateSettings, updateStats, user, logout }}>
      <Router>
        <AppContent />
      </Router>
    </AppContext.Provider>
  );
};

export default App;