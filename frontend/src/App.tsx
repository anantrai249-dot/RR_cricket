import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DashboardPayload, Player, WeightConfig } from './types';
import { recalculatePlayerIndex } from './utils/math';
import { Navbar } from './components/Navbar';
import { HeroOverview } from './components/HeroOverview';
import { Top10Picks } from './components/Top10Picks';
import { PlayerExplorer } from './components/PlayerExplorer';
import { CompareModal } from './components/CompareModal';
import { RRSquadFit } from './components/RRSquadFit';
import { Methodology } from './components/Methodology';
import { WeightSlidersModal } from './components/WeightSlidersModal';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Shield, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [weights, setWeights] = useState<WeightConfig>({
    pressure: 0.40,
    clutch: 0.25,
    consistency: 0.20,
    sample: 0.15,
  });

  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [compareList, setCompareList] = useState<Player[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Fetch Dashboard payload
  useEffect(() => {
    fetch('/data/dashboard.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((payload: DashboardPayload) => {
        setData(payload);
        if (payload.weights) setWeights(payload.weights);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard.json:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Re-calculate all player scores based on live weight configuration
  const scoredPlayers = useMemo(() => {
    if (!data) return [];
    return data.players.map((p) => {
      const liveIndex = recalculatePlayerIndex(p, weights);
      return {
        ...p,
        index: liveIndex,
      };
    }).sort((a, b) => b.index - a.index);
  }, [data, weights]);

  // Derived Top 10 Batters (official Unstop format: min 80 balls, sorted by live index)
  const top10Batters = useMemo(() => {
    return scoredPlayers
      .filter((p) => p.batting.p_balls >= 80 && ['Batter', 'Finisher', 'Opener / PP striker', 'All-rounder'].includes(p.role))
      .slice(0, 10);
  }, [scoredPlayers]);

  // Derived Top 10 Bowlers (official Unstop format: min 80 balls, frontline bowlers)
  const top10Bowlers = useMemo(() => {
    return scoredPlayers
      .filter((p) => p.bowling.p_balls >= 80 && ['Bowler', 'All-rounder'].includes(p.role) && p.bowling.p_inns >= 6)
      .slice(0, 10);
  }, [scoredPlayers]);

  // Derived Balanced RR Auction Targets (Eligible only, non-RR, filling all 4 gaps)
  const top10Auction = useMemo(() => {
    const eligiblePool = scoredPlayers.filter((p) => p.auction_eligible && !p.is_rr);
    const chosen: Player[] = [];
    const used = new Set<number>();
    const quotas: Record<string, number> = {
      'Finisher': 2,
      'Opener / PP striker': 2,
      'Bowler': 3,
      'All-rounder': 2,
      'Batter': 1,
    };

    for (const [role, count] of Object.entries(quotas)) {
      const candidates = eligiblePool.filter((p) => p.role === role && !used.has(p.player_id));
      for (const p of candidates.slice(0, count)) {
        chosen.push(p);
        used.add(p.player_id);
      }
    }

    if (chosen.length < 10) {
      const remaining = eligiblePool.filter((p) => !used.has(p.player_id));
      for (const p of remaining) {
        if (chosen.length >= 10) break;
        chosen.push(p);
        used.add(p.player_id);
      }
    }

    return chosen.sort((a, b) => b.index - a.index).slice(0, 10);
  }, [scoredPlayers]);

  // Handle Preset Changes
  const handleSetPreset = (presetKey: string) => {
    if (presetKey === 'balanced') {
      setWeights({ pressure: 0.40, clutch: 0.25, consistency: 0.20, sample: 0.15 });
      showToast('Weight Profile set to Balanced (40/25/20/15)');
    } else if (presetKey === 'clutch') {
      setWeights({ pressure: 0.30, clutch: 0.40, consistency: 0.15, sample: 0.15 });
      showToast('Weight Profile set to Clutch Uplift Focus (30/40/15/15)');
    } else if (presetKey === 'consistency') {
      setWeights({ pressure: 0.30, clutch: 0.20, consistency: 0.35, sample: 0.15 });
      showToast('Weight Profile set to Consistency Heavy (30/20/35/15)');
    } else if (presetKey === 'sample') {
      setWeights({ pressure: 0.30, clutch: 0.20, consistency: 0.15, sample: 0.35 });
      showToast('Weight Profile set to Sample Volume Heavy (30/20/15/35)');
    }
  };

  const handleChangeWeight = (key: keyof WeightConfig, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetWeights = () => {
    setWeights({ pressure: 0.40, clutch: 0.25, consistency: 0.20, sample: 0.15 });
    showToast('Weights reset to baseline defaults');
  };

  // Compare List Management
  const handleAddToCompare = (player: Player) => {
    if (compareList.some((p) => p.player_id === player.player_id)) {
      setCompareList((prev) => prev.filter((p) => p.player_id !== player.player_id));
      showToast(`Removed ${player.name} from Compare`);
    } else {
      if (compareList.length >= 3) {
        showToast('Max 3 players can be compared at once.');
        return;
      }
      setCompareList((prev) => [...prev, player]);
      showToast(`Added ${player.name} to Compare!`);
    }
  };

  const handleRemoveFromCompare = (playerId: number) => {
    setCompareList((prev) => prev.filter((p) => p.player_id !== playerId));
  };

  // Export View as PDF / PNG
  const handleExportView = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    showToast('Generating high-resolution analytics export...');

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#060D2E',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RR_SupeRR_Selector_S2_${activeTab}_Report.pdf`);

      showToast('Export complete! PDF report downloaded.');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-royals-dark">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-royals-navy via-royals-blue to-royals-pink p-0.5 animate-spin">
          <div className="w-full h-full bg-royals-dark rounded-[14px] flex items-center justify-center">
            <Shield size={24} className="text-royals-pink animate-pulse" />
          </div>
        </div>
        <div className="text-sm font-bold tracking-widest text-gradient-royals uppercase">
          Initializing Royals Intelligence Engine...
        </div>
        <p className="text-xs text-royals-muted">
          Loading 95,000+ pressure deliveries across 860+ IPL and T20I matches
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-royals-dark text-center">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 max-w-md space-y-3">
          <h2 className="text-xl font-bold text-rose-400">Failed to Load Dashboard Data</h2>
          <p className="text-xs text-royals-muted">{error || 'Data payload unavailable'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-royals-pink text-white"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const topRankedPlayerName = top10Auction[0]?.name || '—';

  return (
    <div className="min-h-screen flex flex-col selection:bg-royals-pink selection:text-white noise-overlay">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-panel bg-royals-dark/95 border-royals-pink/50 text-xs font-bold text-white shadow-pink-glow animate-fadeIn">
          <CheckCircle2 size={16} className="text-royals-pink" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Glass Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWeights={() => setIsWeightsModalOpen(true)}
        onExport={handleExportView}
        isExporting={isExporting}
      />

      {/* Main Container */}
      <main ref={printRef} className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {activeTab === 'overview' && (
          <HeroOverview
            meta={data.meta}
            top10Auction={top10Auction}
            top10Batters={top10Batters}
            top10Bowlers={top10Bowlers}
            weights={weights}
            onSetPreset={handleSetPreset}
            onSelectPlayer={(p) => setSelectedPlayer(p)}
            onAddToCompare={handleAddToCompare}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'top10' && (
          <Top10Picks
            top10Auction={top10Auction}
            top10Batters={top10Batters}
            top10Bowlers={top10Bowlers}
            compareList={compareList}
            onSelectPlayer={(p) => setSelectedPlayer(p)}
            onAddToCompare={handleAddToCompare}
          />
        )}

        {activeTab === 'explorer' && (
          <PlayerExplorer
            players={scoredPlayers}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={(p) => setSelectedPlayer(p)}
            onAddToCompare={handleAddToCompare}
          />
        )}

        {activeTab === 'compare' && (
          <CompareModal
            allPlayers={scoredPlayers}
            compareList={compareList}
            onRemoveFromCompare={handleRemoveFromCompare}
            onAddPlayerToCompare={handleAddToCompare}
            onSelectPlayer={(p) => setSelectedPlayer(p)}
          />
        )}

        {activeTab === 'squad-fit' && (
          <RRSquadFit
            rrSquad={data.rr_squad}
            gaps={data.gaps}
            allPlayers={scoredPlayers}
            onSelectPlayer={(p) => setSelectedPlayer(p)}
          />
        )}

        {activeTab === 'methodology' && <Methodology meta={data.meta} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-4 text-center text-xs text-royals-muted space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="font-extrabold text-royals-pink">SupeRR Selector Season 2</span>
          <span>•</span>
          <span>Rajasthan Royals Analytics Case Study</span>
        </div>
        <p className="text-[11px] max-w-xl mx-auto opacity-75">
          Proprietary competition data strictly processed in sandbox environment. Derived from 200,961 ball-by-ball records (2022–2026).
        </p>
      </footer>

      {/* Model Weight Sliders Modal */}
      <WeightSlidersModal
        isOpen={isWeightsModalOpen}
        weights={weights}
        onChangeWeight={handleChangeWeight}
        onSetPreset={handleSetPreset}
        onReset={handleResetWeights}
        onClose={() => setIsWeightsModalOpen(false)}
        topPlayerName={topRankedPlayerName}
      />

      {/* Full Player Detail Deep-Dive Modal */}
      <PlayerDetailModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        onAddToCompare={handleAddToCompare}
        isInCompare={compareList.some((p) => p.player_id === selectedPlayer?.player_id)}
      />
    </div>
  );
};

export default App;
