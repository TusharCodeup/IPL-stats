import React from 'react';
import { motion } from 'framer-motion';

const leaders = [
  {
    title: 'Orange cap',
    name: 'Virat Kohli',
    value: '9218',
    label: 'RUNS',
    image: '/images/players/Virat_Kohli.JPG',
    teamLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Royal_Challengers_Bangalore_2020.svg/200px-Royal_Challengers_Bangalore_2020.svg.png',
    topBg: 'from-orange-400 to-amber-500',
    ribbon: 'bg-red-500',
    textCol: 'text-blue-900',
    realImg: '/images/players/Virat_Kohli.JPG'
  },
  {
    title: 'Most Fours',
    name: 'Virat Kohli',
    value: '830',
    label: 'FOURS',
    image: '/images/players/Virat_Kohli.JPG',
    teamLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Royal_Challengers_Bangalore_2020.svg/200px-Royal_Challengers_Bangalore_2020.svg.png',
    topBg: 'from-[#0b1f4a] to-[#143270]',
    ribbon: 'bg-[#1e3c78]',
    textCol: 'text-blue-900'
  },
  {
    title: 'Most Sixes',
    name: 'Chris Gayle',
    value: '357',
    label: 'SIXES',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Two_views_of_Chris_Gayle_%2848020785077%29.jpg/330px-Two_views_of_Chris_Gayle_%2848020785077%29.jpg',
    teamLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Punjab_Kings_Logo.svg/200px-Punjab_Kings_Logo.svg.png',
    topBg: 'from-[#0b1f4a] to-[#143270]',
    ribbon: 'bg-[#1e3c78]',
    textCol: 'text-blue-900'
  },
  {
    title: 'Highest Score',
    name: 'Chris Gayle',
    value: '175',
    label: 'SCORE',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Two_views_of_Chris_Gayle_%2848020785077%29.jpg/330px-Two_views_of_Chris_Gayle_%2848020785077%29.jpg',
    teamLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Punjab_Kings_Logo.svg/200px-Punjab_Kings_Logo.svg.png',
    topBg: 'from-[#0b1f4a] to-[#143270]',
    ribbon: 'bg-[#1e3c78]',
    textCol: 'text-blue-900'
  },
  {
    title: 'Best Strike Rate',
    name: 'Vaibhav Sooryavanshi',
    value: '226.43',
    label: '',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/No_image_available_-_cricket.svg/200px-No_image_available_-_cricket.svg.png',
    teamLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Rajasthan_Royals_Logo.svg/200px-Rajasthan_Royals_Logo.svg.png',
    topBg: 'from-[#0b1f4a] to-[#143270]',
    ribbon: 'bg-[#1e3c78]',
    textCol: 'text-blue-900'
  }
];

const BattingLeaders = () => {
  return (
    <div className="w-full mb-16 overflow-hidden">
      <div className="flex items-center mb-6 px-4">
        <h2 className="text-3xl font-black italic text-slate-900 dark:text-white flex-1">
          All Time Batting Leaders
        </h2>
        {/* Decorative graphic element from image */}
        <div className="hidden sm:flex opacity-30">
          <div className="w-24 h-24 rounded-full border-[10px] border-pink-200 -mr-12" />
          <div className="w-24 h-24 rounded-full border-[10px] border-yellow-200 -mt-8" />
        </div>
      </div>
      
      {/* Scrollable container for cards */}
      <div className="flex overflow-x-auto pb-8 pt-4 px-4 gap-6 hide-scrollbar">
        {leaders.map((leader, index) => {
          const imgUrl = leader.realImg || leader.image;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex-shrink-0 w-64 h-[26rem] rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-slate-200 dark:border-gray-800 bg-white dark:bg-slate-900 flex flex-col"
            >
              {/* Top Half */}
              <div className={`relative h-52 bg-gradient-to-b ${leader.topBg} flex items-end justify-center`}>
                {/* Team Logo (Top Right) */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white p-1 shadow-sm flex items-center justify-center z-20">
                  <img src={leader.teamLogo} alt="Team" className="max-w-full max-h-full object-contain" />
                </div>
                
                {/* Player Photo */}
                <div className="w-full h-full absolute inset-0 flex items-end justify-center overflow-hidden">
                  <div className="absolute bottom-0 w-full h-2/3 bg-black/10 rounded-t-[100%]" />
                  <img 
                    src={imgUrl} 
                    alt={leader.name} 
                    className="h-44 object-contain object-bottom drop-shadow-xl z-10" 
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>

              {/* Slanted Ribbon */}
              <div className="absolute top-[12.2rem] left-0 right-0 z-20 flex justify-center">
                <div className={`w-[110%] py-1.5 -ml-4 transform rotate-[2deg] ${leader.ribbon} shadow-md`}>
                  <p className="text-center text-white font-black text-xs uppercase tracking-wider -rotate-[2deg]">{leader.title}</p>
                </div>
              </div>

              {/* Bottom Half */}
              <div className="flex-1 flex flex-col items-center justify-between pt-8 pb-4 px-4">
                <div className="text-center">
                  <h3 className={`font-bold text-sm ${leader.textCol} dark:text-blue-300`}>{leader.name}</h3>
                  <div className="mt-1">
                    <span className="text-4xl font-black text-slate-800 dark:text-white leading-none">{leader.value}</span>
                  </div>
                  {leader.label && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-1">{leader.label}</span>
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

export default BattingLeaders;
