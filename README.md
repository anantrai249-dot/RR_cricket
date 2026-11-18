# SupeRR Selector Season 2 — Rajasthan Royals Analytics War Room
### Pressure Reliability Engine & Tactical Auction Decision Dashboard (IPL 2027)

> **Proprietary & Competition Notice:** Built exclusively for Rajasthan Royals' *SupeRR Selector Season 2* analytics case study. All delivery records and statistical models are processed locally without external leakage.

---

## 1. Executive Summary & Objective

T20 matches are won or lost in volatile, high-stakes micro-phases: death overs (16–20), steep chases where the required run rate exceeds 10.0 RPO, top-order collapses (3+ wickets down inside the powerplay), and elimination playoff pressure. Ordinary season averages often mask acute vulnerability under pressure or unfairly penalize high-intent finishers.

This project delivers:
1. **A Data-Driven Pressure Reliability Index (PRI, 0–100):** Combining Bayesian-shrunk execution, clutch baseline delta ($\Delta$), cross-match consistency, and sample size volume across 867 matches and 200,961 deliveries (2022–2026).
2. **Dual-Lens Ranking Output:**
   - **Rajasthan Royals IPL 2027 Auction Target Board:** Top 10 auction-eligible, non-retained players scientifically mapped to Rajasthan Royals' 4 core tactical gaps (Death Finisher, Powerplay Striker, Death Enforcer, Pressure All-Rounder).
   - **Unstop Round 1 Official Submission Lists:** Ordered Top 10 Batters and Top 10 Bowlers across all tournament data.
3. **Interactive Single-Page Analytics Dashboard:** Developed in React, Vite, TypeScript, and Tailwind CSS with real-time dynamic weight sliders, multi-axial radar signatures, over-by-over phase heatmaps, 2–3 player comparison matrix, and PDF/PNG export capability.

---

## 2. Quickstart & Run Commands

### Prerequisites
- **Python 3.10+** (with `pandas>=2.0`, `numpy>=1.26`)
- **Node.js 18+** & **npm**

### Step 1: Data Pipeline & Model Preprocessing
Processes raw ball-by-ball logs, cleans anomalies, calculates match state (RRR, phase, wickets down), fits Bayesian shrinkage, and exports `dashboard.json`:
```bash
# Run from repository root
python scripts/build_dataset.py
```
*Outputs generated:*
- `data/processed/ball_by_ball_clean.csv`
- `data/processed/dashboard.json`
- `frontend/public/data/dashboard.json`

### Step 2: Launch the Analytics Dashboard
```bash
cd frontend
npm install
npm run build
npm run preview -- --port 5173 --host
```
*The dashboard will be live at:* **`http://localhost:5173/`**

For active development with hot-module reloading:
```bash
cd frontend
npm run dev
```

---

## 3. Repository Architecture

```text
super-selector-s2/
├── data/
│   ├── raw/                                 # Unstop provided competition data pack
│   │   ├── ball_by_ball.csv                 # 200,999 delivery events (2022–2026)
│   │   ├── matches.csv                      # 883 match summaries & DLS targets
│   │   ├── competitions.csv                 # 141 tournaments (IPL 2022–26, T20Is)
│   │   ├── teams.csv                        # 353 team definitions (RR ID = 3)
│   │   ├── playing_eleven.csv               # 28,381 player appearances & Impact subs
│   │   └── competition_team_player_mapping.csv # 6,413 squad registration maps
│   ├── processed/
│   │   ├── ball_by_ball_clean.csv           # Cleaned delivery records with pressure flags
│   │   └── dashboard.json                   # Aggregated player metrics & radar coordinates
│   └── inspect_report.txt                   # Automated data inspection & schema report
├── scripts/
│   ├── build_dataset.py                     # Primary pipeline: clean, tag, score, export
│   └── inspect_pressure.py                  # Statistical validation of pressure proportions
├── frontend/
│   ├── public/
│   │   └── data/dashboard.json              # Client runtime data payload
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx                   # Sticky glass navbar with tabs & export button
│   │   │   ├── HeroOverview.tsx             # Hero section, KPIs, dynamic Top 10 leaderboard
│   │   │   ├── Top10Picks.tsx               # 10 glassmorphism cards with circular PRI gauges
│   │   │   ├── PlayerExplorer.tsx           # Search, filters, radar charts, over heatmaps
│   │   │   ├── CompareModal.tsx             # 2–3 player side-by-side comparison & bar chart
│   │   │   ├── RRSquadFit.tsx               # RR 2026 squad audit, 4 tactical gaps, XI simulation
│   │   │   ├── Methodology.tsx              # Mathematical formulas, definitions, limitations
│   │   │   ├── WeightSlidersModal.tsx       # Live re-ranking sliders & preset profiles
│   │   │   └── PlayerDetailModal.tsx        # Deep-dive player profile drawer
│   │   ├── types.ts                         # Complete TypeScript interfaces
│   │   ├── utils/math.ts                    # Live client-side weight re-calculation engine
│   │   ├── App.tsx                          # State orchestration & tab management
│   │   ├── index.css                        # Dual-tone palette, glassmorphism, noise overlay
│   │   └── main.tsx                         # React entrypoint
│   ├── index.html                           # Google Fonts (Poppins, Inter) & meta tags
│   ├── package.json                         # Dependencies (Recharts, Lucide, html2canvas, jsPDF)
│   ├── tailwind.config.js                   # Custom Royals navy & pink color design system
│   └── vite.config.ts                       # Vite bundler configuration
├── data-dictionary.md                       # Comprehensive schema mapping & cleaning rules
├── requirements.txt                         # Python requirements (pandas, numpy)
└── README.md                                # Full case study documentation
```

---

## 4. Methodology & Pressure Reliability Formulation

### 4.1. Definition of Match Pressure
A delivery is objectively marked as high-pressure based on quantifiable match-state indicators:
- **Batting Pressure (38.4% of deliveries):**
  1. *Death Overs:* Overs 16–20 in either innings.
  2. *Steep Chases:* 2nd innings deliveries where Required Run Rate (RRR) exceeds $10.0\text{ runs/over}$.
  3. *Early Collapse:* Overs 1–6 when 3 or more wickets have fallen.
  4. *Final Stretch of Chases:* Overs 16–20 in 2nd innings regardless of score.
  5. *Playoff / Knockout Games:* High-stakes knockout matches during death or high-RRR phases.
- **Bowling Pressure (31.2% of deliveries):**
  1. *Death Overs:* Overs 16–20 in either innings.
  2. *Low-Total Defense:* Defending a sub-par 1st innings total ($< 150\text{ runs}$).
  3. *Clutch Finishes:* Opposition requires $\le 40\text{ runs}$ off the final 4 overs (overs 17–20).
  4. *Playoff Critical Spells:* Powerplay (overs 1–6) or death overs (16–20) in knockouts.

### 4.2. Composite Index Formulation
$$\text{PRI} = 100 \times \left(0.40 \cdot \text{PressurePerf} + 0.25 \cdot \text{ClutchUplift} + 0.20 \cdot \text{Consistency} + 0.15 \cdot \text{SampleConfidence}\right)$$

1. **Pressure Execution ($\text{PressurePerf}$):**
   - *Batters:* Shrunk Strike Rate (40%), Average (30%), Boundary % (20%), and Dot Ball Resistance (10%).
   - *Bowlers:* Inverted Shrunk Economy (40%), Wicket-taking Volume/SR (30%), Dot % (20%), and Boundary Suppression (10%).
2. **Clutch Uplift ($\text{ClutchUplift}$):**
   Measures the delta against each player's non-pressure baseline:
   $$\Delta_{\text{bat}} = \text{SR}_{\text{pressure}} - \text{SR}_{\text{normal}}, \quad \Delta_{\text{bowl}} = \text{Econ}_{\text{normal}} - \text{Econ}_{\text{pressure}}$$
   An excellence floor prevents elite hitters ($\text{SR} > 175$) or elite death bowlers ($\text{Econ} < 8.0$) from being penalized for already performing well in regulation phases.
3. **Innings Consistency ($\text{Consistency}$):**
   Proportion of match appearances where batters achieve $\ge 135\text{ SR}$ or bowlers maintain $\le 8.5\text{ Econ}$, penalized by standard deviation of cross-match variance.
4. **Empirical Bayesian Shrinkage ($\text{SampleConfidence}$):**
   $$\theta_{\text{adj}} = \frac{n}{n + 80}\theta_{\text{obs}} + \frac{80}{n + 80}\mu_{\text{prior}}$$
   Ensures small-sample outliers (e.g., part-timers with 30–40 balls) regress toward the population mean.

---

## 5. Top 10 Picks for Rajasthan Royals (IPL 2027 Auction)

Filtered for **IPL 2027 auction eligibility**, **non-retention on RR**, and balanced across the Royals' 4 core roster deficits:

| Auction Rank | Player | Latest Franchise | Tactical Role | Pressure PRI | Key Pressure Metric | Valuation Tier | How He Strengthens Rajasthan Royals |
|:---:|---|---|---|:---:|:---:|:---:|---|
| **#1** | **Shashank Singh** | Punjab Kings | Finisher | **80.69** | 187.2 SR (398b), 46.6 Avg | ₹14.0–18.0+ Cr | The tournament's premier death closer; solves RR's steep chase conversion when RRR > 10. |
| **#2** | **Asif Khan** | Unattached / UAE | Finisher | **78.70** | 191.2 SR (114b), 36.3 Avg | ₹1.5–4.5 Cr | High-upside budget steal with fearless boundary striking in the final 4 overs. |
| **#3** | **Tim David** | Mumbai Indians | Finisher | **75.40** | 198.1 SR (727b), 32.7 Avg | ₹14.0–18.0+ Cr | Proven IPL brute force; strikes at near 200 in overs 17–20, providing match-winning insurance. |
| **#4** | **Reeza Hendricks** | International / SA | Opener / PP striker | **75.90** | 172.0 SR (343b), 42.1 Avg | ₹5.0–8.5 Cr | Calibrated powerplay anchor who maintains intent and rebuilds calmly after early wickets. |
| **#5** | **Ryan Rickelton** | Mumbai Indians | Opener / PP striker | **75.73** | 186.5 SR (252b), 33.6 Avg | ₹9.0–13.5 Cr | Wicketkeeper-batter who attacks the new ball fearlessly (186+ SR) in steep chases. |
| **#6** | **Benjamin White** | International / IRE | Bowler | **73.20** | 6.69 Econ (96b), 9 Wkts | ₹1.5–4.5 Cr | Accurate leg-spinner who chokes scoring rates when defending sub-150 totals. |
| **#7** | **Jasprit Bumrah** | Mumbai Indians | Bowler | **67.00** | 7.71 Econ (700b), 51 Wkts | ₹14.0–18.0+ Cr | Gold standard death execution; delivers unbreachable sub-7.8 economy in playoff overs. |
| **#8** | **Allah Ghazanfar** | Mumbai Indians | Bowler | **72.59** | 6.18 Econ (167b), 13 Wkts | ₹5.0–8.5 Cr | Mystery prodigy; delivers exceptional 6.2 economy across powerplay and death overs. |
| **#9** | **George Linde** | International / SA | All-rounder | **65.40** | 170.2 SR & 7.8 Econ | ₹3.5–6.0 Cr | Tactical left-arm spin and lower-order boundary-hitting package under the Impact Player rule. |
| **#10** | **Harry Tector** | International / IRE | Batter | **68.84** | 148.5 SR, 48.0 Avg | ₹3.5–6.0 Cr | Middle-overs spin consolidator who stabilizes innings after early top-order collapses. |

---

## 6. Official Unstop Submission Lists (Round 1)

### Top 10 Batters Under Pressure
1. **Shikhar Dhawan** (PRI 82.47 | 166.5 SR, 53.6 Avg)
2. **Shashank Singh** (PRI 80.69 | 187.2 SR, 46.6 Avg)
3. **Asif Khan** (PRI 78.70 | 191.2 SR, 36.3 Avg)
4. **Matthew Wade** (PRI 81.43 | 161.0 SR, 61.2 Avg)
5. **Tim David** (PRI 75.40 | 198.1 SR, 32.7 Avg)
6. **Cooper Connolly** (PRI 76.72 | 175.0 SR, 42.0 Avg)
7. **Babar Azam** (PRI 76.08 | 168.3 SR, 43.6 Avg)
8. **Reeza Hendricks** (PRI 75.90 | 172.0 SR, 42.1 Avg)
9. **Ashutosh Sharma** (PRI 75.79 | 180.2 SR, 27.3 Avg)
10. **Suryakumar Yadav** (PRI 74.92 | 185.4 SR, 40.2 Avg)

### Top 10 Bowlers Under Pressure
1. **Benjamin White** (PRI 73.20 | 6.69 Econ, 9 Wkts)
2. **Allah Ghazanfar** (PRI 72.59 | 6.18 Econ, 13 Wkts)
3. **Mohammad Nawaz** (PRI 68.40 | 5.85 Econ, 18 Wkts)
4. **Maheesh Theekshana** (PRI 67.55 | 7.92 Econ, 41 Wkts)
5. **Varun Chakravarthy** (PRI 67.54 | 7.88 Econ, 34 Wkts)
6. **Rashid Khan** (PRI 67.50 | 7.89 Econ, 72 Wkts)
7. **Mahedi Hasan** (PRI 67.44 | 6.99 Econ, 21 Wkts)
8. **Jasprit Bumrah** (PRI 66.99 | 7.71 Econ, 51 Wkts)
9. **Sunil Narine** (PRI 65.70 | 6.55 Econ, 22 Wkts)
10. **Craig Young** (PRI 65.83 | 7.71 Econ, 21 Wkts)

---

## 7. Visual Design & Accessibility System

- **Dual-Tone Gradient Palette:**
  - Page Background: `linear-gradient(135deg, #060D2E 0%, #0B1B5E 35%, #3A1C71 65%, #FF2E93 100%)`
  - Royal Blue: `#254AA5` | Magenta: `#D81B84` | Electric Pink: `#FF2E93` | Soft Pink: `#FF8CC6`
  - Text: Clean High-Contrast White (`#FFFFFF`) and Muted Periwinkle (`#C9D1F5`).
- **Glassmorphism Styling:** `rgba(255, 255, 255, 0.07)` background, `1px rgba(255, 255, 255, 0.15)` border, backdrop-blur 16px, 20px radius, soft pink shadow glow.
- **Accessibility:** Meets **WCAG AA contrast standards** with large bold numerals for KPIs and clear color coding (green for positive uplift, pink for primary indicators).
