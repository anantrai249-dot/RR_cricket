import pandas as pd
from build_dataset import load, clean_bbb, add_context, _agg_bat, _agg_bowl, innings_consistency_bat, innings_consistency_bowl, score_batters, score_bowlers

bbb, matches, comps, teams, mapping, xi = load()
bbb = clean_bbb(bbb)
bbb = add_context(bbb, matches, comps)

bat_p = _agg_bat(bbb[bbb['bat_pressure']], "p")
bat_n = _agg_bat(bbb[~bbb['bat_pressure']], "n")
bat = bat_p.merge(bat_n, on=["player_id", "player_name"], how="left").fillna(0)
bat = bat[bat['p_balls'] >= 80]
bat_c = innings_consistency_bat(bbb[bbb['bat_pressure']])
bat_s = score_batters(bat, bat_c)

bowl_p = _agg_bowl(bbb[bbb['bowl_pressure']], "p")
bowl_n = _agg_bowl(bbb[~bbb['bowl_pressure']], "n")
bowl = bowl_p.merge(bowl_n, on=["player_id", "player_name"], how="left").fillna(0)
bowl = bowl[bowl['p_balls'] >= 80]
bowl_c = innings_consistency_bowl(bbb[bbb['bowl_pressure']])
bowl_s = score_bowlers(bowl, bowl_c)

print("--- TOP 15 BATTERS (min 80 pressure balls) ---")
for r in bat_s.sort_values("index", ascending=False).head(15).itertuples():
    print(f"{r.player_name}: index={r.index:.2f}, p_balls={r.p_balls}, p_sr={r.p_sr:.1f}, p_avg={r.p_avg:.1f}, n_sr={r.n_sr:.1f}, p_inns={r.p_inns}")

print("\n--- TOP 15 BOWLERS (min 80 pressure balls) ---")
for r in bowl_s.sort_values("index", ascending=False).head(15).itertuples():
    print(f"{r.player_name}: index={r.index:.2f}, p_balls={r.p_balls}, p_econ={r.p_econ:.2f}, p_wkts={r.p_wickets}, n_econ={r.n_econ:.2f}, p_inns={r.p_inns}")
