import React, { useState } from 'react';
import { Player, MetaData, WeightConfig } from '../types';
import { Shield, Flame, Activity, Award, ArrowUpRight, TrendingUp, Sliders, ChevronRight, Crown, Sparkles } from 'lucide-react';

interface HeroOverviewProps {
  meta: MetaData;
  top10Auction: Player[];
  top10Batters: Player[];
  top10Bowlers: Player[];
  weights: WeightConfig;
  onSetPreset: (presetKey: string) => void;
  onSelectPlayer: (player: Player) => void;
  onAddToCompare: (player: Player) => void;
  setActiveTab: (tab: string) => void;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({
  meta,
  top10Auction,
  top10Batters,
  top10Bowlers,
  weights,
  onSetPreset,
  onSelectPlayer,
  onAddToCompare,
  setActiveTab,
}) => {
  const [activeLeaderboard, setActiveLeaderboard] = useState<'auction' | 'bat' | 'bowl'>('auction');

  const currentList =
    activeLeaderboard === 'auction'
      ? top10Auction
      : activeLeaderboard === 'bat'
      ? top10Batters
      : top10Bowlers;

  const topPlayer = currentList[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/15 bg-gradient-to-br from-royals-navy/95 via-royals-purple/75 to-royals-dark/95 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-royals-pink/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-royals-blue/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-2/3 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-400/15 text-amber-300 border border-amber-400/35 shadow-sm">
            <Crown size={14} className="text-amber-400 animate-pulse" />
            <span>Rajasthan Royals Analytical Intelligence • SupeRR Selector S2</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            <span className="text-gradient-blue-royal">Identify the Most</span> <br />
            <span className="text-gradient-pink-electric">Reliable Players Under Pressure</span>
          </h1>

          <p className="text-sm sm:text-base text-royals-muted leading-relaxed max-w-2xl">
            A state-of-the-art <strong className="text-sky-300 font-semibold">Bayesian Reliability Engine</strong> evaluating 860+ IPL and T20I matches (2022–2026).
            Pinpoint <span className="text-amber-300 font-bold">clutch match-winners</span> who excel when <span className="text-royals-pink font-semibold">required run rates spike</span>, powerplays collapse, and tournament stakes peak.
          </p>

          {/* Quick Preset Selector */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-amber-300 font-bold flex items-center gap-1.5 mr-1">
              <Sliders size={13} className="text-amber-400" />
              Weight Profile:
            </span>
            {[
              { id: 'balanced', label: 'Balanced (40/25/20/15)', color: 'hover:border-royals-pink/60 hover:text-royals-pink' },
              { id: 'clutch', label: 'Clutch Uplift (30/40/15/15)', color: 'hover:border-sky-400/60 hover:text-sky-300' },
              { id: 'consistency', label: 'Consistency Focus (30/20/35/15)', color: 'hover:border-emerald-400/60 hover:text-emerald-300' },
              { id: 'sample', label: 'Sample Volume (30/20/15/35)', color: 'hover:border-amber-400/60 hover:text-amber-300' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onSetPreset(p.id)}
                className={`px-3 py-1 rounded-xl glass-pill text-white/90 font-medium transition-all text-[11px] ${p.color}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 - Electric Blue */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-sky-400/50">
          <div className="flex items-center justify-between text-sky-300 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Players Screened</span>
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
              <Activity size={18} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-gradient-blue-royal tracking-tight">
            {meta.players_analysed}
          </div>
          <p className="text-xs text-sky-200/70 mt-1 font-medium">
            Min. 60 balls under pressure
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600" />
        </div>

        {/* KPI 2 - Radiant Gold */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-amber-400/50">
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Matches Analysed</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <Shield size={18} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-gradient-gold-royal tracking-tight">
            {meta.matches}
          </div>
          <p className="text-xs text-amber-200/70 mt-1 font-medium">
            IPL (2022–26) + Major T20Is
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500" />
        </div>

        {/* KPI 3 - Electric Pink */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-royals-pink/50">
          <div className="flex items-center justify-between text-pink-300 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Pressure Balls</span>
            <div className="p-2 rounded-xl bg-royals-pink/20 text-royals-pink group-hover:scale-110 transition-transform">
              <Flame size={18} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-gradient-pink-electric tracking-tight">
            {meta.pressure_deliveries.toLocaleString()}
          </div>
          <p className="text-xs text-pink-200/70 mt-1 font-medium">
            38.4% of total legal deliveries
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-royals-pink via-royals-magenta to-royals-purple" />
        </div>

        {/* KPI 4 - Radiant Gold Winner */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-amber-400/60">
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Top Clutch Pick</span>
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 group-hover:scale-110 transition-transform shadow-sm">
              <Crown size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gradient-gold-royal tracking-tight truncate">
            {topPlayer ? topPlayer.name : '—'}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-royals-pink/25 text-royals-pink font-extrabold border border-royals-pink/40">
              {topPlayer ? `${topPlayer.index.toFixed(1)} PRI` : ''}
            </span>
            <span className="text-xs text-sky-300 font-semibold truncate">
              {topPlayer ? topPlayer.role : ''}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-royals-pink to-sky-400" />
        </div>
      </div>

      {/* Ranked Leaderboard Section */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-gradient-gold-pink tracking-tight flex items-center gap-2">
                <span>Pressure Reliability Index (PRI) Leaderboard</span>
                <Sparkles size={16} className="text-amber-400" />
              </h2>
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-amber-400/20 text-gold-bright font-black border border-amber-400/40 glow-gold">
                Top 10
              </span>
            </div>
            <p className="text-xs text-blue-bright/90 mt-1 font-semibold">
              Dynamically re-ranked based on current Bayesian weight distribution
            </p>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md self-start sm:self-auto">
            <button
              onClick={() => setActiveLeaderboard('auction')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeLeaderboard === 'auction'
                  ? 'bg-gradient-to-r from-royals-blue via-royals-magenta to-royals-pink text-white shadow-pink-glow'
                  : 'text-royals-muted hover:text-white'
              }`}
            >
              RR Auction Targets
            </button>
            <button
              onClick={() => setActiveLeaderboard('bat')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeLeaderboard === 'bat'
                  ? 'bg-gradient-to-r from-royals-blue via-royals-magenta to-royals-pink text-white shadow-pink-glow'
                  : 'text-royals-muted hover:text-white'
              }`}
            >
              Unstop Top Batters
            </button>
            <button
              onClick={() => setActiveLeaderboard('bowl')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeLeaderboard === 'bowl'
                  ? 'bg-gradient-to-r from-royals-blue via-royals-magenta to-royals-pink text-white shadow-pink-glow'
                  : 'text-royals-muted hover:text-white'
              }`}
            >
              Unstop Top Bowlers
            </button>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-sky-300 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-4">Player & Team</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3 text-center">Pressure PRI</th>
                <th className="py-3 px-3">Pressure Stats</th>
                <th className="py-3 px-3">Clutch Delta</th>
                <th className="py-3 px-3">Auction Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentList.slice(0, 10).map((player, idx) => {
                const rank = idx + 1;
                const isBatter = player.role.includes('Batter') || player.role.includes('Finisher') || player.role.includes('Opener');
                const isBowler = player.role === 'Bowler';
                const srDelta = (player.batting.p_sr - player.batting.n_sr).toFixed(1);
                const econDelta = (player.bowling.n_econ - player.bowling.p_econ).toFixed(2);

                return (
                  <tr
                    key={player.player_id}
                    className="hover:bg-white/[0.05] transition-colors group cursor-pointer"
                    onClick={() => onSelectPlayer(player)}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        rank === 1
                          ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-royals-dark shadow-md ring-2 ring-yellow-400/50'
                          : rank === 2
                          ? 'bg-gradient-to-tr from-sky-400 to-blue-300 text-royals-dark ring-1 ring-sky-300'
                          : rank === 3
                          ? 'bg-gradient-to-tr from-amber-700 via-amber-600 to-yellow-600 text-white'
                          : 'bg-white/10 text-royals-muted'
                      }`}>
                        #{rank}
                      </div>
                    </td>

                    {/* Name & Team */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className={`font-black transition-colors flex items-center gap-1.5 ${
                          rank === 1
                            ? 'text-gold-bright text-sm glow-gold'
                            : rank === 2
                            ? 'text-blue-bright text-sm'
                            : rank === 3
                            ? 'text-pink-light text-sm'
                            : 'text-white group-hover:text-pink-vivid'
                        }`}>
                          <span>{player.name}</span>
                          {player.is_rr && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-royals-pink/30 text-pink-vivid font-black border border-royals-pink/50">
                              RR
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-blue-bright/80 font-medium">{player.team}</div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-3">
                      <span className="text-xs px-2.5 py-1 rounded-full glass-pill text-gold-bright font-bold border-amber-400/30 bg-amber-400/10">
                        {player.role}
                      </span>
                    </td>

                    {/* PRI Ring / Score */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center justify-center gap-1 font-black text-base text-white">
                        <span className="text-gradient-pink-electric font-black text-xl">
                          {player.index.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-amber-300 font-bold">/100</span>
                      </div>
                    </td>

                    {/* Pressure Stats */}
                    <td className="py-3.5 px-3">
                      <div className="text-xs space-y-0.5">
                        {isBatter && (
                          <>
                            <div className="font-bold text-white">
                              SR <span className="text-royals-pink font-extrabold">{player.batting.p_sr}</span> ({player.batting.p_balls}b)
                            </div>
                            <div className="text-sky-200/80">Avg <span className="text-amber-300 font-bold">{player.batting.p_avg}</span> • {player.batting.p_boundary_pct}% Bnd</div>
                          </>
                        )}
                        {isBowler && (
                          <>
                            <div className="font-bold text-white">
                              Econ <span className="text-sky-400 font-extrabold">{player.bowling.p_econ}</span> ({player.bowling.p_balls}b)
                            </div>
                            <div className="text-sky-200/80"><span className="text-amber-300 font-bold">{player.bowling.p_wkts}</span> Wkts • {player.bowling.p_dot_pct}% Dots</div>
                          </>
                        )}
                        {player.role === 'All-rounder' && (
                          <>
                            <div className="font-bold text-white">
                              SR <span className="text-royals-pink font-extrabold">{player.batting.p_sr}</span> • Econ <span className="text-sky-400 font-extrabold">{player.bowling.p_econ}</span>
                            </div>
                            <div className="text-sky-200/80">{player.batting.p_balls}b faced • <span className="text-amber-300 font-bold">{player.bowling.p_wkts}</span> wkts</div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Clutch Delta */}
                    <td className="py-3.5 px-3">
                      <div className="text-xs">
                        {isBatter ? (
                          <span className={`inline-flex items-center gap-0.5 font-bold ${
                            Number(srDelta) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            <TrendingUp size={12} />
                            {Number(srDelta) >= 0 ? `+${srDelta}` : srDelta} SR
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-0.5 font-bold ${
                            Number(econDelta) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            <TrendingUp size={12} />
                            {Number(econDelta) >= 0 ? `-${econDelta}` : `+${Math.abs(Number(econDelta))}`} Econ
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Value Tag */}
                    <td className="py-3.5 px-3">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                        player.value_tag.includes('Must-buy') || player.value_tag.includes('Marquee')
                          ? 'bg-royals-pink/20 text-royals-pink border border-royals-pink/40 shadow-sm'
                          : player.value_tag.includes('Retain')
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                      }`}>
                        {player.value_tag}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onAddToCompare(player)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/5 hover:bg-royals-blue/30 text-sky-300 hover:text-white transition-colors border border-white/10"
                          title="Add to Head-to-Head Compare"
                        >
                          Compare
                        </button>
                        <button
                          onClick={() => onSelectPlayer(player)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-royals-pink/25 text-amber-300 hover:text-royals-pink transition-colors border border-white/10"
                          title="Deep Dive Player Profile"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs text-sky-200/80">
          <span>Displaying Top 10 Ranked Match-Winners</span>
          <button
            onClick={() => setActiveTab('explorer')}
            className="flex items-center gap-1 font-bold text-gradient-pink-electric hover:underline"
          >
            <span>Explore All {meta.players_analysed} Players in Explorer Suite</span>
            <ArrowUpRight size={14} className="text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
