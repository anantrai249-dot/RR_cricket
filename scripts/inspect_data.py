from pathlib import Path
import pandas as pd

raw = Path(r"C:\Users\anant\super-selector-s2\data\raw")
out = Path(r"C:\Users\anant\super-selector-s2\data\inspect_report.txt")
lines: list[str] = []
for f in sorted(raw.glob("*.csv")):
    df = pd.read_csv(f, low_memory=False)
    lines.append("=" * 80)
    lines.append(f"{f.name} rows={len(df)} cols={df.shape[1]}")
    lines.append(f"COLUMNS: {list(df.columns)}")
    lines.append("NULLS:")
    lines.append(df.isna().sum().to_string())
    lines.append("DTYPES:")
    lines.append(df.dtypes.astype(str).to_string())
    lines.append("SAMPLE:")
    lines.append(df.head(3).to_string())
    lines.append("")
out.write_text("\n".join(lines), encoding="utf-8")
print(f"wrote {out} ({len(lines)} lines)")
