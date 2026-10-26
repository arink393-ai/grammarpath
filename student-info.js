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
  async remove(id){
    const { error } = await SB.from("student_info").delete().eq("id", id);
    return error ? {err:error.message} : {ok:true};
  }
};
function siAll(){ return (typeof TDATA!=="undefined" && TDATA && TDATA.info) || []; }
function siOf(uid){ return siAll().find(x=>x.user_id===uid) || {}; }
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
function tcStudentsBody(students, progById){
  const roster = siRoster(students);
  const grades = [...new Set(roster.map(x=>x.s.grade).filter(Boolean))].sort((a,b)=>siGradeRank(a)-siGradeRank(b));
  const noneN = roster.filter(x=>!x.s.grade).length, unN = roster.filter(x=>x.kind==="rec").length;
  const chip = (k,label,n)=>`<button class="si-chip ${SI_FILTER===k?"on":""}" data-g="${esc(k)}" onclick="SI_FILTER=this.dataset.g;paintTeacher()">${esc(label)} <b>${n}</b></button>`;
  const filters = `<div class="si-filters">${chip("all","全部",roster.length)}${grades.map(g=>chip(g,g,roster.filter(x=>x.s.grade===g).length)).join("")}${noneN&&grades.length?chip("none","未設年級",noneN):""}${unN?chip("unbound","未綁帳號",unN):""}
    <button class="btn btn-navy si-add" onclick="siNew()">➕ 新增學生（先建檔）</button>
    <button class="btn btn-ghost si-export" onclick="siExport()">⬇️ 匯出名冊 CSV</button></div>`;
  const shown = roster.filter(x=>{ const g=x.s.grade; return SI_FILTER==="all" || (SI_FILTER==="unbound" ? x.kind==="rec" : SI_FILTER==="none" ? !g : g===SI_FILTER); })
    .sort((a,b)=> siGradeRank(a.s.grade)-siGradeRank(b.s.grade) || a.name.localeCompare(b.name,"zh-Hant"));
  const editing = x => SI_EDIT && ((SI_EDIT.kind==="acct" && x.uid===SI_EDIT.uid) || (SI_EDIT.kind==="rec" && x.id===SI_EDIT.id));
  const rows = shown.length ? shown.map(x=>{
    const s = x.s, g = x.kind==="acct" ? (progById[x.uid]||{}) : null;
    const last = g && g.last_active ? new Date(g.last_active).toLocaleDateString() : "—";
    const selfBadge = x.kind==="acct" && siSelfKeys(x.uid).length ? ` <span style="display:inline-block;font-size:11px;color:#1f7a6e;background:#e3f1ee;border-radius:6px;padding:1px 6px" title="學生已在「我的資料」自填">📝 自填</span>` : "";
    const who = x.kind==="acct" ? `${esc(x.name)}${selfBadge}<div class="tc-sub">${esc(x.email)}</div>`
      : `${esc(x.name)} <span class="si-unbound">未綁帳號</span><div class="tc-sub">${x.email?`註冊用 ${esc(x.email)} 會自動綁定`:"還沒填 email，註冊後請手動綁定"}</div>`;
    const btn = x.kind==="acct" ? `siOpen('acct','${x.uid}')` : `siOpen('rec','${x.id}')`;
    return `<tr class="${editing(x)?"si-editing":""} ${x.kind==="rec"?"si-rec":""}"><td>${who}</td>
      <td>${s.grade?esc(s.grade):`<span class="tc-sub">—</span>`}</td>
      <td>${esc(s.school||"")}${s.class_name?`<div class="tc-sub">${esc(s.class_name)} 班</div>`:""}</td>
      <td>${esc(s.schedule||"")}</td>
      <td class="num">${g?(g.completed_count||0):"—"}</td><td class="num">${g?(g.xp||0):"—"}</td><td>${last}</td>
      <td><button class="btn btn-ghost" onclick="${btn}">${x.kind==="rec"?"✏️ 資料／綁定":"✏️ 資料"}</button></td></tr>`;
  }).join("") : `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:20px">${roster.length?"這個條件下沒有學生。":"還沒有學生。可以先按「➕ 新增學生（先建檔）」，等學生註冊再綁定帳號。"}</td></tr>`;
  const warn = TDATA.infoErr ? `<div class="card" style="padding:12px 16px;margin-bottom:12px;color:#B23B2E">學生資料載入失敗：${esc(TDATA.infoErr)}</div>` : "";
  return warn + (SI_EDIT ? siEditor(students) : "") + filters +
    `<div class="tc-tablewrap"><table class="tc-table"><thead><tr><th>學生 Student</th><th>年級</th><th>學校</th><th>上課時間</th><th class="num">完成單元</th><th class="num">XP</th><th>最近登入</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="tc-sub" style="margin-top:8px">🔒 這些資料只有老師看得到，學生（包括本人）都看不到。還沒註冊的學生可以先建檔；學生用你登記的 email 註冊時會自動綁定，也可以手動綁定。</p>`;
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
  const delBtn = s.id ? `<button class="btn btn-ghost si-del" onclick="siDelete()">🗑 刪除這份資料</button>` : "";
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
      ${unbindBtn}${delBtn}${s.updated_at?`<span class="tc-sub">上次更新 ${fmtDate(s.updated_at)}</span>`:""}</div>
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
async function siDelete(){
  const rec = siCurrentRec(); if(!rec || !rec.id) return;
  if(!confirm(`確定刪除「${rec.name||"這位學生"}」的基本資料？（不會刪除學生帳號或學習紀錄）`)) return;
  const r = await SIAPI.remove(rec.id);
  if(r.err){ toast("刪除失敗："+r.err); return; }
  siSetRow(null, rec.id); toast("已刪除資料"); SI_EDIT = null; paintTeacher();
}
/* 匯出名冊（Excel 開得起來的 UTF-8 CSV） */
function siExport(){
  const students = TDATA.profiles.filter(p=>p.role!=="teacher");
  const roster = siRoster(students).sort((a,b)=> siGradeRank(a.s.grade)-siGradeRank(b.s.grade) || a.name.localeCompare(b.name,"zh-Hant"));
  const cell = x => { let s = x==null ? "" : String(x); if(/^[=+\-@]/.test(s)) s = "'"+s; return /[",\n\r]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };
  const head = ["姓名","Email","帳號", ...SI_FIELDS.map(([,l])=>l)];
  const lines = [head, ...roster.map(x=>[x.name, x.email, x.kind==="acct"?"已註冊":"未綁帳號", ...SI_FIELDS.map(([k])=>x.s[k]||"")])]
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
