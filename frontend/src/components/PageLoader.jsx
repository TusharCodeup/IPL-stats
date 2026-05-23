import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
      <h3 className="text-gray-400 font-semibold tracking-wider uppercase text-xs">Loading Module...</h3>
    </div>
  );
};

export default PageLoader;
