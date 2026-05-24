import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trophy, Crosshair, Star, BarChart3, X, ArrowLeftRight } from 'lucide-react';
import FadeIn from '../components/animations/FadeIn';
import { iplPlayers } from '../data/iplLegends';
import { iplSquads } from '../data/iplSquads';

const roles = ['All', 'Batsman', 'Bowler', 'All-rounder', 'WK-Batsman'];
const MAX_RUNS = 8661;
const MAX_WICKETS = 205;

const StatBar = ({ value, max, color, label, delay = 0 }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase tracking-wider">
      <span>{label}</span>
      <span className="text-slate-800 dark:text-white font-black text-xs">{value.toLocaleString()}</span>
    </div>
    <div className="h-2 rounded-full bg-slate-100 dark:bg-gray-900 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  </div>
);

const PlayerSpotlight = ({ setActivePage }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [compare, setCompare] = useState([]); // [player1, player2]
  const [showCompare, setShowCompare] = useState(false);

  const allPlayers = useMemo(() => {
    const merged = [...iplPlayers];
    if (typeof iplSquads !== 'undefined') {
      iplSquads.forEach(sq => {
        if (!merged.find(p => p.name === sq.name)) {
          merged.push({
            role: sq.role || 'Player',
            emoji: '🏏',
            runs: sq.runs ?? 0,
            wickets: sq.wickets ?? 0,
            matches: sq.matches ?? 0,
            sixes: sq.sixes ?? 0,
            fifties: sq.fifties ?? 0,
            hundreds: sq.hundreds ?? 0,
            highest_score: sq.highest_score ?? 0,
            best_bowling: sq.best_bowling || 'N/A',
            ...sq,
          });
        }
      });
    }
    return merged;
  }, []);

  const filtered = useMemo(() => {
    return allPlayers.filter(p => {
      const matchName = p.name.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'All' || p.role === roleFilter;
      const matchTeam = search.length <= 4 && p.team && p.team.toLowerCase().includes(search.toLowerCase());
      return (matchName || matchTeam) && matchRole;
    });
  }, [search, roleFilter, allPlayers]);

  const toggleCompare = (player) => {
    setCompare(prev => {
      if (prev.find(p => p.name === player.name)) {
        return prev.filter(p => p.name !== player.name);
      }
      if (prev.length >= 2) return [prev[1], player];
      return [...prev, player];
    });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <FadeIn>
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-950/20 mb-4">
            <Star className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 dark:text-purple-400">Player Hall of Fame</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Player <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">Spotlight</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm max-w-lg mx-auto">
            The greatest IPL legends — stats, records, and head-to-head comparisons.
          </p>
          {setActivePage && (
            <button
              onClick={() => setActivePage('teams')}
              className="mt-6 px-6 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 font-bold transition-all"
            >
              View Franchise Teams →
            </button>
          )}
        </div>
      </FadeIn>

      {/* Search + Filters + Compare */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
            />
          </div>
          {/* Compare button */}
          {compare.length === 2 && (
            <button
              onClick={() => setShowCompare(true)}
              className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs active:scale-95 transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Compare ({compare.length}/2)
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                roleFilter === role
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-white dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 border border-slate-200 dark:border-gray-800 hover:border-purple-400'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Selected for compare */}
      {compare.length > 0 && (
        <div className="flex items-center justify-center gap-2 mb-6 text-xs text-gray-500">
          <span>Comparing:</span>
          {compare.map(p => (
            <span key={p.name} className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1">
              {p.emoji} {p.name}
              <button onClick={() => toggleCompare(p)} className="ml-1 hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          ))}
          {compare.length < 2 && <span className="text-gray-400 italic">Select one more player</span>}
        </div>
      )}

      {/* Players Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={roleFilter + search}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((player, i) => {
            const isSelected = compare.find(p => p.name === player.name);
            return (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                whileHover={{ y: -4 }}
                className={`rounded-3xl border p-5 transition-all cursor-pointer shadow-lg ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20 ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]/60 hover:border-purple-400 dark:hover:border-purple-600'
                }`}
                onClick={() => toggleCompare(player)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/30 bg-slate-100 dark:bg-gray-800 shrink-0 flex items-center justify-center text-2xl shadow-inner">
                      {player.image ? (
                        <img 
                          src={player.image} 
                          alt={player.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-2xl">${player.emoji}</span>`;
                          }}
                        />
                      ) : (
                        <span>{player.emoji}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight truncate">{player.name}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{player.team}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">{player.role}</span>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-purple-500 text-white px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>

                {/* Stat Bars */}
                <div className="space-y-3 mb-4">
                  <StatBar value={player.runs} max={MAX_RUNS} color="from-blue-500 to-cyan-500" label="Runs" delay={i * 0.05} />
                  <StatBar value={player.wickets} max={MAX_WICKETS} color="from-red-500 to-orange-500" label="Wickets" delay={i * 0.05 + 0.1} />
                </div>

                {/* Quick stats grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { v: player.matches, l: 'Matches' },
                    { v: player.sixes, l: 'Sixes' },
                    { v: player.fifties, l: '50s' },
                    { v: player.hundreds, l: '100s' }
                  ].map(s => (
                    <div key={s.l} className="text-center p-1.5 rounded-lg bg-slate-50 dark:bg-gray-900/50">
                      <span className="block text-sm font-black text-slate-900 dark:text-white">{s.v}</span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase">{s.l}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400 text-sm">No players found matching your search.</div>
      )}

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && compare.length === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowCompare(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-gray-800 shadow-2xl p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-purple-500" />
                  Player Comparison
                </h3>
                <button onClick={() => setShowCompare(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Comparison table */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {/* Headers */}
                <div className="p-3 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/30 bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-3xl mb-2 shadow-inner">
                    {compare[0].image ? (
                      <img 
                        src={compare[0].image} 
                        alt={compare[0].name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span class="text-3xl">${compare[0].emoji}</span>`;
                        }}
                      />
                    ) : (
                      <span>{compare[0].emoji}</span>
                    )}
                  </div>
                  <span className="font-black text-sm text-slate-900 dark:text-white block leading-tight">{compare[0].name}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{compare[0].team}</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-xs font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest bg-slate-100 dark:bg-gray-900 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-gray-800">VS</span>
                </div>
                <div className="p-3 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/30 bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-3xl mb-2 shadow-inner">
                    {compare[1].image ? (
                      <img 
                        src={compare[1].image} 
                        alt={compare[1].name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span class="text-3xl">${compare[1].emoji}</span>`;
                        }}
                      />
                    ) : (
                      <span>{compare[1].emoji}</span>
                    )}
                  </div>
                  <span className="font-black text-sm text-slate-900 dark:text-white block leading-tight">{compare[1].name}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{compare[1].team}</span>
                </div>

                {/* Stats rows */}
                {[
                  { label: 'Runs', key: 'runs' },
                  { label: 'Wickets', key: 'wickets' },
                  { label: 'Matches', key: 'matches' },
                  { label: 'Sixes', key: 'sixes' },
                  { label: 'Fifties', key: 'fifties' },
                  { label: 'Hundreds', key: 'hundreds' },
                  { label: 'Catches', key: 'catches' }
                ].map(stat => {
                  const v0 = compare[0][stat.key];
                  const v1 = compare[1][stat.key];
                  const winner = v0 > v1 ? 0 : v1 > v0 ? 1 : -1;
                  return (
                    <React.Fragment key={stat.key}>
                      <div className={`p-2 rounded-lg ${winner === 0 ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}>
                        <span className={`font-black text-base ${winner === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-gray-300'}`}>
                          {v0.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                      </div>
                      <div className={`p-2 rounded-lg ${winner === 1 ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}>
                        <span className={`font-black text-base ${winner === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-gray-300'}`}>
                          {v1.toLocaleString()}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerSpotlight;
