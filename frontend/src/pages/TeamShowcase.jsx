import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, MapPin, Users, Swords, ChevronDown, Crown, Target } from 'lucide-react';
import FadeIn from '../components/animations/FadeIn';
import { iplTeams } from '../data/iplTeams';

const TeamShowcase = () => {
  const [expandedTeam, setExpandedTeam] = useState(null);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <FadeIn>
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/20 mb-4">
            <Users className="w-4 h-4 text-indigo-500 dark:text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-emerald-400">Franchise Directory</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            IPL <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">Team Showcase</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm max-w-lg mx-auto">
            All 10 IPL franchises — explore team stats, squads, rivalries, and championship history.
          </p>
        </div>
      </FadeIn>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {iplTeams.map((team, i) => {
          const isExpanded = expandedTeam === team.id;
          return (
            <FadeIn key={team.id} delay={i * 0.06}>
              <motion.div
                layout
                whileHover={{ y: -4 }}
                className={`card-3d rounded-3xl border overflow-hidden transition-all duration-300 cursor-pointer shadow-xl ${
                  isExpanded
                    ? `${team.borderColor} bg-white dark:bg-[#111827]/80`
                    : 'border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]/60'
                }`}
                onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
              >
                {/* Team gradient header */}
                <div className={`h-2 bg-gradient-to-r ${team.gradient}`}></div>

                <div className="p-6">
                  {/* Team name & badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex gap-3 items-center min-w-0 flex-1">
                      {team.logo && (
                        <div className="w-10 h-10 shrink-0 bg-slate-50 dark:bg-gray-800 p-1.5 rounded-xl border border-slate-100 dark:border-gray-750 flex items-center justify-center shadow-inner">
                          <img 
                            src={team.logo} 
                            alt={team.name} 
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight truncate">{team.name}</h3>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r ${team.gradient} text-white shrink-0`}>
                            {team.short}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold italic truncate">"{team.motto}"</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 text-right min-w-[100px]">
                      {team.titles > 0 ? (
                        <div className="flex items-center justify-end gap-1 mb-1">
                          {Array.from({ length: Math.min(team.titles, 5) }).map((_, idx) => (
                            <Trophy key={idx} className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold bg-slate-100 dark:bg-gray-800/60 px-2 py-0.5 rounded-md">No titles yet</span>
                      )}
                      {team.titles > 0 && (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 leading-tight block max-w-[120px] break-words">
                          {team.titleYears.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Played', value: team.stats.played },
                      { label: 'Won', value: team.stats.won },
                      { label: 'Lost', value: team.stats.lost },
                      { label: 'Win %', value: `${team.stats.winPct}%` }
                    ].map(s => (
                      <div key={s.label} className="text-center p-2 rounded-xl bg-slate-50 dark:bg-gray-900/50">
                        <span className="block text-lg font-black text-slate-900 dark:text-white">{s.value}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Win percentage bar */}
                  <div className="mb-4">
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-gray-900 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${team.stats.winPct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${team.gradient}`}
                      />
                    </div>
                  </div>

                  {/* Info row */}
                  <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><Crown className="w-3 h-3" /> {team.captain}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {team.homeGround.split(',')[0]}</span>
                  </div>

                  {/* Expand toggle */}
                  <div className="flex items-center justify-center">
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-gray-800 space-y-4">
                          {/* Key Players */}
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                              <Target className="w-3 h-3" /> Key Players
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {team.keyPlayers.map(p => (
                                <span key={p} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Rivalries */}
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                              <Swords className="w-3 h-3" /> Top Rivalries
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {team.rivals.map(r => (
                                <span key={r} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20">
                                  🔥 {r}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Coach & Founded */}
                          <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-gray-400">
                            <span>🏟️ Coach: <strong>{team.coach}</strong></span>
                            <span>📅 Founded: <strong>{team.founded}</strong></span>
                            <span>🏆 Best Season: <strong>{team.stats.bestSeason}</strong></span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
};

export default TeamShowcase;
