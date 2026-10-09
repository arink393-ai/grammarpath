/* 🗺️ 小冒險 Mini-Adventures — short, varied stages for young learners.
   One stage ≈ 5 minutes = 4 rooms of 60–90 s (never the same kind of activity twice in a row)
   + a treasure chest. No timers, no typing; a wrong tap gives a hint and another try.
   World 1 "ABC 字母島" reuses the phonics data in index.html: ABC_PH (5 words + emoji per
   letter), ABC_WORD_ZH (Chinese), and the Kokoro MP3s played by phSpeak(). Speech checking
   uses the existing `sr` recognizer when the browser has one, else a self-check button.
   Progress: store.data.adv = {stages:{<id>:{stars,at}}, day:{d,n}}. Loaded before the main
   script; everything here is only called after the page has booted. */
const ADV_WORLDS = [
 {id:"w1", title:"ABC 字母島", en:"Alphabet Island", emoji:"🔤", stages:[
  {id:"w1s1", letters:"ABCDE", icon:"🍎"},
  {id:"w1s2", letters:"FGHIJ", icon:"🐟"},
  {id:"w1s3", letters:"KLMNO", icon:"🦁"},
  {id:"w1s4", letters:"PQRST", icon:"🐷"},
  {id:"w1s5", letters:"UVWXYZ", icon:"🦓"}]}
];
const ADV_DAILY_GOAL = 2;      // stages per day before the "time for a break" message
const ADV_CLEAR_CANS = 5;      // 🥫 for a stage's first clear
const ADV_CLEAR_XP = 10;
const ADV_ROOMS = [
 {k:"listen", ic:"👂", zh:"聽聲音，找到對的圖片"},
 {k:"letter", ic:"🔤", zh:"這個東西是哪個字母開頭？"},
 {k:"memory", ic:"🃏", zh:"翻牌配對：圖片和英文配成一對"},
 {k:"speak",  ic:"🗣️", zh:"聽一聽，再大聲說出來"}];
let ADV = null;

function advData(){ const a = store.data.adv = store.data.adv || {}; a.stages = a.stages || {}; a.day = a.day || {d:null, n:0}; return a; }
function advAll(){ return ADV_WORLDS.flatMap(w=>w.stages); }
function advStage(id){ return advAll().find(s=>s.id===id); }
function advUnlocked(st){ const all=advAll(), i=all.indexOf(st); return i===0 || !!advData().stages[all[i-1].id]; }
function advToday(){ const a=advData(); return a.day.d===todayKey() ? a.day.n : 0; }
function advNext(){ return advAll().find(s=>!advData().stages[s.id]) || null; }
function advLabel(st){ return st.letters.split("").join(" "); }
function advStars(n){ return "⭐".repeat(n) + "☆".repeat(3-n); }

function advWords(st){
  const out=[];
  st.letters.split("").forEach(L=>{
    const g = (typeof ABC_PH!=="undefined") && ABC_PH[L]; if(!g) return;
    g.w.forEach(([w,e])=> out.push({w, e, zh:(typeof ABC_WORD_ZH!=="undefined" && ABC_WORD_ZH[w])||"", L, starts:w[0].toUpperCase()===L}));
  });
  return out;
}
function advSayZh(text){
  try{
    if(!window.speechSynthesis) return;
    tts.stop(); speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "zh-TW"; u.rate = 0.95;
    const v = speechSynthesis.getVoices().find(v=>/^zh[-_](TW|HK)/i.test(v.lang)) || speechSynthesis.getVoices().find(v=>/^zh/i.test(v.lang));
    if(v) u.voice = v;
    speechSynthesis.speak(u);
  }catch(e){}
}
function advWord(w){ if(typeof phSpeak==="function") phSpeak(w, 0.9); else speak(w); }

/* ---------- home card + map ---------- */
function advHomeCard(){
  if(typeof currentUser==="function" && !currentUser()) return "";
  const nx = advNext(), today = advToday();
  const line = nx ? `下一關：${ADV_WORLDS[0].title} · ${advLabel(nx)}` : "第一個世界全部破關了！🏆";
  return `<section class="card adv-home"><div class="adv-home-art">🗺️</div>
    <div class="adv-home-txt"><div class="eyebrow">小冒險 · 每關 5 分鐘</div><h2>${line}</h2>
    <p>聽一聽、點一點、翻翻牌、說說看——每關四個小遊戲，玩完開寶箱。今天已完成 <b>${today}</b> / ${ADV_DAILY_GOAL} 關</p></div>
    <a class="btn btn-primary adv-home-go" href="#/adventure${nx?"/"+nx.id:""}">▶ ${nx?"開始冒險":"回到地圖"}</a></section>`;
}
function renderAdventure(){
  advQuit(true);
  const a = advData(), today = advToday();
  const nodes = ADV_WORLDS.map(w=>{
    const items = w.stages.map((st,i)=>{
      const rec = a.stages[st.id], open = advUnlocked(st), isNext = !rec && open;
      const cls = rec ? "done" : open ? "next" : "locked";
      const inner = `<span class="adv-node-ic">${open?st.icon:"🔒"}</span><span class="adv-node-lv">第 ${i+1} 關</span><span class="adv-node-l">${advLabel(st)}</span>`;
      const stars = rec ? `<span class="adv-node-stars">${advStars(rec.stars||1)}</span>` : isNext ? `<span class="adv-node-stars go">▶ 從這裡開始</span>` : "";
      return `<div class="adv-step ${i%2?"r":"l"}">${open
        ? `<a class="adv-node ${cls}" href="#/adventure/${st.id}">${inner}</a>`
        : `<div class="adv-node ${cls}" aria-disabled="true">${inner}</div>`}${stars}</div>`;
    }).join("");
    return `<section class="adv-world"><div class="adv-world-h"><span>${w.emoji}</span><div><b>世界 1 · ${w.title}</b><small>${w.en}：認識字母和它們的聲音</small></div></div>
      <div class="adv-path">${items}</div></section>`;
  }).join("");
  const rest = today >= ADV_DAILY_GOAL
    ? `<div class="adv-rest">🎉 今天的冒險完成了（${today} 關）！眼睛休息一下，明天再來找貓咪。<span>還想玩也可以繼續 🐾</span></div>`
    : `<div class="adv-today">今天的冒險：<b>${today}</b> / ${ADV_DAILY_GOAL} 關 ${"🐾".repeat(today)}${"·".repeat(Math.max(0,ADV_DAILY_GOAL-today))}</div>`;
  app.innerHTML = `<div class="view adv">
    <div class="crumb"><a href="#/home">Home</a> › 小冒險</div>
    <div class="adv-hero"><div><div class="eyebrow">Mini Adventures · 小冒險</div>
      <h1 class="display">貓咪島小冒險 🗺️</h1>
      <p>一關只要 5 分鐘：👂 聽一聽 → 🔤 點一點 → 🃏 翻翻牌 → 🗣️ 說說看 → 🎁 開寶箱！破關拿罐罐 🥫，一關一關往前走。</p></div>
      <div class="adv-hero-cat">${typeof catSVG==="function"?catSVG(110,"orange"):""}</div></div>
    ${rest}
    ${nodes}
    <section class="adv-world adv-soon"><div class="adv-world-h"><span>🌳</span><div><b>世界 2 · Be 動詞森林</b><small>製作中，先把字母島玩熟吧！</small></div></div></section>
  </div>`;
}

/* ---------- a stage ---------- */
function advStart(id){
  const st = advStage(id);
  if(!st){ location.hash = "#/adventure"; return; }
  if(!advUnlocked(st)){ toast("先完成前面的關卡喔 🐾"); location.hash = "#/adventure"; return; }
  advQuit(true);
  const words = advWords(st);
  const starters = words.filter(x=>x.starts);
  /* core = 4 words from different letters → reused across rooms for repetition */
  const core = [];
  shuffle(st.letters.split("")).forEach(L=>{ if(core.length>=4) return; const c=shuffle(starters.filter(x=>x.L===L))[0]; if(c) core.push(c); });
  const distract = (target, pool, n) => shuffle(pool.filter(x=>x.e!==target.e && x.w!==target.w)).slice(0,n);
  const listen = core.map(t=>({t, opts:shuffle([t, ...distract(t, words, 2)])}));
  const letters = [...new Set(st.letters.split("").filter(L=>starters.some(x=>x.L===L)))];
  const letter = shuffle(core).map(t=>({t, opts:shuffle([t.L, ...shuffle(letters.filter(L=>L!==t.L)).slice(0,2)])}));
  const pairs = shuffle(core).slice(0,3);
  const cards = shuffle(pairs.flatMap((p,i)=>[{i, kind:"pic"}, {i, kind:"word"}]));
  const speakW = shuffle(core).slice(0,3);
  ADV = {st, room:0, step:0, first:{ok:0,n:0}, tried:false, wrong:{}, locked:false,
    listen, letter, mem:{pairs, cards, open:[], done:{}, busy:false}, speak:speakW, sp:{tries:0, state:"idle", heard:""}};
  advRender(); advAutoAudio();
}
function advQuit(silent){
  if(ADV && typeof sr!=="undefined" && sr.busy) sr.stop();
  clearTimeout(advQuit._t); ADV = null;
}
function advPaws(){
  return `<div class="adv-paws">${[0,1,2,3,4].map(i=>`<span class="${i<ADV.room?"on":i===ADV.room?"cur":""}">${i<4?"🐾":"🎁"}</span>`).join("")}</div>`;
}
function advRender(){
  if(!ADV) return;
  const R = ADV_ROOMS[ADV.room];
  if(!R){ advChest(); return; }
  const body = R.k==="listen" ? advListenHTML() : R.k==="letter" ? advLetterHTML() : R.k==="memory" ? advMemoryHTML() : advSpeakHTML();
  app.innerHTML = `<div class="view adv adv-play">
    <div class="adv-top"><a class="adv-x" href="#/adventure" aria-label="回地圖">✕</a>${advPaws()}<span class="adv-stagelbl">${advLabel(ADV.st)}</span></div>
    <div class="adv-room-h"><span class="adv-room-ic">${R.ic}</span><span class="adv-room-zh">${R.zh}</span>
      <button class="adv-hear-zh" onclick="advSayZh('${R.zh}')" aria-label="唸題目給我聽">🔈</button></div>
    <div class="adv-body">${body}</div></div>`;
}
function advAutoAudio(){
  if(!ADV) return; const R = ADV_ROOMS[ADV.room]; if(!R) return;
  clearTimeout(advQuit._t);
  if(R.k==="listen") advQuit._t = setTimeout(()=>ADV && advWord(ADV.listen[ADV.step].t.w), 350);
  else if(R.k==="speak") advQuit._t = setTimeout(()=>ADV && advWord(ADV.speak[ADV.step].w), 350);
}
function advNextRoom(){ if(!ADV) return; ADV.room++; ADV.step=0; ADV.tried=false; ADV.wrong={}; ADV.locked=false; advRender(); advAutoAudio(); }
function advStepDone(total){
  ADV.locked = true;
  advQuit._t = setTimeout(()=>{ if(!ADV) return; ADV.locked=false; ADV.tried=false; ADV.wrong={};
    if(ADV.step+1 >= total) advNextRoom(); else { ADV.step++; advRender(); advAutoAudio(); } }, 950);
}
function advFirst(ok){ if(!ADV.tried){ ADV.tried=true; ADV.first.n++; if(ok) ADV.first.ok++; } }
function advDots(total){ return `<div class="adv-dots">${Array.from({length:total},(_,i)=>`<i class="${i<ADV.step?"on":i===ADV.step?"cur":""}"></i>`).join("")}</div>`; }

/* room 1 · listen → tap the picture */
function advListenHTML(){
  const r = ADV.listen[ADV.step];
  return `${advDots(ADV.listen.length)}
    <button class="adv-big-hear" onclick="advWord('${r.t.w}')">🔊 再聽一次</button>
    <div class="adv-pics">${r.opts.map((o,k)=>`<button class="adv-pic ${ADV.wrong[k]?"no":""} ${ADV.locked&&o===r.t?"yes":""}" ${ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advListenPick(${k})">${o.e}</button>`).join("")}</div>
    ${ADV.locked?`<div class="adv-yay">✓ ${r.t.w}　${r.t.zh}</div>`:Object.keys(ADV.wrong).length?`<div class="adv-hint">再聽一次，仔細聽喔 👂</div>`:""}`;
}
function advListenPick(k){
  if(!ADV || ADV.locked) return;
  const r = ADV.listen[ADV.step], ok = r.opts[k]===r.t;
  advFirst(ok);
  if(ok){ advRender(); advWord(r.t.w); advStepDone(ADV.listen.length); }
  else { ADV.wrong[k]=1; advRender(); setTimeout(()=>ADV && advWord(r.t.w), 250); }
}

/* room 2 · which letter does it start with */
function advLetterHTML(){
  const r = ADV.letter[ADV.step], w = r.t.w;
  const shown = ADV.locked ? `<b class="adv-first">${w[0]}</b>${w.slice(1)}` : "";
  return `${advDots(ADV.letter.length)}
    <button class="adv-emoji" onclick="advWord('${w}')" aria-label="聽單字">${r.t.e}<span>🔊</span></button>
    <div class="adv-word-reveal">${shown||"&nbsp;"}</div>
    <div class="adv-letters">${r.opts.map((L,k)=>`<button class="adv-letter ${ADV.wrong[k]?"no":""} ${ADV.locked&&L===r.t.L?"yes":""}" ${ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advLetterPick(${k})">${L}<small>${L.toLowerCase()}</small></button>`).join("")}</div>
    ${ADV.locked?`<div class="adv-yay">✓ ${w} 是 ${r.t.L} 開頭！</div>`:Object.keys(ADV.wrong).length?`<div class="adv-hint">仔細聽第一個聲音，再試一次 👂</div>`:""}`;
}
function advLetterPick(k){
  if(!ADV || ADV.locked) return;
  const r = ADV.letter[ADV.step], ok = r.opts[k]===r.t.L;
  advFirst(ok);
  if(ok){ advRender(); advWord(r.t.w); advStepDone(ADV.letter.length); }
  else { ADV.wrong[k]=1; advRender(); setTimeout(()=>ADV && advWord(r.t.w), 250); }
}

/* room 3 · memory flip (picture ↔ word) */
function advMemoryHTML(){
  const m = ADV.mem;
  const cards = m.cards.map((c,k)=>{
    const p = m.pairs[c.i], up = m.open.includes(k) || m.done[c.i];
    return `<button class="adv-card ${up?"up":""} ${m.done[c.i]?"done":""}" ${m.done[c.i]?"disabled":""} onclick="advFlip(${k})">${up?(c.kind==="pic"?`<span class="adv-card-pic">${p.e}</span>`:`<span class="adv-card-w">${p.w}</span>`):`<span class="adv-card-back">🐾</span>`}</button>`;
  }).join("");
  const left = m.pairs.length - Object.keys(m.done).length;
  return `<div class="adv-memo">${cards}</div><div class="adv-hint">${left? `還有 ${left} 對，翻兩張一樣的就配成功！` : "全部配好了！🎉"}</div>`;
}
function advFlip(k){
  if(!ADV) return; const m = ADV.mem;
  if(m.busy || m.open.includes(k) || m.done[m.cards[k].i]) return;
  m.open.push(k);
  const c = m.cards[k]; advWord(m.pairs[c.i].w);
  if(m.open.length===2){
    const [a,b] = m.open.map(x=>m.cards[x]);
    if(a.i===b.i){ m.done[a.i]=1; m.open=[]; advRender();
      if(Object.keys(m.done).length===m.pairs.length){ ADV.locked=true; advQuit._t=setTimeout(advNextRoom, 1100); } }
    else { m.busy=true; advRender(); setTimeout(()=>{ if(!ADV) return; m.open=[]; m.busy=false; advRender(); }, 900); }
  } else advRender();
}

/* room 4 · say it */
function advSpeakHTML(){
  const t = ADV.speak[ADV.step], s = ADV.sp, canHear = typeof sr!=="undefined" && sr.ok;
  let ctl;
  if(s.state==="ok") ctl = `<div class="adv-yay">⭐ 說得好！${s.heard?`我聽到「${esc(s.heard)}」`:""}</div>`;
  else if(s.state==="listening") ctl = `<button class="adv-mic on" disabled>👂 正在聽…</button>`;
  else if(!canHear || s.tries>=2) ctl = `${s.tries>=2?`<div class="adv-hint">沒關係！跟著聲音唸一次就好 😺</div>`:`<div class="adv-hint">聽完跟著大聲唸一次 🗣️</div>`}<button class="btn btn-primary adv-done-btn" onclick="advSpeakSelf()">✓ 我唸好了</button>`;
  else ctl = `<button class="adv-mic" onclick="advListenMe()">🎤 按我，說出來</button>${s.tries?`<div class="adv-hint">很接近了！再說一次 💪${s.heard?`（我聽到「${esc(s.heard)}」）`:""}</div>`:""}`;
  return `${advDots(ADV.speak.length)}
    <div class="adv-say-card"><span class="adv-say-e">${t.e}</span><span class="adv-say-w">${t.w}</span><span class="adv-say-zh">${t.zh}</span></div>
    <button class="adv-big-hear" onclick="advWord('${t.w}')">🔊 聽示範</button>
    <div class="adv-say-ctl">${ctl}</div>`;
}
function advListenMe(){
  if(!ADV || ADV.sp.state==="listening") return;
  tts.stop(); ADV.sp.state="listening"; advRender();
  const t = ADV.speak[ADV.step];
  sr.start(alts=>{
    if(!ADV) return;
    const hit = alts.some(a=>srNorm(a).split(" ").includes(srNorm(t.w)) || srNorm(a)===srNorm(t.w));
    ADV.sp.heard = alts[0]||"";
    if(hit){ ADV.sp.state="ok"; advRender(); advSpeakNext(); }
    else { ADV.sp.tries++; ADV.sp.state="idle"; advRender(); }
  }, err=>{
    if(!ADV || ADV.sp.state!=="listening") return;
    ADV.sp.state="idle";
    if(err==="not-allowed"||err==="service-not-allowed"){ ADV.sp.tries=2; toast("沒有麥克風權限，改成跟著唸就好 🐾"); }
    else if(err){ ADV.sp.tries++; }
    advRender();
  });
}
function advSpeakSelf(){ if(!ADV) return; ADV.sp.state="ok"; ADV.sp.heard=""; advRender(); advSpeakNext(); }
function advSpeakNext(){
  ADV.locked = true;
  advQuit._t = setTimeout(()=>{ if(!ADV) return; ADV.locked=false; ADV.sp={tries:0,state:"idle",heard:""};
    if(ADV.step+1 >= ADV.speak.length) advNextRoom(); else { ADV.step++; advRender(); advAutoAudio(); } }, 1100);
}

/* chest */
function advChest(){
  const a = advData(), st = ADV.st, f = ADV.first;
  const stars = f.n ? (f.ok/f.n>=0.875 ? 3 : f.ok/f.n>=0.6 ? 2 : 1) : 3;
  const prev = a.stages[st.id], firstClear = !prev;
  a.stages[st.id] = {stars: Math.max(stars, prev?prev.stars:0), at: new Date().toISOString()};
  if(a.day.d!==todayKey()) a.day = {d:todayKey(), n:0};
  a.day.n++;
  store.save();
  if(firstClear){ store.addCans(ADV_CLEAR_CANS); store.addXP(ADV_CLEAR_XP); }
  const nx = advNext(), today = a.day.n;
  const restMsg = today===ADV_DAILY_GOAL ? `<div class="adv-rest">🎉 今天的 ${ADV_DAILY_GOAL} 關完成了！眼睛休息一下，明天再來冒險 🐾</div>` : "";
  app.innerHTML = `<div class="view adv adv-play">
    <div class="adv-top"><a class="adv-x" href="#/adventure" aria-label="回地圖">✕</a>${advPaws()}<span class="adv-stagelbl">${advLabel(st)}</span></div>
    <div class="adv-chest">
      <div class="adv-chest-ic">🎁</div>
      <h2>破關成功！</h2>
      <div class="adv-chest-stars">${advStars(stars)}</div>
      <p>${f.ok} / ${f.n} 題一次就答對${stars===3?"，太厲害了！":stars===2?"，很棒喔！":"，下次會更好！"}</p>
      ${firstClear?`<div class="adv-loot">+${ADV_CLEAR_CANS} 🥫 罐罐　+${ADV_CLEAR_XP} XP</div>`:`<div class="adv-loot soft">再玩一次也很棒！（罐罐只在第一次破關給）</div>`}
      ${restMsg}
      <div class="adv-chest-btns">
        ${nx?`<a class="btn btn-primary" href="#/adventure/${nx.id}">下一關：${advLabel(nx)} →</a>`:`<div class="adv-yay">🏆 字母島全部破關！</div>`}
        <a class="btn btn-ghost" href="#/adventure">回到地圖</a>
        <a class="btn btn-ghost" href="#/cats">🐱 看貓咪</a>
      </div>
    </div></div>`;
  ADV = null;
}
window.addEventListener("hashchange", ()=>{ const h=(location.hash||"").slice(2).split("/"); if(ADV && !(h[0]==="adventure" && h[1]===ADV.st.id)) advQuit(true); });
