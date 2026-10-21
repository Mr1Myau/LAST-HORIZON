import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center gap-2.5 rounded-full bg-slate-900/90 border border-amber-500/50 px-4 py-1.5 text-xs font-mono-tech text-amber-300 shadow-lg shadow-amber-950/40 backdrop-blur-md animate-pulse">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>OFFLINE SIMULATION — LOCAL PLANETARY CACHE ACTIVE</span>
    </div>
  );
};
