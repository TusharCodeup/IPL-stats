import { useState, useEffect } from 'react';

const cacheStore = new Map();

export const useCachedData = (key, fetcher, ttl = 300000) => { // Default TTL: 5 minutes
  const [data, setData] = useState(() => {
    const cached = cacheStore.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    return null;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let active = true;
    
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetcher();
        if (active) {
          setData(result);
          cacheStore.set(key, { data: result, timestamp: Date.now() });
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to fetch data');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    
    const cached = cacheStore.get(key);
    if (!cached || Date.now() - cached.timestamp >= ttl) {
      load();
    } else {
      // Stale-While-Revalidate: Return cache immediately, but fetch in background if near expiry
      const isStale = Date.now() - cached.timestamp > ttl * 0.8; // 80% of TTL is considered near-stale
      if (isStale) {
        console.log(`[Cache]: Stale-While-Revalidate triggered for key: ${key}`);
        load();
      }
    }
    
    return () => {
      active = false;
    };
  }, [key, ttl]);
  
  return { data, loading, error };
};
