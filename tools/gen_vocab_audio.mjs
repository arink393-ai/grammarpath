#!/usr/bin/env node
/*
  gen_vocab_audio.mjs — Kokoro 真人發音 for every vocab headword.

  Reads all `w:` headwords from vocab/books.js + vocab/data/*.js, dedupes,
  and renders each to an mp3 at  vocab/audio/<shard>/<slug>.mp3  via the local
  Kokoro-FastAPI server. Resumable: existing files are skipped.

  Prereq: Kokoro running —  cd ~/github/Kokoro-FastAPI && ./start-gpu_mac.sh
  Run:    node tools/gen_vocab_audio.mjs            # fill in what's missing
          node tools/gen_vocab_audio.mjs --limit 20 # just first 20 (test)
          node tools/gen_vocab_audio.mjs --force    # re-render everything
  Env:    KOKORO_URL (default http://localhost:8880), VOICE (af_heart),
          CONC (parallel requests, default 6), SPEED (default 0.95)

  The slug/shard scheme MUST match the browser (vocab/app.js vqAudioUrl & app speak).
*/
import fs from "fs";
import path from "path";

const ROOT   = process.cwd();
const OUTDIR = path.join(ROOT, "vocab", "audio");
const KOKORO = (process.env.KOKORO_URL || "http://localhost:8880").replace(/\/$/, "");
const VOICE  = process.env.VOICE || "af_heart";
const SPEED  = parseFloat(process.env.SPEED || "0.95");
const CONC   = parseInt(process.env.CONC || "6", 10);
const FORCE  = process.argv.includes("--force");
const LIMIT  = (() => { const i = process.argv.indexOf("--limit"); return i >= 0 ? parseInt(process.argv[i + 1], 10) : 0; })();

// --- slug + shard (keep identical to the browser) ---
const slugify = w => String(w).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const shardOf = s => (/^[a-z]/.test(s) ? s[0] : "_");

// --- gather headwords ---
function collectWords() {
  const files = [path.join(ROOT, "vocab", "books.js")];
  const dataDir = path.join(ROOT, "vocab", "data");
  if (fs.existsSync(dataDir)) for (const f of fs.readdirSync(dataDir)) if (f.endsWith(".js")) files.push(path.join(dataDir, f));
  const seen = new Map(); // slug -> original word
  const re = /(?:"w"|'w'|\bw)\s*:\s*(['"])((?:\\.|(?!\1).)*)\1/g;
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, "utf8");
    let m;
    while ((m = re.exec(src))) {
      const w = m[2].replace(/\\(['"])/g, "$1").trim();
      if (!w || w.length > 40 || !/[a-zA-Z]/.test(w)) continue;
      const s = slugify(w);
      if (s && !seen.has(s)) seen.set(s, w);
    }
  }
  return [...seen.entries()].map(([slug, w]) => ({ slug, w }));
}

async function synth(word, outPath) {
  const res = await fetch(KOKORO + "/v1/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "kokoro", input: word, voice: VOICE, response_format: "mp3", speed: SPEED }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) throw new Error("tiny mp3 (" + buf.length + "B)");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
}

async function main() {
  let words = collectWords();
  console.log(`found ${words.length} unique headwords`);
  if (LIMIT) words = words.slice(0, LIMIT);

  // figure out the work list
  const todo = [];
  for (const it of words) {
    const out = path.join(OUTDIR, shardOf(it.slug), it.slug + ".mp3");
    if (!FORCE && fs.existsSync(out) && fs.statSync(out).size > 200) continue;
    todo.push({ ...it, out });
  }
  console.log(`${words.length - todo.length} already done · ${todo.length} to synth · voice=${VOICE} conc=${CONC}`);

  let done = 0, fail = 0;
  const fails = [];
  const t0 = Date.now();
  let idx = 0;
  async function worker() {
    while (idx < todo.length) {
      const it = todo[idx++];
      try { await synth(it.w, it.out); done++; }
      catch (e) { fail++; fails.push(it.w + " :: " + e.message); }
      const n = done + fail;
      if (n % 50 === 0 || n === todo.length) {
        const rate = n / ((Date.now() - t0) / 1000);
        const eta = Math.round((todo.length - n) / Math.max(rate, 0.01) / 60);
        process.stdout.write(`\r  ${n}/${todo.length}  ok=${done} fail=${fail}  ${rate.toFixed(1)}/s  ETA ${eta}m   `);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONC, todo.length || 1) }, worker));
  console.log(`\nDONE. ok=${done} fail=${fail} in ${((Date.now() - t0) / 1000 / 60).toFixed(1)}m`);
  if (fails.length) { fs.writeFileSync(path.join(OUTDIR, "_failures.txt"), fails.join("\n")); console.log(`  ${fails.length} failures logged to vocab/audio/_failures.txt`); }
}
main().catch(e => { console.error(e); process.exit(1); });
