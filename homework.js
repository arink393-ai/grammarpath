/* =====================================================
   作業 2.0：指定範圍、指定學生／分組、開放日期；錄音直接交給老師
   需要 supabase/migrations/20261016120000_homework_groups_scope.sql
   （student_groups / group_members、assignments.target_* / scope / start_date、submissions.kind / source）
   ===================================================== */

/* ---------- 雲端（呼叫時才用 CLOUD／SB，所以本檔可以在主程式之前載入） ---------- */
const HWAPI = {
  async createAssignment(f){
    const { error } = await SB.from("assignments").insert({ ...hwRow(f), created_by:CLOUD.user.id });
    return error ? {err:error.message} : {ok:true};
  },
  async updateAssignment(id, f){
    const { error } = await SB.from("assignments").update(hwRow(f)).eq("id", id);
    return error ? {err:error.message} : {ok:true};
  },
  async loadGroups(){
    const [g, m] = await Promise.all([
      SB.from("student_groups").select("*").order("created_at",{ascending:true}),
      SB.from("group_members").select("*")
    ]);
    if(g.error) throw g.error; if(m.error) throw m.error;
    return { groups:g.data||[], members:m.data||[] };
  },
  async saveGroup(id, name, userIds){
    let gid = id;
    if(gid){
      const { error } = await SB.from("student_groups").update({ name }).eq("id", gid);
      if(error) return {err:error.message};
      const del = await SB.from("group_members").delete().eq("group_id", gid);
      if(del.error) return {err:del.error.message};
    } else {
      const { data, error } = await SB.from("student_groups").insert({ name }).select("id").single();
      if(error) return {err:error.message};
      gid = data.id;
    }
    if(userIds.length){
      const { error } = await SB.from("group_members").insert(userIds.map(u=>({ group_id:gid, user_id:u })));
      if(error) return {err:error.message};
    }
    return {ok:true, id:gid};
  },
  async deleteGroup(id){
    const { error } = await SB.from("student_groups").delete().eq("id", id);
    return error ? {err:error.message} : {ok:true};
  },
  /* 不指定作業，直接交給老師（錄音等） */
  async submitFree({ kind, source, text, file }){
    const payload = { assignment_id:null, user_id:CLOUD.user.id, kind:kind||null, source:source||null, text:text||null, status:"submitted", submitted_at:new Date().toISOString() };
    if(file){
      const ext = (file.name.split(".").pop()||"dat").toLowerCase().replace(/[^a-z0-9]/g,"") || "dat";
      const path = `${CLOUD.user.id}/free_${Date.now()}.${ext}`;
      const up = await SB.storage.from("homework").upload(path, file, { upsert:false });
      if(up.error) return {err:"檔案上傳失敗 File upload failed: "+up.error.message};
      payload.file_url = path;
    }
    const { error } = await SB.from("submissions").insert(payload);
    return error ? {err:error.message} : {ok:true};
  }
};
function hwRow(f){
  return { title:f.title, description:f.description||null, due_date:f.due_date||null, start_date:f.start_date||null,
    target_students:f.target_students||[], target_groups:f.target_groups||[], scope:f.scope||[] };
}

/* ---------- 範圍（scope） ---------- */
/* 項目：{t:"lesson",id} 文法課 · {t:"reading",id} 閱讀文章 · {t:"story",id} 故事／寓言
        · {t:"readaloud",id,lv} 指定文章的跟讀錄音（lv＝a/b/c 指定程度，空＝不限） */
const RA_LV = {a:"A 初級", b:"B 中級", c:"C 高級"};
function scopeInfo(it){
  if(it.t==="lesson"){ const l=lessonById(it.id); return l && {icon:"📘", label:l.title, zh:l.zh, href:"#/lesson/"+l.id}; }
  if(it.t==="reading"){ const r=(typeof READINGS!=="undefined"?READINGS:[]).find(x=>x.id===it.id); return r && {icon:"📰", label:r.topic, zh:r.zh, href:"#/reading/"+r.id}; }
  if(it.t==="story"){ const s=(typeof STORIES!=="undefined"?STORIES:[]).find(x=>x.id===it.id); return s && {icon:s.category==="fable"?"🦊":"📖", label:s.title, zh:s.zh||"", href:"#/story/"+s.id}; }
  if(it.t==="readaloud"){ const r=(typeof READINGS!=="undefined"?READINGS:[]).find(x=>x.id===it.id); return r && {icon:"🎤", label:"跟讀錄音："+r.topic, zh:it.lv&&RA_LV[it.lv]?"指定 "+RA_LV[it.lv]:"程度不限", href:"#/reading/"+r.id, rec:true}; }
  return null;
}
/* 完成判定：文法課＝練習完成；寓言＝做過讀後練習；其他＝打開看過 */
function scopeDone(it, d){
  d = d || {};
  if(it.t==="readaloud"){ const ra=d.readaloud||{}; return !!(it.lv ? ra[it.id+":"+it.lv] : ra[it.id]); }
  if(it.t==="lesson") return !!(d.completed && d.completed[it.id]);
  if(it.t==="story"){
    const s=(typeof STORIES!=="undefined"?STORIES:[]).find(x=>x.id===it.id);
    if(s && s.category==="fable" && d.fableQuiz && d.fableQuiz[it.id]) return true;
  }
  return !!(d.visited && d.visited[it.t+":"+it.id]);
}
function scopeChips(scope, d, linkable, aid){
  return (scope||[]).map(it=>{
    const inf=scopeInfo(it); if(!inf) return "";
    const done=d!==undefined && scopeDone(it,d);
    const inner=`${done?"✅":inf.icon} ${esc(inf.label)}${inf.zh?`<span class="hw-chip-zh">${esc(inf.zh)}</span>`:""}`;
    /* 跟讀錄音：直接跳到那篇文章的錄音區，並預選這份作業 */
    const href = inf.rec && aid ? `#/reading/${it.id}/rec/${aid}${it.lv?"/"+it.lv:""}` : inf.href;
    const label = inf.rec && linkable && !done ? `${inner}<span class="hw-chip-go">去錄音 →</span>` : inner;
    return linkable ? `<a class="hw-chip ${done?"done":""} ${inf.rec?"rec":""}" href="${href}">${label}</a>` : `<span class="hw-chip ${done?"done":""} ${inf.rec?"rec":""}">${inner}</span>`;
  }).join("");
}
/* 記錄學生打開過的閱讀／故事／課程，讓老師看得到「範圍」完成度 */
function hwMarkVisit(){
  if(typeof CLOUD==="undefined" || !(CLOUD.on && currentUser()) || isTeacher()) return;
  const h=(location.hash||"").slice(2).split("/");
  const t = h[0]==="reading" && h[1] && h[1]!=="topic" ? "reading" : h[0]==="story" && h[1] && !/^(fables?|picture-?books?|picturebook)$/.test(h[1]) ? "story" : h[0]==="lesson" && h[1] ? "lesson" : null;
  if(!t) return;
  store.data.visited = store.data.visited || {};
  const k=t+":"+h[1]; if(store.data.visited[k]) return;
  store.data.visited[k] = new Date().toISOString().slice(0,10);
  store.save();
}
/* index.html 的 route() 每次換頁都會呼叫 hwMarkVisit()（含直接開連結進來的第一頁） */

/* ---------- 錄音小工具（作業卡片、直接繳交共用） ---------- */
const HW_MAX_BYTES = 30*1024*1024;   // 與 Supabase homework bucket 的 file_size_limit 一致
const HW_REC_MAX = 600;   // 單段錄音最長 10 分鐘，避免忘了按停止
const HWREC = {};   // key → {state:"idle"|"rec"|"done", rec, stream, chunks, blob, type, url, t0, dur, timer}
function hwRecSupported(){ return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); }
function hwRecHTML(key){
  const R=HWREC[key]||{state:"idle"};
  if(!hwRecSupported()) return `<span class="tc-sub">這個瀏覽器不支援錄音，可改用「上傳檔案」。</span>`;
  if(R.state==="rec") return `<span class="hwrec-on"><span class="ra-dot"></span> 錄音中 <b id="hwrec-t-${key}">${raFmt((Date.now()-R.t0)/1000)}</b></span>
    <button type="button" class="btn btn-primary" onclick="hwRecStop('${key}')">⏹ 停止</button>`;
  if(R.state==="done") return `<audio class="hwrec-audio" controls src="${R.url}"></audio>
    <span class="tc-sub">${raFmt(R.dur||0)}</span><button type="button" class="btn btn-ghost" onclick="hwRecClear('${key}')">🔁 重錄</button>`;
  return `<button type="button" class="btn btn-ghost hwrec-start" onclick="hwRecStart('${key}')">🎤 直接錄音</button>`;
}
function hwRecPaint(key){ const el=document.getElementById("hwrec-"+key); if(el) el.innerHTML=hwRecHTML(key); }
async function hwRecStart(key){
  if(Object.values(HWREC).some(r=>r.state==="rec")){ toast("請先停止另一段錄音 ⏹"); return; }
  if(typeof tts!=="undefined") tts.stop();
  let stream;
  try{ stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true}}); }
  catch(e){ toast("無法使用麥克風：請在瀏覽器網址列允許麥克風權限 🎤"); return; }
  const mime = raMime(); let rec;
  try{ rec = mime ? new MediaRecorder(stream,{mimeType:mime}) : new MediaRecorder(stream); }
  catch(e){ stream.getTracks().forEach(t=>t.stop()); toast("錄音啟動失敗，請重新整理再試一次。"); return; }
  const R = HWREC[key] = {state:"rec", rec, stream, chunks:[], t0:Date.now()};
  rec.ondataavailable = e=>{ if(e.data && e.data.size) R.chunks.push(e.data); };
  rec.onstop = ()=>{
    stream.getTracks().forEach(t=>t.stop()); clearInterval(R.timer);
    if(R.discard) return;
    R.type = rec.mimeType || mime || "audio/webm";
    R.blob = new Blob(R.chunks,{type:R.type}); R.url = URL.createObjectURL(R.blob);
    R.dur = (Date.now()-R.t0)/1000; R.state = "done"; hwRecPaint(key);
  };
  rec.start(1000);
  R.timer = setInterval(()=>{
    const sec=(Date.now()-R.t0)/1000, el=document.getElementById("hwrec-t-"+key); if(el) el.textContent=raFmt(sec);
    if(sec>=HW_REC_MAX && R.rec.state!=="inactive"){ R.rec.stop(); toast("錄音最長 10 分鐘，已自動停止 ⏹"); }
  }, 500);
  hwRecPaint(key);
}
function hwRecStop(key){ const R=HWREC[key]; if(R && R.rec && R.rec.state!=="inactive") R.rec.stop(); }
function hwRecClear(key){ const R=HWREC[key]; if(R && R.url) URL.revokeObjectURL(R.url); delete HWREC[key]; hwRecPaint(key); }
function hwRecFile(key, name){
  const R=HWREC[key]; if(!R || R.state!=="done" || !R.blob) return null;
  return new File([R.blob], `${name}.${raExt(R.type)}`, {type:R.type||"audio/webm"});
}
function hwRecAbortAll(){
  Object.keys(HWREC).forEach(k=>{ const R=HWREC[k];
    if(R.rec && R.rec.state!=="inactive"){ R.discard=true; R.rec.stop(); }
    if(R.stream) R.stream.getTracks().forEach(t=>t.stop());
    clearInterval(R.timer); if(R.url) URL.revokeObjectURL(R.url); delete HWREC[k]; });
}
window.addEventListener("hashchange", ()=>{ if(!/^#\/homework/.test(location.hash)) hwRecAbortAll(); });

/* 等第制成績（百分制區間僅供參考） */
const GRADE_SCALE = [
  ["A+","4.3","90–100"],["A","4.0","85–89"],["A-","3.7","80–84"],
  ["B+","3.3","77–79"],["B","3.0","73–76"],["B-","2.7","70–72"],
  ["C+","2.3","67–69"],["C","2.0","63–66"],["C-","1.7","60–62"],
  ["F","0","59 以下"],["X","0","0"]
];
function gradeSelect(id, val){
  const known = GRADE_SCALE.some(g=>g[0]===val);
  return `<select class="tc-grade" id="${id}" title="等第成績">
    <option value="">— 等第 —</option>
    ${GRADE_SCALE.map(([g,pt,rg])=>`<option value="${g}" ${g===val?"selected":""}>${g}（${pt}｜${rg}）</option>`).join("")}
    ${val && !known ? `<option value="${esc(val)}" selected>${esc(val)}（舊的評分）</option>` : ""}
  </select>`;
}
/* 學生看到的成績：等第＋績分 */
function gradeShow(val){
  const g = GRADE_SCALE.find(x=>x[0]===val);
  return g ? `<span class="hw-gradechip">${esc(g[0])}</span> <span class="tc-sub">績分 ${g[1]}｜百分制 ${g[2]}</span>` : esc(val||"—");
}
function gradeLegend(){
  return `<details class="tc-gradeleg"><summary>📏 等第對照表</summary><table class="tc-table"><thead><tr><th>等第</th><th class="num">績分</th><th>百分制區間（參考）</th></tr></thead><tbody>
    ${GRADE_SCALE.map(([g,pt,rg])=>`<tr><td><b>${g}</b></td><td class="num">${pt}</td><td>${rg}</td></tr>`).join("")}</tbody></table>
    <div class="tc-sub" style="margin-top:6px">百分制區間僅供參考，可依等第定義自行判斷。</div></details>`;
}
const isAudioPath = p => /\.(webm|m4a|mp4|mp3|ogg|wav|aac)$/i.test(p||"");
function hwSourceLabel(s, short){
  const src = s.source || {};
  if(s.kind==="readaloud"){
    const r=(typeof READINGS!=="undefined"?READINGS:[]).find(x=>x.id===src.reading);
    const asg = !short && src.assignment && ((typeof HW_LAST!=="undefined"&&HW_LAST||[]).concat((typeof TDATA!=="undefined"&&TDATA&&TDATA.assignments)||[])).find(x=>x.id===src.assignment);
    return `🎤 跟讀：${esc((r&&r.topic)||src.title||"閱讀文章")}${src.level?`（${esc(String(src.level).toUpperCase())}）`:""}${asg?`<span class="tc-sub">　📝 作業：${esc(asg.title)}</span>`:""}`;
  }
  return "🎙️ 自主錄音";
}

/* ---------- 學生：作業頁 ---------- */
let HW_LAST = [];      // 最近一次載入的作業（交作業時查範圍）
const HW_DRAFT = {};   // 重新整理卡片時保留還沒交的打字內容
function hwKeepDrafts(){ document.querySelectorAll('textarea[id^="hw-text-"]').forEach(t=>{ HW_DRAFT[t.id.slice(8)]=t.value; }); }
async function renderHomework(){
  if(!CLOUD.on) return cloudNeeded("作業繳交 Homework");
  if(!currentUser()){ openAuthModal(); return; }
  app.innerHTML = `<div class="view"><p class="tc-loading">載入作業中… Loading…</p></div>`;
  let assignments=[], subs=[];
  try{ [assignments, subs] = await Promise.all([CLOUD.listAssignments(), CLOUD.mySubmissions()]); }
  catch(e){ app.innerHTML = `<div class="view"><p>載入失敗，請重新整理。 Could not load. ${esc(e.message||"")}</p></div>`; return; }
  if(!/^#\/homework/.test(location.hash)) return;
  HW_LAST = assignments;
  HW_SUBBED = new Set(subs.filter(s=>s.assignment_id).map(s=>s.assignment_id));
  const byA = {}; subs.forEach(s=>{ if(s.assignment_id) byA[s.assignment_id]=s; });
  HW_PENDING = assignments.filter(a=>a.active).map(a=>({a, st:hwStatus(a, byA[a.id])}))
    .filter(x=>x.st.state==="overdue" || x.st.state==="soon");
  updateHwBadge();
  const me = store.data || {};
  const rank = { overdue:0, soon:1, open:2, upcoming:3 };
  const active = assignments.filter(a=>a.active);
  const todo = active.filter(a=>!byA[a.id]).sort((a,b)=> (rank[hwStatus(a).state]??2) - (rank[hwStatus(b).state]??2));
  const done = active.filter(a=>byA[a.id]).sort((a,b)=> String((byA[b.id]||{}).submitted_at||"").localeCompare(String((byA[a.id]||{}).submitted_at||"")));

  const hwItem = (a, isDone)=>{
    const s = byA[a.id], st = hwStatus(a, s);
    const scope = a.scope||[];
    const sDone = scope.filter(it=>scopeDone(it,me)).length;
    const overdue = !isDone && st.state==="overdue";
    const mark = isDone ? (s.status==="returned" ? "📝" : "✅") : (overdue ? "⏰" : "⬜");
    const tags = [
      a.due_date ? `<span class="hw-tag ${overdue?'due-over':(st.state==='soon'?'due-soon':'')}">${overdue?'⏰ 逾期':'截止'} ${fmtDate(a.due_date)}</span>` : "",
      ((a.target_students||[]).length||(a.target_groups||[]).length) ? `<span class="hw-tag forme">👤 指定給你</span>` : "",
      scope.length ? `<span class="hw-tag ${sDone===scope.length?'scope-full':'scope'}">📚 範圍 ${sDone}/${scope.length}</span>` : "",
      (isDone && s.status==="returned" && s.grade) ? `<span class="hw-gradechip">${esc(s.grade)}</span>` : ""
    ].filter(Boolean).join("");
    const statusPill = isDone
      ? (s.status==="returned" ? `<span class="hw-pill done">已批改 Graded</span>` : `<span class="hw-pill sent">已繳交 Submitted</span>`)
      : (overdue ? `<span class="hw-pill due-over">未繳 Not done</span>` : `<span class="hw-pill todo">未繳 Not done</span>`);
    const scopeBox = scope.length ? `<div class="hw-scope"><div class="hw-scope-h">📚 作業範圍（完成 ${sDone} / ${scope.length}）${!isDone&&sDone<scope.length?`<button type="button" class="hw-guide-btn" onclick="hwGuide('${a.id}')">📋 還差哪些？</button>`:""}</div><div class="hw-chips">${scopeChips(scope, me, true, a.id)}</div>
      <div class="tc-sub">點進去完成：文法課做完練習、寓言做讀後練習、🎤 跟讀錄音錄完交出，其他打開讀過就算。全部完成後，即使沒有要寫的內容也可以直接按「繳交」。</div></div>` : "";
    const graded = s && s.status==="returned" ? `<div class="hw-grade"><b>老師評分 Grade：</b>${gradeShow(s.grade)}${s.feedback?`<div class="hw-fb">${esc(s.feedback)}</div>`:""}</div>` : "";
    const prev = s ? `<div class="hw-prev">你上次繳交：${s.text?`「${esc(s.text.slice(0,80))}${s.text.length>80?"…":""}」 `:""}${s.file_url?(isAudioPath(s.file_url)?'🎤 錄音 ':'📎 檔案 '):""}${s.link?'🔗 連結':""}</div>` : "";
    const form = `<div class="hw-form">
        <textarea id="hw-text-${a.id}" placeholder="在這裡打字作答（可留空）Type your answer here…">${esc(HW_DRAFT[a.id]!==undefined ? HW_DRAFT[a.id] : (s&&s.text&&!/^✅ 完成作業範圍/.test(s.text)?s.text:""))}</textarea>
        <div class="hw-row hwrec" id="hwrec-a${a.id.replace(/-/g,"")}">${hwRecHTML("a"+a.id.replace(/-/g,""))}</div>
        <div class="hw-row">
          <label class="hw-file">📎 上傳檔案 File<input type="file" id="hw-file-${a.id}" accept="image/*,audio/*,.pdf,.doc,.docx,.txt"></label>
          <input type="url" id="hw-link-${a.id}" placeholder="🔗 貼上連結 Paste a link (Google Doc…)" value="${s&&s.link?esc(s.link):""}">
        </div>
        <button class="btn btn-navy" id="hw-btn-${a.id}" onclick="hwSubmit('${a.id}')">${s?"重新繳交 Re-submit":"繳交 Submit"}</button>
      </div>`;
    return `<details class="hw-item ${isDone?'is-done':''} ${overdue?'is-over':''}" ${overdue?'open':''}>
      <summary class="hw-sum">
        <span class="hw-mark">${mark}</span>
        <span class="hw-sum-main"><span class="hw-sum-title">${esc(a.title)}</span>${tags?`<span class="hw-sum-tags">${tags}</span>`:""}</span>
        <span class="hw-sum-right">${statusPill}<span class="hw-caret">▸</span></span>
      </summary>
      <div class="hw-body">
        ${a.description?`<p class="hw-desc">${esc(a.description)}</p>`:""}
        ${scopeBox}${graded}${prev}${form}
      </div>
    </details>`;
  };
  const todoHtml = todo.length ? todo.map(a=>hwItem(a,false)).join("")
    : `<div class="hw-empty">🎉 太棒了，沒有待完成的作業！All caught up.</div>`;
  const doneHtml = done.map(a=>hwItem(a,true)).join("");

  const free = subs.filter(s=>!s.assignment_id).sort((a,b)=>String(b.submitted_at).localeCompare(String(a.submitted_at)));
  const freeList = free.length ? `<ul class="hw-freelist">${free.map(s=>`<li>
      <div><b>${hwSourceLabel(s)}</b> <span class="tc-sub">${fmtDate(s.submitted_at)}</span>
        ${s.status==="returned"?`<span class="hw-pill done">已批改</span>`:`<span class="hw-pill sent">已交</span>`}</div>
      ${s.text && s.kind!=="readaloud"?`<div class="hw-prev">「${esc(s.text.slice(0,100))}」</div>`:""}
      ${s.status==="returned"?`<div class="hw-grade"><b>老師評分：</b>${gradeShow(s.grade)}${s.feedback?`<div class="hw-fb">${esc(s.feedback)}</div>`:""}</div>`:""}
    </li>`).join("")}</ul>` : `<p class="tc-sub">還沒有直接交給老師的錄音。</p>`;

  app.innerHTML = `<div class="view">
    <div class="crumb"><a href="#/home">Home</a> › 作業繳交 Homework</div>
    <div class="sb-hd"><div class="eyebrow" style="color:var(--sb-brick)">Homework · 作業</div>
      <h1 class="display">我的作業清單<span class="zh-term-lg" style="color:var(--sb-lapis)">My To-Do</span></h1>
      <p class="lede">點作業標題展開，就能打字、錄音、上傳或貼連結繳交。<br>Tap a task to open it, then type, record, upload, or paste a link.</p></div>
    <div class="hw-summary"><span class="hw-count todo"><b>${todo.length}</b> 待完成 To&nbsp;do</span><span class="hw-count done"><b>${done.length}</b> 已完成 Done</span></div>
    ${hwPendingItems().length?`<button type="button" class="hw-guide-bar" onclick="hwGuide()">📋 還有 <b>${hwPendingItems().length}</b> 項作業範圍沒完成，點我看要做哪些 →</button>`:""}
    <section class="hw-section"><h2 class="hw-sec-h">📌 待完成 To do</h2><div class="hw-list">${todoHtml}</div></section>
    ${done.length?`<section class="hw-section"><h2 class="hw-sec-h">✅ 已完成 Done</h2><div class="hw-list">${doneHtml}</div></section>`:""}
    <div class="card hw-free">
      <h3>🎙️ 直接錄音交給老師</h3>
      <p class="tc-sub" style="margin:0 0 10px">不用等老師出作業：想練口說、念課文、問老師問題，錄完就能交。閱讀文章的「🎤 跟讀錄音」錄完也會直接交到這裡。</p>
      <div class="hw-row hwrec" id="hwrec-free">${hwRecHTML("free")}</div>
      <input id="hw-free-note" class="hw-free-note" maxlength="300" placeholder="想跟老師說的話（可留空）例：我念的是 Unit 3 課文">
      <button class="btn btn-navy" id="hw-free-btn" onclick="hwSubmitFree()">📤 交給老師</button>
      <h4 class="hw-free-h">我交過的錄音</h4>${freeList}
    </div>
  </div>`;
  hwGuideAuto();
}
async function hwSubmit(id, force){
  const key = "a"+id.replace(/-/g,"");
  if(HWREC[key] && HWREC[key].state==="rec"){ toast("請先按 ⏹ 停止錄音"); return; }
  const text = (document.getElementById("hw-text-"+id).value||"").trim();
  const link = (document.getElementById("hw-link-"+id).value||"").trim();
  const fileEl = document.getElementById("hw-file-"+id);
  const recFile = hwRecFile(key, "recording-"+id.slice(0,8));
  const file = recFile || (fileEl && fileEl.files[0]);
  if(recFile && fileEl && fileEl.files[0]){ toast("錄音和上傳檔案只能擇一，這次會交出錄音。"); }
  if(file && file.size > HW_MAX_BYTES){ toast(`檔案太大（${(file.size/1048576).toFixed(1)} MB），上限 30 MB。照片可以先縮小，或改貼雲端連結。`); return; }
  let body = text;
  const a = (HW_LAST||[]).find(x=>x.id===id), scope = (a&&a.scope)||[];
  const done = scope.filter(it=>scopeDone(it, store.data||{})).length;
  if(!text && !link && !file && !scope.length){ toast("請至少打字作答、錄音、上傳檔案或貼連結。"); return; }
  /* 範圍還沒做完：跳出引導視窗，帶學生去完成（也可以選「還是先交出」） */
  if(scope.length && done<scope.length && !force){ hwKeepDrafts(); hwGuide(id, true); return; }
  if(!text && !link && !file) body = `✅ 完成作業範圍 ${done} / ${scope.length}`;
  const btn = document.getElementById("hw-btn-"+id); btn.disabled = true; btn.textContent = "繳交中… Submitting…";
  const r = await CLOUD.submitHomework(id, { text:body, link, file });
  if(r.err){ btn.disabled=false; btn.textContent="繳交 Submit"; toast(r.err); return; }
  hwRecClear(key); hwKeepDrafts(); delete HW_DRAFT[id];
  toast("作業已繳交，做得好 🐾");
  renderHomework();
}
async function hwSubmitFree(){
  if(HWREC.free && HWREC.free.state==="rec"){ toast("請先按 ⏹ 停止錄音"); return; }
  const file = hwRecFile("free", "recording");
  if(!file){ toast("請先按 🎤 錄一段聲音。"); return; }
  const note = (document.getElementById("hw-free-note").value||"").trim();
  const btn = document.getElementById("hw-free-btn"); btn.disabled = true; btn.textContent = "上傳中… Uploading…";
  const r = await HWAPI.submitFree({ kind:"recording", source:null, text:note||`🎙️ 自主錄音 · ${raFmt(HWREC.free.dur||0)}`, file });
  if(r.err){ btn.disabled=false; btn.textContent="📤 交給老師"; toast(r.err); return; }
  hwRecClear("free"); hwKeepDrafts();
  toast("錄音已交給老師 🐾");
  renderHomework();
}

/* ---------- 引導視窗：還沒完成的作業範圍，一項一項帶學生去完成 ---------- */
function hwScopeHint(it, d){
  if(it.t==="lesson") return (d.visited||{})["lesson:"+it.id] ? "已經打開過，還要把練習做完 🎮" : "進去看說明，再把練習做完 🎮";
  if(it.t==="readaloud") return `錄一段整篇跟讀並交出${it.lv&&RA_LV[it.lv]?`（指定 ${RA_LV[it.lv]}）`:""} 🎤`;
  if(it.t==="story"){ const st=(typeof STORIES!=="undefined"?STORIES:[]).find(x=>x.id===it.id); return st&&st.category==="fable" ? "讀完後做「讀後練習」🦊" : "打開讀完就算 📖"; }
  return "打開讀完就算 📰";
}
/* 所有「還沒交、範圍還沒做完」的作業項目；aid 指定時只看那一份 */
function hwPendingItems(aid){
  const d = store.data||{}, out = [];
  (HW_LAST||[]).filter(a=>a.active && (!aid || a.id===aid)).forEach(a=>{
    if(!aid && HW_SUBBED && HW_SUBBED.has(a.id)) return;
    (a.scope||[]).forEach(it=>{ if(!scopeDone(it,d) && scopeInfo(it)) out.push({a, it}); });
  });
  return out;
}
let HW_SUBBED = null;   // 已交過的作業 id（引導視窗略過）
function hwGuide(aid, fromSubmit){
  hwGuideClose();
  const items = hwPendingItems(aid);
  if(!items.length){ if(!fromSubmit) toast("範圍都完成了，可以交作業了 🎉"); return; }
  const d = store.data||{}, groups = {};
  items.forEach(x=>{ (groups[x.a.id]=groups[x.a.id]||{a:x.a, list:[]}).list.push(x.it); });
  const body = Object.values(groups).map(({a,list})=>{
    const total=(a.scope||[]).length, left=list.length;
    return `<div class="hwg-asg"><div class="hwg-ah"><b>${esc(a.title)}</b><span>${a.due_date?`截止 ${fmtDate(a.due_date)}　`:""}還差 ${left} / ${total} 項</span></div>
      <ol class="hwg-list">${list.map(it=>{ const inf=scopeInfo(it);
        const href = inf.rec ? `#/reading/${it.id}/rec/${a.id}${it.lv?"/"+it.lv:""}` : inf.href;
        return `<li><span class="hwg-ic">${inf.icon}</span><span class="hwg-txt"><b>${esc(inf.label)}</b>${inf.zh?` <i>${esc(inf.zh)}</i>`:""}<span class="hwg-hint">${hwScopeHint(it,d)}</span></span>
          <a class="btn btn-primary hwg-go" href="${href}" onclick="hwGuideClose()">去完成 →</a></li>`; }).join("")}</ol></div>`;
  }).join("");
  const el = document.createElement("div");
  el.className = "hwg-overlay"; el.id = "hwg";
  el.innerHTML = `<div class="hwg-card" role="dialog" aria-modal="true" aria-labelledby="hwg-t">
    <button class="hwg-x" onclick="hwGuideClose()" aria-label="關閉">✕</button>
    <h3 id="hwg-t">📋 ${fromSubmit?"先完成這些再交作業吧！":"還差這些就完成了！"}</h3>
    <p class="tc-sub" style="margin:0 0 10px">一項一項點「去完成」，做完回到「作業」頁就會打勾 ✅。</p>
    ${body}
    <div class="hwg-foot">${fromSubmit?`<button class="btn btn-ghost" onclick="hwGuideClose();hwSubmit('${aid}',true)">還是先交出</button>`:""}
      <button class="btn btn-ghost" onclick="hwGuideClose()">${fromSubmit?"好，我先去完成":"稍後再說"}</button></div>
  </div>`;
  el.addEventListener("click", e=>{ if(e.target===el) hwGuideClose(); });
  document.body.appendChild(el);
  const go = el.querySelector(".hwg-go"); if(go) go.focus();
}
function hwGuideClose(){ const el=document.getElementById("hwg"); if(el) el.remove(); }
document.addEventListener("keydown", e=>{ if(e.key==="Escape") hwGuideClose(); });
window.addEventListener("hashchange", hwGuideClose);
/* 打開作業頁時，一天自動提醒一次 */
function hwGuideAuto(){
  if(!hwPendingItems().length) return;
  const key = "hwGuide:"+((currentUser()||{}).id||"")+":"+new Date().toISOString().slice(0,10);
  try{ if(localStorage.getItem(key)) return; localStorage.setItem(key,"1"); }catch(e){}
  setTimeout(()=>{ if(/^#\/homework/.test(location.hash)) hwGuide(); }, 400);
}

/* ---------- 從作業跳到指定文章錄音（#/reading/<id>/rec/<作業id>/<程度>） ---------- */
let HW_RA_TARGET = null;   // {id, aid, lv}：換程度時錄音區會重置，靠這個記住是哪份作業
function hwOpenReadAloud(id, aid, lv){
  HW_RA_TARGET = aid ? {id, aid, lv:lv||""} : null;
  if(!rdById(id)){ location.hash="#/reading"; return; }
  if(!rdById(id).levels) return rdNeed(rdById(id), ()=>hwOpenReadAloud(id, aid, lv));   // 內文還沒下載
  if(lv && RA_LV[lv] && RD_LEVEL!==lv){ RD_LEVEL=lv; RD_ANS={}; RD_SHOW=false; }
  renderReading(id);
  const R = raState(); R.hwTarget = aid || null; R.hwLv = lv || "";
  if(!R.rec) R.view = "take";
  raRender(); raLoadAsg();
  const sec = document.querySelector(".rv.ra"); if(sec) setTimeout(()=>sec.scrollIntoView({behavior:"smooth", block:"start"}), 60);
}
/* 錄音區上方的作業提示（程度不符時提醒換） */
function hwRaBanner(R){
  if(!R.hwTarget && HW_RA_TARGET && HW_RA_TARGET.id===R.id){ R.hwTarget = HW_RA_TARGET.aid; R.hwLv = HW_RA_TARGET.lv; }
  if(!R.hwTarget) return "";
  const a = (R.asg||[]).find(x=>x.id===R.hwTarget) || (HW_LAST||[]).find(x=>x.id===R.hwTarget);
  const wrongLv = R.hwLv && R.hwLv!==R.lvl;
  return `<div class="ra-hwbanner">📝 這是作業${a?`「${esc(a.title)}」`:""}的錄音：錄完按「繳交給老師」就會交到這份作業。
    ${wrongLv?`<div class="ra-hwwarn">⚠️ 老師指定 <b>${RA_LV[R.hwLv]}</b>，你現在是 ${RA_LV[R.lvl]||R.lvl}。<button class="btn btn-ghost" onclick="hwOpenReadAloud('${R.id}','${R.hwTarget}','${R.hwLv}')">換到指定程度</button></div>`:""}
    <a class="ra-hwback" href="#/homework">← 回作業清單</a></div>`;
}
/* 跟讀錄音繳交：作業範圍裡有這篇的「跟讀錄音」→ 存成連到該作業的錄音（可交多篇、不會蓋掉作業本身的作答）；
   錄完若範圍全部完成且這份作業還沒交，就自動幫學生交出 */
async function hwRaSubmit(R, a, file, text){
  const r = rdById(R.id);
  const linked = a && (a.scope||[]).some(it=>it.t==="readaloud" && it.id===R.id);
  const res = (a && !linked) ? await CLOUD.submitHomework(a.id, {text, link:null, file})
    : await HWAPI.submitFree({kind:"readaloud", source:{reading:R.id, level:R.lvl, title:r.topic, ...(linked?{assignment:a.id}:{})}, text, file});
  if(res.err) return res;
  store.data.readaloud = store.data.readaloud || {};
  const today = new Date().toISOString().slice(0,10);
  store.data.readaloud[R.id] = today; store.data.readaloud[R.id+":"+R.lvl] = today; store.save();
  if(linked){
    const scope = a.scope||[], d = store.data||{};
    if(scope.every(it=>scopeDone(it,d))){
      try{
        const mine = await CLOUD.mySubmissions();
        if(!mine.some(s=>s.assignment_id===a.id)){
          const r2 = await CLOUD.submitHomework(a.id, {text:`✅ 完成作業範圍 ${scope.length} / ${scope.length}（含跟讀錄音）`, link:null, file:null});
          if(!r2.err) res.autoDone = true;
        }
      }catch(e){}
    }
  }
  return res;
}

/* ---------- 老師：作業分頁 ---------- */
const TC_SCOPE_OPEN = new Set();   // 展開中的「作業:學生」範圍明細
function tcScopeOpen(aid, uid){ const k=aid+":"+uid; if(TC_SCOPE_OPEN.has(k)) TC_SCOPE_OPEN.delete(k); else TC_SCOPE_OPEN.add(k); TC_OPEN.add(aid); paintTeacher(); }
let TC_FORM = null;   // {id|null, title, desc, start, due, mode:"all"|"pick", students:[], groups:[], scope:[]}
let TC_OPEN = new Set();   // 展開中的作業卡片 id（批改／重繪後保持展開）
let TC_TOUCHED = new Set();// 老師手動開關過的卡片（之後就尊重老師的選擇，不再自動展開）
let TC_NEWOPEN = false;    // 「出新作業／編輯」面板是否展開
function tcToggleOpen(id, open){ TC_TOUCHED.add(id); if(open) TC_OPEN.add(id); else TC_OPEN.delete(id); }
function tcFormBlank(){ return {id:null, title:"", desc:"", start:"", due:"", mode:"all", students:[], groups:[], scope:[]}; }
function tcTargetsOf(a, students){
  const ts=a.target_students||[], tg=a.target_groups||[];
  if(!ts.length && !tg.length) return students.map(p=>p.id);
  const set=new Set(ts);
  (TDATA.members||[]).forEach(m=>{ if(tg.includes(m.group_id)) set.add(m.user_id); });
  return students.map(p=>p.id).filter(id=>set.has(id));
}
function tcTargetLabel(a){
  const ts=a.target_students||[], tg=a.target_groups||[];
  if(!ts.length && !tg.length) return "👥 全班";
  const parts=[];
  if(tg.length) parts.push("分組：" + tg.map(g=>{ const x=(TDATA.groups||[]).find(y=>y.id===g); return esc(x?x.name:"（已刪除的組）"); }).join("、"));
  if(ts.length) parts.push("個別：" + ts.map(u=>esc(tName(u))).join("、"));
  return "🎯 " + parts.join("　");
}
function tcFormSync(){
  if(!TC_FORM) return;
  const v=id=>{ const el=document.getElementById(id); return el ? el.value : undefined; };
  ["title","desc","start","due"].forEach(k=>{ const x=v("na-"+k); if(x!==undefined) TC_FORM[k]=x; });
}
function tcFormSet(k, val){ tcFormSync(); TC_FORM[k]=val; paintTeacher(); }
function tcFormToggle(list, id){
  tcFormSync();
  const arr=TC_FORM[list]; const i=arr.indexOf(id); if(i>=0) arr.splice(i,1); else arr.push(id);
  const c=document.getElementById("na-cnt-"+list); if(c) c.textContent=arr.length;
}
function tcScopeToggle(t, id){
  tcFormSync();
  const i=TC_FORM.scope.findIndex(x=>x.t===t && x.id===id);
  if(i>=0) TC_FORM.scope.splice(i,1); else TC_FORM.scope.push(t==="readaloud" ? {t,id,lv:TC_FORM.raLv||""} : {t,id});
  const c=document.getElementById("na-cnt-scope"); if(c) c.textContent=TC_FORM.scope.length;
  const box=document.getElementById("na-scope-chips"); if(box) box.innerHTML=TC_FORM.scope.length?scopeChips(TC_FORM.scope):`<span class="tc-sub">還沒選。可不選（純打字／錄音作業）。</span>`;
}
function tcEdit(id){
  const a=TDATA.assignments.find(x=>x.id===id); if(!a) return;
  TC_FORM = {id:a.id, title:a.title||"", desc:a.description||"", start:a.start_date||"", due:a.due_date||"",
    mode:(a.target_students||[]).length||(a.target_groups||[]).length?"pick":"all",
    students:[...(a.target_students||[])], groups:[...(a.target_groups||[])], scope:(a.scope||[]).map(x=>x.t==="readaloud"?{t:x.t,id:x.id,lv:x.lv||""}:{t:x.t,id:x.id})};
  TC_NEWOPEN = true;
  paintTeacher(); const f=document.querySelector(".tc-newhw"); if(f) f.scrollIntoView({behavior:"smooth", block:"start"});
}
/* 依年級一次勾選／取消（全都勾了就取消） */
function tcPickGrade(g){
  tcFormSync();
  const ids = TDATA.profiles.filter(p=>p.role!=="teacher" && siOf(p.id).grade===g).map(p=>p.id);
  const all = ids.every(id=>TC_FORM.students.includes(id));
  TC_FORM.students = all ? TC_FORM.students.filter(id=>!ids.includes(id)) : [...new Set([...TC_FORM.students, ...ids])];
  paintTeacher();
}
function tcFormCancel(){ TC_FORM=tcFormBlank(); TC_NEWOPEN=false; paintTeacher(); }
function tcScopePicker(){
  const sel=(t,id)=>TC_FORM.scope.some(x=>x.t===t && x.id===id);
  const cb=(t,id,label,zh)=>`<label class="tc-pick"><input type="checkbox" ${sel(t,id)?"checked":""} onchange="tcScopeToggle('${t}','${id}')"> ${esc(label)}${zh?` <span class="tc-sub">${esc(zh)}</span>`:""}</label>`;
  const lessons = DATA.levels.map(lv=>{
    const units = DATA.units.filter(u=>u.level===lv.id).map(u=>{
      const ls = DATA.lessons.filter(l=>l.unit===u.id);
      return `<div class="tc-pick-unit"><div class="tc-pick-uh">${esc(u.n)} · ${esc(u.name)}</div>${ls.map(l=>cb("lesson",l.id,l.title,l.zh)).join("")}</div>`;
    }).join("");
    return `<details class="tc-pick-grp"><summary>📘 文法 ${esc(lv.name)}｜${esc(lv.zh)}</summary><div class="tc-pick-body">${units}</div></details>`;
  }).join("");
  const rds = (typeof READINGS!=="undefined"?READINGS:[]).slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  const readings = `<details class="tc-pick-grp"><summary>📰 閱讀文章（${rds.length}）</summary><div class="tc-pick-body">${rds.map(r=>cb("reading",r.id,r.topic,r.zh)).join("")}</div></details>`;
  const raLv = TC_FORM.raLv||"";
  const recs = `<details class="tc-pick-grp"><summary>🎤 跟讀錄音（指定文章錄音）</summary><div class="tc-pick-body">
    <div class="hw-row" style="margin:4px 0 8px"><label class="tc-inline">勾選時指定程度
      <select onchange="TC_FORM.raLv=this.value"><option value="" ${raLv===""?"selected":""}>不限（學生自選）</option>${Object.entries(RA_LV).map(([k,l])=>`<option value="${k}" ${raLv===k?"selected":""}>${l}</option>`).join("")}</select></label></div>
    <div class="tc-sub" style="margin-bottom:6px">學生的作業會出現「去錄音 →」，點了直接跳到那篇文章的錄音區，錄完交出就算完成。</div>
    ${rds.map(r=>cb("readaloud",r.id,r.topic,r.zh)).join("")}</div></details>`;
  const sts = typeof STORIES!=="undefined"?STORIES:[];
  const stories = `<details class="tc-pick-grp"><summary>📖 故事／寓言（${sts.length}）</summary><div class="tc-pick-body">${sts.map(s=>cb("story",s.id,s.title,s.category==="fable"?"寓言":"繪本")).join("")}</div></details>`;
  return lessons + readings + recs + stories;
}
function tcHomeworkForm(students){
  if(!TC_FORM) TC_FORM=tcFormBlank();
  const F=TC_FORM, groups=TDATA.groups||[];
  const pick = F.mode==="pick" ? `<div class="tc-target-pick">
      <div class="tc-pick-col"><div class="tc-pick-uh">分組（已選 <b id="na-cnt-groups">${F.groups.length}</b>）</div>
        ${groups.length ? groups.map(g=>`<label class="tc-pick"><input type="checkbox" ${F.groups.includes(g.id)?"checked":""} onchange="tcFormToggle('groups','${g.id}')"> ${esc(g.name)} <span class="tc-sub">${(TDATA.members||[]).filter(m=>m.group_id===g.id).length} 人</span></label>`).join("")
          : `<span class="tc-sub">還沒有分組。到「👥 分組」分頁建立。</span>`}</div>
      <div class="tc-pick-col"><div class="tc-pick-uh">個別學生（已選 <b id="na-cnt-students">${F.students.length}</b>）</div>
        ${typeof siGradeButtons==="function"?siGradeButtons(students,"tcPickGrade"):""}
        ${students.length ? students.map(p=>`<label class="tc-pick"><input type="checkbox" ${F.students.includes(p.id)?"checked":""} onchange="tcFormToggle('students','${p.id}')"> ${esc(p.name||p.email)}${typeof siGradeTag==="function"?siGradeTag(p.id):""}</label>`).join("") : `<span class="tc-sub">還沒有學生。</span>`}</div>
    </div>` : "";
  return `<div class="card tc-newhw">
    <input id="na-title" placeholder="作業標題 Title（必填）" value="${esc(F.title)}">
    <textarea id="na-desc" placeholder="說明 Instructions（可留空）">${esc(F.desc)}</textarea>
    <div class="hw-row"><label class="tc-inline">開放日 Opens <input type="date" id="na-start" value="${esc(F.start)}"></label>
      <label class="tc-inline">截止日 Due <input type="date" id="na-due" value="${esc(F.due)}"></label>
      <span class="tc-sub">開放日留空＝立刻開放；開放日前學生看不到。</span></div>
    <div class="tc-sec"><div class="tc-sec-h">對象 Who</div>
      <div class="tc-seg"><button type="button" class="${F.mode==="all"?"on":""}" onclick="tcFormSet('mode','all')">👥 全班</button><button type="button" class="${F.mode==="pick"?"on":""}" onclick="tcFormSet('mode','pick')">🎯 指定分組／學生</button></div>
      ${pick}</div>
    <div class="tc-sec"><div class="tc-sec-h">範圍 What（已選 <b id="na-cnt-scope">${F.scope.length}</b>）</div>
      <div class="hw-chips" id="na-scope-chips">${F.scope.length?scopeChips(F.scope):`<span class="tc-sub">還沒選。可不選（純打字／錄音作業）。</span>`}</div>
      <div class="tc-pick-wrap">${tcScopePicker()}</div>
      <div class="tc-sub">學生會看到可點的範圍清單；你會在下方看到每個人完成了幾項（文法課＝做完練習、寓言＝做過讀後練習、其他＝打開讀過）。</div></div>
    <div class="hw-row"><button class="btn btn-navy" onclick="tcCreate()">${F.id?"儲存修改 Save":"建立 Create"}</button>
      ${F.id?`<button class="btn btn-ghost" onclick="tcFormCancel()">取消編輯</button>`:""}</div>
  </div>`;
}
async function tcCreate(){
  tcFormSync();
  const F=TC_FORM, title=(F.title||"").trim();
  if(!title){ toast("請填作業標題。"); return; }
  if(F.mode==="pick" && !F.students.length && !F.groups.length){ toast("請至少勾選一個分組或學生，或改成「全班」。"); return; }
  if(F.start && F.due && F.start > F.due){ toast("開放日不能晚於截止日。"); return; }
  const f = { title, description:(F.desc||"").trim(), start_date:F.start||null, due_date:F.due||null,
    target_students:F.mode==="pick"?F.students:[], target_groups:F.mode==="pick"?F.groups:[], scope:F.scope };
  const r = F.id ? await HWAPI.updateAssignment(F.id, f) : await HWAPI.createAssignment(f);
  if(r.err){ toast((F.id?"儲存":"建立")+"失敗："+r.err); return; }
  toast(F.id?"作業已更新 🐾":"作業已建立 🐾"); TC_FORM=tcFormBlank(); TC_NEWOPEN=false; renderTeacher();
}
function tcSubCell(s){
  if(!s) return `<span class="hw-pill todo">未繳</span>`;
  return `${s.text?`<div class="tc-answer">${esc(s.text)}</div>`:""}${s.link&&/^https?:\/\//i.test(s.link)?`<a href="${esc(s.link)}" target="_blank" rel="noopener">🔗 連結</a> `:s.link?`<span class="tc-sub">${esc(s.link)}</span> `:""}${s.file_url?(isAudioPath(s.file_url)?`<button class="btn btn-ghost tc-audiobtn" data-path="${esc(s.file_url)}" onclick="tcAudio(this)">▶️ 播放錄音</button>`:`<button class="btn btn-ghost" data-path="${esc(s.file_url)}" onclick="tcFile(this.dataset.path)">📎 開啟檔案</button>`):""}`;
}
function tcGradeCells(s){
  if(!s) return `<td></td><td></td><td></td><td></td>`;
  return `<td>${fmtDate(s.submitted_at)}</td>
    <td>${gradeSelect("gr-"+s.id, s.grade||"")}</td>
    <td><input class="tc-fb" id="fb-${s.id}" value="${esc(s.feedback||"")}" placeholder="回饋"></td>
    <td><button class="btn btn-ghost tc-savebtn" onclick="tcGrade('${s.id}')">${s.status==="returned"?"✓ 已批":"批改"}</button></td>`;
}
function tcHomeworkBody(students){
  const progById = {}; TDATA.progress.forEach(p=>progById[p.user_id]=p);
  const subsByA = {}; TDATA.submissions.forEach(s=>{ if(s.assignment_id) (subsByA[s.assignment_id]=subsByA[s.assignment_id]||[]).push(s); });
  const list = TDATA.assignments.map(a=>{
    const subs = subsByA[a.id]||[], subBy = {}; subs.forEach(s=>subBy[s.user_id]=s);
    const targets = tcTargetsOf(a, students);
    const extra = subs.filter(s=>!targets.includes(s.user_id)).map(s=>s.user_id);  // 改過對象前就交的人
    const scope = a.scope||[];
    const rowIds = [...targets, ...extra];
    const rows = rowIds.length ? rowIds.map(uid=>{
      const s=subBy[uid], d=(progById[uid]&&progById[uid].data)||{};
      const done=scope.filter(it=>scopeDone(it,d)).length;
      const ok = TC_SCOPE_OPEN.has(a.id+":"+uid);
      const sc = scope.length ? `<td class="num"><button class="tc-scope ${done===scope.length?"full":""} ${ok?"on":""}" onclick="tcScopeOpen('${a.id}','${uid}')" title="點開看哪幾項還沒完成">${done} / ${scope.length} <span class="si-caret">▸</span></button></td>` : "";
      const detail = scope.length && ok ? `<tr class="tc-scope-row"><td colspan="7"><div class="tc-scope-list">${scope.map(it=>{ const inf=scopeInfo(it); if(!inf) return ""; const dn=scopeDone(it,d);
          return `<div class="${dn?"dn":"nd"}">${dn?"✅":"⬜"} ${inf.icon} ${esc(inf.label)}${inf.zh?` <i>${esc(inf.zh)}</i>`:""}${dn?"":`<span class="tc-sub">　${hwScopeHint(it,d).replace(/[🎮🎤🦊📖📰]/g,"").trim()}</span>`}</div>`; }).join("")}</div></td></tr>` : "";
      const recs = TDATA.submissions.filter(x=>!x.assignment_id && x.user_id===uid && x.source && x.source.assignment===a.id);
      const recCell = recs.length ? `<div class="tc-recs">${recs.map(x=>`<div>${hwSourceLabel(x,true)} ${x.file_url?`<button class="btn btn-ghost tc-audiobtn" data-path="${esc(x.file_url)}" onclick="tcAudio(this)">▶️</button>`:""}${x.status==="returned"?` <span class="hw-gradechip">${esc(x.grade||"✓")}</span>`:""}</div>`).join("")}</div>` : "";
      return `<tr class="${s||recs.length?"":"tc-missing"}"><td>${esc(tName(uid))}</td>${sc}<td>${s?tcSubCell(s):(recs.length?"":tcSubCell(s))}${recCell}</td>${tcGradeCells(s)}</tr>${detail}`;
    }).join("") : `<tr><td colspan="${scope.length?7:6}" style="color:var(--muted);padding:12px">這份作業目前沒有指派到任何學生。</td></tr>`;
    const nSub = targets.filter(u=>subBy[u]).length;
    const nGraded = targets.filter(u=>subBy[u] && subBy[u].status==="returned").length;
    const nToGrade = nSub - nGraded;
    const nMiss = targets.length - nSub;
    const pct = targets.length ? Math.round(nSub/targets.length*100) : 0;
    const notYet = a.start_date && a.start_date > new Date(Date.now()+8*3600e3).toISOString().slice(0,10);   // 台灣日期
    const counts = `<span class="tc-cnt ok">✅ 已繳 ${nSub}/${targets.length}</span>`
      + (nToGrade?`<span class="tc-cnt grade">📝 待批 ${nToGrade}</span>`:"")
      + (nMiss?`<span class="tc-cnt miss">⬜ 未繳 ${nMiss}</span>`:"");
    const autoOpen = TC_OPEN.has(a.id) || (nToGrade>0 && !TC_TOUCHED.has(a.id));
    return `<details class="tc-asgn-item ${nToGrade?'has-grade':''}" ontoggle="tcToggleOpen('${a.id}',this.open)" ${autoOpen?'open':''}>
      <summary class="tc-asgn-sum">
        <span class="tc-asgn-title">${esc(a.title)}${a.active?"":' <span class="tc-closed">已關閉</span>'}</span>
        <span class="tc-asgn-counts">${counts}</span>
        <span class="tc-mini-bar" title="${pct}% 已繳"><i style="width:${pct}%"></i></span>
        <span class="hw-caret">▸</span>
      </summary>
      <div class="tc-asgn-body">
        <div class="tc-asgn-toprow">
          <div class="tc-asgn-meta">${tcTargetLabel(a)}${a.start_date?`　📅 ${fmtDate(a.start_date)} 開放${notYet?"（尚未開放）":""}`:""}${a.due_date?`　⏰ 截止 ${fmtDate(a.due_date)}`:""}</div>
          <span class="tc-asgn-act"><button class="btn btn-ghost" onclick="tcEdit('${a.id}')">✏️ 編輯</button>
          <label class="tc-active"><input type="checkbox" ${a.active?"checked":""} onchange="tcActive('${a.id}',this.checked)"> 開放中</label></span>
        </div>
        ${a.description?`<p class="hw-desc">${esc(a.description)}</p>`:""}
        ${scope.length?`<div class="hw-chips">${scopeChips(scope)}</div>`:""}
        <div class="tc-tablewrap"><table class="tc-table sub"><thead><tr><th>學生</th>${scope.length?`<th class="num">範圍完成</th>`:""}<th>作答</th><th>繳交</th><th>分數</th><th>回饋</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      </div>
    </details>`;
  }).join("");
  const free = TDATA.submissions.filter(s=>!s.assignment_id);
  const freeBox = `<details class="tc-asgn-item" ontoggle="tcToggleOpen('__free__',this.open)" ${TC_OPEN.has('__free__')?'open':''}>
    <summary class="tc-asgn-sum"><span class="tc-asgn-title">🎙️ 學生直接繳交的錄音</span><span class="tc-asgn-counts"><span class="tc-cnt ok">${free.length} 份</span></span><span class="tc-mini-bar" style="visibility:hidden"></span><span class="hw-caret">▸</span></summary>
    <div class="tc-asgn-body">
      <p class="tc-sub" style="margin:0 0 8px">不用指派作業：學生在「作業」頁或閱讀文章的「🎤 跟讀錄音」錄完就直接交到這裡。</p>
      <div class="tc-tablewrap"><table class="tc-table sub"><thead><tr><th>學生</th><th>內容</th><th>錄音／說明</th><th>繳交</th><th>分數</th><th>回饋</th><th></th></tr></thead><tbody>
      ${free.length ? free.map(s=>`<tr><td>${esc(tName(s.user_id))}</td><td>${hwSourceLabel(s)}</td><td>${tcSubCell(s)}</td>${tcGradeCells(s)}</tr>`).join("")
        : `<tr><td colspan="7" style="color:var(--muted);padding:12px">還沒有學生直接交錄音。</td></tr>`}</tbody></table></div>
    </div></details>`;
  const groupsWarn = TDATA.groupsErr ? `<div class="card" style="padding:12px 16px;margin-bottom:12px;color:#B23B2E">分組資料載入失敗：${esc(TDATA.groupsErr)}</div>` : "";
  const formOpen = (TC_NEWOPEN || (TC_FORM && TC_FORM.id)) ? " open" : "";
  const newForm = `<details class="tc-new"${formOpen} ontoggle="TC_NEWOPEN=this.open">
    <summary class="tc-new-sum">${TC_FORM&&TC_FORM.id?"✏️ 編輯作業 Edit assignment":"➕ 出新作業 New assignment"}</summary>
    ${tcHomeworkForm(students)}</details>`;
  const overview = list ? `<div class="tc-overview">${list}</div>` : `<div class="hw-empty">還沒有任何作業。用上面的「➕ 出新作業」建立第一份。</div>`;
  return groupsWarn + newForm + gradeLegend() + overview + freeBox;
}

/* ---------- 老師：分組分頁 ---------- */
let TC_GROUP = null;  // {id|null, name, members:[]}
function tcGroupsBody(students){
  const groups=TDATA.groups||[], members=TDATA.members||[];
  if(TDATA.groupsErr) return `<div class="card" style="padding:16px;color:#B23B2E">分組資料載入失敗：${esc(TDATA.groupsErr)}</div>`;
  const G = TC_GROUP;
  const editor = G ? `<div class="card tc-newhw">
      <h3>${G.id?"✏️ 編輯分組":"➕ 新增分組"}</h3>
      <input id="ng-name" maxlength="60" placeholder="組名，例：A 組、進階班、補救組" value="${esc(G.name)}">
      <div class="tc-pick-uh">勾選組員（已選 <b id="ng-cnt">${G.members.length}</b>）</div>
      ${typeof siGradeButtons==="function"?siGradeButtons(students,"tcGroupPickGrade"):""}
      <div class="tc-pick-body tc-pick-grid">${students.map(p=>`<label class="tc-pick"><input type="checkbox" ${G.members.includes(p.id)?"checked":""} onchange="tcGroupToggle('${p.id}')"> ${esc(p.name||p.email)}${typeof siGradeTag==="function"?siGradeTag(p.id):""}</label>`).join("") || `<span class="tc-sub">還沒有學生。</span>`}</div>
      <div class="hw-row"><button class="btn btn-navy" onclick="tcGroupSave()">儲存 Save</button><button class="btn btn-ghost" onclick="TC_GROUP=null;paintTeacher()">取消</button></div>
    </div>` : `<button class="btn btn-navy" style="margin-bottom:14px" onclick="TC_GROUP={id:null,name:'',members:[]};paintTeacher()">➕ 新增分組</button>`;
  const list = groups.length ? groups.map(g=>{
    const ids=members.filter(m=>m.group_id===g.id).map(m=>m.user_id);
    const asg=TDATA.assignments.filter(a=>(a.target_groups||[]).includes(g.id)).length;
    return `<div class="card tc-asgn"><div class="tc-asgn-head"><h3>${esc(g.name)} <span class="tc-count">${ids.length} 人</span></h3>
      <span class="tc-asgn-act"><button class="btn btn-ghost" onclick="tcGroupEdit('${g.id}')">✏️ 編輯</button><button class="btn btn-ghost" onclick="tcGroupDelete('${g.id}')">🗑 刪除</button></span></div>
      <div class="hw-chips">${ids.length?ids.map(u=>`<span class="hw-chip">${esc(tName(u))}</span>`).join(""):`<span class="tc-sub">還沒有組員。</span>`}</div>
      <div class="tc-sub" style="margin-top:6px">指派到這組的作業：${asg} 份</div></div>`;
  }).join("") : `<div class="card" style="padding:18px;color:var(--muted)">還沒有分組。分組後，出作業時可以只指派給某一組（一個學生可以同時在好幾組）。</div>`;
  return `<p class="tc-sub" style="margin:0 0 12px">把學生分組（例如依程度、座位、專題組），出作業時就能只指派給某幾組，或再加上個別學生。</p>` + editor + list;
}
function tcGroupToggle(uid){
  const nm=document.getElementById("ng-name"); if(nm) TC_GROUP.name=nm.value;
  const a=TC_GROUP.members, i=a.indexOf(uid); if(i>=0) a.splice(i,1); else a.push(uid);
  const c=document.getElementById("ng-cnt"); if(c) c.textContent=a.length;
}
function tcGroupPickGrade(g){
  const nm=document.getElementById("ng-name"); if(nm) TC_GROUP.name=nm.value;
  const ids = TDATA.profiles.filter(p=>p.role!=="teacher" && siOf(p.id).grade===g).map(p=>p.id);
  const all = ids.every(id=>TC_GROUP.members.includes(id));
  TC_GROUP.members = all ? TC_GROUP.members.filter(id=>!ids.includes(id)) : [...new Set([...TC_GROUP.members, ...ids])];
  paintTeacher();
}
function tcGroupEdit(id){
  const g=(TDATA.groups||[]).find(x=>x.id===id); if(!g) return;
  TC_GROUP={id, name:g.name, members:(TDATA.members||[]).filter(m=>m.group_id===id).map(m=>m.user_id)};
  paintTeacher();
}
async function tcGroupSave(){
  const nm=document.getElementById("ng-name"); const name=((nm&&nm.value)||"").trim();
  if(!name){ toast("請填組名。"); return; }
  const r=await HWAPI.saveGroup(TC_GROUP.id, name, TC_GROUP.members);
  if(r.err){ toast("儲存失敗："+r.err); return; }
  toast("分組已儲存 🐾"); TC_GROUP=null; renderTeacher();
}
async function tcGroupDelete(id){
  const g=(TDATA.groups||[]).find(x=>x.id===id); if(!g) return;
  const asg=TDATA.assignments.filter(a=>(a.target_groups||[]).includes(id)).length;
  if(!confirm(`確定刪除「${g.name}」？${asg?`\n有 ${asg} 份作業指派給這組，刪除後這組的學生將看不到那些作業（除非另外個別指定）。`:""}`)) return;
  const r=await HWAPI.deleteGroup(id);
  if(r.err){ toast("刪除失敗："+r.err); return; }
  toast("已刪除分組"); renderTeacher();
}
