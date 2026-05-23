import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { adminService } from '../services/adminService';
import { useApi } from '../hooks/useApi';
import { 
  ShieldAlert, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Activity,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

const ModelAccuracy = () => {
  const { isAdmin } = useAuthStore();
  const [metrics, setMetrics] = useState(null);
  const [drift, setDrift] = useState(null);
  const [retrainMsg, setRetrainMsg] = useState('');
  
  const { loading, error, execute } = useApi();
  const { loading: retraining, execute: executeRetrain } = useApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (isAdmin()) {
        const metricsData = await execute(() => adminService.getMetrics());
        const driftData = await execute(() => adminService.getDriftReport());
        setMetrics(metricsData);
        setDrift(driftData);
      } else {
        // Fallback mock metrics for standard users
        setMetrics({
          trained_on: "2026-05-23",
          dataset_version: "Cricsheet IPL CSV2",
          roc_auc_pre_match: 0.5155,
          roc_auc_live_chase: 0.9884,
          accuracy_pre_match: 0.5165,
          accuracy_live_chase: 0.9404,
          features_pre_match: ["team1_enc", "team2_enc", "venue_enc", "toss_winner_enc", "toss_decision_enc", "head_to_head", "form"],
          features_live_chase: ["batting_team_enc", "bowling_team_enc", "venue_enc", "target_runs", "runs_needed", "balls_left", "wickets_left", "crr", "rrr"]
        });
        setDrift({
          drift_detected: false,
          status: "stable",
          message: "Data distribution is stable.",
          metrics: {
            home_win_rate: { historical: 0.542, current: 0.531, drift_score: 0.011 },
            toss_win_correlation: { historical: 0.511, current: 0.505, drift_score: 0.006 }
          }
        });
      }
    } catch (err) {
      console.error('Error fetching MLOps metrics:', err);
    }
  };

  const handleRetrain = async () => {
    if (!isAdmin()) return;
    setRetrainMsg('');
    
    try {
      await executeRetrain(() => adminService.triggerRetrain());
      setRetrainMsg('Retraining pipeline enqueued in backend! Model will rebuild in background.');
    } catch (err) {
      console.error('Retraining trigger failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center animate-pulse">
        <Activity className="w-12 h-12 text-indigo-500 dark:text-yellow-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white font-sans">Querying MLOps Registries...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center space-x-3 p-6 glass-card border-indigo-500/25 dark:border-yellow-500/20 bg-gradient-to-r from-slate-100 to-indigo-500/5 dark:from-[#111827]/80 dark:to-yellow-500/5">
        <span className="text-3xl select-none">⚙️</span>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">MLOps, Accuracy & Metrics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Audit ROC-AUC accuracy metrics, analyze model input drift coefficients, and trigger pipelines.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-sm animate-slide-up">
          {error}
        </div>
      )}

      {retrainMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-sm flex items-center space-x-2 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{retrainMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Model Metrics Column */}
        {metrics && (
          <div className="lg:col-span-2 space-y-6">
            {/* Accuracy card */}
            <div className="glass-card p-6 bg-white/80 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2 font-display">
                <Layers className="w-5 h-5 text-indigo-500 dark:text-yellow-500" />
                <span>Model Accuracy Metrics</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pre Match Model */}
                <div className="bg-slate-50 dark:bg-gray-950 p-5 rounded-2xl border border-slate-200 dark:border-gray-900 space-y-4 transition-colors">
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pre-Match Ensemble</h4>
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-900 pb-3 transition-colors">
                    <span className="text-xs text-gray-400">ROC-AUC score</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-emerald-400">{metrics.roc_auc_pre_match.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Classification Accuracy</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white">{metrics.accuracy_pre_match.toFixed(4)}</span>
                  </div>
                </div>

                {/* Live Chase Model */}
                <div className="bg-slate-50 dark:bg-gray-950 p-5 rounded-2xl border border-slate-200 dark:border-gray-900 space-y-4 transition-colors">
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Live Chase Ensemble</h4>
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-900 pb-3 transition-colors">
                    <span className="text-xs text-gray-400">ROC-AUC score</span>
                    <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{metrics.roc_auc_live_chase.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Classification Accuracy</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white">{metrics.accuracy_live_chase.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features details card */}
            <div className="glass-card p-6 bg-white/80 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2 font-display">
                <FileSpreadsheet className="w-5 h-5 text-gray-400" />
                <span>Feature Configurations</span>
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-gray-300 mb-2">Pre-Match Classifier Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {metrics.features_pre_match.map((f) => (
                      <span key={f} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 transition-colors">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-gray-900 transition-colors">
                  <h4 className="font-bold text-slate-800 dark:text-gray-300 mb-2">Live Chase Classifier Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {metrics.features_live_chase.map((f) => (
                      <span key={f} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 transition-colors">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retraining and Drift Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Retrain panel */}
          <div className="glass-card p-6 bg-white/80 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2 font-display">
              <RotateCw className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />
              <span>Model Retraining Lifecycle</span>
            </h3>

            {metrics && (
              <div className="mb-6 space-y-2 text-xs border-b border-slate-200 dark:border-gray-900 pb-4 transition-colors">
                <div className="flex justify-between">
                  <span className="text-gray-400">Trained Date:</span>
                  <span className="text-slate-800 dark:text-gray-300 font-semibold">{metrics.trained_on}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dataset Source:</span>
                  <span className="text-slate-800 dark:text-gray-300 font-semibold">{metrics.dataset_version}</span>
                </div>
              </div>
            )}

            {isAdmin() ? (
              <button
                onClick={handleRetrain}
                disabled={retraining}
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-cyan-500 dark:to-emerald-500 hover:from-indigo-500 hover:to-cyan-400 dark:hover:from-cyan-400 dark:hover:to-emerald-400 text-white dark:text-gray-950 font-extrabold py-4 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/10 dark:shadow-cyan-500/20 active:scale-[0.98] transition-all"
              >
                {retraining ? (
                  <RotateCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Trigger Retraining</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-950 border border-slate-250 dark:border-gray-900 text-center text-xs text-gray-500 transition-colors">
                ⚠️ Administrator privileges are required to trigger training pipelines.
              </div>
            )}
          </div>

          {/* Drift panel */}
          {drift && (
            <div className="glass-card p-6 bg-white/80 dark:bg-[#111827]/40 border-slate-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2 font-display">
                <ShieldAlert className="w-5 h-5 text-red-500 dark:text-red-400" />
                <span>Baseline Input Drift Report</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-gray-950 rounded-xl border border-slate-200 dark:border-gray-900 transition-colors">
                  {drift.drift_detected ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <span className="text-xs text-yellow-600 dark:text-yellow-500 font-semibold">Drift Detected!</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold">Inputs Distribution Stable</span>
                    </>
                  )}
                </div>

                {/* Metrics */}
                <div className="space-y-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>Home Ground Advantage:</span>
                      <span className="text-slate-800 dark:text-white font-bold">Diff: {drift.metrics.home_win_rate.drift_score.toFixed(4)}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-950 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-gray-900 transition-colors">
                      <div 
                        style={{ width: `${Math.min(drift.metrics.home_win_rate.drift_score * 1000, 100)}%` }}
                        className={`h-full ${drift.metrics.home_win_rate.drift_score > 0.08 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Toss Correlation Impact:</span>
                      <span className="text-slate-800 dark:text-white font-bold">Diff: {drift.metrics.toss_win_correlation.drift_score.toFixed(4)}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-950 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-gray-900 transition-colors">
                      <div 
                        style={{ width: `${Math.min(drift.metrics.toss_win_correlation.drift_score * 1000, 100)}%` }}
                        className={`h-full ${drift.metrics.toss_win_correlation.drift_score > 0.08 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelAccuracy;
