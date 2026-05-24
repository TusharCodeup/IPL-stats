import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { iplStats, filterOptions } from '../data/iplStats';

const StatsLeaderboard = () => {
  const [season, setSeason] = useState("2025");
  const [category, setCategory] = useState("Orange Cap");
  const [team, setTeam] = useState("All Teams");
  const [type, setType] = useState("All Players");
  const [searchQuery, setSearchQuery] = useState("");

  const data = iplStats[season]?.[category] || [];
  const topPlayer = data.length > 0 ? data[0] : null;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl mt-8 font-sans">
      
      {/* Hero Banner for Top Player */}
      {topPlayer && (
        <div className="relative h-[350px] w-full bg-[#0B1221] overflow-hidden group">
          {/* Background Stadium Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: 'url("https://www.iplt20.com/assets/images/team-stadium-bg.jpg")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1221] via-transparent to-transparent" />

          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
            <div className="flex items-center space-x-6 w-full">
              
              {/* Rank Number & Player Image */}
              <div className="flex items-end relative h-64 w-80">
                <span className="text-[200px] font-black text-white/90 leading-none -ml-4 tracking-tighter">
                  {topPlayer.pos}
                </span>
                <img 
                  src={topPlayer.image} 
                  alt={topPlayer.player}
                  className="absolute bottom-0 right-0 h-[110%] object-contain drop-shadow-2xl"
                />
              </div>

              {/* Player Details & Stats Box */}
              <div className="flex-1 pb-4">
                <div className="flex items-center space-x-4 mb-4">
                  <h2 className="text-4xl font-black text-white uppercase tracking-wider">
                    {topPlayer.player}
                  </h2>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1">
                    <img 
                      src={`https://documents.iplt20.com/ipl/assets/images/team-logo-${topPlayer.team.toLowerCase()}.png`} 
                      alt={topPlayer.team}
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                </div>

                <div className="flex border border-white/20 bg-black/40 backdrop-blur-md rounded-sm divide-x divide-white/20 w-fit">
                  <div className="px-6 py-3 text-center">
                    <div className="text-2xl font-bold text-white">{topPlayer.runs}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Runs</div>
                  </div>
                  <div className="px-6 py-3 text-center">
                    <div className="text-2xl font-bold text-white">{topPlayer.mat}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Matches</div>
                  </div>
                  <div className="px-6 py-3 text-center">
                    <div className="text-2xl font-bold text-white">{topPlayer.avg}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Average</div>
                  </div>
                  <div className="px-6 py-3 text-center">
                    <div className="text-2xl font-bold text-white">{topPlayer.sr}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Strike Rate</div>
                  </div>
                  <div className="px-6 py-3 text-center">
                    <div className="text-2xl font-bold text-white">{topPlayer.hs}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Hs. Score</div>
                  </div>
                  <div className="px-6 py-3 text-center">
                    <div className="text-2xl font-bold text-white">{topPlayer.fifties}/{topPlayer.hundreds}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">50s/100s</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        
        {/* Top Tabs (Season / Awards / Records) */}
        <div className="flex justify-center py-6">
          <div className="inline-flex rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden transform -skew-x-12">
            <button className="px-8 py-2 text-sm font-bold bg-[#EF4123] text-white skew-x-12">
              Season
            </button>
            <button className="px-8 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors skew-x-12 border-l border-gray-200 dark:border-slate-700">
              Awards
            </button>
            <button className="px-8 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors skew-x-12 border-l border-gray-200 dark:border-slate-700">
              Records
            </button>
          </div>
        </div>

        {/* Dropdowns Row */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
          <div className="relative min-w-[160px]">
            <select 
              value={`SEASON ${season}`}
              onChange={(e) => setSeason(e.target.value.replace('SEASON ', ''))}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md py-2.5 pl-4 pr-10 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              {filterOptions.seasons.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative min-w-[200px]">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md py-2.5 pl-4 pr-10 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative min-w-[160px]">
            <select 
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md py-2.5 pl-4 pr-10 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              {filterOptions.teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative min-w-[160px]">
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md py-2.5 pl-4 pr-10 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="All Players">All Players</option>
              <option value="Batters">Batters</option>
              <option value="Bowlers">Bowlers</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Search By Player Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md py-2.5 pl-10 pr-4 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0B1221] text-white text-xs uppercase tracking-wider font-semibold">
              <th className="py-4 px-6">POS</th>
              <th className="py-4 px-6">Player</th>
              <th className="py-4 px-4 text-center">Runs</th>
              <th className="py-4 px-4 text-center">Mat</th>
              <th className="py-4 px-4 text-center">Inns</th>
              <th className="py-4 px-4 text-center">NO</th>
              <th className="py-4 px-4 text-center">HS</th>
              <th className="py-4 px-4 text-center">Avg</th>
              <th className="py-4 px-4 text-center">BF</th>
              <th className="py-4 px-4 text-center">SR</th>
              <th className="py-4 px-4 text-center">100</th>
              <th className="py-4 px-4 text-center">50</th>
              <th className="py-4 px-4 text-center">4s</th>
              <th className="py-4 px-4 text-center">6s</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800">
            {data.map((player) => (
              <tr key={player.player} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-6 text-xl font-bold text-gray-900 dark:text-white w-16">
                  {player.pos}
                </td>
                <td className="py-3 px-6">
                  <div className="flex items-center space-x-4">
                    <img src={player.image} alt={player.player} className="w-12 h-12 rounded-full object-cover bg-gray-100 dark:bg-slate-800" />
                    <div>
                      <div className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                        {player.player.split(' ').map((n, i, arr) => 
                          i === arr.length - 1 ? <div key={i}>{n}</div> : <span key={i} className="font-normal">{n} </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-gray-500 mt-0.5">{player.team}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-center font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-800/30">{player.runs}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">{player.mat}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">{player.inns}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">{player.no}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">{player.hs}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">{player.avg}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">{player.bf}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">{player.sr}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">{player.hundreds}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">{player.fifties}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">{player.fours}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">{player.sixes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsLeaderboard;
