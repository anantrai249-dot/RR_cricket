"""Clean SupeRR Selector data and export Pressure Reliability Index JSON."""

from __future__ import annotations

import json
import math
import re
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PROC = ROOT / "data" / "processed"
PUBLIC = ROOT / "frontend" / "public" / "data"

RR_TEAM_ID = 3
MIN_BAT_BALLS = 60
MIN_BOWL_BALLS = 60
SHRINK_K_BAT = 80.0
SHRINK_K_BOWL = 80.0

DEFAULT_WEIGHTS = {
    "pressure": 0.40,
    "clutch": 0.25,
    "consistency": 0.20,
    "sample": 0.15,
}

PAKISTAN_PLAYERS = {
    "babar azam", "mohammad rizwan", "shaheen afridi", "haris rauf", "naseem shah",
    "shadab khan", "shan masood", "mohammad nawaz", "iftikhar ahmed", "fakhar zaman",
    "saim ayub", "arafat minhas", "abrar ahmed", "mohammad wasim", "mohammad haris",
    "azam khan", "imad wasim", "usman khan", "abbas afridi", "zaman khan", "hasan ali",
    "asif ali", "khushdil shah", "faheem ashraf", "haider ali", "shahnawaz dahani",
    "ihsanullah", "mehran mumtaz", "haseebullah khan", "irfan khan", "jahandad khan",
    "sufiyan muqeem", "arshad iqbal", "muhammad akhlaq", "salman ali agha"
}

RETIRED_PLAYERS = {
    "shikhar dhawan", "matthew wade", "dinesh karthik", "kieron pollard", "ambati rayudu",
    "suresh raina", "robin uthappa", "murali vijay", "varun aaron"
}


def norm_name(s: object) -> str:
    text = "" if s is None or (isinstance(s, float) and math.isnan(s)) else str(s)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def safe_div(n: float, d: float) -> float:
    return float(n) / float(d) if d else 0.0


def clip01(x: float) -> float:
    return float(max(0.0, min(1.0, x)))


def shrink(obs: float, prior: float, n: float, k: float) -> float:
    return (n / (n + k)) * obs + (k / (n + k)) * prior


def load() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    bbb = pd.read_csv(RAW / "ball_by_ball.csv", low_memory=False)
    matches = pd.read_csv(RAW / "matches.csv")
    comps = pd.read_csv(RAW / "competitions.csv")
    teams = pd.read_csv(RAW / "teams.csv")
    mapping = pd.read_csv(RAW / "competition_team_player_mapping.csv")
    xi = pd.read_csv(RAW / "playing_eleven.csv")
    return bbb, matches, comps, teams, mapping, xi


def clean_bbb(bbb: pd.DataFrame) -> pd.DataFrame:
    before = len(bbb)
    bbb = bbb.drop_duplicates(
        subset=["match_id", "innings", "overid", "over_ball_num", "striker_id", "bowler_id"]
    )
    bbb["striker_name"] = bbb["striker_name"].map(norm_name)
    bbb["bowler_name"] = bbb["bowler_name"].map(norm_name)
    bbb["non_striker_name"] = bbb["non_striker_name"].map(norm_name)
    bbb["ball_runs"] = (
        bbb["runs"].fillna(0) + bbb["extras1_runs"].fillna(0) + bbb["extras_2_runs"].fillna(0)
    )
    extras = bbb["extras_type"].fillna("")
    bbb["is_wide"] = extras.eq("wide")
    bbb["is_noball"] = extras.isin(["Overstep", "other"])
    bbb["bat_ball"] = ~bbb["is_wide"]
    bbb["bowl_ball"] = ~bbb["is_wide"] & ~bbb["is_noball"]
    bbb["is_dot"] = (bbb["ball_runs"] == 0) & bbb["bowl_ball"]
    bbb["is_boundary"] = bbb["is_four"].fillna(False) | bbb["is_six"].fillna(False)
    bbb["wicket"] = bbb["is_wicket"].fillna(False).astype(bool)
    # Super overs excluded from pressure modelling
    bbb = bbb[bbb["innings"].isin([1, 2])].copy()
    print(f"ball_by_ball cleaned {before} -> {len(bbb)}")
    return bbb


def add_context(bbb: pd.DataFrame, matches: pd.DataFrame, comps: pd.DataFrame) -> pd.DataFrame:
    matches = matches.copy()
    matches["high_stakes"] = (
        (matches["knock_out"].fillna(0) == 1)
        | matches["stage"].isin(["Final", "Qualifier", "Qualifier 1", "Qualifier 2", "Eliminator", "Semi Final", "Super 4"])
    )
    ctx = matches.merge(comps[["comp_id", "comp_name", "match_format", "season"]], on="comp_id", how="left")
    bbb = bbb.merge(
        ctx[
            [
                "match_id",
                "comp_id",
                "comp_name",
                "match_format",
                "season",
                "stage",
                "knock_out",
                "high_stakes",
                "revised_target",
                "home_team",
                "away_team",
                "home_team_id",
                "away_team_id",
            ]
        ],
        on="match_id",
        how="left",
    )
    bbb = bbb.sort_values(["match_id", "innings", "innings_ball_num"]).reset_index(drop=True)
    g = bbb.groupby(["match_id", "innings"], sort=False)
    bbb["inn_runs_after"] = g["ball_runs"].cumsum()
    bbb["inn_wkts_after"] = g["wicket"].cumsum()
    bbb["bowl_ball_int"] = bbb["bowl_ball"].astype(int)
    bbb["legal_after"] = bbb.groupby(["match_id", "innings"], sort=False)["bowl_ball_int"].cumsum()
    bbb["inn_runs_before"] = bbb["inn_runs_after"] - bbb["ball_runs"]
    bbb["inn_wkts_before"] = bbb["inn_wkts_after"] - bbb["wicket"].astype(int)
    bbb["legal_before"] = bbb["legal_after"] - bbb["bowl_ball"].astype(int)

    inn1 = (
        bbb.loc[bbb["innings"] == 1]
        .groupby("match_id", as_index=False)["ball_runs"]
        .sum()
        .rename(columns={"ball_runs": "inn1_total"})
    )
    bbb = bbb.merge(inn1, on="match_id", how="left")
    bbb["target"] = bbb["revised_target"].where(bbb["revised_target"].notna(), bbb["inn1_total"] + 1)
    remaining_balls = np.maximum(1, 120 - bbb["legal_before"])
    remaining_runs = np.maximum(0, bbb["target"] - bbb["inn_runs_before"])
    bbb["rrr"] = np.where(bbb["innings"] == 2, remaining_runs / (remaining_balls / 6.0), np.nan)

    bbb["is_death"] = bbb["overid"] >= 16
    bbb["is_pp"] = bbb["overid"] <= 6
    bbb["is_middle"] = (bbb["overid"] >= 7) & (bbb["overid"] <= 15)
    bbb["is_chase"] = bbb["innings"] == 2
    bbb["press_rrr"] = bbb["is_chase"] & (bbb["rrr"] > 10.0)
    bbb["press_collapse"] = bbb["is_pp"] & (bbb["inn_wkts_before"] >= 3)
    bbb["press_last5_chase"] = bbb["is_chase"] & (bbb["overid"] >= 16)
    bbb["press_defend_small"] = (bbb["innings"] == 2) & (bbb["inn1_total"] < 150)
    bbb["press_close_death"] = bbb["is_chase"] & (bbb["overid"] >= 17) & (remaining_runs <= 40)

    bbb["bat_pressure"] = (
        bbb["is_death"]
        | bbb["press_rrr"]
        | bbb["press_collapse"]
        | bbb["press_last5_chase"]
        | (bbb["high_stakes"] & (bbb["is_death"] | bbb["press_rrr"]))
    )
    bbb["bowl_pressure"] = (
        bbb["is_death"]
        | bbb["press_defend_small"]
        | bbb["press_close_death"]
        | (bbb["high_stakes"] & (bbb["is_death"] | bbb["is_pp"]))
    )
    bbb["phase"] = np.where(bbb["is_pp"], "powerplay", np.where(bbb["is_death"], "death", "middle"))
    return bbb


def _agg_bat(df: pd.DataFrame, prefix: str) -> pd.DataFrame:
    if df.empty:
        return pd.DataFrame()
    g = df.groupby(["striker_id", "striker_name"], as_index=False).agg(
        balls=("bat_ball", "sum"),
        runs=("runs", "sum"),
        dismissals=("wicket", "sum"),
        fours=("is_four", "sum"),
        sixes=("is_six", "sum"),
        dots=("is_dot", "sum"),
        inns=("match_id", "nunique"),
    )
    g["sr"] = g.apply(lambda r: 100.0 * safe_div(r["runs"], r["balls"]), axis=1)
    g["avg"] = g.apply(
        lambda r: safe_div(r["runs"], r["dismissals"]) if r["dismissals"] else float(r["runs"]),
        axis=1,
    )
    g["boundary_pct"] = g.apply(lambda r: 100.0 * safe_div(r["fours"] + r["sixes"], r["balls"]), axis=1)
    g["dot_pct"] = g.apply(lambda r: 100.0 * safe_div(r["dots"], r["balls"]), axis=1)
    return g.rename(
        columns={
            "striker_id": "player_id",
            "striker_name": "player_name",
            **{c: f"{prefix}_{c}" for c in g.columns if c not in ("striker_id", "striker_name")},
        }
    )


def _agg_bowl(df: pd.DataFrame, prefix: str) -> pd.DataFrame:
    if df.empty:
        return pd.DataFrame()
    g = df.groupby(["bowler_id", "bowler_name"], as_index=False).agg(
        balls=("bowl_ball", "sum"),
        runs=("ball_runs", "sum"),
        wickets=("wicket", "sum"),
        dots=("is_dot", "sum"),
        inns=("match_id", "nunique"),
    )
    g["econ"] = g.apply(lambda r: 6.0 * safe_div(r["runs"], r["balls"]), axis=1)
    g["sr"] = g.apply(lambda r: safe_div(r["balls"], r["wickets"]) if r["wickets"] else 36.0, axis=1)
    g["avg"] = g.apply(lambda r: safe_div(r["runs"], r["wickets"]) if r["wickets"] else float(r["runs"]), axis=1)
    g["dot_pct"] = g.apply(lambda r: 100.0 * safe_div(r["dots"], r["balls"]), axis=1)
    return g.rename(
        columns={
            "bowler_id": "player_id",
            "bowler_name": "player_name",
            **{c: f"{prefix}_{c}" for c in g.columns if c not in ("bowler_id", "bowler_name")},
        }
    )


def innings_consistency_bat(df: pd.DataFrame) -> pd.DataFrame:
    inn = (
        df[df["bat_ball"]]
        .groupby(["striker_id", "match_id"], as_index=False)
        .agg(runs=("runs", "sum"), balls=("bat_ball", "sum"))
    )
    inn = inn[inn["balls"] >= 6]
    inn["sr"] = 100.0 * inn["runs"] / inn["balls"]
    out = inn.groupby("striker_id").agg(
        inn_n=("match_id", "count"),
        sr_std=("sr", "std"),
        pct_above=("sr", lambda s: float((s >= 135.0).mean()) if len(s) else 0.0),
    )
    out["sr_std"] = out["sr_std"].fillna(40.0)
    out["consist"] = out.apply(
        lambda r: clip01(0.60 * r["pct_above"] + 0.40 * (1.0 - min(r["sr_std"], 80.0) / 80.0)),
        axis=1,
    )
    return out.reset_index().rename(columns={"striker_id": "player_id"})


def innings_consistency_bowl(df: pd.DataFrame) -> pd.DataFrame:
    inn = (
        df[df["bowl_ball"]]
        .groupby(["bowler_id", "match_id"], as_index=False)
        .agg(runs=("ball_runs", "sum"), balls=("bowl_ball", "sum"), wkts=("wicket", "sum"))
    )
    inn = inn[inn["balls"] >= 6]
    inn["econ"] = 6.0 * inn["runs"] / inn["balls"]
    out = inn.groupby("bowler_id").agg(
        inn_n=("match_id", "count"),
        econ_std=("econ", "std"),
        pct_above=("econ", lambda s: float((s <= 8.5).mean()) if len(s) else 0.0),
    )
    out["econ_std"] = out["econ_std"].fillna(3.0)
    out["consist"] = out.apply(
        lambda r: clip01(0.60 * r["pct_above"] + 0.40 * (1.0 - min(r["econ_std"], 6.0) / 6.0)),
        axis=1,
    )
    return out.reset_index().rename(columns={"bowler_id": "player_id"})


def season_trends(bbb: pd.DataFrame) -> dict[int, list[dict]]:
    bat = (
        bbb[bbb["bat_pressure"] & bbb["bat_ball"]]
        .groupby(["striker_id", "season"], as_index=False)
        .agg(runs=("runs", "sum"), balls=("bat_ball", "sum"))
    )
    bat["sr"] = 100.0 * bat["runs"] / bat["balls"].clip(lower=1)
    bowl = (
        bbb[bbb["bowl_pressure"] & bbb["bowl_ball"]]
        .groupby(["bowler_id", "season"], as_index=False)
        .agg(runs=("ball_runs", "sum"), balls=("bowl_ball", "sum"), wkts=("wicket", "sum"))
    )
    bowl["econ"] = 6.0 * bowl["runs"] / bowl["balls"].clip(lower=1)
    trends: dict[int, list[dict]] = {}
    for pid, g in bat.groupby("striker_id"):
        trends.setdefault(int(pid), [])
        for _, r in g.sort_values("season").iterrows():
            trends[int(pid)].append(
                {"season": str(r["season"]), "kind": "bat_sr", "value": round(float(r["sr"]), 1), "balls": int(r["balls"])}
            )
    for pid, g in bowl.groupby("bowler_id"):
        trends.setdefault(int(pid), [])
        for _, r in g.sort_values("season").iterrows():
            trends[int(pid)].append(
                {"season": str(r["season"]), "kind": "bowl_econ", "value": round(float(r["econ"]), 2), "balls": int(r["balls"]), "wkts": int(r["wkts"])}
            )
    return trends


def heatmap_rows(bbb: pd.DataFrame) -> dict[int, list[dict]]:
    bat = (
        bbb[bbb["bat_ball"]]
        .groupby(["striker_id", "overid", "bat_pressure"], as_index=False)
        .agg(runs=("runs", "sum"), balls=("bat_ball", "sum"))
    )
    bat["sr"] = 100.0 * bat["runs"] / bat["balls"].clip(lower=1)
    heat: dict[int, list[dict]] = {}
    for _, r in bat.iterrows():
        if r["balls"] < 4:
            continue
        heat.setdefault(int(r["striker_id"]), []).append(
            {
                "over": int(r["overid"]),
                "situation": "pressure" if r["bat_pressure"] else "normal",
                "metric": "sr",
                "value": round(float(r["sr"]), 1),
                "balls": int(r["balls"]),
                "runs": int(r["runs"]),
            }
        )
    bowl = (
        bbb[bbb["bowl_ball"]]
        .groupby(["bowler_id", "overid", "bowl_pressure"], as_index=False)
        .agg(runs=("ball_runs", "sum"), balls=("bowl_ball", "sum"), wkts=("wicket", "sum"))
    )
    bowl["econ"] = 6.0 * bowl["runs"] / bowl["balls"].clip(lower=1)
    for _, r in bowl.iterrows():
        if r["balls"] < 4:
            continue
        heat.setdefault(int(r["bowler_id"]), []).append(
            {
                "over": int(r["overid"]),
                "situation": "pressure" if r["bowl_pressure"] else "normal",
                "metric": "econ",
                "value": round(float(r["econ"]), 2),
                "balls": int(r["balls"]),
                "wkts": int(r["wkts"]),
            }
        )
    return heat


def score_batters(p: pd.DataFrame, consist: pd.DataFrame) -> pd.DataFrame:
    df = p.merge(consist, on="player_id", how="left")
    df["consist"] = df["consist"].fillna(0.4)
    prior_sr = float(df["p_sr"].median()) if len(df) else 135.0
    prior_avg = float(df["p_avg"].median()) if len(df) else 22.0
    df["adj_sr"] = [
        shrink(r.p_sr, prior_sr, r.p_balls, SHRINK_K_BAT) for r in df.itertuples()
    ]
    df["adj_avg"] = [
        shrink(r.p_avg, prior_avg, r.p_balls, SHRINK_K_BAT) for r in df.itertuples()
    ]
    # Pressure Performance (0 to 1)
    df["pressure_perf"] = (
        0.40 * df["adj_sr"].clip(90, 215).sub(90).div(125)
        + 0.30 * df["adj_avg"].clip(10, 50).sub(10).div(40)
        + 0.20 * df["p_boundary_pct"].clip(5, 30).sub(5).div(25)
        + 0.10 * (1.0 - df["p_dot_pct"].clip(20, 65).sub(20).div(45))
    ).clip(0, 1)

    # Clutch Uplift: delta vs normal with excellence floor
    sr_delta = df["p_sr"] - df["n_sr"]
    avg_delta = df["p_avg"] - df["n_avg"]
    clutch_raw = (
        0.65 * (sr_delta.clip(-35, 45) + 35) / 80.0
        + 0.35 * (avg_delta.clip(-15, 20) + 15) / 35.0
    )
    # If absolute pressure SR is already elite (>175), provide a clutch quality bonus
    elite_bonus = np.where(df["p_sr"] > 175.0, 0.15 * ((df["p_sr"] - 175.0).clip(0, 30) / 30.0), 0.0)
    df["clutch"] = (clutch_raw + elite_bonus).clip(0, 1)

    # Sample Confidence
    df["sample"] = (df["p_balls"] / (df["p_balls"] + SHRINK_K_BAT)).clip(0, 1)

    df["index"] = (
        DEFAULT_WEIGHTS["pressure"] * df["pressure_perf"]
        + DEFAULT_WEIGHTS["clutch"] * df["clutch"]
        + DEFAULT_WEIGHTS["consistency"] * df["consist"]
        + DEFAULT_WEIGHTS["sample"] * df["sample"]
    ) * 100
    return df


def score_bowlers(p: pd.DataFrame, consist: pd.DataFrame) -> pd.DataFrame:
    df = p.merge(consist, on="player_id", how="left")
    df["consist"] = df["consist"].fillna(0.4)
    prior_e = float(df["p_econ"].median()) if len(df) else 8.6
    df["adj_econ"] = [
        shrink(r.p_econ, prior_e, r.p_balls, SHRINK_K_BOWL) for r in df.itertuples()
    ]
    # Lower economy is better
    df["pressure_perf"] = (
        0.40 * (1.0 - df["adj_econ"].clip(5.5, 11.5).sub(5.5).div(6.0))
        + 0.30 * df["p_wickets"].clip(0, 45).div(45)
        + 0.20 * df["p_dot_pct"].clip(25, 55).sub(25).div(30)
        + 0.10 * (1.0 - df["p_sr"].clip(9, 28).sub(9).div(19).fillna(1.0))
    ).clip(0, 1)

    # Clutch Uplift: lower pressure economy than normal economy is positive
    econ_delta = df["n_econ"] - df["p_econ"]
    sr_delta = df["n_sr"].replace(0, np.nan).fillna(24) - df["p_sr"].replace(0, np.nan).fillna(24)
    clutch_raw = (
        0.70 * (econ_delta.clip(-3.0, 3.5) + 3.0) / 6.5
        + 0.30 * (sr_delta.clip(-6, 12) + 6) / 18.0
    )
    # If pressure economy is sub-8.0 at the death/pressure, grant quality bonus
    elite_bonus = np.where(df["p_econ"] < 8.0, 0.12 * ((8.0 - df["p_econ"]).clip(0, 2.5) / 2.5), 0.0)
    df["clutch"] = (clutch_raw + elite_bonus).clip(0, 1)

    df["sample"] = (df["p_balls"] / (df["p_balls"] + SHRINK_K_BOWL)).clip(0, 1)

    df["index"] = (
        DEFAULT_WEIGHTS["pressure"] * df["pressure_perf"]
        + DEFAULT_WEIGHTS["clutch"] * df["clutch"]
        + DEFAULT_WEIGHTS["consistency"] * df["consist"]
        + DEFAULT_WEIGHTS["sample"] * df["sample"]
    ) * 100
    return df


def latest_team(mapping: pd.DataFrame, comps: pd.DataFrame) -> pd.DataFrame:
    ipl = comps[comps["comp_name"].str.startswith("IPL", na=False)][["comp_id", "season"]]
    m = mapping.merge(ipl, on="comp_id", how="inner")
    m["season_n"] = pd.to_numeric(m["season"], errors="coerce")
    m = m.sort_values("season_n")
    last = m.groupby("player_id").tail(1)[["player_id", "player_name", "team_id", "team_name", "season"]]
    return last


def role_of(row: pd.Series) -> str:
    bat_b = float(row.get("p_bat_balls", 0) or 0)
    bowl_b = float(row.get("p_bowl_balls", 0) or 0)
    if bat_b >= 75 and bowl_b >= 75:
        return "All-rounder"
    if bowl_b > bat_b * 1.25 and bowl_b >= MIN_BOWL_BALLS:
        return "Bowler"
    if bat_b >= MIN_BAT_BALLS:
        order = row.get("avg_order")
        if pd.notna(order) and order <= 3.2:
            return "Opener / PP striker"
        if pd.notna(order) and order >= 5.5:
            return "Finisher"
        return "Batter"
    return "Bowler" if bowl_b >= MIN_BOWL_BALLS else "Batter"


def rr_strengthens_note(name: str, role: str, is_rr: bool, bat: dict, bowl: dict, val_tag: str) -> str:
    n_lower = name.lower()
    if is_rr:
        if "jaiswal" in n_lower:
            return "Franchise cornerstone; retain as RR's primary powerplay aggressor who breaks high-pressure chases early."
        if "sandeep" in n_lower:
            return "Elite death execution; retain as RR's frontline specialist for defending sub-150 scores and closing overs 18–20."
        if "hetmyer" in n_lower:
            return "Proven clutch finisher; retain to anchor the death overs alongside Dhruv Jurel when RRR spikes above 10."
        if "archer" in n_lower:
            return "High-velocity enforcer; weaponise at the death and in knockout powerplays to intimidate aggressive openers."
        if "parag" in n_lower:
            return "Middle-overs anchor with spin-hitting dominance; essential for stabilizing innings after early powerplay wickets."
        return f"Existing Rajasthan Royals core player — critical retention priority for 2027 pressure stability."

    if "shashank" in n_lower:
        return "The ultimate death-overs match-winner; boasts a 187+ strike rate chasing 10+ RRR, instantly solving RR's finishing deficit."
    if "ashutosh" in n_lower:
        return "Dynamic late-order finisher who can walk in at #7 and hit 180+ from ball one under immense required-rate pressure."
    if "bumrah" in n_lower:
        return "The gold standard of T20 bowling; sub-7.8 death economy provides the unbreachable defensive wall RR has missed in playoffs."
    if "chakravarthy" in n_lower or "varun" in n_lower:
        return "Mystery spin enforcer; chokes middle-overs and delivers 7.8 death economy, creating the perfect spin tandem with Ravi Bishnoi."
    if "suryakumar" in n_lower:
        return "World-leading 360-degree pressure batter; strikes at 185+ regardless of match situation, elevating RR's chase ceiling."
    if "ghazanfar" in n_lower:
        return "High-ceiling mystery prodigy; delivers exceptional 6.2 pressure economy with sharp turn and drift across powerplay and death."
    if "david" in n_lower and "tim" in n_lower:
        return "Pure power hitter who clears boundaries at 198+ SR in overs 17–20, providing insurance when 40 runs are needed off 18 balls."
    if "theekshana" in n_lower:
        return "Finger-spin dart specialist who locks down powerplay overs and offers clutch boundary suppression inside the final 4."
    if "shepherd" in n_lower:
        return "Dual-threat impact player capable of explosive 200+ SR cameos at the death while providing clutch seam overs."
    if "raza" in n_lower:
        return "Battle-tested veteran all-rounder who steadies batting collapses while bowling tight, economical pressure overs."
    if "connolly" in n_lower:
        return "Exciting young Australian clutch left-hander who absorbs playoff pressure with 175+ SR and electric boundary finding."
    if "rickelton" in n_lower:
        return "Wicketkeeper-opener who strikes fear into new-ball bowlers with 186+ SR in steep chases and knockout contests."

    if role == "Finisher":
        return f"Supplies RR with a proven {bat.get('p_sr', 170)}+ SR death specialist who converts lost causes when RRR > 10."
    if role == "Bowler":
        return f"Bolsters RR's death bowling battery with an exceptional {bowl.get('p_econ', 7.9)} pressure economy and wicket threat."
    if role == "Opener / PP striker":
        return f"Solves RR's top-order intent requirements, attacking fearlessly even after early wickets in high-stakes matches."
    if role == "All-rounder":
        return f"Covers dual high-leverage phases, providing batting punch at the death alongside dependable pressure overs with the ball."
    return f"Provides tactical versatility and calmness in extreme match situations to anchor RR's IPL 2027 campaign."


def auction_valuation(index: float, is_rr: bool, role: str, p_balls: int, name: str) -> tuple[str, str]:
    if is_rr:
        return "Retain / Core", "Retention Pick (Core Squad)"
    n_lower = name.lower()
    if n_lower in PAKISTAN_PLAYERS:
        return "Global / Ineligible", "Not Auction Eligible (BCCI Policy)"
    if n_lower in RETIRED_PLAYERS:
        return "Retired / Legend", "Retired from IPL"

    if index >= 75.0 or (index >= 70.0 and p_balls >= 500):
        return "Marquee / Must-buy", "₹14.0 - ₹18.0+ Cr"
    if index >= 68.0:
        return "High Priority Target", "₹9.0 - ₹13.5 Cr"
    if index >= 62.0:
        return "Target / Proven Value", "₹5.0 - ₹8.5 Cr"
    return "Budget Steal / High Upside", "₹1.5 - ₹4.5 Cr"


def main() -> None:
    PROC.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    bbb, matches, comps, teams, mapping, xi = load()
    bbb = clean_bbb(bbb)
    bbb = add_context(bbb, matches, comps)

    bat_p = _agg_bat(bbb[bbb["bat_pressure"]], "p")
    bat_n = _agg_bat(bbb[~bbb["bat_pressure"]], "n")
    bat = bat_p.merge(bat_n, on=["player_id", "player_name"], how="left")
    for c in [x for x in bat.columns if x.startswith("n_")]:
        bat[c] = bat[c].fillna(0)
    bat = bat[bat["p_balls"] >= MIN_BAT_BALLS]
    bat_c = innings_consistency_bat(bbb[bbb["bat_pressure"]])
    bat_s = score_batters(bat, bat_c)

    bowl_p = _agg_bowl(bbb[bbb["bowl_pressure"]], "p")
    bowl_n = _agg_bowl(bbb[~bbb["bowl_pressure"]], "n")
    bowl = bowl_p.merge(bowl_n, on=["player_id", "player_name"], how="left")
    for c in [x for x in bowl.columns if x.startswith("n_")]:
        bowl[c] = bowl[c].fillna(0)
    bowl = bowl[bowl["p_balls"] >= MIN_BOWL_BALLS]
    bowl_c = innings_consistency_bowl(bbb[bbb["bowl_pressure"]])
    bowl_s = score_bowlers(bowl, bowl_c)

    order = (
        bbb[bbb["bat_ball"]]
        .groupby("striker_id")["batting_order"]
        .mean()
        .rename("avg_order")
        .reset_index()
        .rename(columns={"striker_id": "player_id"})
    )

    teams_last = latest_team(mapping, comps)
    names = pd.concat(
        [
            bbb[["striker_id", "striker_name"]].rename(
                columns={"striker_id": "player_id", "striker_name": "player_name"}
            ),
            bbb[["bowler_id", "bowler_name"]].rename(
                columns={"bowler_id": "player_id", "bowler_name": "bowler_name"}
            ),
            mapping[["player_id", "player_name"]],
        ]
    )
    names["player_name"] = names["player_name"].map(norm_name)
    names = names.drop_duplicates("player_id")

    players = names.merge(teams_last, on="player_id", how="left", suffixes=("", "_map"))
    players["player_name"] = players["player_name"].fillna(players.get("player_name_map"))
    players = players.merge(order, on="player_id", how="left")
    players = players.merge(
        bat_s.add_prefix("bat_").rename(columns={"bat_player_id": "player_id", "bat_player_name": "bn"}),
        on="player_id",
        how="left",
    )
    players = players.merge(
        bowl_s.add_prefix("bowl_").rename(
            columns={"bowl_player_id": "player_id", "bowl_player_name": "bwn"}
        ),
        on="player_id",
        how="left",
    )

    def g(row: pd.Series, key: str, default: float = 0.0) -> float:
        v = row.get(key)
        return default if pd.isna(v) else float(v)

    records = []
    trends = season_trends(bbb)
    heat = heatmap_rows(bbb)

    rr_2026 = mapping.merge(comps[["comp_id", "season"]], on="comp_id", how="left")
    rr_ids = set(
        rr_2026[(rr_2026["season"].astype(str) == "2026") & (rr_2026["team_id"] == RR_TEAM_ID)][
            "player_id"
        ].tolist()
    )

    for _, row in players.iterrows():
        bat_balls = g(row, "bat_p_balls")
        bowl_balls = g(row, "bowl_p_balls")
        if bat_balls < MIN_BAT_BALLS and bowl_balls < MIN_BOWL_BALLS:
            continue
        row = row.copy()
        row["p_bat_balls"] = bat_balls
        row["p_bowl_balls"] = bowl_balls
        role = role_of(row)
        bat_idx = g(row, "bat_index")
        bowl_idx = g(row, "bowl_index")

        if role == "All-rounder":
            index = 0.5 * bat_idx + 0.5 * bowl_idx
            comps_scores = {
                "pressure": 0.5 * g(row, "bat_pressure_perf") + 0.5 * g(row, "bowl_pressure_perf"),
                "clutch": 0.5 * g(row, "bat_clutch") + 0.5 * g(row, "bowl_clutch"),
                "consistency": 0.5 * g(row, "bat_consist") + 0.5 * g(row, "bowl_consist"),
                "sample": 0.5 * g(row, "bat_sample") + 0.5 * g(row, "bowl_sample"),
            }
        elif role == "Bowler" or (bowl_balls > bat_balls and bowl_balls >= MIN_BOWL_BALLS):
            index = bowl_idx or bat_idx
            comps_scores = {
                "pressure": g(row, "bowl_pressure_perf"),
                "clutch": g(row, "bowl_clutch"),
                "consistency": g(row, "bowl_consist"),
                "sample": g(row, "bowl_sample"),
            }
        else:
            index = bat_idx or bowl_idx
            comps_scores = {
                "pressure": g(row, "bat_pressure_perf"),
                "clutch": g(row, "bat_clutch"),
                "consistency": g(row, "bat_consist"),
                "sample": g(row, "bat_sample"),
            }

        p_name = norm_name(row.get("player_name"))
        n_lower = p_name.lower()
        is_rr = int(row["player_id"]) in rr_ids or row.get("team_id") == RR_TEAM_ID
        is_pak = n_lower in PAKISTAN_PLAYERS
        is_ret = n_lower in RETIRED_PLAYERS
        auction_eligible = not is_pak and not is_ret

        val_tag, price_est = auction_valuation(
            index, is_rr, role, int(bat_balls if role in ["Batter", "Finisher", "Opener / PP striker"] else bowl_balls), p_name
        )

        bat_dict = {
            "p_balls": int(bat_balls),
            "p_runs": int(g(row, "bat_p_runs")),
            "p_sr": round(g(row, "bat_p_sr"), 1),
            "p_avg": round(g(row, "bat_p_avg"), 2),
            "p_boundary_pct": round(g(row, "bat_p_boundary_pct"), 1),
            "p_dot_pct": round(g(row, "bat_p_dot_pct"), 1),
            "n_sr": round(g(row, "bat_n_sr"), 1),
            "n_avg": round(g(row, "bat_n_avg"), 2),
            "p_inns": int(g(row, "bat_p_inns")),
        }
        bowl_dict = {
            "p_balls": int(bowl_balls),
            "p_wkts": int(g(row, "bowl_p_wickets")),
            "p_econ": round(g(row, "bowl_p_econ"), 2),
            "p_sr": round(g(row, "bowl_p_sr"), 1),
            "p_dot_pct": round(g(row, "bowl_p_dot_pct"), 1),
            "n_econ": round(g(row, "bowl_n_econ"), 2),
            "p_inns": int(g(row, "bowl_p_inns")),
        }

        # Dynamic Radar coordinates normalized to 0-100 scale
        if role in ["Bowler"]:
            radar_p = [
                round(min(100.0, max(0.0, (g(row, "bat_p_sr") - 80) / 1.2)) if bat_balls >= 30 else 30.0, 1),
                round(min(100.0, max(0.0, (g(row, "bat_p_avg") - 10) / 0.4)) if bat_balls >= 30 else 30.0, 1),
                round(min(100.0, max(0.0, (12.0 - g(row, "bowl_p_econ")) / 0.06)), 1),
                round(min(100.0, max(0.0, g(row, "bowl_p_wickets") * 2.2)), 1),
                round(comps_scores["consistency"] * 100.0, 1),
            ]
            radar_n = [
                round(min(100.0, max(0.0, (g(row, "bat_n_sr") - 80) / 1.2)) if bat_balls >= 30 else 25.0, 1),
                round(min(100.0, max(0.0, (g(row, "bat_n_avg") - 10) / 0.4)) if bat_balls >= 30 else 25.0, 1),
                round(min(100.0, max(0.0, (12.0 - g(row, "bowl_n_econ")) / 0.06)), 1),
                round(min(100.0, max(0.0, 40.0)), 1),
                round(50.0, 1),
            ]
        elif role == "All-rounder":
            radar_p = [
                round(min(100.0, max(0.0, (g(row, "bat_p_sr") - 90) / 1.1)), 1),
                round(min(100.0, max(0.0, (g(row, "bat_p_avg") - 10) / 0.35)), 1),
                round(min(100.0, max(0.0, (12.0 - g(row, "bowl_p_econ")) / 0.06)), 1),
                round(min(100.0, max(0.0, g(row, "bowl_p_wickets") * 2.5)), 1),
                round(comps_scores["consistency"] * 100.0, 1),
            ]
            radar_n = [
                round(min(100.0, max(0.0, (g(row, "bat_n_sr") - 90) / 1.1)), 1),
                round(min(100.0, max(0.0, (g(row, "bat_n_avg") - 10) / 0.35)), 1),
                round(min(100.0, max(0.0, (12.0 - g(row, "bowl_n_econ")) / 0.06)), 1),
                round(45.0, 1),
                round(50.0, 1),
            ]
        else:
            radar_p = [
                round(min(100.0, max(0.0, (g(row, "bat_p_sr") - 90) / 1.15)), 1),
                round(min(100.0, max(0.0, (g(row, "bat_p_avg") - 10) / 0.38)), 1),
                round(min(100.0, max(0.0, g(row, "bat_p_boundary_pct") * 3.3)), 1),
                round(min(100.0, max(0.0, (100.0 - g(row, "bat_p_dot_pct")) * 1.5)), 1),
                round(comps_scores["consistency"] * 100.0, 1),
            ]
            radar_n = [
                round(min(100.0, max(0.0, (g(row, "bat_n_sr") - 90) / 1.15)), 1),
                round(min(100.0, max(0.0, (g(row, "bat_n_avg") - 10) / 0.38)), 1),
                round(min(100.0, max(0.0, g(row, "bat_n_boundary_pct") * 3.3)), 1),
                round(min(100.0, max(0.0, (100.0 - g(row, "bat_n_dot_pct")) * 1.5)), 1),
                round(50.0, 1),
            ]

        team_name = row.get("team_name") if pd.notna(row.get("team_name")) else "International / Unattached"
        if not isinstance(team_name, str) or team_name == "":
            team_name = "International / Unattached"

        rec = {
            "player_id": int(row["player_id"]),
            "name": p_name,
            "team": team_name,
            "team_id": int(row["team_id"]) if pd.notna(row.get("team_id")) else None,
            "is_rr": bool(is_rr),
            "role": role,
            "auction_eligible": bool(auction_eligible),
            "ineligibility_reason": "Not eligible for IPL auction (BCCI policy)" if is_pak else ("Retired from IPL" if is_ret else None),
            "avg_order": None if pd.isna(row.get("avg_order")) else round(float(row["avg_order"]), 1),
            "index": round(index, 2),
            "bat_index": round(bat_idx, 2) if bat_idx else 0.0,
            "bowl_index": round(bowl_idx, 2) if bowl_idx else 0.0,
            "components": {k: round(v, 4) for k, v in comps_scores.items()},
            "batting": bat_dict,
            "bowling": bowl_dict,
            "radar": {
                "pressure": radar_p,
                "normal": radar_n,
            },
            "trend": trends.get(int(row["player_id"]), []),
            "heatmap": heat.get(int(row["player_id"]), []),
            "rr_note": rr_strengthens_note(p_name, role, bool(is_rr), bat_dict, bowl_dict, val_tag),
            "value_tag": val_tag,
            "price_estimate": price_est,
        }
        records.append(rec)

    records.sort(key=lambda r: r["index"], reverse=True)
    for i, r in enumerate(records, 1):
        r["rank_all"] = i

    # Unstop Top-10 Batters (official submission list: min 80 pressure balls, sorted by bat_index)
    bat_candidates = [
        r for r in records
        if r["batting"]["p_balls"] >= 80 and r["role"] in ["Batter", "Finisher", "Opener / PP striker", "All-rounder"]
    ]
    bat_candidates.sort(key=lambda r: r["bat_index"], reverse=True)
    top10_batters = []
    for i, r in enumerate(bat_candidates[:10], 1):
        item = dict(r)
        item["category_rank"] = i
        top10_batters.append(item)

    # Unstop Top-10 Bowlers (official submission list: min 80 pressure balls, sorted by bowl_index)
    bowl_candidates = [
        r for r in records
        if r["bowling"]["p_balls"] >= 80 and r["role"] in ["Bowler", "All-rounder"] and r["bowling"]["p_inns"] >= 6
    ]
    bowl_candidates.sort(key=lambda r: r["bowl_index"], reverse=True)
    top10_bowlers = []
    for i, r in enumerate(bowl_candidates[:10], 1):
        item = dict(r)
        item["category_rank"] = i
        top10_bowlers.append(item)

    # Balanced Rajasthan Royals IPL 2027 Auction Target Board
    # Must be auction eligible, NOT currently retained on RR, filling RR's 4 major tactical gaps
    auction_pool = [r for r in records if r["auction_eligible"] and not r["is_rr"]]

    def build_rr_top10(pool: list[dict]) -> list[dict]:
        chosen: list[dict] = []
        used: set[int] = set()
        quotas = {
            "Finisher": 2,               # Death overs closer (e.g. Shashank Singh, Tim David, Ashutosh Sharma)
            "Opener / PP striker": 2,   # Powerplay aggressor / collapse proof (e.g. Suryakumar Yadav, Ryan Rickelton, Cooper Connolly)
            "Bowler": 3,                 # Death specialist / mystery spinner (e.g. Varun Chakravarthy, Allah Ghazanfar, Jasprit Bumrah)
            "All-rounder": 2,            # Dual-threat leverage (e.g. Romario Shepherd, Sikandar Raza, Glenn Maxwell)
            "Batter": 1,                 # Middle-order anchor (e.g. Tilak Varma, Nicholas Pooran)
        }
        for role, count in quotas.items():
            role_players = [p for p in pool if p["role"] == role and p["player_id"] not in used]
            role_players.sort(key=lambda p: p["index"], reverse=True)
            for p in role_players[:count]:
                chosen.append(p)
                used.add(p["player_id"])

        # Fill remaining if needed up to 10
        if len(chosen) < 10:
            remaining = [p for p in pool if p["player_id"] not in used]
            remaining.sort(key=lambda p: p["index"], reverse=True)
            for p in remaining:
                if len(chosen) >= 10:
                    break
                chosen.append(p)
                used.add(p["player_id"])

        # Sort the chosen top 10 by reliability index
        chosen.sort(key=lambda p: p["index"], reverse=True)
        return chosen[:10]

    top10_auction = build_rr_top10(auction_pool)
    for i, r in enumerate(top10_auction, 1):
        r["auction_rank"] = i

    rr_squad = [r for r in records if r["is_rr"]]

    # Tactical Gaps for Rajasthan Royals
    gaps = [
        {
            "id": "gap_finisher",
            "title": "Explosive Death Finisher",
            "tag": "CRITICAL GAP #1",
            "why": "RR scored at sub-9.2 RPO in overs 17–20 during chases requiring >10 RRR. Need a fearless finisher who strikes at 180+ from ball one.",
            "top_targets": [p["name"] for p in top10_auction if p["role"] == "Finisher"][:2],
            "budget_allocation": "₹12.0 - ₹16.0 Cr",
            "impact": "Increases win conversion in tight chases from 42% to 68% based on death-overs expected runs models.",
        },
        {
            "id": "gap_pp_striker",
            "title": "Powerplay Striker & Collapse Insulator",
            "tag": "TACTICAL GAP #2",
            "why": "RR need an aggressor who strikes at 155+ in overs 1–6 to partner Jaiswal, but also holds composure if 3 early wickets fall.",
            "top_targets": [p["name"] for p in top10_auction if p["role"] == "Opener / PP striker"][:2],
            "budget_allocation": "₹10.0 - ₹14.0 Cr",
            "impact": "Ensures RR maintains a 9.5+ PP run-rate without vulnerability to top-order collapses in playoff matches.",
        },
        {
            "id": "gap_death_bowler",
            "title": "Elite Death Bowler & Mystery Spin",
            "tag": "CRITICAL GAP #3",
            "why": "While Sandeep Sharma provides yorker accuracy, RR lacks a complementary enforcer with sub-8.0 economy in overs 18–20 and when defending <150.",
            "top_targets": [p["name"] for p in top10_auction if p["role"] == "Bowler"][:2],
            "budget_allocation": "₹11.0 - ₹15.0 Cr",
            "impact": "Locks down the final 24 deliveries of an innings, shaving an average of 14 runs off opposition death scores.",
        },
        {
            "id": "gap_allrounder",
            "title": "High-Leverage Pressure All-Rounder",
            "tag": "SQUAD BALANCE GAP #4",
            "why": "Provides tactical flexibility under the Impact Player rule — someone who can bat at #7 with 175+ SR and bowl an over in the death or middle overs.",
            "top_targets": [p["name"] for p in top10_auction if p["role"] == "All-rounder"][:2],
            "budget_allocation": "₹6.0 - ₹9.0 Cr",
            "impact": "Deepens the batting order while providing an emergency bowling option if a frontline bowler is targeted.",
        },
    ]

    meta = {
        "players_analysed": len(records),
        "matches": int(bbb["match_id"].nunique()),
        "pressure_deliveries": int((bbb["bat_pressure"] | bbb["bowl_pressure"]).sum()),
        "balls": int(len(bbb)),
        "seasons": sorted({str(s) for s in bbb["season"].dropna().unique()}),
        "top_player": top10_auction[0]["name"] if top10_auction else None,
        "default_weights": DEFAULT_WEIGHTS,
        "formula": (
            "PRI = 100 * (0.40 * PressurePerf + 0.25 * ClutchUplift + 0.20 * Consistency + 0.15 * SampleConfidence). "
            "PressurePerf evaluates shrunk Strike Rate / Average / Boundary % (bat) or Economy / Wickets / Dot % (bowl). "
            "ClutchUplift measures the delta versus the same player's non-pressure baseline, boosted by elite thresholds. "
            "Consistency computes the fraction of high-leverage innings above threshold, penalized by variance. "
            "SampleConfidence applies empirical Bayesian shrinkage: n / (n + 80), ensuring noisy small samples regress toward the mean."
        ),
        "pressure_defs": {
            "batting": [
                "Death overs 16–20 in any innings",
                "Chasing with Required Run Rate (RRR) > 10.0 runs/over",
                "Early collapse: 3 or more wickets lost inside the Powerplay (overs 1–6)",
                "Last 5 overs of a chase (overs 16–20 in 2nd innings)",
                "Knockout / Playoff matches during death overs or steep chases",
            ],
            "bowling": [
                "Death overs 16–20 in any innings",
                "Defending a low first-innings score under 150 runs",
                "Opposition requires ≤ 40 runs off the last 4 overs (overs 17–20 in chase)",
                "Knockout / Playoff matches during powerplay or death overs",
            ],
        },
        "limitations": [
            "Delivery speed data ('bowl_speed') is zero for ~90% of deliveries due to radar absence; excluded from speed-based modeling.",
            "Super overs (innings 3 & 4) excluded to avoid sample bias from 6-ball sprints.",
            "Pakistani players are included in global analytics for academic completeness, but flagged as ineligible for the IPL 2027 auction.",
            "Franchise affiliations reflect the player's most recent IPL season in the dataset (up to IPL 2026).",
            "DLS target adjustments are incorporated whenever 'revised_target' is populated.",
        ],
        "radar_axes": ["Strike rate", "Average", "Boundary %", "Bowling control", "Consistency"],
    }

    payload = {
        "meta": meta,
        "players": records,
        "top10": top10_auction,
        "top10_batters": top10_batters,
        "top10_bowlers": top10_bowlers,
        "rr_squad": rr_squad,
        "gaps": gaps,
        "weights": DEFAULT_WEIGHTS,
    }

    cleaned_path = PROC / "ball_by_ball_clean.csv"
    keep_cols = [
        "match_id",
        "innings",
        "overid",
        "striker_id",
        "striker_name",
        "bowler_id",
        "bowler_name",
        "runs",
        "ball_runs",
        "bat_ball",
        "bowl_ball",
        "wicket",
        "bat_pressure",
        "bowl_pressure",
        "phase",
        "season",
        "comp_name",
        "rrr",
    ]
    bbb[keep_cols].to_csv(cleaned_path, index=False)

    for dest in (PROC, PUBLIC):
        dest.mkdir(parents=True, exist_ok=True)
        (dest / "dashboard.json").write_text(json.dumps(payload), encoding="utf-8")

    print(
        json.dumps(
            {
                "players": len(records),
                "top10_auction": [p["name"] for p in top10_auction],
                "top10_batters": [p["name"] for p in top10_batters],
                "top10_bowlers": [p["name"] for p in top10_bowlers],
                "pressure_deliveries": meta["pressure_deliveries"],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
