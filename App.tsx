import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Session from './components/Session';
import Settings from './components/Settings';
import Profile from './components/Profile';
import { UserSettings, UserStats, Level, AvatarId, FeedbackLanguage } from './types';
import { DEFAULT_SETTINGS, INITIAL_STATS } from './constants';
import { Layout } from './components/Layout';

// Create a Context for global state
export const AppContext = React.createContext<{
  settings: UserSettings;
  stats: UserStats;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateStats: (newStats: Partial<UserStats>) => void;
}>({
  settings: DEFAULT_SETTINGS,
  stats: INITIAL_STATS,
  updateSettings: () => {},
  updateStats: () => {},
});

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('lingua_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('lingua_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
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

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateStats = (newStats: Partial<UserStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  return (
    <AppContext.Provider value={{ settings, stats, updateSettings, updateStats }}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/session/:scenarioId" element={<Session />} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
};

export default App;