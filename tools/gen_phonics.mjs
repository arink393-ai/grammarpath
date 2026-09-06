#!/usr/bin/env node
/*
  gen_phonics.mjs — render the ABC phonics words & sentences to natural Kokoro voice.

  Prereq: start Kokoro in another terminal —
    cd ~/github/Kokoro-FastAPI && ./start-gpu_mac.sh
  Then from the site folder:
    node tools/gen_phonics.mjs          # only new / changed items
    node tools/gen_phonics.mjs --force  # re-render everything

  Saves mp3s under ./audio/ph, injects the PH_AUDIO manifest into index.html.
  Config via env: KOKORO_URL (default http://localhost:8880), VOICE (default af_heart).
*/
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT   = process.cwd();
const HTML   = path.join(ROOT, "index.html");
const OUTDIR = path.join(ROOT, "audio", "ph");
const HASHES = path.join(OUTDIR, ".hashes.json");
const KOKORO = (process.env.KOKORO_URL || "http://localhost:8880").replace(/\/$/, "");
const VOICE  = process.env.VOICE || "af_heart";
const FORCE  = process.argv.includes("--force");

function extractObjectLiteral(src, marker){
  const m = src.indexOf(marker); if(m < 0) throw new Error("marker not found: " + marker);
  const start = src.indexOf("{", m);
  let depth = 0, inStr = false, q = "", esc = false;
  for(let j=start;j<src.length;j++){
    const c = src[j];
    if(inStr){ if(esc) esc=false; else if(c==="\\") esc=true; else if(c===q) inStr=false; continue; }
    if(c==='"'||c==="'"||c==="`"){ inStr=true; q=c; }
    else if(c==="{") depth++;
    else if(c==="}"){ depth--; if(depth===0) return src.slice(start, j+1); }
  }
  throw new Error("object end not found");
}
function fname(text){ return "p_" + crypto.createHash("sha256").update(text).digest("hex").slice(0,12) + ".mp3"; }
async function synth(text, speed){
  const res = await fetch(KOKORO + "/v1/audio/speech", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"kokoro", voice:VOICE, input:text, response_format:"mp3", speed })
  });
  if(!res.ok) throw new Error("Kokoro " + res.status + ": " + (await res.text()).slice(0,150));
  const buf = Buffer.from(await res.arrayBuffer());
  if(buf.length < 800) throw new Error("tiny audio for “"+text+"”");
  return buf;
}
async function main(){
  try{ const h = await fetch(KOKORO+"/health"); if(!h.ok) throw 0; }
  catch{ console.error(`\n✗ Cannot reach Kokoro at ${KOKORO}. Start it:\n  cd ~/github/Kokoro-FastAPI && ./start-gpu_mac.sh\n`); process.exit(1); }

  const html = fs.readFileSync(HTML, "utf8");
  const ABC_PH = eval("(" + extractObjectLiteral(html, "const ABC_PH = {") + ")");
  fs.mkdirSync(OUTDIR, { recursive: true });
  const hashes = fs.existsSync(HASHES) ? JSON.parse(fs.readFileSync(HASHES,"utf8")) : {};

  // collect unique texts (words + sentences)
  const texts = new Map();   // text -> speed
  for(const k in ABC_PH){
    for(const [w] of ABC_PH[k].w) texts.set(w, 0.85);      // single words a little slower
    for(const s of ABC_PH[k].ex) texts.set(s[0], 0.95);    // English sentence only (s = [en, zh])
  }
  const manifest = {}; let made = 0, skipped = 0;
  for(const [text, speed] of texts){
    const file = fname(text), abs = path.join(OUTDIR, file), rel = "audio/ph/" + file;
    manifest[text] = rel;
    const sig = crypto.createHash("sha256").update(VOICE+"|"+speed+"|"+text).digest("hex");
    if(!FORCE && hashes[text] === sig && fs.existsSync(abs)){ skipped++; continue; }
    process.stdout.write(`♪ ${text.slice(0,32)} … `);
    fs.writeFileSync(abs, await synth(text, speed));
    hashes[text] = sig; made++;
    console.log("ok");
  }
  fs.writeFileSync(HASHES, JSON.stringify(hashes));
  const injected = html.replace(/\/\*PH_AUDIO_START\*\/[\s\S]*?\/\*PH_AUDIO_END\*\//,
    `/*PH_AUDIO_START*/const PH_AUDIO=${JSON.stringify(manifest)};/*PH_AUDIO_END*/`);
  if(injected === html){ console.error("✗ PH_AUDIO markers not found in index.html"); process.exit(1); }
  fs.writeFileSync(HTML, injected);
  console.log(`\n✓ Done. Synthesised ${made}, reused ${skipped}, total ${texts.size}. Voice ${VOICE}.`);
  console.log("  Next: git add audio index.html && git commit && git push");
}
main().catch(e=>{ console.error("\n✗ " + e.message); process.exit(1); });
