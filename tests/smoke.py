from pathlib import Path
req=["README.md","app.js","server.py"]
miss=[p for p in req if not Path(p).exists()]
if miss:
    raise SystemExit(f"Missing: {miss}")
print("Smoke OK")
