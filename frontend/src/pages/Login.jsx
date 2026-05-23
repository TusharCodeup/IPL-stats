import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';
import { useApi } from '../hooks/useApi';
import { LogIn, KeyRound, User, AlertCircle, RefreshCw } from 'lucide-react';

const Login = ({ onToggleRegister }) => {
  const loginStore = useAuthStore((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, execute } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      const data = await execute(() => authService.login(username, password));
      const { access_token, role, username: resUser, credits, subscription, full_name } = data;
      loginStore(access_token, resUser, role, credits, subscription, full_name);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md glass-card p-8 border border-slate-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-[#111827]/50 shadow-2xl relative overflow-hidden rounded-3xl">
        {/* Background glow decorators */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse-slow"></div>

        {/* Title / Head */}
        <div className="text-center mb-8 relative">
          <span className="text-4xl block mb-2 select-none">🏏</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">Welcome Back</h2>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-widest">IPL Match Winner Prediction</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center space-x-2 animate-slide-up">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error || 'Incorrect credentials. Try admin/admin123.'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 dark:text-gray-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 dark:text-gray-500">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-emerald-500 dark:to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 dark:hover:from-emerald-400 dark:hover:to-cyan-400 text-white dark:text-gray-950 font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 border-t border-slate-200 dark:border-gray-800/80 pt-6 transition-colors">
          New to the platform?{' '}
          <button
            onClick={onToggleRegister}
            className="text-indigo-600 dark:text-emerald-400 hover:text-indigo-500 dark:hover:text-emerald-300 font-semibold transition-colors"
          >
            Register Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
