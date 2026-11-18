import json

with open('frontend/public/data/dashboard.json') as f:
    d = json.load(f)

print("Meta:", d['meta'])
print("\nTop 10 Overall Picks:")
for p in d['top10']:
    print(f"#{p.get('auction_rank') or p.get('rank_all')} {p['name']} | Role: {p['role']} | Team: {p['team']} | Index: {p['index']} | Val: {p['value_tag']}")

print("\nTop 10 Batters:")
for p in d['top10_batters']:
    print(f"{p['name']} (ID {p['player_id']}) -> Index: {p['index']}")

print("\nTop 10 Bowlers:")
for p in d['top10_bowlers']:
    print(f"{p['name']} (ID {p['player_id']}) -> Index: {p['index']}")
