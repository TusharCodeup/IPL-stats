import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Search, Award, Star, Clock, Trophy, RefreshCw } from 'lucide-react';
import FadeIn from '../components/animations/FadeIn';
import { iplTeams } from '../data/iplTeams';

const matchSchedule = [
  // 2026 Playoffs (Upcoming)
  { id: 101, type: 'Qualifier 1', team1: 'Royal Challengers Bengaluru', short1: 'RCB', emoji1: '👑', team2: 'Gujarat Titans', short2: 'GT', emoji2: '🌟', venue: 'HPCA Stadium, Dharamshala', date: '2026-05-26', time: '19:30', status: 'Upcoming' },
  { id: 102, type: 'Eliminator', team1: 'Sunrisers Hyderabad', short1: 'SRH', emoji1: '🧡', team2: 'Rajasthan Royals', short2: 'RR', emoji2: '🦊', venue: 'Maharaja Yadavindra Stadium, New Chandigarh', date: '2026-05-27', time: '19:30', status: 'Upcoming' },
  { id: 103, type: 'Qualifier 2', team1: 'TBD', short1: 'TBD', emoji1: '❓', team2: 'TBD', short2: 'TBD', emoji2: '❓', venue: 'Maharaja Yadavindra Stadium, New Chandigarh', date: '2026-05-29', time: '19:30', status: 'Upcoming' },
  { id: 104, type: 'Final', team1: 'TBD', short1: 'TBD', emoji1: '❓', team2: 'TBD', short2: 'TBD', emoji2: '❓', venue: 'Narendra Modi Stadium, Ahmedabad', date: '2026-05-31', time: '19:30', status: 'Upcoming' },

  // 2025 Playoffs (Finished)
  { id: 51, type: 'Final', team1: 'Royal Challengers Bengaluru', short1: 'RCB', emoji1: '👑', team2: 'Punjab Kings', short2: 'PBKS', emoji2: '🔴', venue: 'Narendra Modi Stadium, Ahmedabad', date: '2025-06-03', time: '19:30', status: 'Finished', result: 'RCB won by 6 runs' },
  { id: 52, type: 'Qualifier 2', team1: 'Punjab Kings', short1: 'PBKS', emoji1: '🔴', team2: 'Mumbai Indians', short2: 'MI', emoji2: '💥', venue: 'M. Chinnaswamy Stadium, Bengaluru', date: '2025-06-01', time: '19:30', status: 'Finished', result: 'PBKS won by 4 wickets' },
  { id: 53, type: 'Eliminator', team1: 'Mumbai Indians', short1: 'MI', emoji1: '💥', team2: 'Gujarat Titans', short2: 'GT', emoji2: '🌟', venue: 'M. A. Chidambaram Stadium, Chennai', date: '2025-05-31', time: '19:30', status: 'Finished', result: 'MI won by 25 runs' },
  { id: 54, type: 'Qualifier 1', team1: 'Royal Challengers Bengaluru', short1: 'RCB', emoji1: '👑', team2: 'Punjab Kings', short2: 'PBKS', emoji2: '🔴', venue: 'Wankhede Stadium, Mumbai', date: '2025-05-30', time: '19:30', status: 'Finished', result: 'RCB won by 15 runs' },

  // 2024 Playoffs (Finished)
  { id: 1, type: 'Final', team1: 'Kolkata Knight Riders', short1: 'KKR', emoji1: '💜', team2: 'Sunrisers Hyderabad', short2: 'SRH', emoji2: '🧡', venue: 'M. A. Chidambaram Stadium, Chennai', date: '2024-05-26', time: '19:30', status: 'Finished', result: 'KKR won by 8 wickets' },
  { id: 2, type: 'Qualifier 2', team1: 'Sunrisers Hyderabad', short1: 'SRH', emoji1: '🧡', team2: 'Rajasthan Royals', short2: 'RR', emoji2: '🦊', venue: 'M. A. Chidambaram Stadium, Chennai', date: '2024-05-24', time: '19:30', status: 'Finished', result: 'SRH won by 36 runs' },
  { id: 3, type: 'Eliminator', team1: 'Rajasthan Royals', short1: 'RR', emoji1: '🦊', team2: 'Royal Challengers Bengaluru', short2: 'RCB', emoji2: '👑', venue: 'Narendra Modi Stadium, Ahmedabad', date: '2024-05-22', time: '19:30', status: 'Finished', result: 'RR won by 4 wickets' },
  { id: 4, type: 'Qualifier 1', team1: 'Kolkata Knight Riders', short1: 'KKR', emoji1: '💜', team2: 'Sunrisers Hyderabad', short2: 'SRH', emoji2: '🧡', venue: 'Narendra Modi Stadium, Ahmedabad', date: '2024-05-21', time: '19:30', status: 'Finished', result: 'KKR won by 8 wickets' },

  // 2026 League matches
  { id: 5, type: 'League Match', team1: 'Chennai Super Kings', short1: 'CSK', emoji1: '🦁', team2: 'Mumbai Indians', short2: 'MI', emoji2: '💥', venue: 'Wankhede Stadium, Mumbai', date: '2026-05-24', time: '19:30', status: 'Upcoming' },
  { id: 6, type: 'League Match', team1: 'Royal Challengers Bengaluru', short1: 'RCB', emoji1: '👑', team2: 'Kolkata Knight Riders', short2: 'KKR', emoji2: '💜', venue: 'M. Chinnaswamy Stadium, Bengaluru', date: '2026-05-25', time: '19:30', status: 'Upcoming' },
  { id: 7, type: 'League Match', team1: 'Rajasthan Royals', short1: 'RR', emoji1: '🦊', team2: 'Gujarat Titans', short2: 'GT', emoji2: '🌟', venue: 'Sawai Mansingh Stadium, Jaipur', date: '2026-05-27', time: '19:30', status: 'Upcoming' },
  { id: 8, type: 'League Match', team1: 'Sunrisers Hyderabad', short1: 'SRH', emoji1: '🧡', team2: 'Delhi Capitals', short2: 'DC', emoji2: '🛡️', venue: 'Rajiv Gandhi Intl Stadium, Hyderabad', date: '2026-05-28', time: '19:30', status: 'Upcoming' },
];

const MatchSchedule = () => {
  const [filterTeam, setFilterTeam] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown timer calculation for next match
  useEffect(() => {
    const nextMatchDate = new Date('2026-05-24T19:30:00').getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextMatchDate - now;
      
      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const teams = useMemo(() => {
    const all = new Set();
    matchSchedule.forEach(m => {
      all.add(m.team1);
      all.add(m.team2);
    });
    return ['All', ...Array.from(all).sort()];
  }, []);

  const filtered = useMemo(() => {
    return matchSchedule.filter(m => {
      const matchSearch = m.team1.toLowerCase().includes(search.toLowerCase()) || 
                          m.team2.toLowerCase().includes(search.toLowerCase()) ||
                          m.venue.toLowerCase().includes(search.toLowerCase());
      const matchTeam = filterTeam === 'All' || m.team1 === filterTeam || m.team2 === filterTeam;
      const matchStatus = filterStatus === 'All' || m.status === filterStatus;
      
      return matchSearch && matchTeam && matchStatus;
    });
  }, [search, filterTeam, filterStatus]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <FadeIn>
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20 mb-4">
            <Calendar className="w-4 h-4 text-cyan-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700 dark:text-cyan-400">Fixtures Calendar</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            IPL Match <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400">Schedule</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm max-w-lg mx-auto">
            Upcoming matches, historical play-off results, and real-time live match notifications.
          </p>
        </div>
      </FadeIn>

      {/* Countdown Banner */}
      <FadeIn delay={0.1}>
        <div className="glass-card mb-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 dark:from-cyan-950/30 dark:to-blue-950/10 border-cyan-500/20 dark:border-cyan-500/25 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl animate-pulse">⏰</span>
            <div>
              <h3 className="font-black text-sm text-slate-950 dark:text-white">Next Super Match Countdown</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">CSK vs MI — El Clásico of Cricket in Wankhede</p>
            </div>
          </div>
          {/* Countdown Clock */}
          <div className="flex gap-2">
            {[
              { val: countdown.days, lbl: 'Days' },
              { val: countdown.hours, lbl: 'Hours' },
              { val: countdown.minutes, lbl: 'Mins' },
              { val: countdown.seconds, lbl: 'Secs' }
            ].map(c => (
              <div key={c.lbl} className="bg-white/80 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 min-w-[64px] text-center shadow-sm">
                <span className="block text-lg font-black text-slate-950 dark:text-white leading-tight">
                  {c.val.toString().padStart(2, '0')}
                </span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mt-0.5">{c.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Search & Filters */}
      <FadeIn delay={0.15}>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-slate-50 dark:bg-gray-900/30 p-4 rounded-2xl border border-slate-200/50 dark:border-gray-800/80">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by team, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="w-full sm:w-44 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Teams</option>
              {teams.filter(t => t !== 'All').map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-36 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Finished">Finished</option>
            </select>
          </div>
        </div>
      </FadeIn>

      {/* Match Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filterTeam + filterStatus + search}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {filtered.map((match, i) => {
            const isFinished = match.status === 'Finished';
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                whileHover={{ y: -4 }}
                className={`rounded-3xl border p-5 bg-white dark:bg-[#111827]/60 shadow-lg border-slate-200 dark:border-gray-800/80 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all`}
              >
                {/* Type & Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-gray-850 px-2.5 py-1 rounded-md text-gray-500 dark:text-gray-400">
                    {match.type}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                    isFinished
                      ? 'bg-slate-100 dark:bg-gray-800 text-gray-500'
                      : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25'
                  }`}>
                    {match.status}
                  </span>
                </div>

                {/* Team Lineup */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex flex-col items-center flex-1 text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-gray-800 p-1.5 flex items-center justify-center mb-2 border border-slate-100 dark:border-gray-700/50 shadow-inner">
                      {(() => {
                        const logoUrl = iplTeams.find(t => t.short === match.short1)?.logo;
                        return logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt={match.short1} 
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<span class="text-3xl">${match.emoji1}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-3xl">{match.emoji1}</span>
                        );
                      })()}
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">{match.team1}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{match.short1}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest bg-slate-50 dark:bg-gray-900/50 px-2 py-1 rounded-full border border-slate-200/50 dark:border-gray-800">VS</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-gray-800 p-1.5 flex items-center justify-center mb-2 border border-slate-100 dark:border-gray-700/50 shadow-inner">
                      {(() => {
                        const logoUrl = iplTeams.find(t => t.short === match.short2)?.logo;
                        return logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt={match.short2} 
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<span class="text-3xl">${match.emoji2}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-3xl">{match.emoji2}</span>
                        );
                      })()}
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">{match.team2}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{match.short2}</span>
                  </div>
                </div>

                {/* Result callout for finished matches */}
                {isFinished && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/20 text-center mb-4">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5" />
                      {match.result}
                    </span>
                  </div>
                )}

                {/* Venue & Date */}
                <div className="pt-3 border-t border-slate-100 dark:border-gray-800/80 flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {match.venue.split(',')[0]}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {match.date} @ {match.time} IST
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400 text-sm">No matches found matching your filters.</div>
      )}
    </div>
  );
};

export default MatchSchedule;
