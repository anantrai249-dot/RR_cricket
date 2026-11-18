import React, { useState, useMemo } from 'react';
import { Player } from '../types';
import { Search, Filter, SlidersHorizontal, ChevronRight, TrendingUp, BarChart3, Shield, Flame, Activity, Sparkles, Crown } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface PlayerExplorerProps {
  players: Player[];
  selectedPlayer: Player | null;
  onSelectPlayer: (player: Player) => void;
  onAddToCompare: (player: Player) => void;
}

export const PlayerExplorer: React.FC<PlayerExplorerProps> = ({
  players,
  selectedPlayer,
  onSelectPlayer,
  onAddToCompare,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [minBalls, setMinBalls] = useState(60);
  const [sortField, setSortField] = useState<'index' | 'p_balls' | 'sr' | 'econ'>('index');

  const teams = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => {
      if (p.team && p.team !== 'Unmapped') set.add(p.team);
    });
    return ['All', ...Array.from(set).sort()];
  }, [players]);

  const roles = ['All', 'Finisher', 'Opener / PP striker', 'Batter', 'Bowler', 'All-rounder'];

  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All' || p.role === roleFilter;
        const matchesTeam = teamFilter === 'All' || p.team === teamFilter;
        const matchesEligible = !eligibleOnly || p.auction_eligible;
        const totalBalls = Math.max(p.batting.p_balls, p.bowling.p_balls);
        const matchesBalls = totalBalls >= minBalls;
        return matchesSearch && matchesRole && matchesTeam && matchesEligible && matchesBalls;
      })
      .sort((a, b) => {
        if (sortField === 'index') return b.index - a.index;
        if (sortField === 'p_balls') {
          const aBalls = Math.max(a.batting.p_balls, a.bowling.p_balls);
          const bBalls = Math.max(b.batting.p_balls, b.bowling.p_balls);
          return bBalls - aBalls;
        }
        if (sortField === 'sr') return b.batting.p_sr - a.batting.p_sr;
        if (sortField === 'econ') return a.bowling.p_econ - b.bowling.p_econ;
        return 0;
      });
  }, [players, searchQuery, roleFilter, teamFilter, eligibleOnly, minBalls, sortField]);

  const activePlayer = selectedPlayer || filteredPlayers[0] || players[0];

  const radarAxes = ['Strike Rate', 'Average', 'Boundary %', 'Bowling Control', 'Consistency'];
  const radarData = activePlayer
    ? radarAxes.map((axis, i) => ({
        subject: axis,
        pressure: activePlayer.radar?.pressure?.[i] ?? 50,
        normal: activePlayer.radar?.normal?.[i] ?? 40,
      }))
    : [];

  const trendData = activePlayer?.trend || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Player Explorer Suite</span>
          <Sparkles size={22} className="text-amber-400" />
        </h2>
        <p className="text-xs sm:text-sm text-sky-200/80 mt-1 font-medium">
          Deep-dive analysis across all 420+ qualifying players with radar models, over heatmaps, and multi-season trends.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-sky-300" size={16} />
            <input
              type="text"
              placeholder="Search player name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="bg-royals-dark text-white">
                  Role: {r}
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input"
            >
              {teams.map((t) => (
                <option key={t} value={t} className="bg-royals-dark text-white">
                  Team: {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium"
            >
              <option value="index" className="bg-royals-dark text-white">Sort: PRI Score (Highest)</option>
              <option value="p_balls" className="bg-royals-dark text-white">Sort: Pressure Deliveries</option>
              <option value="sr" className="bg-royals-dark text-white">Sort: Batting SR</option>
              <option value="econ" className="bg-royals-dark text-white">Sort: Bowling Econ</option>
            </select>
          </div>

          {/* Eligible Only Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <input
              type="checkbox"
              id="eligibleToggle"
              checked={eligibleOnly}
              onChange={(e) => setEligibleOnly(e.target.checked)}
              className="accent-royals-pink rounded cursor-pointer"
            />
            <label htmlFor="eligibleToggle" className="text-xs text-amber-200 font-semibold cursor-pointer select-none truncate">
              Auction Eligible Only
            </label>
          </div>
        </div>

        {/* Sliders & Active Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-sky-200/80">
          <div className="flex items-center gap-3">
            <span>Min. Deliveries: <strong className="text-amber-300 font-bold">{minBalls}b</strong></span>
            <input
              type="range"
              min={40}
              max={300}
              step={10}
              value={minBalls}
              onChange={(e) => setMinBalls(Number(e.target.value))}
              className="w-28 sm:w-36 accent-royals-pink cursor-pointer"
            />
          </div>

          <div>
            Found <span className="text-gradient-pink-electric font-black text-sm">{filteredPlayers.length}</span> players matching filters
          </div>
        </div>
      </div>

      {/* Main Explorer Workspace: Left Table, Right Profile Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Scrollable Roster Table (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-4 space-y-3 max-h-[850px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white">Filtered Roster</h3>
            <span className="text-[11px] text-sky-300 font-medium">Click row to inspect</span>
          </div>

          <div className="overflow-y-auto divide-y divide-white/5 pr-1 flex-1">
            {filteredPlayers.slice(0, 100).map((player) => {
              const isSelected = activePlayer?.player_id === player.player_id;
              const isBatter = player.role.includes('Batter') || player.role.includes('Finisher') || player.role.includes('Opener');

              return (
                <div
                  key={player.player_id}
                  onClick={() => onSelectPlayer(player)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-royals-blue/50 via-royals-purple/40 to-royals-pink/40 border border-royals-pink/60 shadow-pink-glow'
                      : 'hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white truncate">
                        {player.name}
                      </span>
                      {player.is_rr && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-royals-pink/30 text-royals-pink font-extrabold border border-royals-pink/50">
                          RR
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-sky-200/70 mt-0.5 font-medium">
                      <span className="truncate">{player.team}</span>
                      <span>•</span>
                      <span className="text-amber-200/90">{player.role}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="font-black text-sm text-gradient-gold-royal">
                        {player.index.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-sky-300 font-semibold">
                        {isBatter ? `${player.batting.p_sr} SR` : `${player.bowling.p_econ} Econ`}
                      </div>
                    </div>
                    <ChevronRight size={14} className={isSelected ? 'text-amber-300' : 'text-white/20'} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Deep-Dive Visual Analytics Suite (7 cols) */}
        {activePlayer && (
          <div className="lg:col-span-7 space-y-6">
            {/* Player Spotlight Header Card */}
            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-royals-pink/20 text-royals-pink font-bold border border-royals-pink/40 shadow-sm">
                      {activePlayer.role}
                    </span>
                    <span className="text-xs text-sky-200/80 font-medium">
                      {activePlayer.team}
                    </span>
                    {activePlayer.is_rr && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-500/25 text-blue-300 font-bold border border-blue-400/40">
                        Current RR Player
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {activePlayer.name}
                  </h3>
                  <div className="text-xs text-sky-200/90 mt-1 flex items-center gap-3">
                    <span>Valuation: <strong className="text-gradient-gold-royal font-black">{activePlayer.price_estimate}</strong></span>
                    <span>•</span>
                    <span className="text-royals-pink font-extrabold">{activePlayer.value_tag}</span>
                  </div>
                </div>

                {/* Score & Compare Button */}
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="text-right">
                    <div className="text-xs uppercase text-sky-300 font-bold">Reliability Index</div>
                    <div className="text-3xl font-black text-gradient-gold-royal">
                      {activePlayer.index.toFixed(1)}
                      <span className="text-xs text-amber-300 font-bold"> / 100</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onAddToCompare(activePlayer)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-royals-pink/25 hover:text-royals-pink border border-white/20 transition-all text-white"
                  >
                    + Compare
                  </button>
                </div>
              </div>

              {/* Tactical Note */}
              <div className="mt-4 p-3.5 rounded-xl bg-black/35 border border-white/10 text-xs leading-relaxed">
                <span className="font-extrabold text-amber-300">Royals War Room Insight: </span>
                <span className="text-sky-100">{activePlayer.rr_note}</span>
              </div>
            </div>

            {/* Radar Chart: Pressure vs Normal Performance */}
            <div className="glass-panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Pressure vs. Baseline Radar Signature
                  </h4>
                  <p className="text-[11px] text-sky-200/70 font-medium">
                    Multi-axial comparison of high-pressure clutch metrics against regulation play
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-royals-pink shadow-pink-glow" />
                    <span className="text-white font-bold">Pressure</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-sky-400" />
                    <span className="text-sky-300 font-bold">Normal</span>
                  </div>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#7DD3FC', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.2)" />
                    <Radar
                      name="Pressure Situation"
                      dataKey="pressure"
                      stroke="#FF2E93"
                      fill="#FF2E93"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="Normal Situation"
                      dataKey="normal"
                      stroke="#38BDF8"
                      fill="#38BDF8"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Over-by-Over Heatmap */}
            <div className="glass-panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Over-by-Over Phase Breakdown (Overs 1–20)
                  </h4>
                  <p className="text-[11px] text-sky-200/70 font-medium">
                    Delivery intensity and output across match progression
                  </p>
                </div>
                <div className="text-[10px] text-amber-300 font-bold">
                  Pink glow = overs with pressure sample
                </div>
              </div>

              <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 pt-2">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((overNum) => {
                  const overItems = activePlayer.heatmap?.filter((h) => h.over === overNum) || [];
                  const pItem = overItems.find((h) => h.situation === 'pressure');
                  const nItem = overItems.find((h) => h.situation === 'normal');
                  const hasPressure = !!pItem;
                  const val = pItem ? pItem.value : nItem ? nItem.value : null;

                  return (
                    <div
                      key={overNum}
                      className={`p-2 rounded-lg text-center flex flex-col justify-between transition-all group relative cursor-default ${
                        hasPressure
                          ? 'bg-gradient-to-t from-royals-magenta/60 to-royals-pink/50 border border-royals-pink/60 shadow-pink-glow'
                          : val !== null
                          ? 'bg-sky-500/20 border border-sky-400/30 text-sky-200'
                          : 'bg-white/5 border border-white/5 text-white/20'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-white/80">O{overNum}</span>
                      <span className="text-[10px] font-black mt-1 text-white">
                        {val !== null ? Math.round(val) : '—'}
                      </span>

                      {/* Tooltip on hover */}
                      {val !== null && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 p-2.5 rounded-xl bg-royals-dark border border-amber-400/40 text-left text-[10px] whitespace-nowrap shadow-2xl">
                          <div className="font-extrabold text-amber-300">Over {overNum} {hasPressure ? '(Pressure)' : '(Normal)'}</div>
                          <div className="text-white">{pItem ? `${pItem.balls} balls • ${pItem.runs ?? 0} runs` : `${nItem?.balls} balls`}</div>
                          <div className="text-sky-300 font-bold">Value: {val} {pItem?.metric === 'sr' ? 'SR' : 'Econ'}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Season Trend Line Chart */}
            {trendData.length > 0 && (
              <div className="glass-panel p-5 space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Multi-Season Clutch Trend (2022–2026)
                  </h4>
                  <p className="text-[11px] text-sky-200/70 font-medium">
                    Evolution of pressure performance across consecutive seasons
                  </p>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                      <XAxis dataKey="season" stroke="#7DD3FC" fontSize={11} fontWeight={600} />
                      <YAxis stroke="#7DD3FC" fontSize={11} fontWeight={600} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#060D2E',
                          borderColor: '#FF2E93',
                          borderRadius: '12px',
                          fontSize: '11px',
                          boxShadow: '0 0 15px rgba(255, 46, 147, 0.4)',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={activePlayer.role === 'Bowler' ? 'Pressure Econ' : 'Pressure SR'}
                        stroke="#FF2E93"
                        strokeWidth={3}
                        dot={{ fill: '#F59E0B', r: 5 }}
                        activeDot={{ r: 8, stroke: '#FF2E93', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
