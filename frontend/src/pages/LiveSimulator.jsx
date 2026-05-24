import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTheme } from '../context/ThemeContext';
import { statsService } from '../services/statsService';
import { useApi } from '../hooks/useApi';
import useAuthStore from '../store/authStore';
import CheckoutModal from '../components/CheckoutModal';
import config from '../config';
import { 
  Tv2, 
  Play, 
  Square, 
  Settings, 
  TrendingUp, 
  Info,
  Sliders,
  ChevronRight,
  Wifi,
  WifiOff
} from 'lucide-react';


const FAMOUS_MATCHES = [
  { id: "1181768", description: "MI vs CSK (2019 Final) - MI won by 1 run" },
  { id: "335982", description: "RCB vs KKR (2008 Opening Match) - Brendon McCullum 158*" },
  { id: "1254117", description: "CSK vs KKR (2021 Final) - CSK won by 27 runs" },
  { id: "1312200", description: "GT vs RR (2022 Final) - Gujarat Titans won in debut season" }
];

const LiveSimulator = () => {
  const { theme } = useTheme();
  const { token, credits, subscription, setUserDetails } = useAuthStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Configuration settings state
  const [mode, setMode] = useState('generative');
  const [selectedMatchId, setSelectedMatchId] = useState(FAMOUS_MATCHES[0].id);
  const [battingTeam, setBattingTeam] = useState('Royal Challengers Bengaluru');
  const [bowlingTeam, setBowlingTeam] = useState('Mumbai Indians');
  const [venue, setVenue] = useState('M Chinnaswamy Stadium');
  const [targetRuns, setTargetRuns] = useState(180);
  const [speed, setSpeed] = useState(1.0); // delay in seconds


  // Dropdown lists
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);

  // Local stats state
  const [scorecard, setScorecard] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentBalls, setRecentBalls] = useState([]);
  
  const { execute: executeStats } = useApi();
  const { data: socketData, status: socketStatus, connect: socketConnect, disconnect: socketDisconnect } = useWebSocket(config.wsUrl);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (socketData) {
      if (socketData.error) {
        console.error('[Simulator Socket Error]:', socketData.error);
        socketDisconnect();
        return;
      }

      setScorecard(socketData);
      
      // Append coordinates to chart data
      const overFloat = (socketData.balls_bowled / 6).toFixed(1);
      setChartData((prev) => [
        ...prev, 
        { 
          over: parseFloat(overFloat),
          battingWinProb: Math.round(socketData.batting_prob * 100),
          bowlingWinProb: Math.round(socketData.bowling_prob * 100),
          runs: socketData.current_runs,
          wickets: 10 - socketData.wickets_left
        }
      ]);

      // Append last ball to recent balls
      if (socketData.last_ball_event) {
        setRecentBalls((prev) => {
          const ballId = `${socketData.balls_bowled}-${socketData.last_ball_event}`;
          if (prev.find(b => b.id === ballId)) return prev;
          
          const newBall = {
            id: ballId,
            event: socketData.last_ball_event,
            num: socketData.balls_bowled
          };
          return [...prev, newBall].slice(-12);
        });
      }

      // Automatic stop when match terminates
      if (socketData.wickets_left <= 0 || socketData.runs_needed <= 0 || socketData.balls_left <= 0) {
        console.log('[Simulator]: Match terminated naturally.');
        socketDisconnect();
      }
    }
  }, [socketData, socketDisconnect]);

  const fetchOptions = async () => {
    try {
      const teamsRes = await executeStats(() => statsService.getTeams());
      const venuesRes = await executeStats(() => statsService.getVenues());
      setTeams(teamsRes);
      setVenues(venuesRes);
    } catch (err) {
      console.error('Error loading dropdown lists:', err);
    }
  };

  const startSimulation = () => {
    if (subscription === 'free' && credits <= 0) {
      return;
    }

    setScorecard(null);
    setChartData([]);
    setRecentBalls([]);

    const configPayload = {
      token,
      mode,
      delay: speed,
      match_id: mode === 'historical' ? selectedMatchId : undefined,
      batting_team: mode === 'generative' ? battingTeam : undefined,
      bowling_team: mode === 'generative' ? bowlingTeam : undefined,
      venue: mode === 'generative' ? venue : undefined,
      target_runs: mode === 'generative' ? targetRuns : undefined,
    };
    
    socketConnect(configPayload);

    if (subscription === 'free') {
      setUserDetails({ credits: Math.max(0, credits - 1) });
    }
  };


  const formatOvers = (balls) => {
    const overs = Math.floor(balls / 6);
    const extraBalls = balls % 6;
    return `${overs}.${extraBalls}`;
  };

  const active = socketStatus === 'connected' || socketStatus === 'connecting';

  // Customize Recharts Tooltip styling based on dark/light context
  const tooltipStyle = theme === 'dark' 
    ? { backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px', color: '#f3f4f6' }
    : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in transition-colors duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 glass-card border-indigo-500/25 dark:border-cyan-500/20 bg-gradient-to-r from-slate-100 to-indigo-500/5 dark:from-[#111827]/80 dark:to-cyan-500/5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Real-Time Live Predictor
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Simulate a second-innings run chase ball-by-ball. Win probability updates instantly via WebSockets on each delivery.
          </p>
        </div>
        
        {/* Dynamic connection banner */}
        <div className={`mt-4 md:mt-0 flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
          socketStatus === 'connected' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 glow-green'
            : socketStatus === 'connecting'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse'
            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-400'
        }`}>
          {socketStatus === 'connected' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span className="capitalize">WS status: {socketStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-1 glass-card p-6 bg-white/70 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800/80 flex flex-col h-fit relative">
          {subscription === 'free' && credits <= 0 && (
            <div className="absolute inset-0 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-6 rounded-[2.5rem] animate-fade-in border border-indigo-500/20 dark:border-cyan-500/25">
              <span className="text-4xl mb-3">🪙</span>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Credits Depleted</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-[240px] leading-relaxed">
                You have used all 5 of your free trial predictions. Upgrade to the Pro membership to unlock unlimited forecasts.
              </p>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="mt-5 w-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg active:scale-[0.98] transition-all text-xs cursor-pointer"
              >
                Upgrade to Pro (₹99)
              </button>
            </div>
          )}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2 font-display">
            <Settings className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />
            <span>Simulation Parameters</span>
          </h2>

          <div className="space-y-5">
            {/* Mode selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Replay Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={active}
                  onClick={() => setMode('generative')}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    mode === 'generative'
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:border-cyan-500/50 dark:bg-cyan-500/10 dark:text-cyan-400 shadow-md shadow-brand-500/5'
                      : 'border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 text-gray-400 opacity-60'
                  }`}
                >
                  Custom Simulation
                </button>
                <button
                  type="button"
                  disabled={active}
                  onClick={() => setMode('historical')}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    mode === 'historical'
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:border-cyan-500/50 dark:bg-cyan-500/10 dark:text-cyan-400 shadow-md shadow-brand-500/5'
                      : 'border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 text-gray-400 opacity-60'
                  }`}
                >
                  Historical Replay
                </button>
              </div>
            </div>

            {/* Custom parameters (Generative) */}
            {mode === 'generative' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Chasing Team (Batting)</label>
                  <select
                    value={battingTeam}
                    onChange={(e) => setBattingTeam(e.target.value)}
                    disabled={active}
                    className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500/50 disabled:opacity-50 transition-colors"
                  >
                    {teams.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Defending Team (Bowling)</label>
                  <select
                    value={bowlingTeam}
                    onChange={(e) => setBowlingTeam(e.target.value)}
                    disabled={active}
                    className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500/50 disabled:opacity-50 transition-colors"
                  >
                    {teams.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Target runs</label>
                  <input
                    type="number"
                    value={targetRuns}
                    onChange={(e) => setTargetRuns(parseInt(e.target.value) || 0)}
                    disabled={active}
                    className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500/50 disabled:opacity-50 transition-colors"
                  />
                </div>
              </>
            )}

            {/* Historical Select */}
            {mode === 'historical' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Select Match</label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  disabled={active}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500/50 disabled:opacity-50 transition-colors"
                >
                  {FAMOUS_MATCHES.map((m) => (
                    <option key={m.id} value={m.id}>{m.description}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Speed slider */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block flex justify-between">
                <span>Simulation Speed (Delay)</span>
                <span className="text-indigo-600 dark:text-cyan-400 font-extrabold">{speed}s/ball</span>
              </label>
              <div className="flex items-center space-x-3">
                <Sliders className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  disabled={active}
                  className="w-full h-1 bg-slate-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 dark:accent-cyan-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4">
              {!active ? (
                <button
                  onClick={startSimulation}
                  className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-cyan-500 dark:to-emerald-500 hover:from-indigo-500 hover:to-cyan-400 dark:hover:from-cyan-400 dark:hover:to-emerald-400 text-white dark:text-gray-950 font-extrabold py-4 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/10 dark:shadow-cyan-500/20 active:scale-[0.98] transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Live Chase</span>
                </button>
              ) : (
                <button
                  onClick={socketDisconnect}
                  className="w-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 font-extrabold py-4 px-4 rounded-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-all"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>Halt Simulation</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Scorecard & Graph */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          {/* Live Scoreboard */}
          <div className="glass-card p-6 bg-white/70 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-red-500 animate-ping' : 'bg-gray-400'}`}></span>
              <span>Live Broadcast</span>
            </h3>

            {scorecard ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Score */}
                <div className="bg-slate-50 dark:bg-gray-950 p-4 rounded-2xl border border-slate-200 dark:border-gray-900 flex flex-col justify-center transition-colors">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Scoreboard</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {scorecard.current_runs} / {10 - scorecard.wickets_left}
                  </span>
                  <span className="text-xs text-indigo-600 dark:text-cyan-400 font-bold mt-0.5">{scorecard.batting_team}</span>
                </div>

                {/* Overs */}
                <div className="bg-slate-50 dark:bg-gray-950 p-4 rounded-2xl border border-slate-200 dark:border-gray-900 flex flex-col justify-center transition-colors">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Overs Bowled</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {formatOvers(scorecard.balls_bowled)} <span className="text-sm font-semibold text-gray-600">/ 20</span>
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{scorecard.balls_left} balls left</span>
                </div>

                {/* Target */}
                <div className="bg-slate-50 dark:bg-gray-950 p-4 rounded-2xl border border-slate-200 dark:border-gray-900 flex flex-col justify-center transition-colors">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Required Runs</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {scorecard.runs_needed} <span className="text-sm font-semibold text-gray-600">/ {scorecard.target_runs}</span>
                  </span>
                  <span className="text-xs text-red-500 font-bold mt-0.5">Defending: {scorecard.bowling_team}</span>
                </div>

                {/* Run rates */}
                <div className="bg-slate-50 dark:bg-gray-950 p-4 rounded-2xl border border-slate-200 dark:border-gray-900 flex flex-col justify-center transition-colors">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Run Rates</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    CRR: {scorecard.crr}
                  </span>
                  <span className="text-xs text-indigo-600 dark:text-emerald-400 font-extrabold mt-0.5">
                    RRR: {scorecard.rrr}
                  </span>
                </div>

                {/* Last Ball Callout & Recent Balls Feed */}
                <div className="col-span-2 md:col-span-4 bg-slate-100 dark:bg-gray-950/80 p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md transition-colors">
                  <div className="flex items-center space-x-2 text-sm text-slate-700 dark:text-gray-300">
                    <ChevronRight className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />
                    <span className="font-bold">Last Delivery:</span>
                    <span className={`font-black px-2 py-0.5 rounded ${
                      scorecard.last_ball_event.includes('Wicket') 
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>{scorecard.last_ball_event}</span>
                  </div>

                  {/* Recent Balls Bar */}
                  {recentBalls.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mr-1">This Over:</span>
                      {recentBalls.map((ball) => {
                        const isWicket = ball.event.includes('Wicket');
                        const isSix = ball.event.includes('6');
                        const isFour = ball.event.includes('4');
                        const isDot = ball.event.includes('0 runs') || ball.event.includes('dot');
                        return (
                          <div
                            key={ball.id}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border flex-shrink-0 select-none ${
                              isWicket
                                ? 'bg-red-500 text-white border-red-650'
                                : isSix
                                ? 'bg-purple-600 text-white border-purple-750'
                                : isFour
                                ? 'bg-blue-500 text-white border-blue-650'
                                : isDot
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-350 dark:border-gray-700'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            }`}
                            title={`Ball ${formatOvers(ball.num)}: ${ball.event}`}
                          >
                            {isWicket ? 'W' : isSix ? '6' : isFour ? '4' : isDot ? '.' : ball.event.split(' ')[0]}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="text-xs font-bold text-gray-500">
                    AI Probability: {Math.round(scorecard.batting_prob * 100)}% Win Chance
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl bg-slate-50 dark:bg-gray-950/40">
                <Tv2 className="w-12 h-12 text-gray-400 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Broadcast offline. Click 'Start Live Chase' to launch the feed.</p>
              </div>
            )}
          </div>

          {/* Win Probability Graph */}
          <div className="glass-card p-6 bg-white/70 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800 flex-grow">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-between">
              <span>📈 Live win probability trajectory</span>
              {scorecard && (
                <span className="text-xs text-gray-500 font-medium">Model: {scorecard.model_used}</span>
              )}
            </h3>
            
            {/* Blended Win Probability Bar */}
            {scorecard && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-gray-950 rounded-2xl border border-slate-200/50 dark:border-gray-900/30 transition-all">
                <div className="flex justify-between items-center text-xs font-black mb-2">
                  <span className="text-indigo-600 dark:text-emerald-400">
                    🏏 {scorecard.batting_team}: {Math.round(scorecard.batting_prob * 100)}%
                  </span>
                  <span className="text-cyan-550">
                    🎳 {scorecard.bowling_team}: {Math.round(scorecard.bowling_prob * 100)}%
                  </span>
                </div>
                <div className="relative h-4.5 w-full bg-slate-200 dark:bg-gray-900 rounded-full overflow-hidden flex border border-slate-300/40 dark:border-gray-800 shadow-inner">
                  <motion.div 
                    initial={{ width: '50%' }}
                    animate={{ width: `${scorecard.batting_prob * 100}%` }}
                    transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-emerald-500 dark:to-cyan-400"
                  />
                  <motion.div 
                    initial={{ width: '50%' }}
                    animate={{ width: `${scorecard.bowling_prob * 100}%` }}
                    transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                    className="h-full bg-gradient-to-r from-cyan-600 to-indigo-650 dark:from-cyan-600 dark:to-indigo-800 ml-auto"
                  />
                </div>
              </div>
            )}
            
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-gray-500 dark:text-gray-600 italic">
                Chart empty. Win probability will be plotted dynamically over time as balls are bowled.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1f2937' : '#e2e8f0'} vertical={false} />
                    <XAxis 
                      dataKey="over" 
                      stroke="#4b5563" 
                      fontSize={11} 
                      tickLine={false} 
                      label={{ value: 'Overs Bowled', position: 'insideBottom', offset: -5, fill: '#4b5563', fontSize: 10 }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke="#4b5563" 
                      fontSize={11} 
                      tickLine={false}
                      label={{ value: 'Win Prob %', angle: -90, position: 'insideLeft', fill: '#4b5563', fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                      itemStyle={{ color: theme === 'dark' ? '#10b981' : '#4f46e5' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="battingWinProb" 
                      name="Chasing Win %" 
                      stroke={theme === 'dark' ? '#10b981' : '#4f46e5'} 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        planName="Pro"
        onSuccess={() => {}}
      />
    </div>
  );
};

export default LiveSimulator;

