import React from 'react';
import { UserSettings, UserStats } from '../types';
import { DEFAULT_SETTINGS, INITIAL_STATS } from '../constants';

// Create a Context for global state
export const AppContext = React.createContext<{
    settings: UserSettings;
    stats: UserStats;
    updateSettings: (newSettings: Partial<UserSettings>) => void;
    updateStats: (newStats: Partial<UserStats>) => void;
    user: any;
    logout: () => void;
}>({
    settings: DEFAULT_SETTINGS,
    stats: INITIAL_STATS,
    updateSettings: () => { },
    updateStats: () => { },
    user: null,
    logout: () => { },
});
