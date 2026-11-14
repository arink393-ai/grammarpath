/* =====================================================
   使用時間：學生在網站上「實際操作」的時間（登入用時）＋每份作業花的時間
   - 只算頁面在前景、且有操作（點擊／鍵盤／捲動／觸控）的時間；閒置超過 2 分鐘不算（錄音中除外）
   - 老師帳號不記錄。資料存在學生自己的 progress.data（usage / usageAsg），跟著原本的進度同步，不需要新資料表
   - 每個裝置各寫各的（usage[日期][裝置代號]），多個裝置同時用也不會互相蓋掉
   - 台灣時間（UTC+8）算日期
   本檔在主程式之前載入；呼叫時才用 store／CLOUD／currentUser／isTeacher
   ===================================================== */
(function(root){
  const IDLE_MS = 120000, TICK_MS = 5000, FLUSH_MS = 60000, SESSION_GAP = 30*60000, KEEP_DAYS = 90;
  const KIND_LABEL = {lesson:"文法課", reading:"閱讀", story:"故事", daily:"每日練習", homework:"作業頁", game:"遊戲", home:"首頁", other:"其他"};

  /* ---------- 純函式（node 測試用） ---------- */
  const dayKey = ms => new Date(ms + 8*3600e3).toISOString().slice(0,10);
  const hhmm = ms => new Date(ms + 8*3600e3).toISOString().slice(11,16);
  function fmt(sec){
    sec = Math.round(Number(sec)||0);
    if(sec <= 0) return "—";
    if(sec < 60) return "不到 1 分";
    const m = Math.round(sec/60), h = Math.floor(m/60);
    return h ? `${h} 小時${m%60 ? " "+(m%60)+" 分" : ""}` : `${m} 分`;
  }
  function routeKind(hash){
    const a = String(hash||"").replace(/^#\/?/,"").split("/")[0];
    if(["lesson","practice","worksheet","worksheets","level","cheatsheet"].includes(a)) return "lesson";
    if(["reading","readgame","unitread","rubric"].includes(a)) return "reading";
    if(["story","fableworksheet"].includes(a)) return "story";
    if(["daily","vocab"].includes(a)) return "daily";
    if(a === "homework") return "homework";
    if(["game","games","adventure","crossword","wordle","island","cats","participles","verbforms"].includes(a)) return "game";
    if(a === "" || a === "home") return "home";
    return "other";
  }
  /* 這個網址對應到哪些「作業範圍項目」 */
  function routeItems(hash){
    const p = String(hash||"").replace(/^#\/?/,"").split("/"), a = p[0], id = p[1];
    if(!id) return [];
    if(["lesson","practice","worksheet"].includes(a)) return [{t:"lesson", id}];
    if(["reading","readgame"].includes(a) && id !== "topic") return [{t:"reading", id}, {t:"readaloud", id}];
    if(a === "story" && !/^(fables?|picture-?books?|picturebook)$/.test(id)) return [{t:"story", id}];
    return [];
  }
  /* 目前這一頁的時間，要算進哪些「還沒交」的作業 */
  function matchAssignments(items, assignments, submittedIds){
    if(!items.length) return [];
    return (assignments||[]).filter(a => a.active !== false && !(submittedIds && submittedIds.has(a.id))
      && (a.scope||[]).some(it => items.some(x => x.t === it.t && x.id === it.id))).map(a => a.id);
  }
  /* 把這次累積的秒數寫進 data（store.data）。o：{day, dev, now, kinds:{kind:sec}, asg:{aid:sec}, newSession} */
  function addTo(data, o){
    const total = Object.values(o.kinds||{}).reduce((a,b)=>a+b, 0);
    if(total > 0 || o.newSession){
      data.usage = data.usage || {};
      const day = data.usage[o.day] = data.usage[o.day] || {};
      const r = day[o.dev] = day[o.dev] || {s:0, n:0, f:o.now, l:o.now, k:{}};
      r.s += total; r.l = o.now; if(!r.f) r.f = o.now; if(o.newSession) r.n = (r.n||0) + 1;
      r.k = r.k || {}; Object.entries(o.kinds||{}).forEach(([k,v]) => { if(v>0) r.k[k] = (r.k[k]||0) + v; });
    }
    Object.entries(o.asg||{}).forEach(([aid, v]) => {
      if(!(v > 0)) return;
      data.usageAsg = data.usageAsg || {};
      const a = data.usageAsg[aid] = data.usageAsg[aid] || {};
      a[o.dev] = (a[o.dev]||0) + v;
    });
    return data;
  }
  function prune(data, today, keepDays){
    const cut = dayKey(Date.parse(today+"T00:00:00Z") - (keepDays||KEEP_DAYS)*864e5);
    Object.keys(data.usage||{}).forEach(d => { if(d < cut) delete data.usage[d]; });
  }
  /* 各裝置加總：{日期: {s, n, f, l, k:{}}} */
  function daysMap(data){
    const out = {};
    Object.entries((data && data.usage) || {}).forEach(([d, devs]) => {
      const t = out[d] = {s:0, n:0, f:null, l:null, k:{}};
      Object.values(devs||{}).forEach(r => {
        t.s += r.s||0; t.n += r.n||0;
        if(r.f && (!t.f || r.f < t.f)) t.f = r.f;
        if(r.l && (!t.l || r.l > t.l)) t.l = r.l;
        Object.entries(r.k||{}).forEach(([k,v]) => { t.k[k] = (t.k[k]||0) + v; });
      });
    });
    return out;
  }
  /* 最近 n 天（含今天）的總秒數／使用天數／次數／各類型 */
  function sumDays(data, n, nowMs){
    const m = daysMap(data), t = {s:0, days:0, n:0, k:{}};
    for(let i=0; i<n; i++){
      const r = m[dayKey((nowMs||Date.now()) - i*864e5)]; if(!r || !r.s) continue;
      t.s += r.s; t.days++; t.n += r.n; Object.entries(r.k).forEach(([k,v]) => { t.k[k] = (t.k[k]||0) + v; });
    }
    return t;
  }
  const asgSec = (data, aid) => Object.values(((data && data.usageAsg) || {})[aid] || {}).reduce((a,b)=>a+b, 0);

  /* ---------- 老師看的畫面 ---------- */
  const escDef = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const WD = "日一二三四五六";
  function panelHTML(data, titleOf, esc, nowMs){
    esc = esc || escDef; nowMs = nowMs || Date.now();
    const m = daysMap(data), list = [];
    for(let i=13; i>=0; i--) list.push(dayKey(nowMs - i*864e5));
    const max = Math.max(1800, ...list.map(d => (m[d]||{}).s||0));
    const bars = list.map(d => {
      const r = m[d], wd = WD[new Date(d+"T00:00:00Z").getUTCDay()];
      const tip = r && r.s ? `${d}（週${wd}）：${fmt(r.s)}・${r.n||1} 次・${hhmm(r.f)}–${hhmm(r.l)}` : `${d}（週${wd}）：沒有使用`;
      return `<div class="us-col" title="${esc(tip)}"><div class="us-bar"><i class="${r&&r.s?"":"zero"}" style="height:${r&&r.s?Math.max(6,Math.round(r.s/max*100)):0}%"></i></div><span class="us-d ${d===dayKey(nowMs)?"today":""}">${d.slice(8)}</span></div>`;
    }).join("");
    const t1 = sumDays(data,1,nowMs), t7 = sumDays(data,7,nowMs), t30 = sumDays(data,30,nowMs);
    const stat = (l, v) => `<span><b>${v}</b> ${l}</span>`;
    const kinds = Object.entries(t30.k).sort((a,b)=>b[1]-a[1]).map(([k,v]) => `<span class="us-kind">${esc(KIND_LABEL[k]||k)} ${fmt(v)}</span>`).join("");
    const asg = Object.keys((data&&data.usageAsg)||{}).map(aid => ({aid, s:asgSec(data,aid), title:titleOf?titleOf(aid):aid})).filter(x => x.s>0 && x.title)
      .sort((a,b)=>b.s-a.s).map(x => `<span class="us-kind asg">📝 ${esc(x.title)} <b>${fmt(x.s)}</b></span>`).join("");
    if(!t30.s && !asg) return `<div class="us-panel"><div class="us-h">⏱ 使用時間</div><div class="tc-sub">這位學生近 30 天沒有使用紀錄（或還沒更新到有記錄功能的版本）。</div></div>`;
    return `<div class="us-panel"><div class="us-h">⏱ 使用時間 <span class="tc-sub">只算畫面在前景、有實際操作的時間；閒置超過 2 分鐘不算</span></div>
      <div class="us-stats">${stat("今天", fmt(t1.s))}${stat("近 7 天", fmt(t7.s))}${stat("近 30 天", fmt(t30.s))}${stat("近 30 天使用", t30.days+" 天")}${t30.days?stat("平均每個使用日", fmt(t30.s/t30.days)):""}${stat("近 7 天使用", t7.n+" 次")}</div>
      <div class="us-chart" role="img" aria-label="近 14 天每天使用時間">${bars}</div>
      ${kinds?`<div class="us-kinds"><span class="tc-sub">近 30 天花在：</span>${kinds}</div>`:""}
      ${asg?`<div class="us-kinds"><span class="tc-sub">各作業（含寫作業相關的課文、練習）：</span>${asg}</div>`:""}</div>`;
  }

  const API = {fmt, dayKey, hhmm, routeKind, routeItems, matchAssignments, addTo, prune, daysMap, sumDays, asgSec, panelHTML, KIND_LABEL, IDLE_MS};
  if(typeof module === "object") module.exports = API;
  root.Usage = Object.assign(root.Usage || {}, API);

  /* ---------- 瀏覽器端的記錄器 ---------- */
  if(typeof document === "undefined") return;
  const S = {lastAct:Date.now(), lastTick:Date.now(), kinds:{}, asg:{}, asgList:[], subbed:new Set(), asgAt:0, cardAid:null, started:false};
  const note = () => { S.lastAct = Date.now(); };
  ["pointerdown","keydown","wheel","touchstart","touchmove","input","focusin"].forEach(e => document.addEventListener(e, note, {passive:true, capture:true}));
  document.addEventListener("scroll", note, {passive:true, capture:true});
  let mm = 0; document.addEventListener("mousemove", () => { const n = Date.now(); if(n - mm > 2000){ mm = n; note(); } }, {passive:true});

  const eligible = () => typeof store !== "undefined" && typeof currentUser === "function" && !!currentUser() && !(typeof isTeacher === "function" && isTeacher());
  const recording = () => { try{ return (typeof HWREC !== "undefined" && Object.values(HWREC).some(r => r.state === "rec")) || (typeof RA !== "undefined" && RA && RA.rec); }catch(e){ return false; } };
  const devId = () => { try{ let d = localStorage.getItem("eci_dev"); if(!d){ d = Math.random().toString(36).slice(2,8); localStorage.setItem("eci_dev", d); } return d; }catch(e){ return "x"; } };

  async function loadAsg(){
    if(typeof CLOUD === "undefined" || !CLOUD.on || !CLOUD.user || Date.now() - S.asgAt < 15*60000) return;
    S.asgAt = Date.now();
    try{
      const [as, subs] = await Promise.all([CLOUD.listAssignments(), CLOUD.mySubmissions()]);
      API.setAssignments(as, subs);
    }catch(e){ S.asgAt = Date.now() - 14*60000; }   // 失敗 1 分鐘後再試
  }
  function tick(now, ctx){
    now = now || Date.now(); ctx = ctx || {};
    const dt = Math.min(now - S.lastTick, TICK_MS*2); S.lastTick = now;
    if(!eligible()) return;
    if((ctx.visible !== undefined ? ctx.visible : document.visibilityState === "visible") === false) return;
    loadAsg();
    if(now - (ctx.lastAct !== undefined ? ctx.lastAct : S.lastAct) > IDLE_MS && !(ctx.recording !== undefined ? ctx.recording : recording())) return;
    const hash = ctx.hash !== undefined ? ctx.hash : location.hash, sec = dt/1000, kind = routeKind(hash);
    S.kinds[kind] = (S.kinds[kind]||0) + sec;
    let aids = matchAssignments(routeItems(hash), S.asgList, S.subbed);
    if(/^#\/homework/.test(hash) && S.cardAid && !S.subbed.has(S.cardAid)) aids = [...new Set([...aids, S.cardAid])];
    aids.forEach(a => { S.asg[a] = (S.asg[a]||0) + sec; });
  }
  function flush(now){
    now = now || Date.now();
    if(!eligible()) return;
    const kinds = {}, asg = {}; let any = false;
    Object.keys(S.kinds).forEach(k => { const w = Math.floor(S.kinds[k]); if(w > 0){ kinds[k] = w; S.kinds[k] -= w; any = true; } });
    Object.keys(S.asg).forEach(a => { const w = Math.floor(S.asg[a]); if(w > 0){ asg[a] = w; S.asg[a] -= w; any = true; } });
    if(!any) return;
    let last = 0; try{ last = +localStorage.getItem("eci_usage_last") || 0; }catch(e){}
    const newSession = now - last > SESSION_GAP;
    try{ localStorage.setItem("eci_usage_last", String(now)); }catch(e){}
    store.data = addTo(store.data, {day:dayKey(now), dev:devId(), now, kinds, asg, newSession});
    prune(store.data, dayKey(now));
    store.save();
  }
  API.setAssignments = function(as, subs){
    S.asgList = (as||[]).filter(a => a.active !== false);
    S.subbed = new Set((subs||[]).filter(s => s.assignment_id).map(s => s.assignment_id));
    S.asgAt = Date.now();
  };
  API.setCard = function(aid, open){ if(open) S.cardAid = aid; else if(S.cardAid === aid) S.cardAid = null; };
  API._test = {S, tick, flush};
  Object.assign(root.Usage, {setAssignments:API.setAssignments, setCard:API.setCard, _test:API._test});

  window.addEventListener("hashchange", () => { if(!/^#\/homework/.test(location.hash)) S.cardAid = null; });
  document.addEventListener("visibilitychange", () => { if(document.visibilityState === "hidden") flush(); else { S.lastTick = Date.now(); } });
  window.addEventListener("pagehide", () => flush());
  setInterval(() => tick(), TICK_MS);
  setInterval(() => flush(), FLUSH_MS);
})(typeof window !== "undefined" ? window : globalThis);
