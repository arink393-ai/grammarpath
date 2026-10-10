#!/usr/bin/env node
/*
  gen_adv_audio.mjs — render the 小冒險 World 2 (Be 動詞森林) sentences to natural Kokoro voice.

  Prereq: Kokoro running (cd ~/github/Kokoro-FastAPI && ./start-gpu_mac.sh). Then from the site folder:
    node tools/gen_adv_audio.mjs          # only new sentences
    node tools/gen_adv_audio.mjs --force  # re-render everything

  The sentence list comes from adventure.js itself (advBeAllSentences), so adding a feeling or
  an animal there and re-running this is all it takes. Saves mp3s under ./audio/adv and rewrites
  the ADV_AUDIO manifest in adventure.js. Env: KOKORO_URL, VOICE (default af_heart).
*/
import fs from "fs";
import path from "path";
import crypto from "crypto";
import vm from "vm";

const ROOT   = process.cwd();
const JS     = path.join(ROOT, "adventure.js");
const OUTDIR = path.join(ROOT, "audio", "adv");
const KOKORO = (process.env.KOKORO_URL || "http://localhost:8880").replace(/\/$/, "");
const VOICE  = process.env.VOICE || "af_heart";
const FORCE  = process.argv.includes("--force");

const fname = t => "a_" + crypto.createHash("sha256").update(VOICE + "|" + t).digest("hex").slice(0,12) + ".mp3";
async function synth(text){
  const res = await fetch(KOKORO + "/v1/audio/speech", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"kokoro", voice:VOICE, input:text, response_format:"mp3", speed:0.9 })
  });
  if(!res.ok) throw new Error("Kokoro " + res.status + ": " + (await res.text()).slice(0,150));
  const buf = Buffer.from(await res.arrayBuffer());
  if(buf.length < 800) throw new Error("tiny audio for “"+text+"”");
  return buf;
}
const src = fs.readFileSync(JS, "utf8");
const ctx = { window:{ addEventListener(){} } };
vm.createContext(ctx);
vm.runInContext(src + "\n;globalThis.__S = advBeAllSentences();", ctx);
const texts = ctx.__S;
try{ const h = await fetch(KOKORO+"/health"); if(!h.ok) throw 0; }
catch{ console.error(`✗ Cannot reach Kokoro at ${KOKORO}`); process.exit(1); }
fs.mkdirSync(OUTDIR, { recursive:true });
const manifest = {}; let made = 0;
for(const t of texts){
  const f = fname(t), out = path.join(OUTDIR, f);
  if(FORCE || !fs.existsSync(out)){ fs.writeFileSync(out, await synth(t)); made++; process.stdout.write("."); }
  manifest[t] = "audio/adv/" + f;
}
const next = src.replace(/\/\*ADV_AUDIO_START\*\/[\s\S]*?\/\*ADV_AUDIO_END\*\//, "/*ADV_AUDIO_START*/const ADV_AUDIO=" + JSON.stringify(manifest) + ";/*ADV_AUDIO_END*/");
fs.writeFileSync(JS, next);
console.log(`\n✓ ${texts.length} sentences (${made} rendered) → audio/adv, manifest written to adventure.js`);
