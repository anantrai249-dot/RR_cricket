import json
with open('frontend/public/data/dashboard.json') as f:
    d = json.load(f)

names = ["Heinrich Klaasen", "Rinku Singh", "Nicholas Pooran", "Suryakumar Yadav", "Shashank Singh", "Ashutosh Sharma", "Tilak Varma", "Sanju Samson", "Jos Buttler", "Shimron Hetmyer"]
for p in d['players']:
    if any(n.lower() in p['name'].lower() for n in names):
        bat = p['batting']
        print(f"{p['name']} ({p['team']}): Index={p['index']:.1f}, p_balls={bat['p_balls']}, p_sr={bat['p_sr']}, p_avg={bat['p_avg']}, n_sr={bat['n_sr']}, rank={p.get('rank_all')}")
