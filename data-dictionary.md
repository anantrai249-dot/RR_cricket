# Data Dictionary & Schema Documentation
## SupeRR Selector Season 2 — Rajasthan Royals Analytics Case Study

> **Confidentiality & Usage Notice:** This dataset is proprietary and provided solely for the SupeRR Selector Season 2 competition. All processing, calculations, and visualisations are maintained locally on the analyst's environment. No data is published, uploaded, or exposed externally.

---

## 1. Dataset Overview

The dataset covers high-level T20 cricket matches from **2022 to 2026**, spanning the **Indian Premier League (IPL)** (Seasons 2022, 2023, 2024, 2025, and 2026) alongside official **T20 Internationals (T20I)** featuring ICC Full Members and emerging nations.

| File Name | Format | Rows | Columns | Memory Size | Primary Purpose |
|---|---|---|---|---|---|
| `ball_by_ball.csv` | CSV | 200,999 | 33 | ~41.1 MB | Micro-level delivery log with shot, speed, runs, extras, and dismissals |
| `matches.csv` | CSV | 883 | 22 | ~124 KB | Match context, venue, stage, toss, DLS revised targets, result |
| `competitions.csv` | CSV | 141 | 4 | ~7.6 KB | Competition metadata, tournament name, format (`T20`/`T20I`), season |
| `teams.csv` | CSV | 353 | 3 | ~6.9 KB | Tournament team mappings (`comp_id`, `team_id`, `team_name`) |
| `playing_eleven.csv` | CSV | 28,381 | 9 | ~966 KB | Lineups, batting orders, captaincy, wicketkeeper, and Impact Player tracking |
| `competition_team_player_mapping.csv` | CSV | 6,413 | 6 | ~463 KB | Roster registrations connecting players to franchises and national squads |

---

## 2. Table-by-Table Schema & Data Mapping

### 2.1. `ball_by_ball.csv` (200,999 rows × 33 columns)
Delivery-level match events. 38 duplicates on composite delivery key were identified and removed during data cleaning (cleaned to 200,961 deliveries). Super overs (innings 3 & 4) were isolated from regulation T20 modeling.

| Column Name | Inferred Dtype | Null Count | Null % | Example Values | Description & Interpretation |
|---|---|---|---|---|---|
| `match_id` | `int64` | 0 | 0.0% | `13511`, `171501` | Unique match identifier foreign key to `matches.csv`. |
| `innings` | `int64` | 0 | 0.0% | `1`, `2` (3, 4 rare) | Innings number (1 = setting target, 2 = chasing target). |
| `overid` | `int64` | 0 | 0.0% | `1` to `20` | Over number of the innings (1-indexed). |
| `over_ball_num` | `int64` | 0 | 0.0% | `1` to `11` | Sequence of ball within the over (includes re-bowled extras). |
| `innings_ball_num` | `int64` | 0 | 0.0% | `1` to `130` | Cumulative delivery sequence in the innings. |
| `batting_team_id` | `int64` | 0 | 0.0% | `3` (RR), `1` (CSK) | Identifier for team batting. |
| `bowling_team_id` | `int64` | 0 | 0.0% | `2` (MI), `4` (PBKS) | Identifier for team fielding/bowling. |
| `striker_id` | `int64` | 0 | 0.0% | `1187`, `6819` | Unique ID of batter facing the delivery. |
| `striker_name` | `object` | 0 | 0.0% | `"Yashasvi Jaiswal"` | Normalized batter display name. |
| `non_striker_id` | `int64` | 0 | 0.0% | `6273`, `3297` | Unique ID of batter at non-striker's end. |
| `non_striker_name` | `object` | 0 | 0.0% | `"Shimron Hetmyer"` | Normalized non-striker display name. |
| `bowler_id` | `int64` | 0 | 0.0% | `2411`, `2933` | Unique ID of bowler delivering the ball. |
| `bowler_name` | `object` | 0 | 0.0% | `"Jasprit Bumrah"` | Normalized bowler display name. |
| `batting_type` | `object` | 0 | 0.0% | `"LHB"`, `"RHB"` | Batting stance (Left Hand / Right Hand). |
| `bowling_type` | `object` | 0 | 0.0% | `"Right-arm fast"` | Bowling style classification. |
| `batting_order` | `int64` | 0 | 0.0% | `1` to `11` | Position in the batting order for the current innings. |
| `runs` | `int64` | 0 | 0.0% | `0`, `1`, `4`, `6` | Runs scored off the bat on this delivery. |
| `is_four` | `bool` | 0 | 0.0% | `True`, `False` | Flag indicating boundary four. |
| `is_six` | `bool` | 0 | 0.0% | `True`, `False` | Flag indicating boundary six. |
| `is_wicket` | `bool` | 0 | 0.0% | `True`, `False` | Delivery resulted in a dismissal. |
| `dismissal_type_id`| `float64` | 190,118 | 94.6% | `1.0`, `2.0`, `3.0` | Dismissal category ID (present only when wicket occurs). |
| `dismissal_type` | `object` | 190,118 | 94.6% | `"bowled"`, `"caught"` | Textual dismissal mode. |
| `dismissed_player_id` | `float64`| 190,107 | 94.6% | `6819.0` | Player ID dismissed on this ball. |
| `extras_type` | `object` | 189,167 | 94.1% | `"wide"`, `"legbyes"`, `"Overstep"` | Type of extra (`wide`, `legbyes`, `byes`, `Overstep`, `other`, `Penalty`). |
| `extras1_runs` | `int64` | 0 | 0.0% | `0`, `1`, `4` | First extras run increment. |
| `extras_2_runs` | `int64` | 0 | 0.0% | `0`, `1` | Second extras run increment (penalty / overthrow). |
| `pace_or_spin` | `object` | 0 | 0.0% | `"Pace"`, `"Spin"` | Broad discipline classification. |
| `bowl_speed` | `float64` | 0 | 0.0% | `0.0`, `142.5` | Delivery speed in km/h (predominantly 0 when radar unavailable). |
| `stroke` | `object` | 6,158 | 3.1% | `"Cover Drive"`, `"Pull"` | Shot type classification. |
| `delivery_style` | `object` | 391 | 0.2% | `"Outswing"`, `"Yorker"` | Trajectory / delivery classification. |
| `over_or_around` | `object` | 407 | 0.2% | `"Over"`, `"Around"` | Angle of attack from the wicket. |
| `on_or_off` | `object` | 0 | 0.0% | `"Off-side"`, `"On-side"`| Side of the pitch where the ball landed / was played. |
| `delivery_ist_time`| `object` | 0 | 0.0% | `"2024-04-14 14:00:00 UTC"` | Timestamp of the delivery event. |

---

### 2.2. `matches.csv` (883 rows × 22 columns)
Match-level conditions and outcomes.

| Column Name | Inferred Dtype | Null Count | Description |
|---|---|---|---|
| `match_id` | `int64` | 0 | Primary key. |
| `comp_id` | `int64` | 0 | Tournament foreign key. |
| `match_number` | `int64` | 0 | Match number within the season. |
| `match_date` | `object` | 0 | Calendar date of match (`YYYY-MM-DD`). |
| `stage` | `object` | 0 | `"League"`, `"Final"`, `"Qualifier 1"`, `"Qualifier 2"`, `"Eliminator"`, `"Semi Final"`. |
| `venue_id` | `int64` | 0 | Stadium identifier. |
| `venue_country` | `object` | 0 | Host country. |
| `home_team_id` / `away_team_id` | `int64` | 0 | Competing team IDs. |
| `home_team` / `away_team` | `object` | 0 | Franchise / nation names. |
| `toss_win_team_id` | `float64` | 15 | Winner of coin toss. |
| `toss_opted` | `object` | 15 | Decision (`"Batting"` or `"Fielding"`). |
| `man_of_the_match` | `int64` | 0 | Player of match award recipient ID. |
| `revised_target` | `float64` | 860 | DLS revised target in rain-shortened matches. |
| `knock_out` | `int64` | 0 | Binary flag (1 = Playoff / Knockout match, 0 = Group / League match). |
| `win_team_id` | `float64` | 41 | Winning team ID (null on abandoned / no-result games). |
| `result` | `object` | 0 | Outcome string (e.g. `"Rajasthan Royals Won by 7 Wickets"`). |

---

### 2.3. `competitions.csv` (141 rows × 4 columns)
| Column | Type | Sample Value | Notes |
|---|---|---|---|
| `comp_id` | `int64` | `3298` | Competition identifier |
| `comp_name` | `object` | `"IPL 2026"` | Official tournament name |
| `match_format` | `object` | `"T20"` / `"T20I"` | Format specification |
| `season` | `object` | `"2026"` | Calendar season |

---

### 2.4. `teams.csv` (353 rows × 3 columns)
Provides exact team IDs across all tournament instances.
- **Rajasthan Royals ID:** `3`

---

### 2.5. `playing_eleven.csv` (28,381 rows × 9 columns)
Tracks starting lineups, substitute impact players, and on-field roles.
- `batting_order`: Nominal position in lineup.
- `is_captain`, `is_wk`: Specialist role markers.
- `is_impact`, `is_impact_off`: Tactical substitutes under modern IPL Impact Player regulations.

---

### 2.6. `competition_team_player_mapping.csv` (6,413 rows × 6 columns)
Connects player identities across IPL franchises and international teams. Used to tag current IPL franchise and auction status.

---

## 3. Data Cleaning & Normalization Transformations

1. **Duplicate Elimination:** 38 redundant deliveries matching on `[match_id, innings, overid, over_ball_num, striker_id, bowler_id]` were excised.
2. **Delivery Legal Status Partitioning:**
   - `is_wide`: `extras_type == 'wide'` (does not consume a legal ball for batter or bowler).
   - `is_noball`: `extras_type in ['Overstep', 'other']` (consumes batter ball; does not consume legal ball for bowler).
   - `bat_ball`: `~is_wide` (delivery counted towards batter's strike rate and balls faced).
   - `bowl_ball`: `~is_wide & ~is_noball` (official legal delivery counted towards bowler's overs and economy).
3. **Total Runs per Ball:** `ball_runs = runs + extras1_runs + extras_2_runs`.
4. **Dot Balls:** `is_dot = (ball_runs == 0) & bowl_ball`.
5. **Name Normalization:** Stripped extraneous whitespace, standardizing aliases and diacritics across databases.
6. **Innings Target & Required Run Rate (RRR) Derivation:**
   - Innings 1 cumulative total computed per match.
   - Target = `revised_target` (if DLS applied) else `innings_1_total + 1`.
   - In 2nd innings: remaining runs = $\max(0, \text{Target} - \text{Cumulative Runs Before Ball})$.
   - Remaining legal deliveries = $\max(1, 120 - \text{Cumulative Legal Balls Bowled})$.
   - $\text{RRR} = \frac{\text{Remaining Runs}}{\text{Remaining Balls} / 6.0}$.

---

## 4. Derived Pressure Situations

A delivery is tagged as high-pressure based on dynamic match-state parameters:

### Batting Pressure (`bat_pressure = True`):
1. **Death Overs:** Overs 16–20 in any innings.
2. **Steep Chase (High RRR):** 2nd innings where the required run rate exceeds **10.0 runs/over**.
3. **Powerplay Collapse:** Overs 1–6 when 3 or more wickets have already fallen.
4. **Last 5 Overs of a Chase:** Overs 16–20 in 2nd innings regardless of score.
5. **Knockout / High-Stakes Pressure:** Matches with `knock_out == 1` or stage in `['Final', 'Qualifier', 'Eliminator', 'Semi Final']` during death or high-RRR phases.

### Bowling Pressure (`bowl_pressure = True`):
1. **Death Overs:** Overs 16–20 in any innings.
2. **Low-Total Defense:** Bowling in 2nd innings when defending a sub-par total ($< 150$ runs).
3. **Clutch Finish:** Chasing team requires $\le 40$ runs off the final 4 overs (overs 17–20).
4. **Knockout Crucial Spells:** Knockout powerplay (overs 1–6) or death overs (16–20).

---

## 5. Output Datasets
- **`data/processed/ball_by_ball_clean.csv`:** Cleaned and enriched delivery records with contextual pressure flags.
- **`frontend/public/data/dashboard.json` & `data/processed/dashboard.json`:** Production payload powering the interactive web application, including player ratings, radar coordinates, over-by-over heatmaps, season trends, and tactical fit notes.
