import React, { useContext, useRef, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, XCircle, CheckCircle, AlertCircle, Eye, EyeOff, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

const Profile: React.FC = () => {
    const { stats, settings, updateSettings, user } = useContext(AppContext);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Auto-dismiss notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
    };

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);

    const handlePasswordChange = async () => {
        if (!user || !user.id) {
            showNotification('User ID not found. Please log in again.', 'error');
            return;
        }

        if (!newPassword || !confirmPassword) {
            showNotification('Please fill in all password fields.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('Passwords do not match.', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showNotification('Password must be at least 6 characters long.', 'error');
            return;
        }

        setChangingPassword(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: user.username,
                    role: user.role,
                    password: newPassword
                })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    showNotification('Session expired. Please log out and log in again.', 'error');
                    setChangingPassword(false);
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update password');
            }

            showNotification('Password updated successfully.', 'success');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error: any) {
            console.error('Error updating password:', error);
            showNotification(error.message, 'error');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLevel = e.target.value as any;
        updateSettings({ level: newLevel });
        showNotification(`Academic level updated to ${newLevel}`, 'success');
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showNotification('Formato no válido. Solo se permiten archivos JPG o PNG.', 'error');
            return;
        }

        if (file.size > 1024 * 1024) { // 1MB
            showNotification('Archivo demasiado grande. El tamaño máximo permitido es 1 MB.', 'error');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            // 1. Upload Image
            const uploadResponse = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.message || 'Error en la subida');
            }
            const { imageUrl } = await uploadResponse.json();

            // 2. Update User Profile
            const token = localStorage.getItem('token');
            const updateResponse = await fetch(`http://localhost:3001/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: user.username,
                    role: user.role,
                    profile_picture: imageUrl
                })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(errorData.message || 'Error al actualizar el perfil');
            }

            // 3. Update Local Storage and Context (Reload to sync)
            const updatedUser = { ...user, profile_picture: imageUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            showNotification('Foto de perfil actualizada correctamente.', 'success');

            // Small delay to show success before reload
            setTimeout(() => window.location.reload(), 2000);

        } catch (error: any) {
            console.error('Error uploading profile picture:', error);
            showNotification(`No se pudo actualizar la foto: ${error.message}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8 relative">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, x: '-50%' }}
                        className={`fixed top-6 left-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${notification.type === 'error'
                            ? 'bg-red-500/90 text-white border-red-400'
                            : 'bg-green-500/90 text-white border-green-400'
                            }`}
                    >
                        {notification.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
                        <span className="font-medium text-lg">{notification.message}</span>
                        <button onClick={() => setNotification(null)} className="ml-2 opacity-80 hover:opacity-100">
                            <XCircle size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Glass Header */}
            <div className="glass-card p-8 rounded-[2rem] flex items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 blur-lg opacity-60 animate-pulse" />
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-white to-blue-50 border-4 border-white dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-xl">
                        {user?.profile_picture ? (
                            <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-5xl font-extrabold text-blue-600">
                                {user?.username?.charAt(0).toUpperCase() || settings.name.charAt(0)}
                            </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={32} />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    {uploading && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full shadow-md">Uploading...</div>}
                </div>

                <div>
                    <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
                        {user?.username || settings.name}
                    </h2>
                </div>
            </div>

            {/* Academic Profile Section */}
            <div className="glass-card p-8 rounded-[2rem] relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="text-slate-400" size={20} />
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Difficulty Level</span>
                </div>

                <div className="relative max-w-md mx-auto">
                    <button
                        onClick={() => setIsLevelMenuOpen(!isLevelMenuOpen)}
                        className="w-full py-4 px-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-xl text-slate-700 dark:text-slate-200">{settings.level}</span>
                            <span className="text-sm text-slate-400 font-medium">
                                {settings.level === 'A1' && '(Pre-básico)'}
                                {settings.level === 'A2' && '(Básico)'}
                                {settings.level === 'B1' && '(Pre-Intermedio)'}
                                {settings.level === 'B2' && '(Intermedio)'}
                                {settings.level === 'C1' && '(Avanzado)'}
                                {settings.level === 'C2' && '(Profesional)'}
                            </span>
                        </div>
                        {isLevelMenuOpen ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400 group-hover:text-blue-500 transition-colors" />}
                    </button>

                    <AnimatePresence>
                        {isLevelMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="absolute top-full left-0 right-0 mt-2 z-20 bg-slate-50 dark:bg-slate-900 rounded-3xl p-2 space-y-1 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden"
                            >
                                {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => {
                                            updateSettings({ level: lvl });
                                            setIsLevelMenuOpen(false);
                                            showNotification(`Academic level updated to ${lvl}`, 'success');
                                        }}
                                        className={`w-full py-3 rounded-2xl text-center font-bold transition-all duration-300 ${settings.level === lvl
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                                            }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-8 flex justify-between items-center px-2 max-w-md mx-auto">
                    <span className="text-slate-400 font-medium text-sm">Current Goal:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                        {settings.level === 'A1' && 'Pre-básico'}
                        {settings.level === 'A2' && 'Básico'}
                        {settings.level === 'B1' && 'Pre-Intermedio'}
                        {settings.level === 'B2' && 'Intermedio'}
                        {settings.level === 'C1' && 'Avanzado'}
                        {settings.level === 'C2' && 'Profesional'}
                    </span>
                </div>
            </div>

            {/* Change Password Section */}
            <div className="glass-card p-8 rounded-[2rem]">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Security</h3>
                <div className="space-y-4 max-w-md">
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="font-semibold mb-1">Password Requirements:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                            <li>At least 6 characters long</li>
                            <li>Use a mix of letters and numbers for better security</li>
                        </ul>
                    </div>

                    <button
                        onClick={handlePasswordChange}
                        disabled={changingPassword}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                    >
                        {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;