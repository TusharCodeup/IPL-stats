import React, { useState, useEffect } from 'react';
import { statsService } from '../services/statsService';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../context/ThemeContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  CheckCircle2, 
  XCircle, 
  Zap, 
  TrendingUp
} from 'lucide-react';

const TeamAnalytics = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  
  const { loading, error, execute } = useApi();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await execute(() => statsService.getSummary());
      setStats(data);
      if (data.team_stats.length >= 2) {
        setTeamA(data.team_stats[0].team_name);
        setTeamB(data.team_stats[1].team_name);
      }
    } catch (err) {
      console.error('Failed to load team analytics:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center animate-pulse">
        <TrendingUp className="w-12 h-12 text-indigo-500 dark:text-emerald-400 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Compiling Team Strength Metrics...</h3>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 dark:text-red-400 font-semibold">{error || 'Data unavailable.'}</p>
      </div>
    );
  }

  const teamAData = stats.team_stats.find(t => t.team_name === teamA);
  const teamBData = stats.team_stats.find(t => t.team_name === teamB);

  // Generate Comparison Chart Data
  const chartData = [
    {
      metric: 'Win Rate %',
      [teamA]: teamAData ? Math.round(teamAData.win_rate * 100) : 0,
      [teamB]: teamBData ? Math.round(teamBData.win_rate * 100) : 0,
    },
    {
      metric: 'Matches Played',
      [teamA]: teamAData ? teamAData.matches_played : 0,
      [teamB]: teamBData ? teamBData.matches_played : 0,
    },
    {
      metric: 'Total Wins',
      [teamA]: teamAData ? teamAData.wins : 0,
      [teamB]: teamBData ? teamBData.wins : 0,
    }
  ];

  const tooltipStyle = theme === 'dark' 
    ? { backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px', color: '#f3f4f6' }
    : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in transition-colors duration-300">
      {/* Title Header */}
      <div className="flex items-center space-x-3 p-6 glass-card border-indigo-500/20 dark:border-emerald-500/20 bg-gradient-to-r from-slate-100 to-indigo-500/5 dark:from-[#111827]/80 dark:to-emerald-500/5">
        <span className="text-3xl select-none">📊</span>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">Team Comparison & Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Compare overall franchise win rates, match counts, and dynamic form histories side-by-side.
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 glass-card bg-white/70 dark:bg-[#111827]/30 border-slate-200 dark:border-gray-800">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Compare Team A</label>
          <select
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
          >
            {stats.team_stats.map((t) => (
              <option key={t.team_name} value={t.team_name} disabled={t.team_name === teamB}>
                {t.team_name} (WR: {Math.round(t.win_rate * 100)}%)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Against Team B</label>
          <select
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
          >
            {stats.team_stats.map((t) => (
              <option key={t.team_name} value={t.team_name} disabled={t.team_name === teamA}>
                {t.team_name} (WR: {Math.round(t.win_rate * 100)}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team A Details */}
        <div className="glass-card p-6 bg-white/70 dark:bg-[#111827]/40 border-slate-200 dark:border-emerald-500/10 hover:border-indigo-500/20 dark:hover:border-emerald-500/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{teamA}</h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-indigo-500/20 dark:border-emerald-500/20">Team A</span>
          </div>

          {teamAData && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 dark:bg-gray-950 p-3 rounded-xl border border-slate-200 dark:border-gray-900 transition-colors">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Played</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">{teamAData.matches_played}</span>
                </div>
                <div className="bg-slate-50 dark:bg-gray-950 p-3 rounded-xl border border-slate-200 dark:border-gray-900 transition-colors">
                  <span className="text-[10px] text-indigo-500 dark:text-emerald-500 uppercase tracking-widest block font-bold">Wins</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-emerald-400 mt-1 block">{teamAData.wins}</span>
                </div>
                <div className="bg-slate-50 dark:bg-gray-950 p-3 rounded-xl border border-slate-200 dark:border-gray-900 transition-colors">
                  <span className="text-[10px] text-red-500 uppercase tracking-widest block font-bold">Losses</span>
                  <span className="text-lg font-black text-red-600 dark:text-red-400 mt-1 block">{teamAData.losses}</span>
                </div>
              </div>

              {/* Form */}
              <div className="bg-slate-50 dark:bg-gray-950 p-4 rounded-2xl border border-slate-200 dark:border-gray-900 space-y-2 transition-colors">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Recent Matches Form</span>
                <div className="flex items-center space-x-3">
                  {teamAData.form.map((res, i) => (
                    <div key={i} className="flex items-center space-x-1">
                      {res === 'W' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  ))}
                  {teamAData.form.length === 0 && <span className="text-xs text-gray-500">No recent matches logged.</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Team B Details */}
        <div className="glass-card p-6 bg-white/70 dark:bg-[#111827]/40 border-slate-200 dark:border-cyan-500/10 hover:border-indigo-500/20 dark:hover:border-cyan-500/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{teamB}</h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 border border-cyan-500/20 dark:border-cyan-500/20">Team B</span>
          </div>

          {teamBData && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 dark:bg-gray-950 p-3 rounded-xl border border-slate-200 dark:border-gray-900 transition-colors">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Played</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">{teamBData.matches_played}</span>
                </div>
                <div className="bg-slate-50 dark:bg-gray-950 p-3 rounded-xl border border-slate-200 dark:border-gray-900 transition-colors">
                  <span className="text-[10px] text-cyan-500 uppercase tracking-widest block font-bold">Wins</span>
                  <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 mt-1 block">{teamBData.wins}</span>
                </div>
                <div className="bg-slate-50 dark:bg-gray-950 p-3 rounded-xl border border-slate-200 dark:border-gray-900 transition-colors">
                  <span className="text-[10px] text-red-500 uppercase tracking-widest block font-bold">Losses</span>
                  <span className="text-lg font-black text-red-600 dark:text-red-400 mt-1 block">{teamBData.losses}</span>
                </div>
              </div>

              {/* Form */}
              <div className="bg-slate-50 dark:bg-gray-950 p-4 rounded-2xl border border-slate-200 dark:border-gray-900 space-y-2 transition-colors">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Recent Matches Form</span>
                <div className="flex items-center space-x-3">
                  {teamBData.form.map((res, i) => (
                    <div key={i} className="flex items-center space-x-1">
                      {res === 'W' ? (
                        <CheckCircle2 className="w-6 h-6 text-cyan-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  ))}
                  {teamBData.form.length === 0 && <span className="text-xs text-gray-500">No recent matches logged.</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side-by-Side Visual Chart */}
        <div className="glass-card p-6 bg-white/70 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800 lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2 font-display">
            <Zap className="w-5 h-5 text-indigo-500 dark:text-yellow-400" />
            <span>Side-by-Side Metrics</span>
          </h3>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="metric" stroke="#4b5563" fontSize={11} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                />
                <Bar dataKey={teamA} fill={theme === 'dark' ? '#10b981' : '#4f46e5'} radius={[8, 8, 0, 0]} />
                <Bar dataKey={teamB} fill={theme === 'dark' ? '#06b6d4' : '#0ea5e9'} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalytics;
