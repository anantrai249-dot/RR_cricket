import React from 'react';
import { WeightConfig, Player } from '../types';
import { X, Sliders, RotateCcw, Sparkles, Crown } from 'lucide-react';

interface WeightSlidersModalProps {
  isOpen: boolean;
  weights: WeightConfig;
  onChangeWeight: (key: keyof WeightConfig, val: number) => void;
  onSetPreset: (presetKey: string) => void;
  onReset: () => void;
  onClose: () => void;
  topPlayerName: string;
}

export const WeightSlidersModal: React.FC<WeightSlidersModalProps> = ({
  isOpen,
  weights,
  onChangeWeight,
  onSetPreset,
  onReset,
  onClose,
  topPlayerName,
}) => {
  if (!isOpen) return null;

  const total = weights.pressure + weights.clutch + weights.consistency + weights.sample;
  const pPct = Math.round((weights.pressure / total) * 100);
  const cPct = Math.round((weights.clutch / total) * 100);
  const csPct = Math.round((weights.consistency / total) * 100);
  const sPct = Math.round((weights.sample / total) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel p-6 sm:p-8 max-w-lg w-full relative overflow-hidden space-y-6 border border-amber-400/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-amber-400" />
            <h3 className="font-black text-lg text-white">Adjust Model Weights</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-royals-muted hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Top Player Tracker */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-royals-navy/90 via-royals-purple/90 to-royals-dark/95 border border-amber-400/40 flex items-center justify-between shadow-amber-500/10 shadow-lg">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-amber-400 animate-pulse" />
            <span className="text-xs text-sky-200 font-bold">Current #1 Ranked Titan:</span>
          </div>
          <span className="font-black text-sm text-gradient-gold-royal truncate max-w-[180px]">
            {topPlayerName}
          </span>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {/* Pressure Perf - Electric Pink */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-pink-300">1. Pressure Execution</span>
              <span className="font-mono text-gradient-pink-electric font-black text-sm">{pPct}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={70}
              step={5}
              value={Math.round(weights.pressure * 100)}
              onChange={(e) => onChangeWeight('pressure', Number(e.target.value) / 100)}
              className="w-full accent-royals-pink cursor-pointer"
            />
            <p className="text-[10px] text-sky-200/70 font-medium">
              Shrunk strike rate, average, boundary % and economy in pressure balls
            </p>
          </div>

          {/* Clutch Uplift - Electric Sky Blue */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-sky-300">2. Clutch Uplift (&Delta; vs Normal)</span>
              <span className="font-mono text-sky-400 font-black text-sm">{cPct}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={Math.round(weights.clutch * 100)}
              onChange={(e) => onChangeWeight('clutch', Number(e.target.value) / 100)}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <p className="text-[10px] text-sky-200/70 font-medium">
              Performance differential under pressure compared to ordinary overs
            </p>
          </div>

          {/* Consistency - Emerald */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-emerald-300">3. Innings Consistency</span>
              <span className="font-mono text-emerald-400 font-black text-sm">{csPct}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={Math.round(weights.consistency * 100)}
              onChange={(e) => onChangeWeight('consistency', Number(e.target.value) / 100)}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <p className="text-[10px] text-sky-200/70 font-medium">
              Proportion of matches meeting criteria without high variance
            </p>
          </div>

          {/* Sample Size - Radiant Gold */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-300">4. Sample Size Confidence</span>
              <span className="font-mono text-gradient-gold-royal font-black text-sm">{sPct}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={5}
              value={Math.round(weights.sample * 100)}
              onChange={(e) => onChangeWeight('sample', Number(e.target.value) / 100)}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <p className="text-[10px] text-sky-200/70 font-medium">
              Bayesian confidence penalty for players with limited match experience
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="text-xs font-bold text-amber-300">Select Strategy Preset:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onSetPreset('balanced')}
              className="p-2.5 rounded-xl glass-pill text-white hover:border-royals-pink/60 hover:bg-white/10 transition-all font-semibold text-left"
            >
              Balanced (40/25/20/15)
            </button>
            <button
              onClick={() => onSetPreset('clutch')}
              className="p-2.5 rounded-xl glass-pill text-white hover:border-sky-400/60 hover:bg-white/10 transition-all font-semibold text-left"
            >
              Clutch Heavy (30/40/15/15)
            </button>
            <button
              onClick={() => onSetPreset('consistency')}
              className="p-2.5 rounded-xl glass-pill text-white hover:border-emerald-400/60 hover:bg-white/10 transition-all font-semibold text-left"
            >
              Consistency Focus (30/20/35/15)
            </button>
            <button
              onClick={() => onSetPreset('sample')}
              className="p-2.5 rounded-xl glass-pill text-white hover:border-amber-400/60 hover:bg-white/10 transition-all font-semibold text-left"
            >
              Volume Heavy (30/20/15/35)
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-amber-300/80 hover:text-amber-300 font-bold transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-royals-pink via-royals-magenta to-amber-500 text-white shadow-pink-glow hover:opacity-95"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
