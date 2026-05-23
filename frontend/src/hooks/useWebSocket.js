import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url) => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('disconnected'); // connecting, connected, disconnected
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const configRef = useRef(null); // Save last config to re-send on reconnection
  const MAX_RECONNECT_ATTEMPTS = 5;
  
  const connect = useCallback((initialConfig = null) => {
    if (initialConfig) {
      configRef.current = initialConfig;
    }
    
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    // Clear any existing reconnect timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    setStatus('connecting');
    console.log(`[WebSocket]: Connecting to ${url}...`);
    
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log('[WebSocket]: Connected successfully.');
      setStatus('connected');
      reconnectAttemptsRef.current = 0;
      
      // If we have saved configuration parameters, automatically send them
      if (configRef.current) {
        console.log('[WebSocket]: Re-sending configuration payload...', configRef.current);
        ws.send(JSON.stringify(configRef.current));
      }
    };
    
    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch (e) {
        console.error('[WebSocket]: Data parse error:', e);
      }
    };
    
    ws.onclose = (event) => {
      console.log('[WebSocket]: Connection closed.', event.reason);
      setStatus('disconnected');
      wsRef.current = null;
      
      // If we didn't explicitly call disconnect and reconnect limit is not exceeded, attempt auto-reconnect
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && configRef.current) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        console.warn(`[WebSocket]: Lost connection. Reconnecting in ${delay}ms... (Attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    };
    
    ws.onerror = (error) => {
      console.error('[WebSocket]: Socket encountered error:', error);
      ws.close();
    };
    
    wsRef.current = ws;
  }, [url]);
  
  const send = useCallback((payload) => {
    configRef.current = payload;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn('[WebSocket]: Socket not open. Queued payload for when connection establishes.');
      connect(payload);
    }
  }, [connect]);
  
  const disconnect = useCallback(() => {
    console.log('[WebSocket]: Disconnecting manually.');
    configRef.current = null; // Clear configuration to stop auto-reconnection
    reconnectAttemptsRef.current = 0;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
    setData(null);
  }, []);
  
  useEffect(() => {
    return () => {
      // Clean up connection on component unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
  
  return { data, status, send, connect, disconnect };
};
