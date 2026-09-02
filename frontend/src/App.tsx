import React, { useState, useEffect } from 'react';
import { Welcome3DHero } from './components/Welcome3DHero';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [view, setView] = useState<'hero' | 'dashboard'>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(true);

  // Sync dark class with document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'dark bg-slate-950 text-slate-100' : 'light bg-slate-50 text-slate-900'}`}>
      {view === 'hero' ? (
        <Welcome3DHero
          onLaunchDashboard={() => setView('dashboard')}
          isDark={isDark}
        />
      ) : (
        <Dashboard
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onReturnToHero={() => setView('hero')}
        />
      )}
    </div>
  );
}
