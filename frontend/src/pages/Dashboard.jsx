import React, { useState, useEffect, useMemo } from 'react';
import { statsService } from '../services/statsService';
import { predictionService } from '../services/predictionService';
import { useApi } from '../hooks/useApi';
import VirtualTable from '../components/VirtualTable';
import { sanitizeInput } from '../utils/sanitize';
import useAuthStore from '../store/authStore';
import CheckoutModal from '../components/CheckoutModal';
import { 
  Sparkles, 
  HelpCircle, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Coins, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  MinusCircle
} from 'lucide-react';


const Dashboard = () => {
  // Dropdown options lists
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  
  // Form selections state
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [venue, setVenue] = useState('');
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState('field');

  // Request handlers state
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [formError, setFormError] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { credits, subscription, setUserDetails } = useAuthStore();
  
  const { loading: optionsLoading, execute: executeOptions } = useApi();
  const { loading: predictLoading, execute: executePredict } = useApi();
  const { execute: executeHistory } = useApi();


  useEffect(() => {
    fetchOptions();
    fetchHistory();
  }, []);

  const fetchOptions = async () => {
    try {
      const teamsData = await executeOptions(() => statsService.getTeams());
      const venuesData = await executeOptions(() => statsService.getVenues());
      setTeams(teamsData);
      setVenues(venuesData);
    } catch (err) {
      console.error('Error fetching option lists:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const historyData = await executeHistory(() => predictionService.getHistory());
      setHistory(historyData);
    } catch (err) {
      console.error('Error fetching prediction history:', err);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!team1 || !team2 || !venue || !tossWinner) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (team1 === team2) {
      setFormError('Teams cannot be the same.');
      return;
    }
    
    setFormError('');
    setPrediction(null);

    try {
      const data = await executePredict(() => predictionService.getPreMatchPrediction({
        team1,
        team2,
        venue,
        toss_winner: tossWinner,
        toss_decision: tossDecision
      }));
      setPrediction(data);
      if (subscription === 'free') {
        setUserDetails({ credits: Math.max(0, credits - 1) });
      }
      fetchHistory(); // refresh logs table
    } catch (err) {
      console.error('Error running prediction:', err);
    }
  };

  // Virtual Table Columns definition
  const columns = useMemo(() => [
    {
      header: 'Teams',
      render: (log) => (
        <span className="font-semibold text-slate-800 dark:text-gray-200">
          {sanitizeInput(log.team1)} <span className="text-xs text-gray-500">vs</span> {sanitizeInput(log.team2)}
        </span>
      )
    },
    {
      header: 'Venue',
      render: (log) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">{sanitizeInput(log.venue)}</span>
      )
    },
    {
      header: 'Toss Setting',
      render: (log) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {sanitizeInput(log.toss_winner)} elected to {sanitizeInput(log.toss_decision)}
        </span>
      )
    },
    {
      header: 'Favored Winner',
      render: (log) => (
        <span className="text-xs font-bold text-indigo-600 dark:text-emerald-400">{sanitizeInput(log.predicted_winner)}</span>
      )
    },
    {
      header: 'Win Probability',
      render: (log) => (
        <span className="font-extrabold text-slate-800 dark:text-white">{Math.round(log.win_probability * 100)}%</span>
      )
    },
    {
      header: 'Explanation Summary',
      render: (log) => (
        <span className="text-xs text-gray-500 max-w-xs truncate block" title={log.explanation_summary}>
          {sanitizeInput(log.explanation_summary)}
        </span>
      )
    }
  ], []);

  // Compute form values for toss choices dynamically
  const tossOptions = useMemo(() => {
    const opts = [];
    if (team1) opts.push(team1);
    if (team2) opts.push(team2);
    return opts;
  }, [team1, team2]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in transition-colors">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 glass-card border-indigo-500/20 dark:border-emerald-500/20 bg-gradient-to-r from-slate-100 to-indigo-500/5 dark:from-[#111827]/80 dark:to-emerald-500/5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Pre-Match Prediction Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure teams, venue and toss settings to estimate winning probabilities using the Cric-AI Ensemble.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 text-sm font-semibold glow-brand dark:glow-green">
          <Sparkles className="w-4 h-4" />
          <span>Multi-Model Ensemble Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Predictor Form */}
        <div className="lg:col-span-1 glass-card p-6 bg-white/70 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800/80 relative">
          {subscription === 'free' && credits <= 0 && (
            <div className="absolute inset-0 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-6 rounded-[2.5rem] animate-fade-in border border-indigo-500/20 dark:border-emerald-500/25">
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
            <span>⚙️ Configuration</span>
          </h2>

          {formError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm animate-slide-up">
              {formError}
            </div>
          )}

          <form onSubmit={handlePredict} className="space-y-5">
            {/* Team 1 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Team 1 (Batting First)</label>
              <select
                value={team1}
                onChange={(e) => {
                  setTeam1(e.target.value);
                  setTossWinner('');
                }}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
              >
                <option value="">Select Team 1</option>
                {teams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Team 2 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Team 2 (Bowling First)</label>
              <select
                value={team2}
                onChange={(e) => {
                  setTeam2(e.target.value);
                  setTossWinner('');
                }}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
              >
                <option value="">Select Team 2</option>
                {teams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Venue */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Stadium / Venue</span>
              </label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
              >
                <option value="">Select Venue</option>
                {venues.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Toss Winner */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block flex items-center space-x-1">
                <Coins className="w-3.5 h-3.5" />
                <span>Toss Winner</span>
              </label>
              <select
                value={tossWinner}
                onChange={(e) => setTossWinner(e.target.value)}
                disabled={!team1 || !team2}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 disabled:opacity-50 transition-colors"
              >
                <option value="">Select Toss Winner</option>
                {tossOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Toss Decision */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Toss Decision</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTossDecision('field')}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    tossDecision === 'field'
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-400 shadow-lg shadow-indigo-500/5 dark:shadow-emerald-500/5'
                      : 'border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 text-gray-400'
                  }`}
                >
                  Bowl First
                </button>
                <button
                  type="button"
                  onClick={() => setTossDecision('bat')}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    tossDecision === 'bat'
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-400 shadow-lg shadow-indigo-500/5 dark:shadow-emerald-500/5'
                      : 'border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 text-gray-400'
                  }`}
                >
                  Bat First
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={predictLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-emerald-500 dark:to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 dark:hover:from-emerald-400 dark:hover:to-cyan-400 text-white dark:text-gray-950 font-extrabold py-4 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all mt-6"
            >
              {predictLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Run Prediction</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results & Explanation */}
        <div className="lg:col-span-2 space-y-6">
          {predictLoading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass-card p-8 bg-white/70 dark:bg-[#111827]/40 text-center animate-pulse border-slate-200 dark:border-gray-800">
              <RefreshCw className="w-12 h-12 text-indigo-500 dark:text-emerald-400 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Aggregating Cricket Metrics...</h3>
              <p className="text-gray-500 text-sm mt-2 max-w-sm">
                Evaluating team strength indexes, head-to-head records, venue bias matrices, and recent form EWMA values.
              </p>
            </div>
          )}

          {!predictLoading && !prediction && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass-card p-8 bg-white/70 dark:bg-[#111827]/40 text-center border-dashed border-slate-200 dark:border-gray-800">
              <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-bold text-slate-400 dark:text-gray-500">Prediction Engine Ready</h3>
              <p className="text-gray-500 text-sm mt-2 max-w-md">
                Configure the match parameters on the left and run the prediction pipeline to generate win probabilities and explainable AI insights.
              </p>
            </div>
          )}

          {prediction && !predictLoading && (
            <div className="space-y-6 animate-slide-up">
              {/* Win Probability Card */}
              <div className="glass-card p-6 bg-white/70 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">🏆 Prediction Summary</h3>
                
                {/* Team Headings */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">{team1}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Team 1</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-850 border border-slate-200 dark:border-gray-850 text-xs font-bold text-gray-500">VS</div>
                  <div className="flex flex-col text-right">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">{team2}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Team 2</span>
                  </div>
                </div>

                {/* Blended Probability Bar */}
                <div className="relative h-8 w-full bg-slate-100 dark:bg-gray-950 rounded-full overflow-hidden border border-slate-200 dark:border-gray-850 flex shadow-inner">
                  {/* Team 1 split */}
                  <div 
                    style={{ width: `${prediction.team1_probability * 100}%` }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-emerald-600 dark:to-emerald-500 transition-all duration-1000 flex items-center pl-4 font-extrabold text-white text-sm relative"
                  >
                    <span className="drop-shadow">{Math.round(prediction.team1_probability * 100)}%</span>
                  </div>
                  {/* Team 2 split */}
                  <div 
                    style={{ width: `${prediction.team2_probability * 100}%` }}
                    className="h-full bg-gradient-to-l from-cyan-600 to-cyan-500 dark:from-cyan-600 dark:to-cyan-500 transition-all duration-1000 flex items-center justify-end pr-4 font-extrabold text-white text-sm relative ml-auto"
                  >
                    <span className="drop-shadow">{Math.round(prediction.team2_probability * 100)}%</span>
                  </div>
                </div>

                {/* Predicted Winner Callout */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-100 dark:bg-gray-950 rounded-2xl border border-slate-200 dark:border-gray-850">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-emerald-400" />
                    <span className="text-sm text-gray-500">Favored Winner:</span>
                    <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-emerald-400 dark:to-cyan-500">
                      {prediction.predicted_winner}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 sm:mt-0 font-medium">Model: {prediction.model_used}</span>
                </div>
              </div>

              {/* Explainable AI (SHAP Contributions) */}
              {prediction.explanation && (
                <div className="glass-card p-6 bg-white/70 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                    <span>💡 Why this Prediction? (Explainable AI)</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 italic">{prediction.explanation.summary}</p>
                  
                  <div className="space-y-4">
                    {prediction.explanation.contributions.map((item, index) => {
                      const isPositive = item.type === 'positive';
                      return (
                        <div key={index} className="flex items-start justify-between p-4 rounded-xl bg-slate-50 dark:bg-gray-950/60 border border-slate-200 dark:border-gray-900 hover:border-slate-300 dark:hover:border-gray-800 transition-colors">
                          <div className="flex items-start space-x-3">
                            {isPositive ? (
                              <PlusCircle className="w-5 h-5 text-indigo-500 dark:text-emerald-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <MinusCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <h4 className="text-sm font-bold text-slate-800 dark:text-gray-200">{item.feature}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{item.description}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-extrabold px-2.5 py-1 rounded-lg ${
                            isPositive 
                              ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-500 border border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                          }`}>
                            {item.impact}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History Log using VirtualTable */}
      <div className="glass-card p-6 bg-white/70 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 font-display">📝 Your Prediction History Log</h3>
        <VirtualTable 
          data={history} 
          columns={columns} 
          itemHeight={64} 
          containerHeight={380} 
        />
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        planName="Pro"
        onSuccess={fetchHistory}
      />
    </div>
  );
};

export default Dashboard;

