import React from 'react';
import { statsService } from '../services/statsService';
import { useCachedData } from '../hooks/useCachedData';
import { useTheme } from '../context/ThemeContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  History, 
  MapPin, 
  TrendingUp,
  Award
} from 'lucide-react';

const Historical = () => {
  const { theme } = useTheme();
  
  // Use Stale-While-Revalidate cached data (TTL of 10 minutes)
  const { data: stats, loading, error } = useCachedData(
    'historical_summary', 
    async () => {
      const res = await statsService.getSummary();
      return res.data;
    },
    600000 
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center animate-pulse">
        <History className="w-12 h-12 text-indigo-500 dark:text-cyan-400 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white font-sans">Compiling Historical Analytics...</h3>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-505 dark:text-red-400 font-semibold">{error || 'Data unavailable.'}</p>
      </div>
    );
  }

  // Find the highest scoring venue
  const highestScoringVenue = [...stats.venue_bias].sort((a, b) => b.avg_first_innings_score - a.avg_first_innings_score)[0];
  // Find the venue with the highest chasing advantage
  const highestChasingAdvVenue = [...stats.venue_bias].sort((a, b) => b.chasing_advantage_pct - a.chasing_advantage_pct)[0];

  const tooltipStyle = theme === 'dark' 
    ? { backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px', color: '#f3f4f6' }
    : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center space-x-3 p-6 glass-card border-indigo-500/25 dark:border-cyan-500/20 bg-gradient-to-r from-slate-100 to-indigo-500/5 dark:from-[#111827]/80 dark:to-cyan-500/5">
        <span className="text-3xl select-none">Stadiums</span>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">Historical Venue & Toss Insights</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Explore venue scoring patterns, chasing advantages, and toss correlations calculated from over 1,000 matches.
          </p>
        </div>
      </div>

      {/* Insight highlights cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Matches */}
        <div className="glass-card p-6 bg-white/80 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold block">Total Match Archive</span>
          <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{stats.total_matches} Games</span>
          <p className="text-xs text-gray-400 mt-1">Spanning over {stats.total_seasons} seasons (2008–2026).</p>
        </div>

        {/* Chasing Hotspot */}
        {highestChasingAdvVenue && (
          <div className="glass-card p-6 bg-white/80 dark:bg-[#111827]/40 border-indigo-500/10 dark:border-emerald-500/10 hover:border-indigo-500/30 dark:hover:border-emerald-500/20 transition-all">
            <span className="text-xs text-indigo-600 dark:text-emerald-400 uppercase tracking-widest font-bold block">Chasing Paradise</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block truncate" title={highestChasingAdvVenue.venue}>
              {highestChasingAdvVenue.venue}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Chasing team wins {Math.round(highestChasingAdvVenue.chasing_advantage_pct)}% of games here.
            </p>
          </div>
        )}

        {/* Scoring Hotspot */}
        {highestScoringVenue && (
          <div className="glass-card p-6 bg-white/80 dark:bg-[#111827]/40 border-indigo-500/10 dark:border-cyan-500/10 hover:border-indigo-500/30 dark:hover:border-cyan-500/20 transition-all">
            <span className="text-xs text-indigo-600 dark:text-cyan-400 uppercase tracking-widest font-bold block">Batter's Heaven</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block truncate" title={highestScoringVenue.venue}>
              {highestScoringVenue.venue}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Highest average first innings score of {highestScoringVenue.avg_first_innings_score} runs.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chasing Advantage Bar Chart */}
        <div className="glass-card p-6 bg-white/80 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2 font-display">
            <MapPin className="w-5 h-5 text-indigo-600 dark:text-emerald-400" />
            <span>Chasing Success Rate by Stadium (%)</span>
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.venue_bias} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#4b5563" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="venue" stroke="#4b5563" fontSize={9} width={120} tickLine={false} />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                />
                <Bar dataKey="chasing_advantage_pct" name="Chasing Win %" fill="#10b981" radius={[0, 4, 4, 0]}>
                  {stats.venue_bias.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.chasing_advantage_pct >= 52.0 
                          ? (theme === 'dark' ? '#10b981' : '#4f46e5') 
                          : (theme === 'dark' ? '#1f2937' : '#cbd5e1')
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Avg Score Bar Chart */}
        <div className="glass-card p-6 bg-white/80 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2 font-display">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
            <span>Average 1st Innings Score by Stadium</span>
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.venue_bias} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
                <XAxis type="number" domain={[140, 190]} stroke="#4b5563" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="venue" stroke="#4b5563" fontSize={9} width={120} tickLine={false} />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                />
                <Bar dataKey="avg_first_innings_score" name="Avg 1st Inn Score" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                  {stats.venue_bias.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.avg_first_innings_score >= 165.0 
                          ? (theme === 'dark' ? '#06b6d4' : '#0284c7') 
                          : (theme === 'dark' ? '#1f2937' : '#cbd5e1')
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historical;
