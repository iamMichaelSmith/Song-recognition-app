from pathlib import Path

req = ["README.md", "app.js", "server.py", "config.example.js", "config.js"]
miss = [p for p in req if not Path(p).exists()]
if miss:
    raise SystemExit(f"Missing: {miss}")

app_js = Path("app.js").read_text(encoding="utf-8")
if "e460f49f21abb45069803db0a41a4693" in app_js:
    raise SystemExit("Hardcoded AudD token still present in app.js")

if "window.APP_CONFIG" not in app_js:
    raise SystemExit("Runtime config hook missing from app.js")

index_html = Path("index.html").read_text(encoding="utf-8")
if 'src="config.js"' not in index_html:
    raise SystemExit("index.html must load config.js before app.js")

print("Smoke OK")
