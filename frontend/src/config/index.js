const config = {
  development: {
    apiUrl: 'http://127.0.0.1:8000/api/v1',
    wsUrl: 'ws://127.0.0.1:8000/api/ws/live-simulation',
    logLevel: 'debug',
  },
  staging: {
    apiUrl: 'https://staging-api.iplpredictor.com/api/v1',
    wsUrl: 'wss://staging-api.iplpredictor.com/api/ws/live-simulation',
    logLevel: 'info',
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'https://ipl-win-backend.onrender.com/api/v1',
    wsUrl: import.meta.env.VITE_WS_URL || 'wss://ipl-win-backend.onrender.com/api/ws/live-simulation',
    logLevel: 'error',
  },
};

const env = import.meta.env.VITE_APP_ENV || (import.meta.env.MODE === 'production' ? 'production' : 'development');
export default config[env] || config.development;
