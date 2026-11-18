import { Player, WeightConfig } from '../types';

export function recalculatePlayerIndex(player: Player, weights: WeightConfig): number {
  const totalWeight = weights.pressure + weights.clutch + weights.consistency + weights.sample;
  if (totalWeight === 0) return 0;

  const wP = weights.pressure / totalWeight;
  const wC = weights.clutch / totalWeight;
  const wCs = weights.consistency / totalWeight;
  const wS = weights.sample / totalWeight;

  const raw =
    wP * player.components.pressure +
    wC * player.components.clutch +
    wCs * player.components.consistency +
    wS * player.components.sample;

  return Math.round(raw * 10000) / 100;
}

export function formatRuns(runs: number): string {
  return runs.toLocaleString();
}

export function formatCrore(num: number): string {
  return `₹${num.toFixed(1)} Cr`;
}
