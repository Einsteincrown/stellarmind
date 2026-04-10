import React from 'react';
import { Cpu, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between mb-8 px-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-hw-card rounded-lg flex items-center justify-center border border-white/10 hw-glow">
          <Cpu className="w-6 h-6 text-hw-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tighter uppercase">StellarMind</h1>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-hw-accent animate-pulse" />
            <span className="hw-label text-[8px]">System Active // Horizon Testnet</span>
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-6">
        <div className="text-right">
          <p className="hw-label">Network Load</p>
          <p className="hw-value">0.42 TPS</p>
        </div>
        <div className="text-right">
          <p className="hw-label">AI Engine</p>
          <p className="hw-value text-hw-accent">Claude 3.5 Sonnet</p>
        </div>
        <Activity className="w-5 h-5 text-hw-muted" />
      </div>
    </header>
  );
};
