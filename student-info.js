/* =====================================================
   學生基本資料（家教用）：年級、學校、班級、生日、家長、聯絡方式、上課時間、教材、目標、備註
   需要 supabase/migrations/20261017090000_student_info.sql（只有老師能讀寫）
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
  async save(userId, f){
    const row = { user_id:userId, updated_at:new Date().toISOString() };
    SI_FIELDS.forEach(([k])=>{ const v=(f[k]==null?"":String(f[k])).trim(); row[k] = v || null; });
    const { error } = await SB.from("student_info").upsert(row, { onConflict:"user_id" });
    return error ? {err:error.message} : {ok:true, row};
  }
};
function siOf(uid){ return ((typeof TDATA!=="undefined" && TDATA && TDATA.info) || []).find(x=>x.user_id===uid) || {}; }
function siGradeRank(g){ const i=STUDENT_GRADES.indexOf(g); return i<0 ? 99 : i; }
function siGradeTag(uid){ const g=siOf(uid).grade; return g ? `<span class="si-grade">${esc(g)}</span>` : ""; }
function siAge(b){
  if(!b) return ""; const d=new Date(b+"T00:00:00"); if(isNaN(d)) return "";
  const n=new Date(); let a=n.getFullYear()-d.getFullYear(); if(n<new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a>=0 && a<120 ? `${a} 歲` : "";
}

/* ---------- 老師：學生分頁 ---------- */
let SI_FILTER = "all";   // "all" | 年級 | "none"
let SI_EDIT = null;      // 正在編輯的學生 id
function tcStudentsBody(students, progById){
  const info = TDATA.info || [];
  const grades = [...new Set(info.map(x=>x.grade).filter(Boolean))].sort((a,b)=>siGradeRank(a)-siGradeRank(b));
  const noneN = students.filter(p=>!siOf(p.id).grade).length;
  const chip = (k,label,n)=>`<button class="si-chip ${SI_FILTER===k?"on":""}" data-g="${esc(k)}" onclick="SI_FILTER=this.dataset.g;paintTeacher()">${esc(label)} <b>${n}</b></button>`;
  const filters = `<div class="si-filters">${chip("all","全部",students.length)}${grades.map(g=>chip(g,g,students.filter(p=>siOf(p.id).grade===g).length)).join("")}${noneN&&grades.length?chip("none","未設年級",noneN):""}
    <button class="btn btn-ghost si-export" onclick="siExport()">⬇️ 匯出名冊 CSV</button></div>`;
  const shown = students.filter(p=>{ const g=siOf(p.id).grade; return SI_FILTER==="all" || (SI_FILTER==="none" ? !g : g===SI_FILTER); })
    .sort((a,b)=> siGradeRank(siOf(a.id).grade)-siGradeRank(siOf(b.id).grade) || String(a.name||"").localeCompare(String(b.name||""),"zh-Hant"));
  const rows = shown.length ? shown.map(p=>{
    const g = progById[p.id] || {}, s = siOf(p.id);
    const last = g.last_active ? new Date(g.last_active).toLocaleDateString() : "—";
    return `<tr class="${SI_EDIT===p.id?"si-editing":""}"><td>${esc(p.name||"")}<div class="tc-sub">${esc(p.email||"")}</div></td>
      <td>${s.grade?esc(s.grade):`<span class="tc-sub">—</span>`}</td>
      <td>${esc(s.school||"")}${s.class_name?`<div class="tc-sub">${esc(s.class_name)} 班</div>`:""}</td>
      <td>${esc(s.schedule||"")}</td>
      <td class="num">${g.completed_count||0}</td><td class="num">${g.xp||0}</td><td>${last}</td>
      <td><button class="btn btn-ghost" onclick="siOpen('${p.id}')">✏️ 資料</button></td></tr>`;
  }).join("") : `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:20px">${students.length?"這個年級沒有學生。":"還沒有學生註冊。No students yet."}</td></tr>`;
  const warn = TDATA.infoErr ? `<div class="card" style="padding:12px 16px;margin-bottom:12px;color:#B23B2E">學生資料載入失敗：${esc(TDATA.infoErr)}</div>` : "";
  return warn + (SI_EDIT ? siEditor(students.find(p=>p.id===SI_EDIT)) : "") + filters +
    `<div class="tc-tablewrap"><table class="tc-table"><thead><tr><th>學生 Student</th><th>年級</th><th>學校</th><th>上課時間</th><th class="num">完成單元</th><th class="num">XP</th><th>最近登入</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="tc-sub" style="margin-top:8px">🔒 這些資料只有老師看得到，學生（包括本人）都看不到。</p>`;
}
function siEditor(p){
  if(!p) return "";
  const s = siOf(p.id), v = k => esc(s[k]||"");
  const txt = (k,label,ph,max) => `<label class="si-f"><span>${label}</span><input id="si-${k}" maxlength="${max}" value="${v(k)}" placeholder="${esc(ph)}"></label>`;
  return `<div class="card si-editor">
    <div class="si-ed-h"><h3>✏️ ${esc(p.name||p.email||"學生")} 的資料</h3><span class="tc-sub">${esc(p.email||"")}</span></div>
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
    <div class="hw-row"><button class="btn btn-navy" id="si-save" onclick="siSave()">儲存 Save</button><button class="btn btn-ghost" onclick="SI_EDIT=null;paintTeacher()">關閉</button>
      ${s.updated_at?`<span class="tc-sub">上次更新 ${fmtDate(s.updated_at)}</span>`:""}</div>
  </div>`;
}
function siOpen(uid){ SI_EDIT = uid; paintTeacher(); const e=document.querySelector(".si-editor"); if(e) e.scrollIntoView({behavior:"smooth", block:"start"}); }
async function siSave(){
  const f = {}; SI_FIELDS.forEach(([k])=>{ const el=document.getElementById("si-"+k); f[k] = el ? el.value : ""; });
  const btn=document.getElementById("si-save"); btn.disabled=true; btn.textContent="儲存中…";
  const r = await SIAPI.save(SI_EDIT, f);
  if(r.err){ btn.disabled=false; btn.textContent="儲存 Save"; toast("儲存失敗："+r.err); return; }
  TDATA.info = (TDATA.info||[]).filter(x=>x.user_id!==SI_EDIT).concat([r.row]);
  toast("學生資料已儲存 🐾"); SI_EDIT = null; paintTeacher();
}
/* 匯出名冊（Excel 開得起來的 UTF-8 CSV） */
function siExport(){
  const students = TDATA.profiles.filter(p=>p.role!=="teacher")
    .sort((a,b)=> siGradeRank(siOf(a.id).grade)-siGradeRank(siOf(b.id).grade) || String(a.name||"").localeCompare(String(b.name||""),"zh-Hant"));
  const cell = x => { let s = x==null ? "" : String(x); if(/^[=+\-@]/.test(s)) s = "'"+s; return /[",\n\r]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };
  const head = ["姓名","Email", ...SI_FIELDS.map(([,l])=>l)];
  const lines = [head, ...students.map(p=>{ const s=siOf(p.id); return [p.name||"", p.email||"", ...SI_FIELDS.map(([k])=>s[k]||"")]; })]
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
