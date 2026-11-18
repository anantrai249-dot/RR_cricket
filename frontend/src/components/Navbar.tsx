import React from 'react';
import { Shield, Sliders, Download, Sparkles, UserCheck, BarChart3, Users, BookOpen, Crown } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenWeights: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenWeights,
  onExport,
  isExporting,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'top10', label: 'Top 10 Picks', icon: Shield },
    { id: 'explorer', label: 'Player Explorer', icon: Users },
    { id: 'compare', label: 'Head-to-Head', icon: UserCheck },
    { id: 'squad-fit', label: 'RR Squad Fit', icon: Sparkles },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-royals-dark/85 border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Royals Logo & Branding */}
        <div 
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 via-amber-400 to-royals-pink p-0.5 shadow-pink-glow group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-royals-dark rounded-[10px] flex items-center justify-center">
              <span className="font-black text-gradient-gold-royal text-lg tracking-wider">RR</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base tracking-wide flex items-center gap-1">
                <span className="text-gradient-pink-electric">SupeRR</span>
                <span className="text-gradient-gold-royal">Selector</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-400/20 text-gold-bright border border-amber-400/40 flex items-center gap-1 shadow-sm glow-gold">
                <Crown size={10} className="text-amber-400" />
                Season 2
              </span>
            </div>
            <p className="text-[11px] text-blue-bright font-semibold hidden sm:block tracking-wide">
              IPL 2027 Auction Pressure Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-royals-blue via-royals-magenta to-royals-pink text-white shadow-pink-glow font-black border border-white/20'
                    : 'text-sky-200/80 hover:text-pink-300 hover:bg-white/5 font-semibold'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-gold-bright animate-pulse' : 'text-sky-400'} />
                <span className={isActive ? 'text-white' : ''}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWeights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold glass-pill text-gold-bright border-amber-400/40 hover:border-amber-400/70 hover:bg-amber-400/15 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            title="Adjust Model Weights & Sliders"
          >
            <Sliders size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Model Weights</span>
          </button>

          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-royals-pink via-royals-magenta to-royals-blue text-white shadow-pink-glow hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 border border-white/20"
            title="Export Dashboard View as PDF/PNG"
          >
            <Download size={14} className="text-gold-bright" />
            <span className="hidden sm:inline text-white">{isExporting ? 'Exporting...' : 'Export View'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="flex md:hidden items-center justify-around pt-2.5 mt-2 border-t border-white/5 overflow-x-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] ${
                isActive ? 'text-royals-pink font-bold' : 'text-royals-muted'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-amber-300' : ''} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
