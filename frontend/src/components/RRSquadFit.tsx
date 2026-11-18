import React from 'react';
import { Player, SquadGap } from '../types';
import { Sparkles, Shield, Target, DollarSign, Award, ChevronRight, CheckCircle2, Crown } from 'lucide-react';

interface RRSquadFitProps {
  rrSquad: Player[];
  gaps: SquadGap[];
  allPlayers: Player[];
  onSelectPlayer: (player: Player) => void;
}

export const RRSquadFit: React.FC<RRSquadFitProps> = ({
  rrSquad,
  gaps,
  allPlayers,
  onSelectPlayer,
}) => {
  const simulatedXI = [
    { num: 1, name: 'Yashasvi Jaiswal', role: 'Opener (LH)', tag: 'Retained Core', stat: '168.4 PP SR', tagColor: 'bg-blue-500/20 text-sky-300 border-blue-400/40' },
    { num: 2, name: 'Ryan Rickelton', role: 'Wicketkeeper Opener', tag: 'Auction Target #1', stat: '186.5 Pressure SR', tagColor: 'bg-royals-blue/30 text-sky-200 border-royals-blue/50' },
    { num: 3, name: 'Sanju Samson / Anchor', role: 'Top Order', tag: 'Auction Target #2', stat: '175.1 Pressure SR', tagColor: 'bg-royals-blue/30 text-sky-200 border-royals-blue/50' },
    { num: 4, name: 'Riyan Parag', role: 'Middle Order', tag: 'Retained Core', stat: '162.0 Middle SR', tagColor: 'bg-blue-500/20 text-sky-300 border-blue-400/40' },
    { num: 5, name: 'Shashank Singh', role: 'Clutch Finisher', tag: 'Priority Must-Buy', stat: '187.2 Pressure SR (80.7 PRI)', tagColor: 'bg-gradient-to-r from-amber-500/30 to-royals-pink/30 text-amber-300 border-amber-400/50 shadow-sm' },
    { num: 6, name: 'Shimron Hetmyer', role: 'Death Finisher', tag: 'Retained Core', stat: '159.9 Pressure SR', tagColor: 'bg-blue-500/20 text-sky-300 border-blue-400/40' },
    { num: 7, name: 'Ravindra Jadeja', role: 'Spin All-Rounder', tag: 'Retained Core', stat: '7.4 Pressure Econ', tagColor: 'bg-blue-500/20 text-sky-300 border-blue-400/40' },
    { num: 8, name: 'Sam Curran / George Linde', role: 'Seam/Spin All-Rounder', tag: 'All-Rounder Gap', stat: '184.9 Death SR', tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' },
    { num: 9, name: 'Jofra Archer', role: 'Pace Enforcer', tag: 'Retained Core', stat: '145+ km/h Express', tagColor: 'bg-blue-500/20 text-sky-300 border-blue-400/40' },
    { num: 10, name: 'Sandeep Sharma', role: 'Death Yorker Specialist', tag: 'Retained Core', stat: '7.8 Death Econ', tagColor: 'bg-blue-500/20 text-sky-300 border-blue-400/40' },
    { num: 11, name: 'Allah Ghazanfar / Varun C.', role: 'Mystery Spin Enforcer', tag: 'Auction Target #3', stat: '6.18 Pressure Econ', tagColor: 'bg-royals-pink/25 text-royals-pink border-royals-pink/40' },
    { num: 12, name: 'Dhruv Jurel (Impact)', role: 'Impact Batter / Closer', tag: 'Retained Core', stat: '172.0 Death SR', tagColor: 'bg-amber-400/20 text-amber-300 border-amber-400/40' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-400/15 text-amber-300 border border-amber-400/35 mb-2 shadow-sm">
          <Crown size={13} className="text-amber-400" />
          <span>Franchise Roster Optimization</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Rajasthan Royals Squad Fit & Auction Strategy</span>
          <Sparkles size={20} className="text-amber-400" />
        </h2>
        <p className="text-xs sm:text-sm text-sky-200/80 mt-1 max-w-3xl font-medium">
          Mapping empirical pressure reliability to Rajasthan Royals’ tactical roster gaps ahead of the IPL 2027 Auction.
          Maximizing win probability in high-leverage death overs and steep chases.
        </p>
      </div>

      {/* 4 Critical Gaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {gaps.map((gap, index) => {
          const targets = gap.top_targets.map((name) =>
            allPlayers.find((p) => p.name.toLowerCase() === name.toLowerCase())
          ).filter(Boolean) as Player[];

          const gapColors = [
            'border-royals-pink/40 hover:border-royals-pink/60',
            'border-sky-400/40 hover:border-sky-400/60',
            'border-amber-400/40 hover:border-amber-400/60',
            'border-purple-400/40 hover:border-purple-400/60',
          ];

          return (
            <div key={gap.id} className={`glass-panel p-6 relative overflow-hidden flex flex-col justify-between ${gapColors[index % gapColors.length]}`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${
                    index === 0
                      ? 'bg-royals-pink/25 text-royals-pink border-royals-pink/40'
                      : index === 1
                      ? 'bg-sky-500/25 text-sky-300 border-sky-400/40'
                      : index === 2
                      ? 'bg-amber-400/25 text-amber-300 border-amber-400/40'
                      : 'bg-purple-500/25 text-purple-300 border-purple-400/40'
                  }`}>
                    {gap.tag}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gradient-gold-royal font-black">
                    <DollarSign size={13} className="text-amber-400" />
                    <span>Allocated Purse: {gap.budget_allocation}</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mt-1">
                  {gap.title}
                </h3>

                <p className="text-xs text-sky-100/90 leading-relaxed mt-2 font-medium">
                  {gap.why}
                </p>

                {/* Tactical Impact Badge */}
                <div className="mt-3 p-3 rounded-xl bg-black/35 border border-white/5 text-xs text-emerald-300 font-medium">
                  <span className="font-extrabold text-amber-300">Expected Impact: </span>
                  {gap.impact}
                </div>
              </div>

              {/* Recommended Targets Section */}
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                <div className="text-[11px] font-extrabold text-sky-300 uppercase tracking-wider">
                  Model Recommended Auction Targets
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {targets.map((target) => (
                    <div
                      key={target.player_id}
                      onClick={() => onSelectPlayer(target)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/40 cursor-pointer transition-all flex items-center justify-between gap-2 group"
                    >
                      <div className="min-w-0">
                        <div className="font-black text-xs text-white group-hover:text-amber-300 transition-colors truncate">
                          {target.name}
                        </div>
                        <div className="text-[10px] text-sky-200/80 truncate font-medium">
                          {target.role.includes('Bowler')
                            ? `${target.bowling.p_econ} Econ • ${target.bowling.p_wkts}W`
                            : `${target.batting.p_sr} SR • ${target.batting.p_avg} Avg`}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-xs text-gradient-gold-royal">
                          {target.index.toFixed(1)}
                        </div>
                        <div className="text-[9px] text-amber-300 font-bold">
                          {target.price_estimate.split('-')[0].trim()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated 2027 Royals Playing XI */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Shield size={18} className="text-amber-400" />
              <span>Simulated Rajasthan Royals IPL 2027 Clutch XI</span>
            </h3>
            <p className="text-xs text-sky-200/80 mt-0.5 font-medium">
              Optimized matchday lineup with retained pillars and recommended pressure auction acquisitions
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 self-start sm:self-auto shadow-sm">
            100% Pressure Phase Coverage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-2">
          {simulatedXI.map((pos) => (
            <div
              key={pos.num}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                pos.tag.includes('Priority')
                  ? 'bg-amber-400/15 border-amber-400/60 shadow-amber-500/20'
                  : pos.tag.includes('Auction Target')
                  ? 'bg-royals-blue/25 border-sky-400/40 shadow-blue-glow'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center flex-shrink-0 ${
                  pos.tag.includes('Priority')
                    ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-royals-dark ring-1 ring-yellow-400'
                    : 'bg-white/10 text-sky-300'
                }`}>
                  {pos.num}
                </span>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs text-white truncate">{pos.name}</div>
                  <div className="text-[10px] text-sky-200/70 truncate font-medium">{pos.role}</div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${pos.tagColor}`}>
                  {pos.tag}
                </span>
                <div className="text-[10px] text-emerald-300 font-bold mt-1">
                  {pos.stat}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
