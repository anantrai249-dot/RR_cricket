import React, { useState } from 'react';
import { Player } from '../types';
import { Award, Zap, TrendingUp, Shield, BarChart2, Plus, Check, Crown, Sparkles } from 'lucide-react';

interface Top10PicksProps {
  top10Auction: Player[];
  top10Batters: Player[];
  top10Bowlers: Player[];
  compareList: Player[];
  onSelectPlayer: (player: Player) => void;
  onAddToCompare: (player: Player) => void;
}

export const Top10Picks: React.FC<Top10PicksProps> = ({
  top10Auction,
  top10Batters,
  top10Bowlers,
  compareList,
  onSelectPlayer,
  onAddToCompare,
}) => {
  const [activeBoard, setActiveBoard] = useState<'auction' | 'bat' | 'bowl'>('auction');

  const currentList =
    activeBoard === 'auction'
      ? top10Auction
      : activeBoard === 'bat'
      ? top10Batters
      : top10Bowlers;

  const isPlayerInCompare = (pid: number) => compareList.some((p) => p.player_id === pid);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-400/15 text-amber-300 border border-amber-400/35 mb-2 shadow-sm">
            <Crown size={13} className="text-amber-400" />
            <span>Auction War Room Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Top 10 Pressure Titans</span>
            <Sparkles size={20} className="text-amber-400" />
          </h2>
          <p className="text-xs sm:text-sm text-sky-200/80 mt-1 max-w-2xl font-medium">
            {activeBoard === 'auction'
              ? 'Tactically calibrated shortlist designed to fill Rajasthan Royals’ 4 primary roster deficits at the IPL 2027 Auction.'
              : activeBoard === 'bat'
              ? 'The 10 highest-ranked batters under high-pressure situations for the official Unstop Round 1 submission.'
              : 'The 10 highest-ranked bowlers under high-pressure situations for the official Unstop Round 1 submission.'}
          </p>
        </div>

        {/* Board Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md self-start md:self-auto">
          <button
            onClick={() => setActiveBoard('auction')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeBoard === 'auction'
                ? 'bg-gradient-to-r from-royals-blue via-royals-magenta to-royals-pink text-white shadow-pink-glow'
                : 'text-royals-muted hover:text-white'
            }`}
          >
            RR 2027 Auction Targets
          </button>
          <button
            onClick={() => setActiveBoard('bat')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeBoard === 'bat'
                ? 'bg-gradient-to-r from-royals-blue via-royals-magenta to-royals-pink text-white shadow-pink-glow'
                : 'text-royals-muted hover:text-white'
            }`}
          >
            Unstop Top Batters
          </button>
          <button
            onClick={() => setActiveBoard('bowl')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeBoard === 'bowl'
                ? 'bg-gradient-to-r from-royals-blue via-royals-magenta to-royals-pink text-white shadow-pink-glow'
                : 'text-royals-muted hover:text-white'
            }`}
          >
            Unstop Top Bowlers
          </button>
        </div>
      </div>

      {/* Cards Grid: 10 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {currentList.map((player, idx) => {
          const rank = idx + 1;
          const isBatter = player.role.includes('Batter') || player.role.includes('Finisher') || player.role.includes('Opener');
          const isBowler = player.role === 'Bowler';
          const inCompare = isPlayerInCompare(player.player_id);
          const srDelta = (player.batting.p_sr - player.batting.n_sr).toFixed(1);
          const econDelta = (player.bowling.n_econ - player.bowling.p_econ).toFixed(2);

          // SVG Circular Gauge calculation
          const radius = 34;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (player.index / 100) * circumference;

          return (
            <div
              key={player.player_id}
              className="glass-panel p-5 relative overflow-hidden group hover:border-royals-pink/50 transition-all flex flex-col justify-between"
            >
              {/* Top Banner Row */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-md ${
                    rank === 1
                      ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-royals-dark ring-2 ring-yellow-400/60 shadow-amber-500/20'
                      : rank === 2
                      ? 'bg-gradient-to-tr from-sky-400 to-blue-300 text-royals-dark ring-2 ring-sky-300/40'
                      : rank === 3
                      ? 'bg-gradient-to-tr from-amber-700 via-amber-600 to-yellow-600 text-white ring-1 ring-amber-500'
                      : 'bg-white/10 text-white border border-white/15'
                  }`}>
                    #{rank}
                  </div>

                  {/* Player Name & Team */}
                  <div>
                    <h3 className="font-extrabold text-lg text-white group-hover:text-royals-pink transition-colors">
                      {player.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-sky-200/80 mt-0.5 font-medium">
                      <span>{player.team}</span>
                      <span>•</span>
                      <span className="text-amber-300 font-semibold">{player.role}</span>
                    </div>
                  </div>
                </div>

                {/* Circular Reliability Ring Gauge with Tri-Color Gradient */}
                <div className="relative w-18 h-18 flex items-center justify-center flex-shrink-0">
                  <svg className="w-18 h-18 transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      stroke="url(#triColorGradient)"
                      strokeWidth="6"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="triColorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="50%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#FF2E93" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-black text-gradient-gold-royal leading-none">
                      {player.index.toFixed(1)}
                    </span>
                    <span className="text-[8px] font-extrabold text-royals-pink tracking-wider uppercase mt-0.5">
                      PRI
                    </span>
                  </div>
                </div>
              </div>

              {/* Pressure Stats Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/30 border border-white/5 text-xs mb-4">
                {isBatter && (
                  <>
                    <div>
                      <div className="text-[10px] text-sky-300 uppercase font-bold">Pressure SR</div>
                      <div className="text-base font-black text-gradient-pink-electric">{player.batting.p_sr}</div>
                      <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <TrendingUp size={10} />
                        {Number(srDelta) >= 0 ? `+${srDelta}` : srDelta} vs norm
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-sky-300 uppercase font-bold">Pressure Avg</div>
                      <div className="text-base font-black text-gradient-gold-royal">{player.batting.p_avg}</div>
                      <div className="text-[10px] text-sky-200/70">{player.batting.p_balls} balls faced</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-sky-300 uppercase font-bold">Boundary %</div>
                      <div className="text-base font-black text-white">{player.batting.p_boundary_pct}%</div>
                      <div className="text-[10px] text-sky-200/70">{player.batting.p_dot_pct}% dots</div>
                    </div>
                  </>
                )}

                {isBowler && (
                  <>
                    <div>
                      <div className="text-[10px] text-pink-300 uppercase font-bold">Pressure Econ</div>
                      <div className="text-base font-black text-sky-400">{player.bowling.p_econ}</div>
                      <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <TrendingUp size={10} />
                        {Number(econDelta) >= 0 ? `-${econDelta}` : `+${Math.abs(Number(econDelta))}`} vs norm
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-pink-300 uppercase font-bold">Pressure Wkts</div>
                      <div className="text-base font-black text-gradient-gold-royal">{player.bowling.p_wkts}</div>
                      <div className="text-[10px] text-sky-200/70">{player.bowling.p_balls} balls bowled</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-pink-300 uppercase font-bold">Dot Ball %</div>
                      <div className="text-base font-black text-white">{player.bowling.p_dot_pct}%</div>
                      <div className="text-[10px] text-sky-200/70">SR {player.bowling.p_sr}b</div>
                    </div>
                  </>
                )}

                {player.role === 'All-rounder' && (
                  <>
                    <div>
                      <div className="text-[10px] text-sky-300 uppercase font-bold">Pressure SR</div>
                      <div className="text-base font-black text-gradient-pink-electric">{player.batting.p_sr}</div>
                      <div className="text-[10px] text-sky-200/70">{player.batting.p_balls}b faced</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-sky-300 uppercase font-bold">Pressure Econ</div>
                      <div className="text-base font-black text-sky-400">{player.bowling.p_econ}</div>
                      <div className="text-[10px] text-amber-300 font-bold">{player.bowling.p_wkts} wickets</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-sky-300 uppercase font-bold">Consistency</div>
                      <div className="text-base font-black text-emerald-400">
                        {Math.round(player.components.consistency * 100)}%
                      </div>
                      <div className="text-[10px] text-sky-200/70">Spell stability</div>
                    </div>
                  </>
                )}
              </div>

              {/* Valuation & Scout Note */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-extrabold text-royals-pink bg-royals-pink/15 px-2.5 py-0.5 rounded-md border border-royals-pink/35 shadow-sm">
                    {player.value_tag}
                  </span>
                  <span className="text-xs font-black text-gradient-gold-royal">
                    Est. Value: {player.price_estimate}
                  </span>
                </div>

                <p className="text-xs text-sky-100/90 leading-relaxed line-clamp-2">
                  <span className="font-extrabold text-amber-300">How he strengthens RR: </span>
                  {player.rr_note}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectPlayer(player)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold glass-pill text-white hover:border-royals-pink/40 hover:bg-white/10 transition-all"
                >
                  <BarChart2 size={13} className="text-royals-pink" />
                  <span>Deep Dive (Radar & Heatmap)</span>
                </button>

                <button
                  onClick={() => onAddToCompare(player)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                    inCompare
                      ? 'bg-gradient-to-r from-royals-pink to-royals-magenta text-white border-royals-pink shadow-pink-glow'
                      : 'glass-pill text-sky-300 hover:text-white hover:border-sky-400/40'
                  }`}
                  title={inCompare ? 'Added to Compare' : 'Add to Compare'}
                >
                  {inCompare ? <Check size={14} className="text-amber-300" /> : <Plus size={14} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
