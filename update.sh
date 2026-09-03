#!/bin/bash
# One-click weekly update for GrammarPath audio.
# Starts Kokoro if needed, regenerates changed articles' voice, commits & pushes.
# Usage:  cd ~/github/grammarpath && ./update.sh
set -e

SITE="$HOME/github/grammarpath"
KOKORO="$HOME/github/Kokoro-FastAPI"
cd "$SITE"

echo "① Getting latest…"
git pull --quiet || true

# Start Kokoro only if it isn't already running
if ! curl -s -m 2 http://localhost:8880/health >/dev/null 2>&1; then
  echo "② Starting Kokoro (first time can take ~30s)…"
  ( cd "$KOKORO" && ./start-gpu_mac.sh >/tmp/kokoro.log 2>&1 & )
  for i in $(seq 1 50); do
    curl -s -m 2 http://localhost:8880/health >/dev/null 2>&1 && break
    sleep 3
  done
  STARTED_KOKORO=1
else
  echo "② Kokoro already running."
fi

echo "③ Generating voice for new / changed articles…"
node tools/gen_audio.mjs

echo "④ Publishing…"
git add -A
if git diff --cached --quiet; then
  echo "   Nothing changed — already up to date."
else
  git commit -m "update audio $(date +%F)"
  git push
  echo "   Pushed. GitHub Pages will update in ~1 minute."
fi

# If this script started Kokoro, stop it again to free the machine
if [ "$STARTED_KOKORO" = "1" ]; then
  pkill -f "uvicorn api.src.main:app" 2>/dev/null || true
  echo "   Kokoro stopped."
fi

echo "✓ All done: https://arink393-ai.github.io/grammarpath/"
