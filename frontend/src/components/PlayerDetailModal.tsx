import React from 'react';
import { Player } from '../types';
import { X, Award, TrendingUp, Shield, BarChart3, Plus, Check, Flame, Crown, Sparkles } from 'lucide-react';
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
} from 'recharts';

interface PlayerDetailModalProps {
  player: Player | null;
  onClose: () => void;
  onAddToCompare: (player: Player) => void;
  isInCompare: boolean;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  onClose,
  onAddToCompare,
  isInCompare,
}) => {
  if (!player) return null;

  const isBatter = player.role.includes('Batter') || player.role.includes('Finisher') || player.role.includes('Opener');
  const isBowler = player.role === 'Bowler';
  const srDelta = (player.batting.p_sr - player.batting.n_sr).toFixed(1);
  const econDelta = (player.bowling.n_econ - player.bowling.p_econ).toFixed(2);

  const radarAxes = ['Strike Rate', 'Average', 'Boundary %', 'Bowling Control', 'Consistency'];
  const radarData = radarAxes.map((axis, i) => ({
    subject: axis,
    pressure: player.radar?.pressure?.[i] ?? 50,
    normal: player.radar?.normal?.[i] ?? 40,
  }));

  const trendData = player.trend || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="glass-panel p-6 sm:p-8 max-w-4xl w-full my-auto relative overflow-hidden border border-white/20 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-royals-pink/20 text-royals-pink font-bold border border-royals-pink/35 shadow-sm">
                {player.role}
              </span>
              <span className="text-xs text-sky-200/80 font-medium">{player.team}</span>
              {player.is_rr && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/25 text-blue-300 font-bold border border-blue-400/40">
                  Rajasthan Royals Core
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {player.name}
            </h2>

            <div className="flex items-center gap-3 text-xs text-sky-200/90 mt-1 font-medium">
              <span>Valuation: <strong className="text-gradient-gold-royal font-black">{player.price_estimate}</strong></span>
              <span>•</span>
              <span className="text-royals-pink font-extrabold">{player.value_tag}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onAddToCompare(player)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                isInCompare
                  ? 'bg-gradient-to-r from-royals-pink to-royals-magenta text-white border-royals-pink shadow-pink-glow'
                  : 'glass-pill text-sky-300 hover:text-white hover:border-sky-400/50'
              }`}
            >
              {isInCompare ? <Check size={14} className="text-amber-300" /> : <Plus size={14} />}
              <span>{isInCompare ? 'In Compare' : 'Add to Compare'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-royals-muted hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Top Summary Banner: Score & Component Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-black/35 border border-white/10">
          <div className="sm:col-span-2 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-royals-blue via-amber-400 to-royals-pink p-0.5 shadow-pink-glow flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-royals-dark rounded-[14px] flex flex-col items-center justify-center">
                <span className="text-xl font-black text-gradient-gold-royal leading-none">
                  {player.index.toFixed(1)}
                </span>
                <span className="text-[8px] font-extrabold text-royals-pink uppercase mt-0.5">
                  PRI
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase text-sky-300 font-bold">Reliability Index</div>
              <div className="text-xs text-white mt-0.5 font-bold">
                Overall Rank #{player.rank_all ?? '—'}
              </div>
              <div className="text-[11px] text-amber-300 font-extrabold">
                {player.value_tag}
              </div>
            </div>
          </div>

          <div className="sm:col-span-3 grid grid-cols-4 gap-2 text-center text-xs border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-3">
            <div>
              <div className="text-[9px] text-sky-300 uppercase font-bold">Pressure Perf</div>
              <div className="font-black text-sm text-gradient-pink-electric mt-0.5">
                {Math.round(player.components.pressure * 100)}%
              </div>
            </div>
            <div>
              <div className="text-[9px] text-sky-300 uppercase font-bold">Clutch Uplift</div>
              <div className="font-black text-sm text-sky-400 mt-0.5">
                {Math.round(player.components.clutch * 100)}%
              </div>
            </div>
            <div>
              <div className="text-[9px] text-sky-300 uppercase font-bold">Consistency</div>
              <div className="font-black text-sm text-emerald-400 mt-0.5">
                {Math.round(player.components.consistency * 100)}%
              </div>
            </div>
            <div>
              <div className="text-[9px] text-sky-300 uppercase font-bold">Sample Conf</div>
              <div className="font-black text-sm text-gradient-gold-royal mt-0.5">
                {Math.round(player.components.sample * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Scout Report Note */}
        <div className="p-4 rounded-xl bg-royals-pink/15 border border-royals-pink/35 text-xs leading-relaxed">
          <span className="font-extrabold text-amber-300">Royals War Room Scout Note: </span>
          <span className="text-sky-100 font-medium">{player.rr_note}</span>
        </div>

        {/* Charts Row: Radar & Season Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Radar Chart */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Pressure vs Normal Radar</span>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-royals-pink font-extrabold">• Pressure</span>
                <span className="text-sky-400 font-extrabold">• Normal</span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#7DD3FC', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.15)" />
                  <Radar
                    name="Pressure"
                    dataKey="pressure"
                    stroke="#FF2E93"
                    fill="#FF2E93"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Normal"
                    dataKey="normal"
                    stroke="#38BDF8"
                    fill="#38BDF8"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Season Trend Line Chart */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Career Season Trajectory</span>
              <span className="text-[10px] text-amber-300 font-bold">2022–2026 Pressure Output</span>
            </div>

            <div className="h-56 w-full pt-2">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis dataKey="season" stroke="#7DD3FC" fontSize={10} fontWeight={600} />
                    <YAxis stroke="#7DD3FC" fontSize={10} fontWeight={600} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#060D2E',
                        borderColor: '#FF2E93',
                        borderRadius: '10px',
                        fontSize: '11px',
                        boxShadow: '0 0 15px rgba(255, 46, 147, 0.4)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={player.role === 'Bowler' ? 'Pressure Econ' : 'Pressure SR'}
                      stroke="#FF2E93"
                      strokeWidth={3}
                      dot={{ fill: '#F59E0B', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-sky-200/60">
                  No multi-season trend data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Over-by-Over Heatmap */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Over-by-Over Matrix (Overs 1–20)</span>
            <span className="text-[10px] text-amber-300 font-bold">Pink indicates pressure involvement</span>
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-20 gap-1 pt-1">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((overNum) => {
              const overItems = player.heatmap?.filter((h) => h.over === overNum) || [];
              const pItem = overItems.find((h) => h.situation === 'pressure');
              const nItem = overItems.find((h) => h.situation === 'normal');
              const hasPressure = !!pItem;
              const val = pItem ? pItem.value : nItem ? nItem.value : null;

              return (
                <div
                  key={overNum}
                  className={`p-1.5 rounded text-center flex flex-col justify-between ${
                    hasPressure
                      ? 'bg-royals-pink/50 border border-royals-pink/70 text-white shadow-pink-glow'
                      : val !== null
                      ? 'bg-sky-500/20 border border-sky-400/30 text-sky-300'
                      : 'bg-white/5 border border-white/5 text-white/20'
                  }`}
                >
                  <span className="text-[8px] font-bold">O{overNum}</span>
                  <span className="text-[9px] font-black mt-0.5">
                    {val !== null ? Math.round(val) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
