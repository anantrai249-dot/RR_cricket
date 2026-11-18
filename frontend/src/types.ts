export interface BattingStats {
  p_balls: number;
  p_runs: number;
  p_sr: number;
  p_avg: number;
  p_boundary_pct: number;
  p_dot_pct: number;
  n_sr: number;
  n_avg: number;
  p_inns: number;
}

export interface BowlingStats {
  p_balls: number;
  p_wkts: number;
  p_econ: number;
  p_sr: number;
  p_dot_pct: number;
  n_econ: number;
  p_inns: number;
}

export interface PlayerTrend {
  season: string;
  kind: 'bat_sr' | 'bowl_econ';
  value: number;
  balls: number;
  wkts?: number;
}

export interface HeatmapItem {
  over: number;
  situation: 'pressure' | 'normal';
  metric: 'sr' | 'econ';
  value: number;
  balls: number;
  runs?: number;
  wkts?: number;
}

export interface PlayerComponents {
  pressure: number;
  clutch: number;
  consistency: number;
  sample: number;
}

export interface Player {
  player_id: number;
  name: string;
  team: string;
  team_id: number | null;
  is_rr: boolean;
  role: string;
  auction_eligible: boolean;
  ineligibility_reason: string | null;
  avg_order: number | null;
  index: number;
  bat_index: number;
  bowl_index: number;
  rank_all?: number;
  category_rank?: number;
  auction_rank?: number;
  components: PlayerComponents;
  batting: BattingStats;
  bowling: BowlingStats;
  radar: {
    pressure: number[];
    normal: number[];
  };
  trend: PlayerTrend[];
  heatmap: HeatmapItem[];
  rr_note: string;
  value_tag: string;
  price_estimate: string;
}

export interface MetaData {
  players_analysed: number;
  matches: number;
  pressure_deliveries: number;
  balls: number;
  seasons: string[];
  top_player: string;
  default_weights: {
    pressure: number;
    clutch: number;
    consistency: number;
    sample: number;
  };
  formula: string;
  pressure_defs: {
    batting: string[];
    bowling: string[];
  };
  limitations: string[];
  radar_axes: string[];
}

export interface SquadGap {
  id: string;
  title: string;
  tag: string;
  why: string;
  top_targets: string[];
  budget_allocation: string;
  impact: string;
}

export interface DashboardPayload {
  meta: MetaData;
  players: Player[];
  top10: Player[];
  top10_batters: Player[];
  top10_bowlers: Player[];
  rr_squad: Player[];
  gaps: SquadGap[];
  weights: {
    pressure: number;
    clutch: number;
    consistency: number;
    sample: number;
  };
}

export interface WeightConfig {
  pressure: number;
  clutch: number;
  consistency: number;
  sample: number;
}
