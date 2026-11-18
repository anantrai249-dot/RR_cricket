import pandas as pd
import numpy as np
from build_dataset import load, clean_bbb, add_context, _agg_bat, _agg_bowl, innings_consistency_bat, innings_consistency_bowl, score_batters, score_bowlers

bbb, matches, comps, teams, mapping, xi = load()
bbb = clean_bbb(bbb)
bbb = add_context(bbb, matches, comps)

# Let's inspect bat balls distribution
bat_p = _agg_bat(bbb[bbb['bat_pressure']], "p")
bat_n = _agg_bat(bbb[~bbb['bat_pressure']], "n")
bat = bat_p.merge(bat_n, on=["player_id", "player_name"], how="left")
for c in [x for x in bat.columns if x.startswith("n_")]:
    bat[c] = bat[c].fillna(0)

print(f"Total batters with >0 pressure balls: {len(bat)}")
print(f"Batters with >=40 pressure balls: {(bat['p_balls'] >= 40).sum()}")
print(f"Batters with >=60 pressure balls: {(bat['p_balls'] >= 60).sum()}")
print(f"Batters with >=80 pressure balls: {(bat['p_balls'] >= 80).sum()}")
print(f"Batters with >=100 pressure balls: {(bat['p_balls'] >= 100).sum()}")

# Inspect bowlers
bowl_p = _agg_bowl(bbb[bbb['bowl_pressure']], "p")
bowl_n = _agg_bowl(bbb[~bbb['bowl_pressure']], "n")
bowl = bowl_p.merge(bowl_n, on=["player_id", "player_name"], how="left")
for c in [x for x in bowl.columns if x.startswith("n_")]:
    bowl[c] = bowl[c].fillna(0)

print(f"\nTotal bowlers with >0 pressure balls: {len(bowl)}")
print(f"Bowlers with >=40 pressure balls: {(bowl['p_balls'] >= 40).sum()}")
print(f"Bowlers with >=60 pressure balls: {(bowl['p_balls'] >= 60).sum()}")
print(f"Bowlers with >=80 pressure balls: {(bowl['p_balls'] >= 80).sum()}")
print(f"Bowlers with >=100 pressure balls: {(bowl['p_balls'] >= 100).sum()}")
