import React, { useContext } from 'react';
import { AppContext } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { stats, settings } = useContext(AppContext);

  const progressData = [
    { name: 'Fluency', value: 75, color: '#3b82f6' },
    { name: 'Grammar', value: 60, color: '#8b5cf6' },
    { name: 'Vocab', value: 85, color: '#10b981' },
  ];

  const activityData = [
    { day: 'Mon', xp: 120 },
    { day: 'Tue', xp: 200 },
    { day: 'Wed', xp: 150 },
    { day: 'Thu', xp: 300 },
    { day: 'Fri', xp: 250 },
    { day: 'Sat', xp: 180 },
    { day: 'Sun', xp: stats.xp > 1500 ? 220 : 100 },
  ];

  return (
    <div className="space-y-8">
       {/* Glass Header */}
       <div className="glass-card p-8 rounded-[2rem] flex items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 blur-lg opacity-60 animate-pulse" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white to-blue-50 border-4 border-white dark:border-slate-700 flex items-center justify-center text-5xl font-extrabold text-blue-600 shadow-xl">
                  {settings.name.charAt(0)}
              </div>
          </div>
          
          <div>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{settings.name}</h2>
              <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-sm">
                    Level {stats.level} Scholar
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm">
                    {settings.level} Target
                  </span>
              </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-6 rounded-[2rem]"
          >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full"/> Skills Radar
              </h3>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={progressData}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={8}
                              dataKey="value"
                              stroke="none"
                              cornerRadius={6}
                          >
                              {progressData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Pie>
                      </PieChart>
                  </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                  {progressData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{d.name}</span>
                      </div>
                  ))}
              </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-6 rounded-[2rem]"
          >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full"/> Activity
              </h3>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData}>
                          <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="xp" fill="url(#colorXp)" radius={[6, 6, 6, 6]} barSize={12} />
                          <defs>
                            <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </motion.div>
       </div>

       <div className="glass-card p-8 rounded-[2rem]">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Trophy Case</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[1, 2, 3, 4].map((i) => (
                 <motion.div 
                    key={i}
                    whileHover={{ scale: 1.05, rotateY: 10 }}
                    className={`relative p-6 rounded-2xl flex flex-col items-center text-center gap-3 border transition-all ${
                        i <= 2 
                        ? 'bg-gradient-to-br from-yellow-100 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/10 border-yellow-200 dark:border-yellow-700/30' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 grayscale opacity-70'
                    }`}
                 >
                    <div className="text-5xl drop-shadow-md filter">
                        {i === 1 ? '🗣️' : i === 2 ? '🔥' : i === 3 ? '🧠' : '👑'}
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {i === 1 ? 'First Talk' : i === 2 ? 'Week Streak' : i === 3 ? 'Grammar Wiz' : 'Legend'}
                    </div>
                    {i <= 2 && <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_orange]" />}
                 </motion.div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default Profile;