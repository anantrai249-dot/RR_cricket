import pandas as pd
from build_dataset import load, clean_bbb, add_context

bbb, matches, comps, teams, mapping, xi = load()
bbb = clean_bbb(bbb)
bbb = add_context(bbb, matches, comps)

tot_bat = bbb['bat_ball'].sum()
press_bat = (bbb['bat_ball'] & bbb['bat_pressure']).sum()
tot_bowl = bbb['bowl_ball'].sum()
press_bowl = (bbb['bowl_ball'] & bbb['bowl_pressure']).sum()

print(f"Total legal bat balls: {tot_bat}")
print(f"Bat pressure balls: {press_bat} ({press_bat/tot_bat:.1%})")
print(f"Total legal bowl balls: {tot_bowl}")
print(f"Bowl pressure balls: {press_bowl} ({press_bowl/tot_bowl:.1%})")

# Check individual pressure indicators
print("\nBatting pressure components:")
print(f"Death overs: {(bbb['bat_ball'] & bbb['is_death']).sum()}")
print(f"High RRR (>10): {(bbb['bat_ball'] & bbb['press_rrr']).sum()}")
print(f"PP collapse (3+ down): {(bbb['bat_ball'] & bbb['press_collapse']).sum()}")
print(f"Last 5 chase: {(bbb['bat_ball'] & bbb['press_last5_chase']).sum()}")

print("\nBowling pressure components:")
print(f"Death overs: {(bbb['bowl_ball'] & bbb['is_death']).sum()}")
print(f"Defend small (<150): {(bbb['bowl_ball'] & bbb['press_defend_small']).sum()}")
print(f"Close death (<=40 off last 4): {(bbb['bowl_ball'] & bbb['press_close_death']).sum()}")
print(f"High stakes knockout PP/death: {(bbb['bowl_ball'] & bbb['high_stakes'] & (bbb['is_death'] | bbb['is_pp'])).sum()}")
