import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ShieldAlert, Award, Star, ArrowUpRight, TrendingUp, Info } from 'lucide-react';
import FadeIn from '../components/animations/FadeIn';
import { iplTeams } from '../data/iplTeams';

const seasonsData = {
  '2026': [
    { rank: 1, name: 'Royal Challengers Bengaluru', short: 'RCB', played: 14, won: 9, lost: 5, nr: 0, pts: 18, nrr: 0.783, form: ['W', 'L', 'W', 'W', 'W'], emoji: '👑', color: 'from-red-600 to-red-800' },
    { rank: 2, name: 'Gujarat Titans', short: 'GT', played: 14, won: 9, lost: 5, nr: 0, pts: 18, nrr: 0.695, form: ['W', 'W', 'L', 'W', 'L'], emoji: '🌟', color: 'from-slate-700 to-cyan-700' },
    { rank: 3, name: 'Sunrisers Hyderabad', short: 'SRH', played: 14, won: 9, lost: 5, nr: 0, pts: 18, nrr: 0.524, form: ['L', 'W', 'W', 'L', 'W'], emoji: '🧡', color: 'from-orange-500 to-orange-700' },
    { rank: 4, name: 'Rajasthan Royals', short: 'RR', played: 13, won: 7, lost: 6, nr: 0, pts: 14, nrr: 0.083, form: ['W', 'L', 'W', 'L', 'L'], emoji: '🦊', color: 'from-pink-600 to-pink-800' },
    { rank: 5, name: 'Punjab Kings', short: 'PBKS', played: 13, won: 6, lost: 6, nr: 1, pts: 13, nrr: 0.227, form: ['L', 'W', 'L', 'W', 'L'], emoji: '🔴', color: 'from-red-600 to-red-700' },
    { rank: 6, name: 'Kolkata Knight Riders', short: 'KKR', played: 13, won: 6, lost: 6, nr: 1, pts: 13, nrr: 0.011, form: ['W', 'L', 'L', 'W', 'W'], emoji: '💜', color: 'from-purple-600 to-purple-900' },
    { rank: 7, name: 'Chennai Super Kings', short: 'CSK', played: 14, won: 6, lost: 8, nr: 0, pts: 12, nrr: -0.345, form: ['L', 'W', 'L', 'L', 'L'], emoji: '🦁', color: 'from-yellow-500 to-amber-600' },
    { rank: 8, name: 'Delhi Capitals', short: 'DC', played: 13, won: 6, lost: 7, nr: 0, pts: 12, nrr: -0.871, form: ['L', 'L', 'W', 'W', 'L'], emoji: '🛡️', color: 'from-blue-700 to-red-600' },
    { rank: 9, name: 'Mumbai Indians', short: 'MI', played: 13, won: 4, lost: 9, nr: 0, pts: 8, nrr: -0.510, form: ['W', 'L', 'L', 'L', 'L'], emoji: '💥', color: 'from-blue-600 to-blue-800' },
    { rank: 10, name: 'Lucknow Super Giants', short: 'LSG', played: 13, won: 4, lost: 9, nr: 0, pts: 8, nrr: -0.702, form: ['L', 'L', 'W', 'L', 'L'], emoji: '🌀', color: 'from-cyan-500 to-blue-700' }
  ],
  '2025': [
    { rank: 1, name: 'Punjab Kings', short: 'PBKS', played: 14, won: 9, lost: 4, nr: 1, pts: 19, nrr: 0.372, form: ['L', 'W', 'L', 'W', 'W'], emoji: '🔴', color: 'from-red-600 to-red-700' },
    { rank: 2, name: 'Royal Challengers Bengaluru', short: 'RCB', played: 14, won: 9, lost: 4, nr: 1, pts: 19, nrr: 0.301, form: ['W', 'W', 'W', 'L', 'W'], emoji: '👑', color: 'from-red-600 to-red-800' },
    { rank: 3, name: 'Gujarat Titans', short: 'GT', played: 14, won: 9, lost: 5, nr: 0, pts: 18, nrr: 0.254, form: ['W', 'L', 'W', 'W', 'L'], emoji: '🌟', color: 'from-slate-700 to-cyan-700' },
    { rank: 4, name: 'Mumbai Indians', short: 'MI', played: 14, won: 8, lost: 6, nr: 0, pts: 16, nrr: 1.142, form: ['W', 'W', 'L', 'W', 'L'], emoji: '💥', color: 'from-blue-600 to-blue-800' },
    { rank: 5, name: 'Delhi Capitals', short: 'DC', played: 14, won: 7, lost: 6, nr: 1, pts: 15, nrr: 0.011, form: ['L', 'W', 'W', 'L', 'W'], emoji: '🛡️', color: 'from-blue-700 to-red-600' },
    { rank: 6, name: 'Sunrisers Hyderabad', short: 'SRH', played: 14, won: 6, lost: 7, nr: 1, pts: 13, nrr: -0.241, form: ['L', 'L', 'W', 'L', 'W'], emoji: '🧡', color: 'from-orange-500 to-orange-700' },
    { rank: 7, name: 'Lucknow Super Giants', short: 'LSG', played: 14, won: 6, lost: 8, nr: 0, pts: 12, nrr: -0.376, form: ['W', 'L', 'L', 'W', 'L'], emoji: '🌀', color: 'from-cyan-500 to-blue-700' },
    { rank: 8, name: 'Kolkata Knight Riders', short: 'KKR', played: 14, won: 5, lost: 7, nr: 2, pts: 12, nrr: -0.305, form: ['L', 'W', 'L', 'L', 'W'], emoji: '💜', color: 'from-purple-600 to-purple-900' },
    { rank: 9, name: 'Rajasthan Royals', short: 'RR', played: 14, won: 4, lost: 10, nr: 0, pts: 8, nrr: -0.549, form: ['L', 'L', 'L', 'W', 'L'], emoji: '🦊', color: 'from-pink-600 to-pink-800' },
    { rank: 10, name: 'Chennai Super Kings', short: 'CSK', played: 14, won: 4, lost: 10, nr: 0, pts: 8, nrr: -0.647, form: ['L', 'L', 'W', 'L', 'L'], emoji: '🦁', color: 'from-yellow-500 to-amber-600' }
  ],
  '2024': [
    { rank: 1, name: 'Kolkata Knight Riders', short: 'KKR', played: 14, won: 9, lost: 3, nr: 2, pts: 20, nrr: 1.428, form: ['W', 'W', 'W', 'W', 'L'], emoji: '💜', color: 'from-purple-600 to-purple-900' },
    { rank: 2, name: 'Sunrisers Hyderabad', short: 'SRH', played: 14, won: 8, lost: 5, nr: 1, pts: 17, nrr: 0.414, form: ['W', 'L', 'W', 'W', 'L'], emoji: '🧡', color: 'from-orange-500 to-orange-700' },
    { rank: 3, name: 'Rajasthan Royals', short: 'RR', played: 14, won: 8, lost: 5, nr: 1, pts: 17, nrr: 0.273, form: ['L', 'L', 'L', 'L', 'W'], emoji: '🦊', color: 'from-pink-600 to-pink-800' },
    { rank: 4, name: 'Royal Challengers Bengaluru', short: 'RCB', played: 14, won: 7, lost: 7, nr: 0, pts: 14, nrr: 0.459, form: ['W', 'W', 'W', 'W', 'W'], emoji: '👑', color: 'from-red-600 to-red-800' },
    { rank: 5, name: 'Chennai Super Kings', short: 'CSK', played: 14, won: 7, lost: 7, nr: 0, pts: 14, nrr: 0.428, form: ['L', 'W', 'L', 'W', 'L'], emoji: '🦁', color: 'from-yellow-500 to-amber-600' },
    { rank: 6, name: 'Delhi Capitals', short: 'DC', played: 14, won: 7, lost: 7, nr: 0, pts: 14, nrr: -0.377, form: ['W', 'L', 'W', 'L', 'W'], emoji: '🛡️', color: 'from-blue-700 to-red-600' },
    { rank: 7, name: 'Lucknow Super Giants', short: 'LSG', played: 14, won: 7, lost: 7, nr: 0, pts: 14, nrr: -0.667, form: ['W', 'L', 'L', 'L', 'W'], emoji: '🌀', color: 'from-cyan-500 to-blue-700' },
    { rank: 8, name: 'Gujarat Titans', short: 'GT', played: 14, won: 5, lost: 7, nr: 2, pts: 12, nrr: -0.063, form: ['L', 'W', 'L', 'W', 'L'], emoji: '🌟', color: 'from-slate-700 to-cyan-700' },
    { rank: 9, name: 'Punjab Kings', short: 'PBKS', played: 14, won: 5, lost: 9, nr: 0, pts: 10, nrr: -0.353, form: ['L', 'L', 'W', 'L', 'L'], emoji: '🔴', color: 'from-red-600 to-red-700' },
    { rank: 10, name: 'Mumbai Indians', short: 'MI', played: 14, won: 4, lost: 10, nr: 0, pts: 8, nrr: -0.318, form: ['L', 'L', 'W', 'L', 'L'], emoji: '💥', color: 'from-blue-600 to-blue-800' }
  ],
  '2023': [
    { rank: 1, name: 'Gujarat Titans', short: 'GT', played: 14, won: 10, lost: 4, nr: 0, pts: 20, nrr: 0.840, form: ['W', 'W', 'L', 'W', 'W'], emoji: '🌟', color: 'from-slate-700 to-cyan-700' },
    { rank: 2, name: 'Chennai Super Kings', short: 'CSK', played: 14, won: 8, lost: 5, nr: 1, pts: 17, nrr: 0.652, form: ['W', 'L', 'W', 'W', 'L'], emoji: '🦁', color: 'from-yellow-500 to-amber-600' },
    { rank: 3, name: 'Lucknow Super Giants', short: 'LSG', played: 14, won: 8, lost: 5, nr: 1, pts: 17, nrr: 0.284, form: ['W', 'W', 'W', 'L', 'W'], emoji: '🌀', color: 'from-cyan-500 to-blue-700' },
    { rank: 4, name: 'Mumbai Indians', short: 'MI', played: 14, won: 8, lost: 6, nr: 0, pts: 16, nrr: -0.044, form: ['W', 'L', 'W', 'L', 'W'], emoji: '💥', color: 'from-blue-600 to-blue-800' },
    { rank: 5, name: 'Rajasthan Royals', short: 'RR', played: 14, won: 7, lost: 7, nr: 0, pts: 14, nrr: 0.148, form: ['W', 'L', 'W', 'L', 'L'], emoji: '🦊', color: 'from-pink-600 to-pink-800' },
    { rank: 6, name: 'Royal Challengers Bengaluru', short: 'RCB', played: 14, won: 7, lost: 7, nr: 0, pts: 14, nrr: 0.135, form: ['L', 'W', 'W', 'L', 'W'], emoji: '👑', color: 'from-red-600 to-red-800' },
    { rank: 7, name: 'Kolkata Knight Riders', short: 'KKR', played: 14, won: 6, lost: 8, nr: 0, pts: 12, nrr: -0.239, form: ['L', 'W', 'L', 'W', 'L'], emoji: '💜', color: 'from-purple-600 to-purple-900' },
    { rank: 8, name: 'Punjab Kings', short: 'PBKS', played: 14, won: 6, lost: 8, nr: 0, pts: 12, nrr: -0.304, form: ['L', 'L', 'W', 'L', 'W'], emoji: '🔴', color: 'from-red-600 to-red-700' },
    { rank: 9, name: 'Delhi Capitals', short: 'DC', played: 14, won: 5, lost: 9, nr: 0, pts: 10, nrr: -0.808, form: ['L', 'W', 'L', 'W', 'L'], emoji: '🛡️', color: 'from-blue-700 to-red-600' },
    { rank: 10, name: 'Sunrisers Hyderabad', short: 'SRH', played: 14, won: 4, lost: 10, nr: 0, pts: 8, nrr: -0.590, form: ['L', 'L', 'L', 'W', 'L'], emoji: '🧡', color: 'from-orange-500 to-orange-700' }
  ]
};

const PointsTable = () => {
  const [selectedSeason, setSelectedSeason] = useState('2026');

  const standings = seasonsData[selectedSeason] || [];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <FadeIn>
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 mb-4">
            <Trophy className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-sans">IPL Standings</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            IPL <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">Points Table</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm max-w-lg mx-auto">
            Live standings, net run rates, and recent form trends for the current and historical IPL seasons.
          </p>
        </div>
      </FadeIn>

      {/* Season Selection */}
      <FadeIn delay={0.1}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex bg-slate-100 dark:bg-gray-900 p-1.5 rounded-2xl border border-slate-200/50 dark:border-gray-800">
            {Object.keys(seasonsData).map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedSeason === season
                    ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-md'
                    : 'text-gray-500 hover:text-slate-800 dark:hover:text-gray-200'
                }`}
              >
                IPL {season}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-slate-50 dark:bg-gray-900/40 px-3.5 py-2 rounded-xl border border-slate-200/50 dark:border-gray-800/80">
            <Info className="w-3.5 h-3.5 text-emerald-500" />
            <span>Top 4 Teams qualify for the playoffs</span>
          </div>
        </div>
      </FadeIn>

      {/* Standings Table Card */}
      <FadeIn delay={0.15}>
        <div className="glass-card overflow-hidden bg-white/70 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800/80 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-[#1f2937]/20 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  <th className="py-4.5 px-6 w-16 text-center">Rank</th>
                  <th className="py-4.5 px-4 min-w-[240px]">Team</th>
                  <th className="py-4.5 px-4 text-center">Played</th>
                  <th className="py-4.5 px-4 text-center">Won</th>
                  <th className="py-4.5 px-4 text-center">Lost</th>
                  <th className="py-4.5 px-4 text-center">N/R</th>
                  <th className="py-4.5 px-4 text-center">Points</th>
                  <th className="py-4.5 px-4 text-center">NRR</th>
                  <th className="py-4.5 px-6 min-w-[150px] text-center">Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/80">
                <AnimatePresence mode="popLayout">
                  {standings.map((team) => {
                    const isPlayoffZone = team.rank <= 4;
                    return (
                      <motion.tr
                        key={team.short}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`group transition-all hover:bg-slate-50/40 dark:hover:bg-[#111827]/30 ${
                          isPlayoffZone 
                            ? 'bg-emerald-500/[0.01] dark:bg-emerald-500/[0.015]' 
                            : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-6 font-black text-sm text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs ${
                            team.rank === 1
                              ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20'
                              : team.rank === 2
                              ? 'bg-slate-400/10 text-slate-600 dark:bg-slate-400/20 dark:text-slate-300 border border-slate-400/20'
                              : team.rank === 3
                              ? 'bg-amber-700/10 text-amber-800 dark:bg-amber-700/20 dark:text-amber-500 border border-amber-700/20'
                              : isPlayoffZone
                              ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {team.rank}
                          </span>
                        </td>

                        {/* Team Name */}
                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-gray-800 p-1 flex items-center justify-center shrink-0 border border-slate-100 dark:border-gray-700/50 shadow-inner">
                              {(() => {
                                const logoUrl = iplTeams.find(t => t.short === team.short)?.logo;
                                return logoUrl ? (
                                  <img 
                                    src={logoUrl} 
                                    alt={team.short} 
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.parentElement.innerHTML = `<span class="text-xl">${team.emoji}</span>`;
                                    }}
                                  />
                                ) : (
                                  <span className="text-xl">{team.emoji}</span>
                                );
                              })()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                                {team.name}
                              </span>
                              <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider font-sans">
                                {team.short}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Played */}
                        <td className="py-4 px-4 text-center font-bold text-sm text-slate-700 dark:text-gray-300">{team.played}</td>
                        {/* Won */}
                        <td className="py-4 px-4 text-center font-black text-sm text-emerald-600 dark:text-emerald-400">{team.won}</td>
                        {/* Lost */}
                        <td className="py-4 px-4 text-center font-bold text-sm text-red-500">{team.lost}</td>
                        {/* No Result */}
                        <td className="py-4 px-4 text-center font-bold text-sm text-gray-400">{team.nr}</td>
                        
                        {/* Points */}
                        <td className="py-4 px-4 text-center font-black text-base text-slate-900 dark:text-white">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-white group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 border border-transparent group-hover:border-emerald-500/20 transition-all">
                            {team.pts}
                          </span>
                        </td>

                        {/* NRR */}
                        <td className={`py-4 px-4 text-center font-black text-sm ${
                          team.nrr >= 0 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-red-500'
                        }`}>
                          {team.nrr > 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3)}
                        </td>

                        {/* Form */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1.5">
                            {team.form.map((res, idx) => (
                              <span
                                key={idx}
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black border select-none ${
                                  res === 'W'
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-400'
                                    : 'bg-red-500/10 text-red-500 border-red-500/25 dark:bg-red-500/20 dark:text-red-400'
                                }`}
                              >
                                {res}
                              </span>
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default PointsTable;
