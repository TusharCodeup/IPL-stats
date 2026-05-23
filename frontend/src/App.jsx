import React, { useState, lazy, Suspense } from 'react';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import PageLoader from './components/PageLoader';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';

// Lazy load pages for performance code-splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LiveSimulator = lazy(() => import('./pages/LiveSimulator'));
const TeamAnalytics = lazy(() => import('./pages/TeamAnalytics'));
const Historical = lazy(() => import('./pages/Historical'));
const ModelAccuracy = lazy(() => import('./pages/ModelAccuracy'));
const Landing = lazy(() => import('./pages/Landing'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  const { isLoggedIn } = useAuthStore();
  const [anonymousView, setAnonymousView] = useState('landing'); // 'landing', 'login', 'register'
  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard', 'live', 'analytics', 'historical', 'accuracy', 'settings'

  // 1. Session check for anonymous users
  if (!isLoggedIn()) {
    if (anonymousView === 'landing') {
      return (
        <ErrorBoundary>
          <ThemeProvider>
            <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
              {/* Anonymous Navbar */}
              <header className="border-b border-slate-200/80 dark:border-gray-900/50 bg-white/80 dark:bg-[#0e1322]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏏</span>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-500 font-sans tracking-wide">
                        IPL CRIC-AI
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase">
                        Predictive Analytics
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setAnonymousView('login')}
                      className="text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-emerald-400 px-4 py-2 transition-colors cursor-pointer"
                    >
                      Log In
                    </button>
                    <button 
                      onClick={() => setAnonymousView('register')}
                      className="bg-indigo-600 dark:bg-emerald-500 hover:bg-indigo-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </header>

              <main className="flex-grow">
                <Suspense fallback={<PageLoader />}>
                  <Landing onGetStarted={() => setAnonymousView('register')} />
                </Suspense>
              </main>

              <footer className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500 dark:text-gray-600 border-t border-slate-200 dark:border-gray-900/80 pt-6 mt-12 w-full pb-8">
                IPL Match Winner Prediction Platform © {new Date().getFullYear()} - Developed with FastAPI, Scikit-learn, XGBoost & React.
              </footer>
            </div>
          </ThemeProvider>
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary>
        <ThemeProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col items-center justify-center font-sans relative">
            <button
              onClick={() => setAnonymousView('landing')}
              className="absolute top-6 left-6 text-xs font-bold text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <span>←</span> <span>Back to Home</span>
            </button>
            <Suspense fallback={<PageLoader />}>
              {anonymousView === 'login' ? (
                <Login onToggleRegister={() => setAnonymousView('register')} />
              ) : (
                <Register onToggleLogin={() => setAnonymousView('login')} />
              )}
            </Suspense>
          </div>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // 2. Main Authenticated Dashboard Workspace Layout
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'live':
        return <LiveSimulator />;
      case 'analytics':
        return <TeamAnalytics />;
      case 'historical':
        return <Historical />;
      case 'accuracy':
        return <ModelAccuracy />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-gray-100 flex flex-col font-sans relative overflow-hidden pb-12 transition-colors duration-300">
          {/* Dynamic background ambient glowing effects */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-emerald-500/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>

          {/* Navigation */}
          <Navbar activePage={activePage} setActivePage={setActivePage} />

          {/* Offline indicator banner */}
          <OfflineBanner />

          {/* Main Page Area with loading Suspense */}
          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              {renderActivePage()}
            </Suspense>
          </main>

          {/* Footer */}
          <footer className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500 dark:text-gray-600 border-t border-slate-200 dark:border-gray-900 pt-6 mt-12 w-full transition-colors">
            IPL Match Winner Prediction Platform © {new Date().getFullYear()} - Developed with FastAPI, Scikit-learn, XGBoost & React.
          </footer>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

