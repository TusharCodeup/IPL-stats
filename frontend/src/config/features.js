export const FEATURES = {
  LIVE_SIMULATOR: import.meta.env.VITE_FEATURE_LIVE_SIMULATOR !== 'false',
  XAI_INSIGHTS: import.meta.env.VITE_FEATURE_XAI !== 'false',
  DATA_DRIFT: import.meta.env.VITE_FEATURE_DATA_DRIFT !== 'false',
  HISTORICAL_REPLAY: import.meta.env.VITE_FEATURE_HISTORICAL_REPLAY !== 'false',
};
