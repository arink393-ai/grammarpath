/* 🗺️ 小冒險 Mini-Adventures — short, varied stages for young learners.
   One stage ≈ 5 minutes = 4 rooms of 60–90 s (never the same kind of activity twice in a row)
   + a treasure chest. No timers, no typing; a wrong tap gives a hint and another try.
   World 1 "ABC 字母島" reuses the phonics data in index.html: ABC_PH (5 words + emoji per
   letter), ABC_WORD_ZH (Chinese), and the Kokoro MP3s played by phSpeak(). Speech checking
   uses the existing `sr` recognizer when the browser has one, else a self-check button.
   World 2 "Be 動詞森林" builds am/is/are sentences from small subject × feeling / animal tables
   (BE_SUBJ, BE_FEEL, BE_ANIMAL); its sentences have Kokoro MP3s in ADV_AUDIO
   (tools/gen_adv_audio.mjs renders them and rewrites the manifest below).
   Progress: store.data.adv = {stages:{<id>:{stars,at}}, day:{d,n}}. Loaded before the main
   script; everything here is only called after the page has booted. */
const ADV_WORLDS = [
 {id:"w1", kind:"abc", title:"ABC 字母島", en:"Alphabet Island", sub:"認識字母和它們的聲音", emoji:"🔤", stages:[
  {id:"w1s1", letters:"ABCDE", icon:"🍎"},
  {id:"w1s2", letters:"FGHIJ", icon:"🐟"},
  {id:"w1s3", letters:"KLMNO", icon:"🦁"},
  {id:"w1s4", letters:"PQRST", icon:"🐷"},
  {id:"w1s5", letters:"UVWXYZ", icon:"🦓"}]},
 {id:"w2", kind:"be", title:"Be 動詞森林", en:"Be-Verb Forest", sub:"am、is、are 要跟誰在一起？", emoji:"🌳",
  note:"會唸字母了？也可以直接從這裡開始 🐾", stages:[
  {id:"w2s1", label:"I am · You are", icon:"🙋", subj:["I","you"], kind:"feel",
   tip:"I（我）一定配 am；you（你）配 are。"},
  {id:"w2s2", label:"He is · She is", icon:"👧", subj:["he","she"], kind:"feel",
   tip:"一個人——he（他）、she（她）——都用 is。"},
  {id:"w2s3", label:"It is · They are", icon:"🐶", subj:["it","they"], kind:"animal",
   tip:"一隻用 is：It is a dog.　很多隻用 are，動物後面加 s：They are dogs."},
  {id:"w2s4", label:"We are · They are", icon:"🙌", subj:["we","they"], kind:"feel",
   tip:"兩個人以上——we（我們）、they（他們）——都用 are。"},
  {id:"w2s5", label:"am · is · are", icon:"🦉", subj:["I","you","he","she","it","we","they"], kind:"mix", boss:true,
   tip:"森林大魔王：全部混在一起！先看清楚主角是誰，再選 am、is、are。"}]}
];
/*ADV_AUDIO_START*/const ADV_AUDIO={"I am happy.":"audio/adv/a_a85a5e31ada1.mp3","I am sad.":"audio/adv/a_ad010de98ce1.mp3","I am hungry.":"audio/adv/a_f20f9c38780c.mp3","I am sleepy.":"audio/adv/a_e7ef9e7a6778.mp3","I am hot.":"audio/adv/a_9c34429fa1bd.mp3","I am cold.":"audio/adv/a_429360649df6.mp3","I am angry.":"audio/adv/a_826017315c79.mp3","I am sick.":"audio/adv/a_b825a638fc72.mp3","You are happy.":"audio/adv/a_3755df596d0d.mp3","You are sad.":"audio/adv/a_46b518e37532.mp3","You are hungry.":"audio/adv/a_658a98b1b9fd.mp3","You are sleepy.":"audio/adv/a_9dacde09c6df.mp3","You are hot.":"audio/adv/a_c01f26e13c30.mp3","You are cold.":"audio/adv/a_bf0d90a42a25.mp3","You are angry.":"audio/adv/a_6a6c6b4f7d03.mp3","You are sick.":"audio/adv/a_76de963f1e41.mp3","He is happy.":"audio/adv/a_3c0d84017aa7.mp3","He is sad.":"audio/adv/a_f6dc18458732.mp3","He is hungry.":"audio/adv/a_a623704685ee.mp3","He is sleepy.":"audio/adv/a_2c1f43776814.mp3","He is hot.":"audio/adv/a_35b36f973f22.mp3","He is cold.":"audio/adv/a_73788d970df6.mp3","He is angry.":"audio/adv/a_c28793426a13.mp3","He is sick.":"audio/adv/a_a18940de3c33.mp3","She is happy.":"audio/adv/a_39196cd583b7.mp3","She is sad.":"audio/adv/a_85d1b9a6ee68.mp3","She is hungry.":"audio/adv/a_57747d138474.mp3","She is sleepy.":"audio/adv/a_0113bc32ce02.mp3","She is hot.":"audio/adv/a_8a78ec572358.mp3","She is cold.":"audio/adv/a_3c11b2b10448.mp3","She is angry.":"audio/adv/a_b9ff75381932.mp3","She is sick.":"audio/adv/a_2674c05d99f3.mp3","It is a dog.":"audio/adv/a_4803ad338863.mp3","They are dogs.":"audio/adv/a_0bbe01b727cb.mp3","It is a cat.":"audio/adv/a_94361c485925.mp3","They are cats.":"audio/adv/a_da3fe27c4ab4.mp3","It is a bird.":"audio/adv/a_33f853ee07f6.mp3","They are birds.":"audio/adv/a_27047a859f5c.mp3","It is a rabbit.":"audio/adv/a_feaf01cac562.mp3","They are rabbits.":"audio/adv/a_ba57d591eefe.mp3","It is a frog.":"audio/adv/a_70c432be5e61.mp3","They are frogs.":"audio/adv/a_9d112913c03b.mp3","It is a duck.":"audio/adv/a_78d8b8a581ab.mp3","They are ducks.":"audio/adv/a_92e5605370f6.mp3","We are happy.":"audio/adv/a_3642390e7b23.mp3","We are sad.":"audio/adv/a_b04765f9e33e.mp3","We are hungry.":"audio/adv/a_a46fa74ab81c.mp3","We are sleepy.":"audio/adv/a_32a1c2ba6cb8.mp3","We are hot.":"audio/adv/a_56691cd16786.mp3","We are cold.":"audio/adv/a_532254122d9e.mp3","We are angry.":"audio/adv/a_2707f70ba826.mp3","We are sick.":"audio/adv/a_2535806879e9.mp3","They are happy.":"audio/adv/a_51ee05b71de3.mp3","They are sad.":"audio/adv/a_a39f59e1dfb2.mp3","They are hungry.":"audio/adv/a_3884bb1e6a39.mp3","They are sleepy.":"audio/adv/a_085b969b028c.mp3","They are hot.":"audio/adv/a_d8283390293a.mp3","They are cold.":"audio/adv/a_dfd31ab8e713.mp3","They are angry.":"audio/adv/a_da392c126574.mp3","They are sick.":"audio/adv/a_b1c59711c454.mp3"};/*ADV_AUDIO_END*/
const BE_SUBJ = {
 I:   {w:"I",    e:"🙋",   zh:"我",   be:"am"},
 you: {w:"You",  e:"👉",   zh:"你",   be:"are"},
 he:  {w:"He",   e:"👦",   zh:"他",   be:"is"},
 she: {w:"She",  e:"👧",   zh:"她",   be:"is"},
 it:  {w:"It",   e:"🐶",   zh:"牠",   be:"is"},
 we:  {w:"We",   e:"🙋🙋", zh:"我們", be:"are"},
 they:{w:"They", e:"👫",   zh:"他們", be:"are"}};
const BE_FEEL = [["happy","😄","很開心"],["sad","😢","很難過"],["hungry","😋","肚子餓了"],["sleepy","😴","想睡覺"],
 ["hot","🥵","好熱"],["cold","🥶","好冷"],["angry","😠","很生氣"],["sick","🤒","生病了"]];
const BE_ANIMAL = [["dog","🐶","狗"],["cat","🐱","貓"],["bird","🐦","鳥"],["rabbit","🐰","兔子"],["frog","🐸","青蛙"],["duck","🦆","鴨子"]];
const ADV_DAILY_GOAL = 2;      // stages per day before the "time for a break" message
const ADV_CLEAR_CANS = 5;      // 🥫 for a stage's first clear
const ADV_CLEAR_XP = 10;
const ADV_ROOMS = [   // World 1
 {k:"listen", ic:"👂", zh:"聽聲音，找到對的圖片"},
 {k:"letter", ic:"🔤", zh:"這個東西是哪個字母開頭？"},
 {k:"memory", ic:"🃏", zh:"翻牌配對：圖片和英文配成一對"},
 {k:"speak",  ic:"🗣️", zh:"聽一聽，再大聲說出來"}];
const ADV_ROOMS_BE = [   // World 2
 {k:"learn",  ic:"📖", zh:"先看一看：誰配哪一個？"},
 {k:"listen", ic:"👂", zh:"聽句子，找到對的圖片"},
 {k:"be",     ic:"🧩", zh:"選一選：am、is 還是 are？"},
 {k:"build",  ic:"🚂", zh:"照順序點字卡，排出句子"},
 {k:"speak",  ic:"🗣️", zh:"聽一聽，再大聲說出來"}];
let ADV = null;

function advData(){ const a = store.data.adv = store.data.adv || {}; a.stages = a.stages || {}; a.day = a.day || {d:null, n:0}; return a; }
function advAll(){ return ADV_WORLDS.flatMap(w=>w.stages); }
function advStage(id){ return advAll().find(s=>s.id===id); }
function advWorldOf(st){ return ADV_WORLDS.find(w=>w.stages.includes(st)); }
/* each world's first stage is open (older kids can skip the ABCs); inside a world, one by one */
function advUnlocked(st){ const w=advWorldOf(st), i=w.stages.indexOf(st); return i===0 || !!advData().stages[w.stages[i-1].id]; }
function advToday(){ const a=advData(); return a.day.d===todayKey() ? a.day.n : 0; }
/* next stage = keep going in the world played most recently, else the first uncleared stage */
function advNext(){
  const a=advData(); let last=null, at="";
  advAll().forEach(s=>{ const r=a.stages[s.id]; if(r && (r.at||"")>=at){ at=r.at||""; last=s; } });
  const inWorld = last && advWorldOf(last).stages.find(s=>!a.stages[s.id]);
  return inWorld || advAll().find(s=>!a.stages[s.id]) || null;
}
function advLabel(st){ return st.label || st.letters.split("").join(" "); }
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
function advWord(w){
  if(typeof PH_AUDIO!=="undefined" && !advWord.merged){ Object.assign(PH_AUDIO, ADV_AUDIO); advWord.merged=true; }
  if(typeof phSpeak==="function") phSpeak(w, 0.9); else speak(w);
}

/* ---------- World 2 sentence data ---------- */
function beFeel(sk, f){
  const S = BE_SUBJ[sk];
  return {w:`${S.w} ${S.be} ${f[0]}.`, words:[S.w, S.be, f[0]], subj:sk, be:S.be, key:f[0], kind:"feel",
    e:S.e+f[1], lab:S.zh, zh:`${S.zh}${f[2]}。`};
}
function beAnimal(many, a){
  return many
    ? {w:`They are ${a[0]}s.`, words:["They","are",a[0]+"s"], subj:"they", be:"are", key:a[0], many:true, kind:"animal", e:a[1]+a[1], lab:"", zh:`牠們是${a[2]}。`}
    : {w:`It is a ${a[0]}.`, words:["It","is","a",a[0]], subj:"it", be:"is", key:a[0], many:false, kind:"animal", e:a[1], lab:"", zh:`牠是一隻${a[2]}。`};
}
function beItems(st){
  const feel = sks => sks.flatMap(sk=>BE_FEEL.map(f=>beFeel(sk, f)));
  const animals = () => BE_ANIMAL.flatMap(a=>[beAnimal(false,a), beAnimal(true,a)]);
  if(st.kind==="feel") return feel(st.subj);
  if(st.kind==="animal") return animals();
  return [...feel(["I","you","he","she","we","they"]), ...animals()];
}
/* every sentence World 2 can say — tools/gen_adv_audio.mjs renders these */
function advBeAllSentences(){
  const out = new Set();
  ADV_WORLDS.filter(w=>w.kind==="be").forEach(w=>w.stages.forEach(st=>beItems(st).forEach(it=>out.add(it.w))));
  return [...out];
}
/* a recognizer result counts if it has every word of the target (contractions expanded, "a" optional) */
function advExpand(s){
  return (" "+s+" ").replace(/ i'm /g," i am ").replace(/ (you|we|they)'re /g," $1 are ").replace(/ (he|she|it)'s /g," $1 is ").trim();
}
function advHeardOk(alts, t){
  const want = srNorm(t.w).split(" ").filter(x=>x && x!=="a");
  return alts.some(a=>{ const got = advExpand(srNorm(a)).split(" "); return want.every(x=>got.includes(x)); });
}

/* ---------- home card + map ---------- */
function advHomeCard(){
  if(typeof currentUser==="function" && !currentUser()) return "";
  const nx = advNext(), today = advToday();
  const line = nx ? `下一關：${advWorldOf(nx).title} · ${advLabel(nx)}` : "所有世界都破關了！🏆";
  return `<section class="card adv-home"><div class="adv-home-art">🗺️</div>
    <div class="adv-home-txt"><div class="eyebrow">小冒險 · 每關 5 分鐘</div><h2>${line}</h2>
    <p>聽一聽、點一點、排一排、說說看——每關幾個小遊戲，玩完開寶箱。今天已完成 <b>${today}</b> / ${ADV_DAILY_GOAL} 關</p></div>
    <a class="btn btn-primary adv-home-go" href="#/adventure${nx?"/"+nx.id:""}">▶ ${nx?"開始冒險":"回到地圖"}</a></section>`;
}
function renderAdventure(){
  advQuit(true);
  const a = advData(), today = advToday(), nx = advNext();
  const nodes = ADV_WORLDS.map((w,wi)=>{
    const items = w.stages.map((st,i)=>{
      const rec = a.stages[st.id], open = advUnlocked(st), isNext = !rec && open;
      const cls = rec ? "done" : open ? "next" : "locked";
      const inner = `<span class="adv-node-ic">${open?st.icon:"🔒"}</span><span class="adv-node-lv">${st.boss?"大魔王":`第 ${i+1} 關`}</span><span class="adv-node-l">${advLabel(st).split(" · ").length===2?advLabel(st).replace(" · ","<br>"):advLabel(st)}</span>`;
      const stars = rec ? `<span class="adv-node-stars">${advStars(rec.stars||1)}</span>` : isNext ? `<span class="adv-node-stars go">${st===nx?"▶ 從這裡開始":"▶ 可以挑戰"}</span>` : "";
      return `<div class="adv-step ${i%2?"r":"l"}">${open
        ? `<a class="adv-node ${cls}${st.boss?" boss":""}" href="#/adventure/${st.id}">${inner}</a>`
        : `<div class="adv-node ${cls}${st.boss?" boss":""}" aria-disabled="true">${inner}</div>`}${stars}</div>`;
    }).join("");
    const cleared = w.stages.filter(st=>a.stages[st.id]).length;
    return `<section class="adv-world adv-${w.kind}" id="adv-${w.id}"><div class="adv-world-h"><span>${w.emoji}</span><div><b>世界 ${wi+1} · ${w.title}</b><small>${w.en}：${w.sub}　（${cleared}/${w.stages.length}）</small>${w.note&&!cleared?`<small class="adv-world-note">${w.note}</small>`:""}</div></div>
      <div class="adv-path">${items}</div></section>`;
  }).join("");
  const rest = today >= ADV_DAILY_GOAL
    ? `<div class="adv-rest">🎉 今天的冒險完成了（${today} 關）！眼睛休息一下，明天再來找貓咪。<span>還想玩也可以繼續 🐾</span></div>`
    : `<div class="adv-today">今天的冒險：<b>${today}</b> / ${ADV_DAILY_GOAL} 關 ${"🐾".repeat(today)}${"·".repeat(Math.max(0,ADV_DAILY_GOAL-today))}</div>`;
  app.innerHTML = `<div class="view adv">
    <div class="crumb"><a href="#/home">Home</a> › 小冒險</div>
    <div class="adv-hero"><div><div class="eyebrow">Mini Adventures · 小冒險</div>
      <h1 class="display">貓咪島小冒險 🗺️</h1>
      <p>一關只要 5 分鐘：聽一聽 → 點一點 → 排一排 → 說說看 → 🎁 開寶箱！破關拿罐罐 🥫，一關一關往前走。</p></div>
      <div class="adv-hero-cat">${typeof catSVG==="function"?catSVG(110,"orange"):""}</div></div>
    ${rest}
    ${nodes}
  </div>`;
}

/* ---------- a stage ---------- */
function advStart(id){
  const st = advStage(id);
  if(!st){ location.hash = "#/adventure"; return; }
  if(!advUnlocked(st)){ toast("先完成前面的關卡喔 🐾"); location.hash = "#/adventure"; return; }
  advQuit(true);
  if(advWorldOf(st).kind==="be"){ advStartBe(st); return; }
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
  ADV = {st, rooms:ADV_ROOMS, room:0, step:0, first:{ok:0,n:0}, tried:false, wrong:{}, locked:false,
    listen, letter, mem:{pairs, cards, open:[], done:{}, busy:false}, speak:speakW, sp:{tries:0, state:"idle", heard:""}};
  advRender(); advAutoAudio();
}
/* World 2: one small set of sentences ("core") travels through every room */
function advStartBe(st){
  const pool = shuffle(beItems(st)), n = st.boss ? 5 : 4;
  const subs = [...new Set(pool.map(x=>x.subj))], cap = Math.ceil(n/subs.length);
  const core = [], seen = {}, per = {};
  for(const it of pool){
    if(core.length>=n) break;
    if(seen[it.key] || (per[it.subj]||0)>=cap) continue;
    seen[it.key]=1; per[it.subj]=(per[it.subj]||0)+1; core.push(it);
  }
  for(const it of pool){ if(core.length>=n) break; if(!core.includes(it)) core.push(it); }
  const all = beItems(st);
  const pic = x => x.e+"|"+x.lab;
  const listen = core.map(t=>{
    /* one distractor changes "who", one changes "what" — both have to be heard to choose */
    const who  = t.kind==="animal" ? beAnimal(!t.many, BE_ANIMAL.find(a=>a[0]===t.key))
                                   : beFeel(shuffle(Object.keys(BE_SUBJ).filter(k=>k!==t.subj && k!=="it" && BE_SUBJ[k].e!==BE_SUBJ[t.subj].e))[0], BE_FEEL.find(f=>f[0]===t.key));
    const what = shuffle(all.filter(x=>x.kind===t.kind && x.key!==t.key && (t.kind==="animal" ? x.many===t.many : x.subj===t.subj)))[0];
    const opts = [t, who, what].filter((x,i,arr)=>x && arr.findIndex(y=>y && pic(y)===pic(x))===i);
    return {t, opts:shuffle(opts)};
  });
  const be = shuffle(core).map(t=>({t, opts:["am","is","are"]}));
  const build = shuffle(core).slice(0,3).map(t=>{
    let order; do{ order = shuffle(t.words.map((_,i)=>i)); }while(order.every((v,i)=>v===i));
    return {t, order};
  });
  const speakS = shuffle(core).slice(0,3);
  const learn = (st.boss ? ["I","she","they"] : st.subj).map(sk=>({sk, ex: core.find(x=>x.subj===sk) || pool.find(x=>x.subj===sk)}));
  ADV = {st, rooms:ADV_ROOMS_BE, room:0, step:0, first:{ok:0,n:0}, tried:false, wrong:{}, locked:false,
    learn, listen, be, build, bd:{step:-1, placed:[], err:false}, speak:speakS, sp:{tries:0, state:"idle", heard:""}};
  advRender(); advAutoAudio();
}
function advQuit(silent){
  if(ADV && typeof sr!=="undefined" && sr.busy) sr.stop();
  clearTimeout(advQuit._t); ADV = null;
}
function advPaws(){
  const n = ADV.rooms.length;
  return `<div class="adv-paws">${Array.from({length:n+1},(_,i)=>`<span class="${i<ADV.room?"on":i===ADV.room?"cur":""}">${i<n?"🐾":"🎁"}</span>`).join("")}</div>`;
}
function advRender(){
  if(!ADV) return;
  const R = ADV.rooms[ADV.room];
  if(!R){ advChest(); return; }
  const body = {listen:advListenHTML, letter:advLetterHTML, memory:advMemoryHTML, speak:advSpeakHTML,
    learn:advLearnHTML, be:advBeHTML, build:advBuildHTML}[R.k]();
  app.innerHTML = `<div class="view adv adv-play">
    <div class="adv-top"><a class="adv-x" href="#/adventure" aria-label="回地圖">✕</a>${advPaws()}<span class="adv-stagelbl">${advLabel(ADV.st)}</span></div>
    <div class="adv-room-h"><span class="adv-room-ic">${R.ic}</span><span class="adv-room-zh">${R.zh}</span>
      <button class="adv-hear-zh" onclick="advSayZh(ADV.rooms[ADV.room].zh)" aria-label="唸題目給我聽">🔈</button></div>
    <div class="adv-body">${body}</div></div>`;
}
function advAutoAudio(){
  if(!ADV) return; const R = ADV.rooms[ADV.room]; if(!R) return;
  clearTimeout(advQuit._t);
  const say = w => { advQuit._t = setTimeout(()=>ADV && advWord(w), 350); };
  if(R.k==="listen") say(ADV.listen[ADV.step].t.w);
  else if(R.k==="speak") say(ADV.speak[ADV.step].w);
  else if(R.k==="build") say(ADV.build[ADV.step].t.w);
}
function advNextRoom(){ if(!ADV) return; ADV.room++; ADV.step=0; ADV.tried=false; ADV.wrong={}; ADV.locked=false; advRender(); advAutoAudio(); }
function advStepDone(total){
  ADV.locked = true;
  advQuit._t = setTimeout(()=>{ if(!ADV) return; ADV.locked=false; ADV.tried=false; ADV.wrong={};
    if(ADV.step+1 >= total) advNextRoom(); else { ADV.step++; advRender(); advAutoAudio(); } }, 950);
}
function advFirst(ok){ if(!ADV.tried){ ADV.tried=true; ADV.first.n++; if(ok) ADV.first.ok++; } }
function advDots(total){ return `<div class="adv-dots">${Array.from({length:total},(_,i)=>`<i class="${i<ADV.step?"on":i===ADV.step?"cur":""}"></i>`).join("")}</div>`; }
function advPicInner(o){ return `<span class="adv-pic-e${Array.from(o.e).length>1?" duo":""}">${o.e}</span>${o.lab?`<small class="adv-pic-lab">${o.lab}</small>`:""}`; }

/* room 1 · listen → tap the picture */
function advListenHTML(){
  const r = ADV.listen[ADV.step];
  return `${advDots(ADV.listen.length)}
    <button class="adv-big-hear" onclick="advWord(ADV.listen[ADV.step].t.w)">🔊 再聽一次</button>
    <div class="adv-pics">${r.opts.map((o,k)=>`<button class="adv-pic ${ADV.wrong[k]?"no":""} ${ADV.locked&&o===r.t?"yes":""}" ${ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advListenPick(${k})">${advPicInner(o)}</button>`).join("")}</div>
    ${ADV.locked?`<div class="adv-yay">✓ ${r.t.w}　${r.t.zh}</div>`:Object.keys(ADV.wrong).length?`<div class="adv-hint">${ADV.st.letters?"再聽一次，仔細聽喔 👂":"聽清楚：是誰？怎麼了？再試一次 👂"}</div>`:""}`;
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
    <div class="adv-say-card"><span class="adv-say-e">${t.e}</span><span class="adv-say-w${t.w.includes(" ")?" long":""}">${t.w}</span><span class="adv-say-zh">${t.zh}</span></div>
    <button class="adv-big-hear" onclick="advWord(ADV.speak[ADV.step].w)">🔊 聽示範</button>
    <div class="adv-say-ctl">${ctl}</div>`;
}
function advListenMe(){
  if(!ADV || ADV.sp.state==="listening") return;
  tts.stop(); ADV.sp.state="listening"; advRender();
  const t = ADV.speak[ADV.step];
  sr.start(alts=>{
    if(!ADV) return;
    const hit = advHeardOk(alts, t);
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

/* World 2 · room 0 · learn: who goes with am / is / are (no score) */
function advLearnHTML(){
  const groups = [["am",["I"]],["is",["he","she","it"]],["are",["you","we","they"]]];
  const inStage = sk => ADV.st.subj.includes(sk);
  const cards = ADV.learn.map((x,k)=>{ const S=BE_SUBJ[x.sk], ex=x.ex;
    return `<button class="adv-learn-card" onclick="advWord(ADV.learn[${k}].ex.w)">
      <span class="adv-learn-e">${ex.kind==="animal"?ex.e:S.e}</span>
      <span class="adv-learn-pair"><b>${S.w}</b> <i class="be-${S.be}">${S.be}</i></span>
      <span class="adv-learn-ex">${ex.w} 🔊</span><small>${ex.zh}</small></button>`; }).join("");
  const table = `<div class="adv-rule">${groups.map(([be,sks])=>`<div class="adv-rule-row"><i class="be-${be}">${be}</i><span>${sks.map(sk=>`<b class="${inStage(sk)?"on":""}">${BE_SUBJ[sk].w}</b>`).join("")}</span></div>`).join("")}</div>`;
  return `<div class="adv-learn">${cards}</div>
    <p class="adv-tip">💡 ${ADV.st.tip}</p>${table}
    <button class="btn btn-primary adv-done-btn" onclick="advNextRoom()">我記住了，出發 ▶</button>`;
}

/* World 2 · room 2 · pick am / is / are */
function advBeHTML(){
  const r = ADV.be[ADV.step], t = r.t, rest = t.words.slice(2).join(" ");
  const blank = ADV.locked ? `<b class="adv-blank fill be-${t.be}">${t.be}</b>` : `<span class="adv-blank">？</span>`;
  return `${advDots(ADV.be.length)}
    <div class="adv-be-pic">${advPicInner(t)}</div>
    <div class="adv-sent">${t.words[0]} ${blank} ${rest}.</div>
    <div class="adv-letters">${r.opts.map((b,k)=>`<button class="adv-letter adv-be-opt be-${b} ${ADV.wrong[k]?"no":""} ${ADV.locked&&b===t.be?"yes":""}" ${ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advBePick(${k})">${b}</button>`).join("")}</div>
    ${ADV.locked?`<div class="adv-yay">✓ ${t.w}　${t.zh}</div>`:Object.keys(ADV.wrong).length?`<div class="adv-hint">想一想：主角是「${t.lab||(t.many?"很多隻":"一隻")}」<br><span class="adv-hint-rule"><span>I → am</span><span>he / she / it → is</span><span>you / we / they → are</span></span></div>`:""}`;
}
function advBePick(k){
  if(!ADV || ADV.locked) return;
  const r = ADV.be[ADV.step], ok = r.opts[k]===r.t.be;
  advFirst(ok);
  if(ok){ advRender(); advWord(r.t.w); advStepDone(ADV.be.length); }
  else { ADV.wrong[k]=1; advRender(); }
}

/* World 2 · room 3 · sentence train: tap the word cards in order */
function advBuildHTML(){
  const r = ADV.build[ADV.step], t = r.t, bd = ADV.bd;
  if(bd.step!==ADV.step) ADV.bd = {step:ADV.step, placed:[], err:false};
  const placed = ADV.bd.placed, done = placed.length===t.words.length;
  const line = t.words.map((w,i)=>`<span class="adv-slot ${i<placed.length?"on":""}">${i<placed.length?w:""}</span>`).join("") + (done?`<span class="adv-dot">.</span>`:"");
  const tiles = r.order.map(i=>`<button class="adv-tile ${ADV.wrong[i]?"no":""}" ${placed.includes(i)?"style=\"visibility:hidden\"":""} ${done?"disabled":""} onclick="advTile(${i})">${t.words[i]}</button>`).join("");
  return `${advDots(ADV.build.length)}
    <div class="adv-be-pic small">${advPicInner(t)}</div>
    <div class="adv-line">🚂${line}</div>
    <div class="adv-tiles">${tiles}</div>
    <button class="adv-big-hear" onclick="advWord(ADV.build[ADV.step].t.w)">🔊 聽句子</button>
    ${done?`<div class="adv-yay">✓ ${t.w}　${t.zh}</div>`:ADV.bd.err?`<div class="adv-hint">${placed.length?"再聽一次，下一個字是什麼？🔊":"聽一次句子，第一個字是誰？🔊"}</div>`:""}`;
}
function advTile(i){
  if(!ADV || ADV.locked) return;
  const t = ADV.build[ADV.step].t, bd = ADV.bd;
  if(bd.placed.includes(i)) return;
  if(t.words[i]===t.words[bd.placed.length]){
    bd.placed.push(i); ADV.wrong={};
    if(bd.placed.length===t.words.length){ ADV.tried=false; advFirst(!bd.err); advRender(); advWord(t.w); advStepDone(ADV.build.length); }
    else advRender();
  } else {
    bd.err = true; ADV.wrong = {[i]:1}; advRender();
    setTimeout(()=>{ if(ADV && ADV.wrong[i]){ ADV.wrong={}; advRender(); } }, 650);
  }
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
  const w = advWorldOf(st), nx = advNext(), worldDone = w.stages.every(x=>a.stages[x.id]), today = a.day.n;
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
        ${worldDone?`<div class="adv-yay">🏆 ${w.title}全部破關！</div>`:""}
        ${nx?`<a class="btn btn-primary" href="#/adventure/${nx.id}">${advWorldOf(nx)!==w?`前往${advWorldOf(nx).title}：`:"下一關："}${advLabel(nx)} →</a>`:""}
        <a class="btn btn-ghost" href="#/adventure">回到地圖</a>
        <a class="btn btn-ghost" href="#/cats">🐱 看貓咪</a>
      </div>
    </div></div>`;
  ADV = null;
}
window.addEventListener("hashchange", ()=>{ const h=(location.hash||"").slice(2).split("/"); if(ADV && !(h[0]==="adventure" && h[1]===ADV.st.id)) advQuit(true); });
