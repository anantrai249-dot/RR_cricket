import React, { useState } from 'react';
import { Player } from '../types';
import { X, UserCheck, TrendingUp, BarChart2, Shield, Flame, Award, Sparkles, Crown } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface CompareModalProps {
  allPlayers: Player[];
  compareList: Player[];
  onRemoveFromCompare: (playerId: number) => void;
  onAddPlayerToCompare: (player: Player) => void;
  onSelectPlayer: (player: Player) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  allPlayers,
  compareList,
  onRemoveFromCompare,
  onAddPlayerToCompare,
  onSelectPlayer,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | ''>('');

  const handleAddSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val !== '') {
      const p = allPlayers.find((x) => x.player_id === Number(val));
      if (p) {
        onAddPlayerToCompare(p);
      }
      setSelectedPlayerId('');
    }
  };

  const playersToCompare =
    compareList.length >= 2
      ? compareList.slice(0, 3)
      : compareList.length === 1
      ? [compareList[0], allPlayers.find((p) => p.player_id !== compareList[0].player_id) || allPlayers[1]]
      : allPlayers.slice(0, 2);

  // High contrast Tri-Color Theme: Vibrant Pink, Electric Sky Blue, Radiant Gold
  const colors = ['#FF2E93', '#38BDF8', '#F59E0B'];

  const radarAxes = ['Strike Rate', 'Average', 'Boundary %', 'Bowling Control', 'Consistency'];
  const radarData = radarAxes.map((axis, i) => {
    const row: any = { subject: axis };
    playersToCompare.forEach((p, idx) => {
      row[`player_${idx}`] = p.radar?.pressure?.[i] ?? 50;
    });
    return row;
  });

  const barData = [
    {
      metric: 'Pressure Strike Rate',
      ...playersToCompare.reduce((acc, p, idx) => ({ ...acc, [p.name]: p.batting.p_sr }), {}),
    },
    {
      metric: 'Pressure Average',
      ...playersToCompare.reduce((acc, p, idx) => ({ ...acc, [p.name]: p.batting.p_avg }), {}),
    },
    {
      metric: 'Boundary %',
      ...playersToCompare.reduce((acc, p, idx) => ({ ...acc, [p.name]: p.batting.p_boundary_pct }), {}),
    },
    {
      metric: 'Pressure Economy',
      ...playersToCompare.reduce((acc, p, idx) => ({ ...acc, [p.name]: p.bowling.p_econ }), {}),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-400/15 text-amber-300 border border-amber-400/35 mb-2 shadow-sm">
            <Crown size={13} className="text-amber-400" />
            <span>Head-to-Head Evaluation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Compare Pressure Titans</span>
            <Sparkles size={20} className="text-amber-400" />
          </h2>
          <p className="text-xs sm:text-sm text-sky-200/80 mt-1 font-medium">
            Side-by-side tactical breakdown for 2–3 players to resolve auction bidding dilemmas.
          </p>
        </div>

        {/* Add Player Dropdown */}
        {playersToCompare.length < 3 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedPlayerId}
              onChange={handleAddSelect}
              className="px-3 py-2 text-xs rounded-xl glass-input w-48 sm:w-64 font-medium"
            >
              <option value="" className="bg-royals-dark text-white">
                + Add player to compare...
              </option>
              {allPlayers
                .filter((p) => !playersToCompare.some((x) => x.player_id === p.player_id))
                .slice(0, 80)
                .map((p) => (
                  <option key={p.player_id} value={p.player_id} className="bg-royals-dark text-white">
                    {p.name} ({p.role}, {p.index.toFixed(1)} PRI)
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Selected Players Cards Row */}
      <div className={`grid grid-cols-1 sm:grid-cols-${playersToCompare.length} gap-4`}>
        {playersToCompare.map((player, idx) => {
          const color = colors[idx % colors.length];
          return (
            <div
              key={player.player_id}
              className="glass-panel p-5 relative overflow-hidden flex flex-col justify-between"
              style={{ borderColor: `${color}80`, boxShadow: `0 0 20px ${color}20` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-sky-200/80 font-medium">{player.team}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1 group-hover:text-royals-pink">
                    {player.name}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full glass-pill text-amber-200 font-semibold inline-block mt-1 border-amber-400/20">
                    {player.role}
                  </span>
                </div>

                {compareList.length > 2 && (
                  <button
                    onClick={() => onRemoveFromCompare(player.player_id)}
                    className="p-1 rounded-lg text-royals-muted hover:text-white hover:bg-white/10"
                    title="Remove from comparison"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-sky-300 uppercase font-bold">Reliability Index</div>
                  <div className="text-2xl font-black" style={{ color }}>
                    {player.index.toFixed(1)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-sky-300 uppercase font-bold">Auction Estimate</div>
                  <div className="text-xs font-black text-gradient-gold-royal">
                    {player.price_estimate}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Metrics Comparison Table */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <span>Direct Metric Comparison Matrix</span>
          <Sparkles size={16} className="text-amber-400" />
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-sky-300 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Metric Category</th>
                {playersToCompare.map((p, idx) => (
                  <th key={p.player_id} className="py-2.5 px-4 font-black" style={{ color: colors[idx] }}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              <tr>
                <td className="py-3 px-3 font-bold text-white">Pressure Reliability Index (PRI)</td>
                {playersToCompare.map((p, idx) => {
                  const isMax = p.index === Math.max(...playersToCompare.map((x) => x.index));
                  return (
                    <td key={p.player_id} className="py-3 px-4 font-black text-sm">
                      <span className={isMax ? 'text-gradient-gold-royal font-black text-base' : 'text-white'}>
                        {p.index.toFixed(1)}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Pressure Strike Rate</td>
                {playersToCompare.map((p) => {
                  const isMax = p.batting.p_sr === Math.max(...playersToCompare.map((x) => x.batting.p_sr));
                  return (
                    <td key={p.player_id} className="py-3 px-4 font-bold">
                      <span className={isMax ? 'text-gradient-pink-electric font-black text-sm' : 'text-white'}>
                        {p.batting.p_sr}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Clutch SR Delta vs Normal</td>
                {playersToCompare.map((p) => {
                  const delta = (p.batting.p_sr - p.batting.n_sr).toFixed(1);
                  return (
                    <td key={p.player_id} className="py-3 px-4 font-bold">
                      <span className={Number(delta) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {Number(delta) >= 0 ? `+${delta}` : delta} SR
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Pressure Batting Average</td>
                {playersToCompare.map((p) => (
                  <td key={p.player_id} className="py-3 px-4 font-bold text-gradient-gold-royal">
                    {p.batting.p_avg}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Boundary %</td>
                {playersToCompare.map((p) => (
                  <td key={p.player_id} className="py-3 px-4 font-bold text-white">
                    {p.batting.p_boundary_pct}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Pressure Bowling Economy</td>
                {playersToCompare.map((p) => {
                  const validEcons = playersToCompare.map((x) => x.bowling.p_econ).filter((e) => e > 0);
                  const isMin = p.bowling.p_econ > 0 && p.bowling.p_econ === Math.min(...validEcons);
                  return (
                    <td key={p.player_id} className="py-3 px-4 font-bold">
                      <span className={isMin ? 'text-sky-400 font-black text-sm' : 'text-white'}>
                        {p.bowling.p_econ > 0 ? p.bowling.p_econ : '—'}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Pressure Wickets</td>
                {playersToCompare.map((p) => (
                  <td key={p.player_id} className="py-3 px-4 font-bold text-amber-300">
                    {p.bowling.p_wkts > 0 ? p.bowling.p_wkts : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Total Pressure Deliveries</td>
                {playersToCompare.map((p) => (
                  <td key={p.player_id} className="py-3 px-4 font-semibold text-sky-200/80">
                    {Math.max(p.batting.p_balls, p.bowling.p_balls)} deliveries
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Consistency Metric</td>
                {playersToCompare.map((p) => (
                  <td key={p.player_id} className="py-3 px-4 font-bold text-emerald-400">
                    {Math.round(p.components.consistency * 100)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Charts: Multi Radar & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Player Radar Chart */}
        <div className="glass-panel p-5 space-y-3">
          <h3 className="font-bold text-sm text-white">Overlapping Radar Profile</h3>
          <p className="text-[11px] text-sky-200/70 font-medium">Multi-attribute comparative overlay</p>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#7DD3FC', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.15)" />
                {playersToCompare.map((p, idx) => (
                  <Radar
                    key={p.player_id}
                    name={p.name}
                    dataKey={`player_${idx}`}
                    stroke={colors[idx % colors.length]}
                    fill={colors[idx % colors.length]}
                    fillOpacity={0.25}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: '11px', color: '#fff', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Head-to-Head Bar Chart */}
        <div className="glass-panel p-5 space-y-3">
          <h3 className="font-bold text-sm text-white">Key Pressure Metrics Comparison</h3>
          <p className="text-[11px] text-sky-200/70 font-medium">Direct bar comparison across core indicators</p>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis dataKey="metric" stroke="#7DD3FC" fontSize={11} fontWeight={600} />
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
                <Legend wrapperStyle={{ fontSize: '11px', color: '#fff', paddingTop: '10px' }} />
                {playersToCompare.map((p, idx) => (
                  <Bar
                    key={p.player_id}
                    dataKey={p.name}
                    fill={colors[idx % colors.length]}
                    radius={[6, 6, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
