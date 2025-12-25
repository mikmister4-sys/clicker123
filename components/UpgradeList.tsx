import React from 'react';
import { UpgradeConfig } from '../types';
import { Hand, Zap, Disc, Atom, Satellite, Bot, Factory, Sun, CircleDot, Lock } from 'lucide-react';

// Icon mapping
const Icons: Record<string, React.FC<any>> = {
  Hand, Zap, Disc, Atom, Satellite, Bot, Factory, Sun, CircleDot
};

interface UpgradeListProps {
  title: string;
  upgrades: UpgradeConfig[];
  purchased: Record<string, number>;
  currency: number;
  onBuy: (id: string) => void;
}

const UpgradeList: React.FC<UpgradeListProps> = ({ title, upgrades, purchased, currency, onBuy }) => {
  
  const calculateCost = (baseCost: number, multiplier: number, count: number) => {
    return Math.floor(baseCost * Math.pow(multiplier, count));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div className="p-4 bg-slate-800/80 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-indigo-300 uppercase tracking-wider">{title}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {upgrades.map((upgrade) => {
          const count = purchased[upgrade.id] || 0;
          const cost = calculateCost(upgrade.baseCost, upgrade.costMultiplier, count);
          const canAfford = currency >= cost;
          const Icon = Icons[upgrade.icon] || CircleDot;

          return (
            <button
              key={upgrade.id}
              onClick={() => onBuy(upgrade.id)}
              disabled={!canAfford}
              className={`w-full group relative flex items-center p-3 rounded-lg border transition-all duration-200 text-left
                ${canAfford 
                  ? 'bg-slate-800/60 border-slate-600 hover:bg-slate-700 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10' 
                  : 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
                }
              `}
            >
              <div className={`p-3 rounded-lg mr-4 transition-colors ${canAfford ? 'bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white' : 'bg-slate-800 text-slate-600'}`}>
                <Icon size={24} />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-100">{upgrade.name}</span>
                  <span className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-400">Lvl {count}</span>
                </div>
                <div className="text-xs text-slate-400 mb-2 line-clamp-1">{upgrade.description}</div>
                <div className="flex justify-between items-center">
                  <div className="text-xs font-medium text-slate-500">
                    +{upgrade.basePower} {upgrade.type === 'CLICK' ? 'Click' : 'DPS'}
                  </div>
                  <div className={`font-mono text-sm font-bold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                    {cost.toLocaleString()} SD
                  </div>
                </div>
              </div>
              
              {/* Unlock visual flare if affordable */}
              {canAfford && (
                <div className="absolute inset-0 rounded-lg ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/50 pointer-events-none transition-all" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UpgradeList;