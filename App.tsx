import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Starfield from './components/Starfield';
import FloatingTextOverlay from './components/FloatingText';
import UpgradeList from './components/UpgradeList';
import { GameState, FloatingText, UpgradeType } from './types';
import { CLICK_UPGRADES, AUTO_UPGRADES, INITIAL_GAME_STATE } from './constants';
import { Sparkles, Trophy, Zap, Clock } from 'lucide-react';

const formatNumber = (num: number): string => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return Math.floor(num).toLocaleString();
};

const App: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('cosmicClickerSave');
      return saved ? JSON.parse(saved) : INITIAL_GAME_STATE;
    } catch (e) {
      console.error("Failed to load save", e);
      return INITIAL_GAME_STATE;
    }
  });

  // UI State
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  // Derived Stats
  const stats = useMemo(() => {
    let clickPower = 1;
    let autoPower = 0;

    CLICK_UPGRADES.forEach(u => {
      const count = gameState.upgrades[u.id] || 0;
      if (count > 0) clickPower += u.basePower * count;
    });

    AUTO_UPGRADES.forEach(u => {
      const count = gameState.upgrades[u.id] || 0;
      if (count > 0) autoPower += u.basePower * count;
    });

    return { clickPower, autoPower };
  }, [gameState.upgrades]);

  // Persist Save
  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem('cosmicClickerSave', JSON.stringify(gameState));
    }, 5000); // Autosave every 5s
    return () => clearInterval(saveInterval);
  }, [gameState]);

  // Auto Farm Loop (Runs 10 times a second for smoothness)
  useEffect(() => {
    if (stats.autoPower === 0) return;
    
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        stardust: prev.stardust + (stats.autoPower / 10),
        lifetimeStardust: prev.lifetimeStardust + (stats.autoPower / 10)
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [stats.autoPower]);

  // Handle Manual Click
  const handlePlanetClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default touch actions like zoom
    // e.preventDefault(); // Sometimes problematic with React synthetic events, handled via CSS touch-action usually
    
    // Get coordinates for floating text
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Add Resources
    setGameState(prev => ({
      ...prev,
      stardust: prev.stardust + stats.clickPower,
      lifetimeStardust: prev.lifetimeStardust + stats.clickPower,
      clickCount: prev.clickCount + 1
    }));

    // Add Floating Text
    const newText: FloatingText = {
      id: Date.now() + Math.random(),
      x: clientX,
      y: clientY,
      text: formatNumber(stats.clickPower)
    };
    
    setFloatingTexts(prev => [...prev, newText]);
    
    // Trigger visual click state
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 100);

    // Clean up old floating texts
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 1000);

  }, [stats.clickPower]);

  // Handle Purchase
  const buyUpgrade = (id: string) => {
    const config = [...CLICK_UPGRADES, ...AUTO_UPGRADES].find(u => u.id === id);
    if (!config) return;

    const currentCount = gameState.upgrades[id] || 0;
    const cost = Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentCount));

    if (gameState.stardust >= cost) {
      setGameState(prev => ({
        ...prev,
        stardust: prev.stardust - cost,
        upgrades: {
          ...prev.upgrades,
          [id]: currentCount + 1
        }
      }));
    }
  };

  // Reset Game
  const resetGame = () => {
    if (confirm("Are you sure you want to reset all progress?")) {
      setGameState(INITIAL_GAME_STATE);
      localStorage.removeItem('cosmicClickerSave');
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row text-white select-none">
      <Starfield />
      
      {/* Background Ambience / Glow behind planet */}
      <div className="absolute top-1/2 left-1/2 md:left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-900/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Floating Text Overlay */}
      <FloatingTextOverlay items={floatingTexts} />

      {/* LEFT SECTION: Stats & Clicker */}
      <div className="relative z-10 w-full md:w-5/12 lg:w-1/3 flex flex-col items-center justify-between p-6 h-[55%] md:h-full">
        
        {/* Header Stats */}
        <div className="w-full bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20 shadow-2xl flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-indigo-300 uppercase tracking-widest text-xs font-bold">
            <Sparkles size={14} /> Cosmic Stardust
          </div>
          <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-indigo-400 drop-shadow-sm">
            {Math.floor(gameState.stardust).toLocaleString()}
          </div>
          <div className="flex w-full justify-between mt-2 px-4 text-sm font-medium text-slate-400">
             <div className="flex items-center gap-1"><Zap size={14} className="text-yellow-400" /> {formatNumber(stats.autoPower)}/sec</div>
             <div className="flex items-center gap-1"><span className="text-emerald-400">+{formatNumber(stats.clickPower)}</span>/click</div>
          </div>
        </div>

        {/* Central Clicker Object */}
        <div className="flex-1 flex items-center justify-center w-full">
          <button
            onMouseDown={handlePlanetClick}
            onTouchStart={handlePlanetClick}
            className={`
              relative w-48 h-48 md:w-64 md:h-64 rounded-full 
              bg-gradient-to-br from-indigo-500 via-purple-600 to-slate-900
              shadow-[0_0_50px_rgba(79,70,229,0.5)] 
              planet-glow transition-transform duration-75 ease-in-out
              active:scale-95 hover:scale-105
              cursor-pointer group
              ${isClicking ? 'scale-95 brightness-110' : ''}
            `}
            style={{
              backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)'
            }}
          >
             {/* Planet Details */}
             <div className="absolute inset-0 rounded-full overflow-hidden opacity-80">
                <div className="absolute top-[20%] left-[10%] w-[40%] h-[20%] bg-black/10 rounded-full blur-sm transform -rotate-12"></div>
                <div className="absolute bottom-[30%] right-[15%] w-[20%] h-[10%] bg-black/20 rounded-full blur-md"></div>
                {/* Ring System */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border-[20px] border-indigo-400/10 rounded-full skew-x-12 scale-y-[0.3] pointer-events-none group-hover:border-indigo-400/20 transition-colors"></div>
             </div>
          </button>
        </div>

        {/* Lifetime Stats Footer */}
        <div className="text-center text-xs text-slate-500 font-mono">
           Lifetime Harvest: {formatNumber(gameState.lifetimeStardust)}
        </div>
      </div>

      {/* RIGHT SECTION: Upgrades */}
      <div className="relative z-10 w-full md:w-7/12 lg:w-2/3 h-[45%] md:h-full bg-slate-950/50 backdrop-blur-sm border-t md:border-t-0 md:border-l border-indigo-500/20 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        
        {/* Mobile Tab Switcher could go here, but split view is better for idle games */}
        <div className="flex-1 min-h-0">
           <UpgradeList 
             title="Tools (Click)" 
             upgrades={CLICK_UPGRADES} 
             purchased={gameState.upgrades} 
             currency={gameState.stardust}
             onBuy={buyUpgrade}
           />
        </div>
        
        <div className="flex-1 min-h-0">
           <UpgradeList 
             title="Automation (Idle)" 
             upgrades={AUTO_UPGRADES} 
             purchased={gameState.upgrades} 
             currency={gameState.stardust}
             onBuy={buyUpgrade}
           />
        </div>

      </div>

      {/* Utility Buttons */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
         <button onClick={resetGame} className="p-2 bg-slate-800/80 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors" title="Reset Game">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
         </button>
      </div>

    </div>
  );
};

export default App;