#!/usr/bin/env node
/*
  gen_story.mjs — render Story Time scene narration to natural Kokoro voice.

  Prereq: start Kokoro in another terminal —
    cd ~/github/Kokoro-FastAPI && ./start-gpu_mac.sh
  Then from the site folder:
    node tools/gen_story.mjs          # only new / changed scenes
    node tools/gen_story.mjs --force  # re-render everything

  Saves mp3s under ./audio/story, injects the SB_AUDIO manifest into index.html.
  Config via env: KOKORO_URL (default http://localhost:8880), VOICE (default af_heart).
*/
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT   = process.cwd();
const HTML   = path.join(ROOT, "index.html");
const OUTDIR = path.join(ROOT, "audio", "story");
const HASHES = path.join(OUTDIR, ".hashes.json");
const KOKORO = (process.env.KOKORO_URL || "http://localhost:8880").replace(/\/$/, "");
const VOICE  = process.env.VOICE || "af_heart";
const SPEED  = 0.92;                 // natural narration; slow playback handled by playbackRate
const FORCE  = process.argv.includes("--force");

function extractArrayLiteral(src, marker){
  const m = src.indexOf(marker); if(m < 0) throw new Error("marker not found: " + marker);
  const start = src.indexOf("[", m);
  let depth = 0, inStr = false, q = "", esc = false;
  for(let j=start;j<src.length;j++){
    const c = src[j];
    if(inStr){ if(esc) esc=false; else if(c==="\\") esc=true; else if(c===q) inStr=false; continue; }
    if(c==='"'||c==="'"||c==="`"){ inStr=true; q=c; }
    else if(c==="[") depth++;
    else if(c==="]"){ depth--; if(depth===0) return src.slice(start, j+1); }
  }
  throw new Error("array end not found");
}
function fname(text){ return "s_" + crypto.createHash("sha256").update(text).digest("hex").slice(0,12) + ".mp3"; }
// what Kokoro actually voices: drop HTML tags and normalise whitespace (manifest key stays the raw text)
function speakable(text){ return text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); }
async function synth(text){
  const res = await fetch(KOKORO + "/v1/audio/speech", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"kokoro", voice:VOICE, input:text, response_format:"mp3", speed:SPEED })
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
  const STORIES = eval("(" + extractArrayLiteral(html, "const STORIES = [") + ")");
  fs.mkdirSync(OUTDIR, { recursive: true });
  const hashes = fs.existsSync(HASHES) ? JSON.parse(fs.readFileSync(HASHES,"utf8")) : {};

  // collect unique scene English texts across every story
  const texts = new Set();
  for(const s of STORIES){
    if(!Array.isArray(s.scenes)) continue;
    for(const sc of s.scenes){ if(sc && sc.en) texts.add(sc.en.trim()); }
  }

  const manifest = {}; let made = 0, skipped = 0;
  for(const text of texts){
    const spoken = speakable(text);
    const file = fname(text), abs = path.join(OUTDIR, file), rel = "audio/story/" + file;
    manifest[text] = rel;
    const sig = crypto.createHash("sha256").update(VOICE+"|"+SPEED+"|"+spoken).digest("hex");
    if(!FORCE && hashes[text] === sig && fs.existsSync(abs)){ skipped++; continue; }
    process.stdout.write(`♪ ${spoken.slice(0,42)} … `);
    fs.writeFileSync(abs, await synth(spoken));
    hashes[text] = sig; made++;
    console.log("ok");
  }
  fs.writeFileSync(HASHES, JSON.stringify(hashes));
  const injected = html.replace(/\/\*SB_AUDIO_START\*\/[\s\S]*?\/\*SB_AUDIO_END\*\//,
    `/*SB_AUDIO_START*/const SB_AUDIO=${JSON.stringify(manifest)};/*SB_AUDIO_END*/`);
  if(injected === html){ console.error("✗ SB_AUDIO markers not found in index.html"); process.exit(1); }
  fs.writeFileSync(HTML, injected);
  console.log(`\n✓ Done. Synthesised ${made}, reused ${skipped}, total ${texts.size}. Voice ${VOICE}.`);
  console.log("  Next: git add audio index.html && git commit && git push");
}
main().catch(e=>{ console.error("\n✗ " + e.message); process.exit(1); });
