#!/usr/bin/env node
/*
  gen_audio.mjs — render the weekly reading articles to natural Kokoro voice.

  What it does:
    1. reads index.html and pulls out the READINGS data
    2. for each article × level (A1-A2 / B1-B2 / C1-C2) sends the text to a local
       Kokoro-FastAPI server and saves an mp3 under ./audio
    3. injects the id→level→file manifest back into index.html (RD_AUDIO)
    4. remembers a hash of each text, so re-runs only synthesise what changed

  Prereq: start Kokoro once in another terminal —
    cd ~/github/Kokoro-FastAPI && ./start-gpu_mac.sh
  Then from the site folder:
    node tools/gen_audio.mjs            # only new / changed articles
    node tools/gen_audio.mjs --force    # re-render everything

  Config via env: KOKORO_URL (default http://localhost:8880), VOICE (default af_heart).
*/
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT     = process.cwd();
const HTML     = path.join(ROOT, "index.html");
const AUDIODIR = path.join(ROOT, "audio");
const HASHES   = path.join(AUDIODIR, ".hashes.json");
const KOKORO   = (process.env.KOKORO_URL || "http://localhost:8880").replace(/\/$/, "");
const VOICE    = process.env.VOICE || "af_heart";
const FORCE    = process.argv.includes("--force");
const SPEED    = { a: 0.82, b: 0.90, c: 0.96 };   // beginners a little slower
const LEVELS   = ["a", "b", "c"];

// --- pull the `const READINGS = [ ... ];` array literal out of the HTML ---
function extractArrayLiteral(src, marker) {
  const m = src.indexOf(marker);
  if (m < 0) throw new Error("marker not found: " + marker);
  const start = src.indexOf("[", m);
  let depth = 0, inStr = false, q = "", esc = false;
  for (let j = start; j < src.length; j++) {
    const c = src[j];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === q) inStr = false;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = true; q = c; }
    else if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) return src.slice(start, j + 1); }
  }
  throw new Error("array end not found");
}

async function synth(text, speed) {
  const res = await fetch(KOKORO + "/v1/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "kokoro", voice: VOICE, input: text, response_format: "mp3", speed }),
  });
  if (!res.ok) throw new Error("Kokoro " + res.status + ": " + (await res.text()).slice(0, 200));
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error("suspiciously small audio (" + buf.length + " bytes)");
  return buf;
}

async function main() {
  // health check
  try {
    const h = await fetch(KOKORO + "/health");
    if (!h.ok) throw new Error("status " + h.status);
  } catch (e) {
    console.error(`\n✗ Cannot reach Kokoro at ${KOKORO}. Start it first:\n  cd ~/github/Kokoro-FastAPI && ./start-gpu_mac.sh\n`);
    process.exit(1);
  }

  const html = fs.readFileSync(HTML, "utf8");
  const READINGS = eval(extractArrayLiteral(html, "const READINGS = ["));
  fs.mkdirSync(AUDIODIR, { recursive: true });
  const hashes = fs.existsSync(HASHES) ? JSON.parse(fs.readFileSync(HASHES, "utf8")) : {};

  const manifest = {};
  let made = 0, skipped = 0;

  for (const r of READINGS) {
    for (const lvl of LEVELS) {
      const lv = r.levels && r.levels[lvl];
      if (!lv) continue;
      const text = (lv.title + ". " + lv.text.join(" ")).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
      const speed = SPEED[lvl] ?? 0.92;
      const key = `${r.id}-${lvl}`;
      const rel = `audio/${key}.mp3`;
      const abs = path.join(ROOT, rel);
      const sig = crypto.createHash("sha256").update(VOICE + "|" + speed + "|" + text).digest("hex");

      manifest[r.id] = manifest[r.id] || {};
      manifest[r.id][lvl] = rel;

      if (!FORCE && hashes[key] === sig && fs.existsSync(abs)) { skipped++; continue; }

      process.stdout.write(`♪ ${key} (${text.length} chars, speed ${speed}) … `);
      const buf = await synth(text, speed);
      fs.writeFileSync(abs, buf);
      hashes[key] = sig;
      made++;
      console.log(`${(buf.length / 1024).toFixed(0)} KB`);
    }
  }

  fs.writeFileSync(HASHES, JSON.stringify(hashes, null, 0));

  // inject manifest into index.html
  const injected = html.replace(
    /\/\*RD_AUDIO_START\*\/[\s\S]*?\/\*RD_AUDIO_END\*\//,
    `/*RD_AUDIO_START*/const RD_AUDIO=${JSON.stringify(manifest)};/*RD_AUDIO_END*/`
  );
  if (injected === html && !/RD_AUDIO_START/.test(html)) {
    console.error("✗ RD_AUDIO markers not found in index.html — add them near rdSpeak().");
    process.exit(1);
  }
  fs.writeFileSync(HTML, injected);

  console.log(`\n✓ Done. Synthesised ${made}, reused ${skipped}. Voice: ${VOICE}. Manifest injected into index.html.`);
  console.log("  Next: git add audio index.html && git commit && git push");
}

main().catch((e) => { console.error("\n✗ " + e.message); process.exit(1); });
