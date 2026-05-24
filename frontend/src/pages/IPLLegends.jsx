import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Star, Play, X, Search } from 'lucide-react';
import FadeIn from '../components/animations/FadeIn';
import { iplLegends, legendCategories } from '../data/iplLegends';

const IPLLegends = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const filtered = useMemo(() => {
    return iplLegends.filter(m => {
      const matchCat = activeCategory === 'All' || m.category === activeCategory;
      const matchSearch = m.player.toLowerCase().includes(search.toLowerCase()) ||
                          m.team.toLowerCase().includes(search.toLowerCase()) ||
                          m.title.toLowerCase().includes(search.toLowerCase()) ||
                          m.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <FadeIn>
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 mb-4">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Hall of Fame</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Greatest <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">IPL Moments</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm max-w-lg mx-auto">
            From Shane Warne's fairy tale to Dhoni's last dance — relive the moments that made IPL legendary.
          </p>
        </div>
      </FadeIn>


      {/* Search Input */}
      <FadeIn delay={0.05}>
        <div className="max-w-md mx-auto mb-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search moments by player, team, season..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </FadeIn>

      {/* Category Filters */}
      <FadeIn delay={0.1}>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {legendCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-white dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 border border-slate-200 dark:border-gray-800 hover:border-amber-400 dark:hover:border-amber-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Moments Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + search}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((moment, i) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${moment.color} p-6 text-white cursor-default group shadow-xl flex flex-col justify-between`}
            >
              {/* YouTube Thumbnail Background */}
              {moment.youtubeId && (
                <div className="absolute inset-0 w-full h-full opacity-20 group-hover:opacity-35 group-hover:scale-105 transition-all duration-500 pointer-events-none">
                  <img
                    src={`https://img.youtube.com/vi/${moment.youtubeId}/hqdefault.jpg`}
                    alt={moment.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                </div>
              )}
              {/* Glow */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full blur-xl pointer-events-none"></div>

              <div className="relative z-10">
                {/* Season badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl group-hover:scale-110 transition-transform">{moment.emoji}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    IPL {moment.season}
                  </span>
                </div>

                <h3 className="text-xl font-black mb-1 leading-tight">{moment.title}</h3>
                
                <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-white/70 uppercase tracking-wider">
                  <span>{moment.player}</span>
                  <span>•</span>
                  <span>{moment.team}</span>
                </div>
                
                <p className="text-xs text-white/75 leading-relaxed">{moment.description}</p>
              </div>

              <div className="relative z-10">
                {/* Category tag */}
                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {moment.category}
                  </span>
                </div>

                {/* Highlight button */}
                {moment.youtubeId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVideo(moment.youtubeId);
                    }}
                    className="mt-4 w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Watch Highlight
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400 text-sm">
          No moments found matching your query.
        </div>
      )}

      {/* Video Modal Player */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black uppercase text-white tracking-widest">IPL Legendary Moments</span>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video aspect iframe */}
              <div className="w-full aspect-video bg-black relative flex flex-col items-center justify-center p-8 text-center border-b border-slate-800/80">
                <img
                  src={`https://img.youtube.com/vi/${selectedVideo}/maxresdefault.jpg`}
                  alt="Video Thumbnail"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  onError={(e) => e.target.src = `https://img.youtube.com/vi/${selectedVideo}/hqdefault.jpg`}
                />
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-600/30">
                    <Play className="w-8 h-8 text-white fill-current ml-1" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Watch on YouTube</h3>
                  <p className="text-sm text-gray-300 max-w-md mx-auto mb-6">
                    Due to IPL broadcasting restrictions, this official highlight video cannot be played directly on external websites.
                  </p>
                  <a
                    href={`https://www.youtube.com/watch?v=${selectedVideo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-black hover:bg-gray-200 transition-colors"
                  >
                    Watch Highlight
                  </a>
                </div>
              </div>

              {/* Embed Fallback Info & Button */}
              <div className="p-4 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <h4 className="text-xs font-black text-white flex items-center justify-center sm:justify-start gap-1">
                    <span className="text-amber-500">ℹ️</span> Official IPL Content
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                    You will be redirected to YouTube to watch this video in high quality.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IPLLegends;
