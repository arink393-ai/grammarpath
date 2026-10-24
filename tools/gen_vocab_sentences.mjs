#!/usr/bin/env node
/*
  gen_vocab_sentences.mjs — Kokoro 真人發音 for every vocab EXAMPLE sentence (w.ex).

  Loads BUILTIN_BOOKS (vocab/books.js + vocab/data/*.js), collects each word's
  `ex` example sentence, dedupes by slug, and renders each to an mp3 at the SAME
  scheme as words:  vocab/audio/<shard>/<slug>.mp3  (so the browser finds them
  automatically — it already slugs any spoken text). Resumable; skips existing.

  Prereq: Kokoro running — cd ~/github/Kokoro-FastAPI && ./start-gpu_mac.sh
  Run:    node tools/gen_vocab_sentences.mjs            # fill missing
          node tools/gen_vocab_sentences.mjs --limit 20
  Env:    KOKORO_URL, VOICE (af_heart), CONC (default 10), SPEED (default 0.92)
*/
import fs from "fs";
import path from "path";

const ROOT   = process.cwd();
const OUTDIR = path.join(ROOT, "vocab", "audio");
const KOKORO = (process.env.KOKORO_URL || "http://localhost:8880").replace(/\/$/, "");
const VOICE  = process.env.VOICE || "af_heart";
const SPEED  = parseFloat(process.env.SPEED || "0.92");
const CONC   = parseInt(process.env.CONC || "10", 10);
const LIMIT  = (() => { const i = process.argv.indexOf("--limit"); return i >= 0 ? parseInt(process.argv[i + 1], 10) : 0; })();

const slugify = w => String(w).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const shardOf = s => (/^[a-z]/.test(s) ? s[0] : "_");

function loadBooks() {
  let BUILTIN_BOOKS = [];
  let code = fs.readFileSync(path.join(ROOT, "vocab", "books.js"), "utf8").replace(/const\s+BUILTIN_BOOKS\s*=/, "BUILTIN_BOOKS=");
  const dd = path.join(ROOT, "vocab", "data");
  for (const f of fs.readdirSync(dd)) if (f.endsWith(".js")) code += "\n" + fs.readFileSync(path.join(dd, f), "utf8");
  eval(code);
  return BUILTIN_BOOKS;
}

function collect() {
  const seen = new Map(); // slug -> text
  for (const b of loadBooks()) for (const w of (b.words || [])) {
    const ex = w.ex && String(w.ex).trim();
    if (!ex || ex.length < 2 || !/[a-zA-Z]/.test(ex)) continue;
    const s = slugify(ex);
    if (s && !seen.has(s)) seen.set(s, ex);
  }
  return [...seen.entries()].map(([slug, text]) => ({ slug, text }));
}

async function synth(text, outPath) {
  const res = await fetch(KOKORO + "/v1/audio/speech", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "kokoro", input: text, voice: VOICE, response_format: "mp3", speed: SPEED }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) throw new Error("tiny mp3");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
}

async function main() {
  let items = collect();
  console.log(`found ${items.length} unique example sentences`);
  if (LIMIT) items = items.slice(0, LIMIT);
  const todo = [];
  for (const it of items) {
    const out = path.join(OUTDIR, shardOf(it.slug), it.slug + ".mp3");
    if (fs.existsSync(out) && fs.statSync(out).size > 200) continue;
    todo.push({ ...it, out });
  }
  console.log(`${items.length - todo.length} already present · ${todo.length} to synth · voice=${VOICE} conc=${CONC}`);
  let done = 0, fail = 0; const fails = []; const t0 = Date.now(); let idx = 0;
  async function worker() {
    while (idx < todo.length) {
      const it = todo[idx++];
      try { await synth(it.text, it.out); done++; } catch (e) { fail++; fails.push(it.text + " :: " + e.message); }
      const n = done + fail;
      if (n % 50 === 0 || n === todo.length) {
        const rate = n / ((Date.now() - t0) / 1000);
        process.stdout.write(`\r  ${n}/${todo.length} ok=${done} fail=${fail} ${rate.toFixed(1)}/s ETA ${Math.round((todo.length - n) / Math.max(rate, .01) / 60)}m   `);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONC, todo.length || 1) }, worker));
  console.log(`\nDONE ex-sentences. ok=${done} fail=${fail} in ${((Date.now() - t0) / 1000 / 60).toFixed(1)}m`);
  if (fails.length) fs.writeFileSync(path.join(OUTDIR, "_sentence_failures.txt"), fails.join("\n"));
}
main().catch(e => { console.error(e); process.exit(1); });
