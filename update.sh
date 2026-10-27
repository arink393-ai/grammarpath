#!/bin/bash
# One-click weekly news update for English Cat Island.
#
#   Weekly flow:
#     1. Add the new article to the `const READINGS = [ ... ]` array in index.html
#        (id / topic / zh / src / date / week / tag / icon + levels.{a,b,c} + discuss).
#        Give it the newest `week:` label (e.g. "9/14–9/20") — that alone makes it the
#        featured "本週選文 / 本週推薦" and puts it at the top of the list, automatically.
#     2. Run this script.  It generates the Kokoro voice for the new article, then
#        commits and pushes.  GitHub Pages redeploys in ~1 minute.
#
#   Usage:  cd ~/github/grammarpath && ./update.sh          （只發佈音檔與音檔清單）
#           cd ~/github/grammarpath && ./update.sh --all    （連同資料夾裡所有修改一起發佈）
set -e

SITE="$HOME/github/grammarpath"
KOKORO="$HOME/github/Kokoro-FastAPI"
cd "$SITE"

echo "① Getting latest (keeping your local edits)…"
git pull --rebase --autostash --quiet || true

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

echo "③ Generating real-voice audio for new / changed articles…"
node tools/gen_audio.mjs

echo "④ Publishing…"
# 只提交這支腳本自己產生的東西：audio/ 的 MP3 與 .hashes.json，以及 index.html 裡的 RD_AUDIO 音檔清單。
# 不用 git add -A —— 別的工作階段放在資料夾裡、還沒做完的修改不會被一起送上線。
# 想照舊把所有修改一起發佈（例如你手動在 index.html 加了新文章）：./update.sh --all
if [ "$1" = "--all" ]; then
  git add -A
else
  git add audio
  python3 tools/stage_rd_audio.py
fi
if git diff --cached --quiet; then
  echo "   Nothing changed — already up to date."
else
  git commit -m "weekly reading update $(date +%F)"
  git push
  echo "   Pushed. GitHub Pages will update in ~1 minute."
fi

# If this script started Kokoro, stop it again to free the machine
if [ "$STARTED_KOKORO" = "1" ]; then
  pkill -f "uvicorn api.src.main:app" 2>/dev/null || true
  echo "   Kokoro stopped."
fi

echo "✓ All done — the newest article is now the featured 本週選文 / 本週推薦."
echo "  https://arink393-ai.github.io/grammarpath/#/reading"
