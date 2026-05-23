import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  
  if (isOnline) return null;
  
  return (
    <div className="bg-amber-600/90 text-white font-bold text-center py-2 px-4 text-xs sticky top-16 z-40 backdrop-blur-md border-b border-amber-500/35 flex items-center justify-center space-x-2 animate-slide-up shadow-md">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Offline Mode active. Live WS simulations and DB requests are suspended until connection is restored.</span>
    </div>
  );
};

export default OfflineBanner;
