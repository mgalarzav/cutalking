import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Moon, Sun, Globe } from 'lucide-react';
import { FeedbackLanguage } from '../types';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useContext(AppContext);

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h2>

      {/* Language Section */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="text-green-500" size={20} /> Feedback Language
        </h3>
        <div className="grid grid-cols-3 gap-2">
            {[
                { code: 'EN', label: 'English' },
                { code: 'ES', label: 'Español' },
                { code: 'DE', label: 'Deutsch' }
            ].map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => updateSettings({ feedbackLanguage: lang.code as FeedbackLanguage })}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        settings.feedbackLanguage === lang.code
                        ? 'bg-green-600 text-white shadow-md shadow-green-500/30'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                    {lang.label}
                </button>
            ))}
        </div>
      </section>

      {/* Appearance Section */}
       <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between cursor-pointer" onClick={toggleDarkMode}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${settings.darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
                    {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                    <div className="text-slate-900 dark:text-white font-medium">Dark Mode</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark themes</div>
                </div>
            </div>
            
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.darkMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${settings.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
       </section>

    </div>
  );
};

export default Settings;