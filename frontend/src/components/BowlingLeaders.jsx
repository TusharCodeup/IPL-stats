import React from 'react';
import { motion } from 'framer-motion';
import { iplBowlingLeaders } from '../data/iplLegends';

const BowlingLeaders = () => {
  return (
    <div className="w-full mb-16 overflow-hidden">
      <div className="flex items-center mb-6 px-4">
        <h2 className="text-3xl font-black italic text-slate-900 dark:text-white flex-1">
          All Time Bowling Leaders
        </h2>
      </div>
      
      {/* Scrollable container for cards */}
      <div className="flex overflow-x-auto pb-8 pt-4 px-4 gap-6 hide-scrollbar">
        {iplBowlingLeaders.map((leader, index) => {
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex-shrink-0 w-64 h-[26rem] rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-slate-200 dark:border-gray-800 bg-white dark:bg-slate-900 flex flex-col"
            >
              {/* Top Half */}
              <div className={`relative h-52 flex items-end justify-center ${leader.color}`}>
                {/* Team Logo (Top Right) */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white p-1 shadow-sm flex items-center justify-center z-20">
                  <img src={leader.teamLogo} alt="Team" className="max-w-full max-h-full object-contain" />
                </div>
                
                {/* Player Photo */}
                <div className="w-full h-full absolute inset-0 flex items-end justify-center overflow-hidden">
                  {/* Subtle curved background overlay to match screenshot style */}
                  <div className="absolute bottom-0 w-full h-2/3 bg-black/10 rounded-t-[100%]" />
                  <img 
                    src={leader.image} 
                    alt={leader.name} 
                    className="h-44 object-contain object-bottom drop-shadow-xl z-10" 
                    onError={(e) => { 
                      e.target.style.display = 'none'; 
                      // Render silhouette if image fails
                      e.target.parentElement.innerHTML += '<div class="absolute inset-0 flex items-end justify-center"><svg width="120" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-white/20"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';
                    }}
                  />
                </div>
              </div>

              {/* Slanted Ribbon */}
              <div className="absolute top-[12.2rem] left-0 right-0 z-20 flex justify-center">
                <div className={`w-[110%] py-1.5 -ml-4 transform rotate-[2deg] bg-slate-800 dark:bg-slate-700 shadow-md`}>
                  <p className="text-center text-white font-black text-xs uppercase tracking-wider -rotate-[2deg]">{leader.category}</p>
                </div>
              </div>

              {/* Bottom Half */}
              <div className="flex-1 flex flex-col items-center justify-between pt-8 pb-4 px-4">
                <div className="text-center">
                  <h3 className="font-bold text-sm text-blue-900 dark:text-blue-300">{leader.name}</h3>
                  <div className="mt-1">
                    <span className="text-4xl font-black text-slate-800 dark:text-white leading-none">{leader.value}</span>
                  </div>
                  {leader.subtitle && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-1">{leader.subtitle}</span>
                  )}
                </div>
                
                <div className="w-full mt-4 pt-4 border-t border-slate-200 dark:border-gray-800 text-center">
                  <button className="text-xs font-bold text-gray-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer">
                    View Full List
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BowlingLeaders;
