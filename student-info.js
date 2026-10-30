/* =====================================================
   學生基本資料（家教用）：年級、學校、班級、生日、家長、聯絡方式、上課時間、教材、目標、備註
   需要 supabase/migrations/20261017090000_student_info.sql＋20261017150000_student_info_prebind.sql（只有老師能讀寫）
   還沒註冊的學生可以先建檔（user_id 為空），學生用登記的 email 註冊時資料庫會自動綁定
   本檔在主程式之前載入：呼叫時才用 CLOUD／SB／TDATA
   ===================================================== */
const STUDENT_GRADES = ["幼兒園","小一","小二","小三","小四","小五","小六","國一","國二","國三","高一","高二","高三","大學","成人","其他"];
const SI_FIELDS = [
  ["grade","年級"],["school","學校"],["class_name","班級"],["birthday","生日"],
  ["parent_name","家長姓名"],["contact","聯絡方式（電話／LINE）"],["schedule","上課時間"],["start_date","開始上課日"],
  ["textbook","使用教材"],["goals","學習目標"],["notes","備註"]
];
const SIAPI = {
  async load(){
    const { data, error } = await SB.from("student_info").select("*");
    if(error) throw error; return data||[];
  },
  /* rec：既有檔案（有 id）／{user_id} 已註冊但還沒建檔／{} 新建「未綁帳號」檔案 */
  async save(rec, f){
    const row = { updated_at:new Date().toISOString() };
    SI_FIELDS.forEach(([k])=>{ const v=(f[k]==null?"":String(f[k])).trim(); row[k] = v || null; });
    if(!rec.user_id){ row.name = (f.name||"").trim() || null; row.email = (f.email||"").trim().toLowerCase() || null; }
    const q = rec.id ? SB.from("student_info").update(row).eq("id", rec.id)
                     : SB.from("student_info").insert({ ...row, user_id:rec.user_id||null });
    const { data, error } = await q.select().single();
    return error ? {err:error.message} : {ok:true, row:data};
  },
  async bind(id, userId){
    const { data, error } = await SB.from("student_info").update({ user_id:userId, updated_at:new Date().toISOString() }).eq("id", id).select().single();
    return error ? {err:/student_info_user_id_key|duplicate/i.test(error.message)?"這個帳號已經有一份資料了，請先刪除或解除那一份。":error.message} : {ok:true, row:data};
  },
  async unbind(id, name, email){   // 解除時一併補上姓名（資料庫規定沒帳號就要有名字）
    const { data, error } = await SB.from("student_info").update({ user_id:null, name, email:email||null, updated_at:new Date().toISOString() }).eq("id", id).select().single();
    return error ? {err:error.message} : {ok:true, row:data};
  },
  /* 封存／還原：封存的學生從名單、作業統計、勾選清單隱藏，帳號與資料都保留 */
  async setArchived(rec, on){
    const at = on ? new Date().toISOString() : null;
    const q = rec.id ? SB.from("student_info").update({ archived_at:at, updated_at:new Date().toISOString() }).eq("id", rec.id)
                     : SB.from("student_info").insert({ user_id:rec.user_id, archived_at:at, updated_at:new Date().toISOString() });
    const { data, error } = await q.select().single();
    return error ? {err:error.message} : {ok:true, row:data};
  },
  /* 永久刪除學生帳號（資料庫函式只允許老師、且只能刪學生；學習進度、繳交、基本資料會一起連帶刪除） */
  async deleteAccount(uid, paths){
    const { error } = await SB.rpc("delete_student_account", { target:uid });
    if(error) return {err:error.message};
    if(paths && paths.length){ try{ await SB.storage.from("homework").remove(paths); }catch(e){} }   // 錄音／檔案：盡力清掉
    return {ok:true};
  },
  async remove(id){
    const { error } = await SB.from("student_info").delete().eq("id", id);
    return error ? {err:error.message} : {ok:true};
  }
};
function siAll(){ return (typeof TDATA!=="undefined" && TDATA && TDATA.info) || []; }
function siOf(uid){ return siAll().find(x=>x.user_id===uid) || {}; }
const siArchived = uid => !!siOf(uid).archived_at;
function siVisibleStudents(list){ return list.filter(p=>!siArchived(p.id)); }
function siUnbound(){ return siAll().filter(x=>!x.user_id); }
function siGradeRank(g){ const i=STUDENT_GRADES.indexOf(g); return i<0 ? 99 : i; }
function siGradeTag(uid){ const g=siOf(uid).grade; return g ? `<span class="si-grade">${esc(g)}</span>` : ""; }
function siAge(b){
  if(!b) return ""; const d=new Date(b+"T00:00:00"); if(isNaN(d)) return "";
  const n=new Date(); let a=n.getFullYear()-d.getFullYear(); if(n<new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a>=0 && a<120 ? `${a} 歲` : "";
}
function siSetRow(row, removeId){
  TDATA.info = siAll().filter(x=>x.id!==(removeId||row&&row.id));
  if(row) TDATA.info.push(row);
}

/* ---------- 老師：學生分頁 ---------- */
let SI_FILTER = "all";   // "all" | 年級 | "none"
let SI_EDIT = null;      // {kind:"acct", uid} 已註冊學生 ｜ {kind:"rec", id} 未綁帳號的檔案 ｜ {kind:"new"}
/* 名單＝已註冊學生＋還沒綁帳號的檔案 */
/* 學生在「我的資料」自填的資料（存在各自 progress.data.profile / .consent） */
function siSelfProfile(uid){
  const g = (typeof TDATA!=="undefined" && TDATA && TDATA.progress) ? TDATA.progress.find(x=>x.user_id===uid) : null;
  const d = (g && g.data) || {};
  return { profile: d.profile || {}, consent: d.consent || null };
}
function siSelfKeys(uid){ const p=siSelfProfile(uid).profile||{}; return Object.keys(p).filter(k=>p[k]); }
/* 把學生自填內容帶入上方老師表單的「空白」欄位 */
function siFillFromSelf(uid){
  const pr = siSelfProfile(uid).profile || {};
  const map = {grade:"si-grade",school:"si-school",class_name:"si-class_name",birthday:"si-birthday",contact:"si-contact",parent_name:"si-parent_name",goals:"si-goals",notes:"si-notes"};
  let n=0;
  Object.keys(map).forEach(k=>{ const el=document.getElementById(map[k]); if(el && pr[k] && !String(el.value||"").trim()){ el.value=pr[k]; n++; } });
  const extras=[["nickname","暱稱"],["parent_contact","家長聯絡"],["weak","想加強"],["interests","興趣"]].filter(([k])=>pr[k]).map(([k,l])=>`${l}：${pr[k]}`);
  if(extras.length){ const nt=document.getElementById("si-notes"); if(nt){ nt.value=(String(nt.value||"").trim()?nt.value+"\n":"")+extras.join("；"); n++; } }
  const age=document.getElementById("si-age"); if(age && pr.birthday) age.textContent=siAge(pr.birthday);
  try{ toast(n?`已帶入 ${n} 個欄位，記得按「儲存」存進名冊 🐾`:"沒有可帶入的空欄（上方欄位已有內容）"); }catch(e){}
}
function siSelfBox(uid){
  const sp = siSelfProfile(uid), pr = sp.profile||{}, cs = sp.consent;
  const keys = Object.keys(pr).filter(k=>pr[k]);
  const LAB = {nickname:"暱稱",grade:"年級",school:"學校",class_name:"班級",birthday:"生日",contact:"聯絡方式",parent_name:"家長姓名",parent_contact:"家長聯絡",goals:"學習目標",weak:"想加強的地方",interests:"興趣喜好",notes:"想告訴老師的話"};
  const order = ["nickname","grade","school","class_name","birthday","contact","parent_name","parent_contact","goals","weak","interests","notes"];
  const consentLine = cs&&cs.agreed
    ? `<span style="color:#1f7a6e;font-size:12.5px;font-weight:700">✅ 已同意個資告知（${esc((cs.at||"").slice(0,10))}・v${esc(cs.version||"1.0")}）</span>`
    : `<span style="color:#c0392b;font-size:12.5px;font-weight:700">⚠️ 尚未勾選同意</span>`;
  const list = keys.length
    ? `<div style="display:grid;gap:3px 16px;grid-template-columns:1fr">${order.filter(k=>pr[k]).map(k=>`<div style="font-size:13.5px;line-height:1.7"><b>${esc(LAB[k]||k)}</b>：${esc(pr[k]).replace(/\n/g,"<br>")}</div>`).join("")}</div>`
    : `<div class="tc-sub">這位學生還沒有自己填寫「我的資料」。</div>`;
  return `<div style="margin:14px 0;padding:12px 14px;border:1px solid #cfe2dd;background:#f3f9f7;border-radius:10px">
    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:6px"><b style="color:#1f7a6e">🧑‍🎓 學生自填資料 Self-reported</b> ${consentLine} ${keys.length?`<button class="btn btn-ghost" type="button" style="margin-left:auto;padding:4px 10px" onclick="siFillFromSelf('${uid}')">↧ 帶入上方空欄</button>`:""}</div>
    ${list}
    <p class="tc-sub" style="margin:8px 0 0">這是學生在「我的資料」頁自己填的，僅供參考；要存進正式名冊請用上方欄位（可先按「帶入」再儲存）。</p></div>`;
}
function siRoster(students){
  return [...students.map(p=>({kind:"acct", key:"u:"+p.id, uid:p.id, name:p.name||p.email||"", email:p.email||"", s:siOf(p.id), p})),
          ...siUnbound().map(r=>({kind:"rec", key:"r:"+r.id, id:r.id, name:r.name||"", email:r.email||"", s:r}))];
}
function tcStudentsBody(_visible, progById){
  /* 這個分頁自己用全部學生（才能顯示「已封存」）；其他分頁拿到的是已排除封存學生的名單 */
  const students = TDATA.profiles.filter(p=>p.role!=="teacher");
  const full = siRoster(students);
  const archN = full.filter(x=>x.s.archived_at).length;
  const roster = full.filter(x=>!x.s.archived_at);
  const grades = [...new Set(roster.map(x=>x.s.grade).filter(Boolean))].sort((a,b)=>siGradeRank(a)-siGradeRank(b));
  const noneN = roster.filter(x=>!x.s.grade).length, unN = roster.filter(x=>x.kind==="rec").length;
  const chip = (k,label,n)=>`<button class="si-chip ${SI_FILTER===k?"on":""}" data-g="${esc(k)}" onclick="SI_FILTER=this.dataset.g;paintTeacher()">${esc(label)} <b>${n}</b></button>`;
  const filters = `<div class="si-filters">${chip("all","全部",roster.length)}${grades.map(g=>chip(g,g,roster.filter(x=>x.s.grade===g).length)).join("")}${noneN&&grades.length?chip("none","未設年級",noneN):""}${unN?chip("unbound","未綁帳號",unN):""}${archN?chip("archived","📦 已封存",archN):""}
    <button class="btn btn-navy si-add" onclick="siNew()">➕ 新增學生（先建檔）</button>
    <button class="btn btn-ghost si-export" onclick="siExport()">⬇️ 匯出名冊 CSV</button></div>`;
  const pool = SI_FILTER==="archived" ? full.filter(x=>x.s.archived_at) : roster;
  const shown = pool.filter(x=>{ const g=x.s.grade; return SI_FILTER==="all" || SI_FILTER==="archived" || (SI_FILTER==="unbound" ? x.kind==="rec" : SI_FILTER==="none" ? !g : g===SI_FILTER); })
    .sort((a,b)=> siGradeRank(a.s.grade)-siGradeRank(b.s.grade) || a.name.localeCompare(b.name,"zh-Hant"));
  const editing = x => SI_EDIT && ((SI_EDIT.kind==="acct" && x.uid===SI_EDIT.uid) || (SI_EDIT.kind==="rec" && x.id===SI_EDIT.id));
  const rows = shown.length ? shown.map(x=>{
    const s = x.s, g = x.kind==="acct" ? (progById[x.uid]||{}) : null;
    const last = g && g.last_active ? new Date(g.last_active).toLocaleDateString() : "—";
    const selfN = x.kind==="acct" ? siSelfKeys(x.uid).length : 0;
    const cs = x.kind==="acct" ? siSelfProfile(x.uid).consent : null;
    const selfBadge = selfN ? ` <span style="display:inline-block;font-size:11px;color:#1f7a6e;background:#e3f1ee;border-radius:6px;padding:1px 6px" title="學生已在「我的資料」自填">📝 自填</span>` : "";
    const consentCell = x.kind!=="acct" ? `<span class="tc-sub">—</span>`
      : (cs&&cs.agreed) ? `<span style="color:#1f7a6e;font-weight:700" title="同意於 ${esc((cs.at||"").slice(0,10))}（v${esc(cs.version||"1.0")}）">✅ 已同意</span><div class="tc-sub">${esc((cs.at||"").slice(0,10))}</div>`
      : selfN ? `<span style="color:#c0392b;font-weight:700">⚠️ 未同意</span>`
      : `<span class="tc-sub">未填</span>`;
    const who = x.kind==="acct" ? `${esc(x.name)}${selfBadge}${x.s.archived_at?` <span class="si-arch">📦 已封存</span>`:""}<div class="tc-sub">${esc(x.email)}</div>`
      : `${esc(x.name)} <span class="si-unbound">未綁帳號</span><div class="tc-sub">${x.email?`註冊用 ${esc(x.email)} 會自動綁定`:"還沒填 email，註冊後請手動綁定"}</div>`;
    const btn = x.kind==="acct" ? `siOpen('acct','${x.uid}')` : `siOpen('rec','${x.id}')`;
    return `<tr class="${editing(x)?"si-editing":""} ${x.kind==="rec"?"si-rec":""}"><td>${who}</td>
      <td>${s.grade?esc(s.grade):`<span class="tc-sub">—</span>`}</td>
      <td>${esc(s.school||"")}${s.class_name?`<div class="tc-sub">${esc(s.class_name)} 班</div>`:""}</td>
      <td>${esc(s.schedule||"")}</td>
      <td class="num">${g?`<button class="si-progbtn ${SI_OPEN.has(x.uid)?"on":""}" onclick="siToggleProg('${x.uid}')" title="展開看做完哪些單元">${g.completed_count||0} <span class="si-caret">▸</span></button>`:"—"}</td><td class="num">${g?(g.xp||0):"—"}</td><td>${last}</td>
      <td>${consentCell}</td>
      <td><div class="si-rowact"><button class="btn btn-ghost" onclick="${btn}">${x.kind==="rec"?"✏️ 資料／綁定":"✏️ 資料"}</button>${siRowDelBtns(x)}</div></td></tr>`
      + (x.kind==="acct" && SI_OPEN.has(x.uid) ? `<tr class="si-prog-row"><td colspan="9">${siProgressPanel((g&&g.data)||{})}</td></tr>` : "");
  }).join("") : `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:20px">${roster.length||archN?"這個條件下沒有學生。":"還沒有學生。可以先按「➕ 新增學生（先建檔）」，等學生註冊再綁定帳號。"}</td></tr>`;
  const warn = TDATA.infoErr ? `<div class="card" style="padding:12px 16px;margin-bottom:12px;color:#B23B2E">學生資料載入失敗：${esc(TDATA.infoErr)}</div>` : "";
  return warn + (SI_EDIT ? siEditor(students) : "") + filters +
    `<div class="tc-tablewrap"><table class="tc-table"><thead><tr><th>學生 Student</th><th>年級</th><th>學校</th><th>上課時間</th><th class="num">完成單元</th><th class="num">XP</th><th>最近登入</th><th>個資同意</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="tc-sub" style="margin-top:8px">🔒 這些資料只有老師看得到，學生（包括本人）都看不到。還沒註冊的學生可以先建檔；學生用你登記的 email 註冊時會自動綁定，也可以手動綁定。</p>`;
}
/* 列表每一列的刪除相關按鈕：已封存→還原；未綁帳號的檔案→刪除；已註冊學生→移出名單 */
function siRowDelBtns(x){
  const key = x.kind==="acct" ? x.uid : x.id;
  if(x.s.archived_at) return `<button class="btn btn-ghost" onclick="siArchive('${x.kind}','${key}',false)" title="還原到名單">↩️ 還原</button>`;
  if(x.kind==="rec") return `<button class="btn btn-ghost si-del" onclick="siDelete('${x.id}')" title="刪除這份資料" aria-label="刪除這份資料">🗑</button>`;
  return `<button class="btn btn-ghost" onclick="siArchive('acct','${x.uid}',true)" title="移出名單（可還原）">📦 移出</button>`;
}
function siRecOf(kind, id){ return kind==="acct" ? (siOf(id).id ? siOf(id) : {user_id:id}) : siAll().find(x=>x.id===id); }
function siNameOf(kind, id){
  if(kind==="acct"){ const p=TDATA.profiles.find(x=>x.id===id); return (p&&(p.name||p.email))||"這位學生"; }
  const r=siAll().find(x=>x.id===id); return (r&&r.name)||"這位學生";
}
async function siArchive(kind, id, on){
  const rec = siRecOf(kind, id); if(!rec) return;
  const name = siNameOf(kind, id);
  if(on && !confirm(`把「${name}」移出名單？\n\n• 帳號、學習紀錄、作業都還在，隨時可以到「📦 已封存」還原\n• 他不會再出現在你的名單、作業統計和勾選清單\n• 他仍然可以正常登入使用網站，也還是看得到全班作業\n\n（要連帳號一起刪掉，請打開他的「✏️ 資料」→「永久刪除帳號」）`)) return;
  const r = await SIAPI.setArchived(rec, on);
  if(r.err){ toast((on?"移出名單":"還原")+"失敗："+r.err); return; }
  siSetRow(r.row);
  if(SI_EDIT) SI_EDIT = null;
  if(SI_FILTER==="archived" && !siAll().some(x=>x.archived_at)) SI_FILTER = "all";   // 最後一位也還原了，回到「全部」
  toast(on ? `已把「${name}」移出名單（可在「📦 已封存」還原）` : `已還原「${name}」`); paintTeacher();
}
/* 永久刪除帳號：要輸入學生姓名才會執行 */
async function siDeleteAcct(uid){
  const p = TDATA.profiles.find(x=>x.id===uid); if(!p || p.role==="teacher") return;
  const name = (p.name||p.email||"").trim();
  const mine = TDATA.submissions.filter(x=>x.user_id===uid), files = mine.map(x=>x.file_url).filter(Boolean);
  const typed = prompt(`⚠️ 永久刪除「${name}」的帳號\n\n會一起刪除：帳號與登入、學習進度、背單字紀錄、${mine.length} 份作業繳交（含 ${files.length} 個錄音／檔案）、基本資料與分組紀錄。\n這個動作無法還原。\n\n只是想讓他不再出現在名單？請取消，改用「📦 移出名單」。\n\n確定要刪除，請輸入學生姓名「${name}」：`);
  if(typed===null) return;
  if(typed.trim()!==name){ toast("輸入的姓名不一致，沒有刪除。"); return; }
  const r = await SIAPI.deleteAccount(uid, files);
  if(r.err){ toast("刪除失敗："+r.err); return; }
  SI_EDIT = null; toast(`已永久刪除「${name}」的帳號`); renderTeacher();
}

/* ---------- 展開看學生進度：做完哪些單元、哪些課還有錯題 ---------- */
const SI_OPEN = new Set();   // 展開中的學生 id
function siToggleProg(uid){ if(SI_OPEN.has(uid)) SI_OPEN.delete(uid); else SI_OPEN.add(uid); paintTeacher(); }
function siProgressPanel(d){
  const done = d.completed || {}, mis = {};
  Object.keys(d.mistakes||{}).forEach(k=>{ const id=k.split(":")[0]; if(k.startsWith("vq:")) return; mis[id]=(mis[id]||0)+1; });
  const opened = d.visited || {};
  const levels = DATA.levels.map(lv=>{
    const units = DATA.units.filter(u=>u.level===lv.id);
    const ls = DATA.lessons.filter(l=>units.some(u=>u.id===l.unit));
    const n = ls.filter(l=>done[l.id]).length, pct = ls.length ? Math.round(n/ls.length*100) : 0;
    const touched = n || ls.some(l=>mis[l.id] || opened["lesson:"+l.id]);
    const body = units.map(u=>{
      const ul = DATA.lessons.filter(l=>l.unit===u.id), un = ul.filter(l=>done[l.id]).length;
      return `<div class="sp-unit"><div class="sp-uh">${esc(u.n)} · ${esc(u.name)} <span class="${un===ul.length?"full":""}">${un}/${ul.length}</span></div>
        <div class="sp-ls">${ul.map(l=>{
          const st = done[l.id] ? "done" : opened["lesson:"+l.id] ? "seen" : "todo";
          const mk = st==="done" ? "✅" : st==="seen" ? "👀" : "⬜";
          const tip = st==="done" ? "已完成練習" : st==="seen" ? `打開過（${opened["lesson:"+l.id]}），還沒做完練習` : "還沒開始";
          return `<span class="sp-l ${st}" title="${esc(tip)}">${mk} ${esc(l.title)}<i>${esc(l.zh||"")}</i>${mis[l.id]?`<b class="sp-mis" title="還有 ${mis[l.id]} 題錯題待複習">錯 ${mis[l.id]}</b>`:""}</span>`;
        }).join("")}</div></div>`;
    }).join("");
    return `<details class="sp-lv" ${touched?"open":""}><summary><span class="sp-lvn">${esc(lv.name)}｜${esc(lv.zh)}</span>
      <span class="sp-bar"><i style="width:${pct}%"></i></span><span class="sp-cnt">${n} / ${ls.length}（${pct}%）</span></summary>${body}</details>`;
  }).join("");
  const misTotal = Object.values(mis).reduce((a,b)=>a+b,0);
  const fq = d.fableQuiz||{}, fqN = Object.keys(fq).length;
  const ra = Object.keys(d.readaloud||{}).filter(k=>!k.includes(":")).length;
  const rdN = Object.keys(opened).filter(k=>k.startsWith("reading:")).length;
  const extra = [
    `📌 錯題待複習 <b>${misTotal}</b> 題`,
    `🦊 寓言讀後練習 <b>${fqN}</b> 則`,
    `📰 打開過的閱讀 <b>${rdN}</b> 篇`,
    `🎤 交過跟讀錄音 <b>${ra}</b> 篇`,
    `🔥 連續 <b>${(d.streak&&d.streak.count)||0}</b> 天`
  ].map(t=>`<span>${t}</span>`).join("");
  return `<div class="sp-panel"><div class="sp-extra">${extra}</div>${levels}
    <div class="tc-sub sp-legend">✅ 做完練習　👀 打開過但還沒做完　⬜ 還沒開始　<b class="sp-mis">錯 n</b> 這課還有 n 題錯題沒複習對</div></div>`;
}
function siEditor(students){
  const E = SI_EDIT; let s = {}, title = "", sub = "", bound = true;
  if(E.kind==="acct"){ const p = students.find(x=>x.id===E.uid); if(!p) return ""; s = siOf(p.id); title = p.name||p.email||"學生"; sub = p.email||""; }
  else if(E.kind==="rec"){ s = siAll().find(x=>x.id===E.id); if(!s) return ""; title = s.name||"未命名"; bound = false; }
  else { title = "新增學生（先建檔）"; bound = false; }
  const v = k => esc(s[k]||"");
  const txt = (k,label,ph,max,type) => `<label class="si-f"><span>${label}</span><input id="si-${k}" ${type?`type="${type}"`:""} maxlength="${max}" value="${v(k)}" placeholder="${esc(ph)}"></label>`;
  /* 綁定：只列還沒有資料的已註冊學生；有 email 相符的排前面 */
  let bindBox = "";
  if(E.kind==="rec"){
    const free = students.filter(p=>!siOf(p.id).id);
    const em = (s.email||"").toLowerCase();
    free.sort((a,b)=> (String(b.email||"").toLowerCase()===em) - (String(a.email||"").toLowerCase()===em));
    bindBox = `<div class="si-bind"><b>🔗 綁定已註冊的帳號</b>
      ${free.length ? `<select id="si-bind-user"><option value="">選擇學生帳號…</option>${free.map(p=>`<option value="${p.id}">${esc(p.name||"")}（${esc(p.email||"")}）${em&&String(p.email||"").toLowerCase()===em?" ← email 相符":""}</option>`).join("")}</select>
        <button class="btn btn-navy" onclick="siBind()">綁定</button>` : `<span class="tc-sub">目前沒有「已註冊但還沒建檔」的學生帳號。學生註冊後再來綁定，或請他用上面的 email 註冊會自動綁上。</span>`}</div>`;
  }
  const unbindBtn = E.kind==="acct" && s.id ? `<button class="btn btn-ghost" onclick="siUnbind()">解除綁定</button>` : "";
  const delBtn = s.id && E.kind==="rec" ? `<button class="btn btn-ghost si-del" onclick="siDelete()">🗑 刪除這份資料</button>` : "";
  const archKey = E.kind==="acct" ? E.uid : E.id;
  const danger = E.kind==="new" ? "" : `<details class="si-danger"><summary>⚠️ 移出名單／刪除</summary><div class="si-danger-body">
      ${s.archived_at
        ? `<div><b>這位學生目前是「已封存」。</b><div class="tc-sub">不在名單與作業統計裡；帳號和資料都還在。</div><button class="btn btn-ghost" onclick="siArchive('${E.kind}','${archKey}',false)">↩️ 還原到名單</button></div>`
        : `<div><b>📦 移出名單（可還原）</b><div class="tc-sub">例如不再上課的學生。帳號、紀錄都保留，之後可以在「📦 已封存」還原。</div><button class="btn btn-ghost" onclick="siArchive('${E.kind}','${archKey}',true)">📦 移出名單</button></div>`}
      ${E.kind==="acct" ? `<div><b class="si-red">🗑 永久刪除帳號（無法還原）</b><div class="tc-sub">連同學習進度、作業繳交與錄音、基本資料一起刪除。要輸入學生姓名確認。</div><button class="btn btn-ghost si-del" onclick="siDeleteAcct('${E.uid}')">永久刪除這個學生帳號…</button></div>`
        : `<div><b class="si-red">🗑 刪除這份資料</b><div class="tc-sub">這位學生還沒有帳號，只會刪掉你建的這份檔案。</div><button class="btn btn-ghost si-del" onclick="siDelete()">🗑 刪除這份資料</button></div>`}
    </div></details>`;
  return `<div class="card si-editor">
    <div class="si-ed-h"><h3>${E.kind==="new"?"➕":"✏️"} ${esc(title)}${E.kind==="new"?"":" 的資料"}</h3>${sub?`<span class="tc-sub">${esc(sub)}</span>`:""}${!bound&&E.kind!=="new"?`<span class="si-unbound">未綁帳號</span>`:""}</div>
    ${bound ? "" : `<div class="si-grid">
      ${txt("name","學生姓名（必填）","例：王小明",40)}
      ${txt("email","註冊用 Email（選填，用來自動綁定）","例：ming@example.com",120,"email")}
    </div>`}
    <div class="si-grid">
      <label class="si-f"><span>年級</span><select id="si-grade"><option value="">（未設定）</option>${STUDENT_GRADES.map(g=>`<option ${s.grade===g?"selected":""}>${g}</option>`).join("")}</select></label>
      ${txt("school","學校","例：臺北市立大安國中",80)}
      ${txt("class_name","班級","例：205",40)}
      <label class="si-f"><span>生日 <em id="si-age" class="tc-sub">${siAge(s.birthday)}</em></span><input type="date" id="si-birthday" value="${v("birthday")}" oninput="document.getElementById('si-age').textContent=siAge(this.value)"></label>
      ${txt("parent_name","家長姓名","例：王媽媽",40)}
      ${txt("contact","聯絡方式（電話／LINE）","例：0912-345-678／LINE: abc",120)}
      ${txt("schedule","上課時間","例：每週三 19:00–20:30",120)}
      <label class="si-f"><span>開始上課日</span><input type="date" id="si-start_date" value="${v("start_date")}"></label>
      ${txt("textbook","使用教材","例：翰林版國二上、全民英檢初級",120)}
    </div>
    <label class="si-f"><span>學習目標</span><textarea id="si-goals" maxlength="500" placeholder="例：會考英文 A++、英檢中級">${v("goals")}</textarea></label>
    <label class="si-f"><span>備註</span><textarea id="si-notes" maxlength="2000" placeholder="個性、弱點、家長叮嚀、請假紀錄…">${v("notes")}</textarea></label>
    ${E.kind==="acct" ? siSelfBox(E.uid) : ""}
    ${bindBox}
    <div class="hw-row"><button class="btn btn-navy" id="si-save" onclick="siSave()">儲存 Save</button><button class="btn btn-ghost" onclick="SI_EDIT=null;paintTeacher()">關閉</button>
      ${unbindBtn}${s.updated_at?`<span class="tc-sub">上次更新 ${fmtDate(s.updated_at)}</span>`:""}</div>
    ${danger}
  </div>`;
}
function siOpen(kind, id){ SI_EDIT = kind==="acct" ? {kind, uid:id} : {kind, id}; paintTeacher(); const e=document.querySelector(".si-editor"); if(e) e.scrollIntoView({behavior:"smooth", block:"start"}); }
function siNew(){ SI_EDIT = {kind:"new"}; paintTeacher(); const e=document.getElementById("si-name"); if(e){ e.scrollIntoView({behavior:"smooth", block:"center"}); e.focus(); } }
function siCurrentRec(){
  const E = SI_EDIT; if(!E) return null;
  if(E.kind==="acct"){ const s = siOf(E.uid); return s.id ? s : {user_id:E.uid}; }
  if(E.kind==="rec") return siAll().find(x=>x.id===E.id) || null;
  return {};
}
async function siSave(){
  const rec = siCurrentRec(); if(!rec) return;
  const f = {}; [...SI_FIELDS.map(([k])=>k), "name", "email"].forEach(k=>{ const el=document.getElementById("si-"+k); f[k] = el ? el.value : ""; });
  if(!rec.user_id && !f.name.trim()){ toast("請填學生姓名。"); return; }
  if(!rec.user_id && f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())){ toast("Email 格式看起來不對。"); return; }
  const btn=document.getElementById("si-save"); btn.disabled=true; btn.textContent="儲存中…";
  const r = await SIAPI.save(rec, f);
  if(r.err){ btn.disabled=false; btn.textContent="儲存 Save"; toast("儲存失敗："+r.err); return; }
  siSetRow(r.row);
  toast(SI_EDIT.kind==="new" ? "已建檔，學生註冊後可以綁定帳號 🐾" : "學生資料已儲存 🐾"); SI_EDIT = null; paintTeacher();
}
async function siBind(){
  const rec = siCurrentRec(); const sel = document.getElementById("si-bind-user");
  if(!rec || !rec.id || !sel || !sel.value){ toast("請先選擇要綁定的學生帳號。"); return; }
  const p = TDATA.profiles.find(x=>x.id===sel.value);
  if(!confirm(`把「${rec.name||"這份資料"}」綁定到帳號「${p?(p.name||p.email):""}」？\n（目前表單上還沒儲存的修改請先按儲存）`)) return;
  const r = await SIAPI.bind(rec.id, sel.value);
  if(r.err){ toast("綁定失敗："+r.err); return; }
  siSetRow(r.row); toast("已綁定帳號 🔗"); SI_EDIT = {kind:"acct", uid:sel.value}; paintTeacher();
}
async function siUnbind(){
  const rec = siCurrentRec(); if(!rec || !rec.id) return;
  if(!confirm("解除綁定後，這份資料會變成「未綁帳號」，之後可以再綁到其他帳號。確定？")) return;
  const p = TDATA.profiles.find(x=>x.id===rec.user_id);
  const r = await SIAPI.unbind(rec.id, rec.name || (p&&(p.name||p.email)) || "未命名", rec.email || (p&&p.email) || "");
  if(r.err){ toast("解除失敗："+r.err); return; }
  siSetRow(r.row); toast("已解除綁定"); SI_EDIT = {kind:"rec", id:r.row.id}; paintTeacher();
}
async function siDelete(id){
  const rec = id ? siAll().find(x=>x.id===id) : siCurrentRec(); if(!rec || !rec.id) return;
  if(!confirm(`確定刪除「${rec.name||"這位學生"}」的基本資料？（不會刪除學生帳號或學習紀錄）`)) return;
  const r = await SIAPI.remove(rec.id);
  if(r.err){ toast("刪除失敗："+r.err); return; }
  siSetRow(null, rec.id); toast("已刪除資料"); if(SI_EDIT && SI_EDIT.kind==="rec" && SI_EDIT.id===rec.id) SI_EDIT = null; paintTeacher();
}
/* 匯出名冊（Excel 開得起來的 UTF-8 CSV） */
function siExport(){
  const students = TDATA.profiles.filter(p=>p.role!=="teacher");
  const roster = siRoster(students).sort((a,b)=> siGradeRank(a.s.grade)-siGradeRank(b.s.grade) || a.name.localeCompare(b.name,"zh-Hant"));
  const cell = x => { let s = x==null ? "" : String(x); if(/^[=+\-@]/.test(s)) s = "'"+s; return /[",\n\r]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };
  const head = ["姓名","Email","帳號","名單狀態", ...SI_FIELDS.map(([,l])=>l)];
  const lines = [head, ...roster.map(x=>[x.name, x.email, x.kind==="acct"?"已註冊":"未綁帳號", x.s.archived_at?"已封存":"在名單", ...SI_FIELDS.map(([k])=>x.s[k]||"")])]
    .map(r=>r.map(cell).join(","));
  const blob = new Blob(["﻿"+lines.join("\r\n")], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `學生名冊-${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
/* 出作業／分組時「依年級一次勾選」 */
function siGradeButtons(students, fnName){
  const grades = [...new Set(students.map(p=>siOf(p.id).grade).filter(Boolean))].sort((a,b)=>siGradeRank(a)-siGradeRank(b));
  return grades.length ? `<div class="si-quick"><span class="tc-sub">依年級勾選：</span>${grades.map(g=>`<button type="button" class="si-chip" data-g="${esc(g)}" onclick="${fnName}(this.dataset.g)">${esc(g)}</button>`).join("")}</div>` : "";
}
