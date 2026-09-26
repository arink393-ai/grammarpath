'use strict';

/* ========== 工具 ========== */
const $ = s => document.querySelector(s);
const app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { toast('瀏覽器無法儲存進度（可能是無痕模式）'); } },
  del(k) { try { localStorage.removeItem(k); } catch {} }
};
const today = () => { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); };
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200); }

/* ========== 間隔重複 ========== */
// 階段 → 下次複習間隔（天）。階段 ≥ MASTER 算「熟記」。KILLED＝太簡單，不再出現
const INTERVALS = [0, 1, 2, 4, 7, 15, 30, 60, 120];
const MASTER = 5;
const KILLED = 99;

/* ========== 資料 ========== */
const DEFAULT_SETTINGS = { bookId: 'jh-core', dailyNew: 10, autoplay: true, voice: 'youdao', accent: 2 };
let settings = { ...DEFAULT_SETTINGS, ...LS.get('vr:settings', {}) };
const saveSettings = () => LS.set('vr:settings', settings);
// ?book=<id>：從外部連結直接指定單字書（例如 Language Lab 章節）
(() => {
  const q = new URLSearchParams(location.search).get('book');
  if (q && BUILTIN_BOOKS.concat(LS.get('vr:books', [])).some(b => b.id === q)) { settings.bookId = q; saveSettings(); }
  if (q) history.replaceState(null, '', location.pathname + location.hash);
})();

const customBooks = () => LS.get('vr:books', []);
const allBooks = () => [...BUILTIN_BOOKS, ...customBooks()];
const curBook = () => allBooks().find(b => b.id === settings.bookId) || allBooks().find(b => b.id === DEFAULT_SETTINGS.bookId);
const prog = id => LS.get('vr:p:' + id, {});
const saveProg = (id, p) => { LS.set('vr:p:' + id, p); markDirty(id); };
const stars = id => new Set(LS.get('vr:star:' + id, []));
const saveStars = (id, s) => { LS.set('vr:star:' + id, [...s]); markDirty(id); };
// 每本書各自記錄每日完成數（vr:bs:<id>），全站統計＝各書加總（再加上舊版的 vr:stats）
const bstats = id => LS.get('vr:bs:' + id, {});
function stats() {
  const out = {};
  const add = o => Object.entries(o).forEach(([d, x]) => { out[d] = out[d] || { n: 0, r: 0 }; out[d].n += x.n || 0; out[d].r += x.r || 0; });
  add(LS.get('vr:stats', {}));
  allBooks().forEach(b => add(bstats(b.id)));
  return out;
}
function bump(id, field) { const s = bstats(id), t = today(); s[t] = s[t] || { n: 0, r: 0 }; s[t][field]++; LS.set('vr:bs:' + id, s); markDirty(id); }
function streak() {
  const s = stats(), on = x => x && x.n + x.r > 0;
  let t = today(); if (!on(s[t])) t--;
  let n = 0; while (on(s[t])) { n++; t--; } return n;
}
function status(r) {
  if (!r) return 'new';
  if (r.s >= KILLED) return 'killed';
  if (r.s >= MASTER) return 'master';
  return 'learning';
}
// 這本書今天已學的新字數（每本書分開算）
const newToday = book => { const p = prog(book.id), t = today(); return book.words.filter(w => p[w.w] && p[w.w].d0 === t).length; };
function summary(book) {
  const p = prog(book.id), t = today();
  const c = { new: 0, learning: 0, master: 0, killed: 0, due: 0 };
  for (const w of book.words) {
    const r = p[w.w]; c[status(r)]++;
    if (r && r.s < KILLED && r.due <= t) c.due++;
  }
  return c;
}

/* ========== 發音 ========== */
let audio;
function speak(text, slow) {
  if (!text) return;
  if (audio) { audio.pause(); audio = null; }
  if (window.speechSynthesis) speechSynthesis.cancel();
  const fallback = () => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = settings.accent === 1 ? 'en-GB' : 'en-US';
    u.rate = slow ? 0.75 : 0.95;
    const v = speechSynthesis.getVoices().find(v => v.lang === u.lang && /Samantha|Google|Daniel|Karen|Ava|Serena/.test(v.name));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  };
  if (settings.voice !== 'youdao') return fallback();
  audio = new Audio('https://dict.youdao.com/dictvoice?type=' + settings.accent + '&audio=' + encodeURIComponent(text));
  audio.onerror = fallback;
  audio.play().catch(fallback);
}

/* ========== 例句中標出單字 ========== */
function stemRe(word) {
  const w = word.toLowerCase().replace(/[^a-z' -]/g, '');
  const root = w.length > 4 ? w.replace(/(e|y|le)$/, '') : w;
  return new RegExp('\\b(' + root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "[a-z]*)", 'i');
}
const markEx = (ex, w) => esc(ex).replace(stemRe(w), '<mark>$1</mark>');
const clozeEx = (ex, w) => esc(ex).replace(stemRe(w), '<u>&nbsp;</u>');

/* ========== 雲端同步（English Cat Island 帳號，老師後台看得到） ========== */
// 只有在頁面提供 window.VR_SUPABASE（grammarpath/vocab/index.html）時啟用；
// 與主站同網域，所以共用主站的登入狀態。
const CLOUD = { sb: null, user: null, timer: null, dirty: new Set(), state: 'off' };
function markDirty(id) {
  if (!CLOUD.user) return;
  CLOUD.dirty.add(id); clearTimeout(CLOUD.timer); CLOUD.timer = setTimeout(cloudPush, 2000);
}
function cloudBar() {
  if (CLOUD.state === 'off') return '';
  if (CLOUD.state === 'guest') return `<a class="cloudbar warn" href="../#/home">☁️ 還沒登入：登入 English Cat Island 帳號後，進度會同步給老師 →</a>`;
  if (CLOUD.state === 'error') return `<div class="cloudbar warn">☁️ 同步暫時失敗，進度先存在這台裝置，稍後會自動再試</div>`;
  const m = CLOUD.user.user_metadata || {};
  return `<div class="cloudbar">☁️ ${esc(m.name || CLOUD.user.email)} · 進度已同步給老師</div>`;
}
function wipeLocal() {
  const ks = [];
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^vr:(p|star|bs):|^vr:(stats|books)$/.test(k)) ks.push(k); }
  ks.forEach(k => localStorage.removeItem(k));
}
async function cloudInit() {
  const cfg = window.VR_SUPABASE;
  if (!cfg || !window.supabase) return;
  CLOUD.state = 'guest';
  try {
    CLOUD.sb = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true } });
    const { data: { session: s } } = await CLOUD.sb.auth.getSession();
    CLOUD.user = s && s.user || null;
  } catch (e) { console.warn('cloud init', e); }
  if (CLOUD.user) {
    // 共用電腦：換了另一位同學登入，就清掉上一位留在本機的進度
    const owner = LS.get('vr:owner', null);
    if (owner && owner !== CLOUD.user.id) wipeLocal();
    LS.set('vr:owner', CLOUD.user.id);
    await cloudPull();
    allBooks().forEach(b => { if (Object.keys(prog(b.id)).length || stars(b.id).size) CLOUD.dirty.add(b.id); });
    await cloudPush();
  }
  if (!session && !(quiz && !quiz.done) && !location.hash.startsWith('#teacher')) route();
}
async function cloudPull() {
  const { data, error } = await CLOUD.sb.from('vocab_progress').select('book_id,words,stars,days,book_data').eq('user_id', CLOUD.user.id);
  if (error) { CLOUD.state = 'error'; console.warn('cloud pull', error); return; }
  CLOUD.state = 'synced';
  for (const row of data || []) {
    const id = row.book_id;
    if (row.book_data && !allBooks().some(b => b.id === id)) LS.set('vr:books', [...customBooks(), row.book_data]);
    const p = prog(id);
    for (const [w, r] of Object.entries(row.words || {})) if (!p[w] || (r.u || 0) > (p[w].u || 0)) p[w] = r;
    LS.set('vr:p:' + id, p);
    LS.set('vr:star:' + id, [...new Set([...stars(id), ...(row.stars || [])])]);
    const bs = bstats(id);
    for (const [d, x] of Object.entries(row.days || {})) {
      const y = bs[d] || { n: 0, r: 0 };
      bs[d] = { n: Math.max(y.n || 0, x.n || 0), r: Math.max(y.r || 0, x.r || 0) };
    }
    LS.set('vr:bs:' + id, bs);
  }
}
async function cloudPush() {
  if (!CLOUD.user || !CLOUD.dirty.size) return;
  const ids = [...CLOUD.dirty]; CLOUD.dirty.clear();
  const now = new Date().toISOString(), cut = today() - 90;
  const rows = ids.map(id => {
    const b = allBooks().find(x => x.id === id); if (!b) return null;
    const days = Object.fromEntries(Object.entries(bstats(id)).filter(([d]) => +d >= cut));
    return {
      user_id: CLOUD.user.id, book_id: id, book_title: b.title, total: b.words.length,
      words: prog(id), stars: [...stars(id)], days,
      book_data: BUILTIN_BOOKS.some(x => x.id === id) ? null : b,
      last_active: now, updated_at: now
    };
  }).filter(Boolean);
  if (!rows.length) return;
  const { error } = await CLOUD.sb.from('vocab_progress').upsert(rows, { onConflict: 'user_id,book_id' });
  const was = CLOUD.state;
  if (error) { ids.forEach(i => CLOUD.dirty.add(i)); CLOUD.state = 'error'; console.warn('cloud push', error); }
  else CLOUD.state = 'synced';
  if (was !== CLOUD.state && (location.hash === '#home' || !location.hash)) home();
}
async function cloudDelete(id) {
  CLOUD.dirty.delete(id);
  if (CLOUD.user) { try { await CLOUD.sb.from('vocab_progress').delete().eq('user_id', CLOUD.user.id).eq('book_id', id); } catch {} }
}
document.addEventListener('visibilitychange', () => { if (document.hidden) cloudPush(); });

/* ========== 路由 ========== */
let session = null, quiz = null;
const routes = { home, study, quiz: quizHome, list, me, teacher };
async function route() {
  const h = location.hash.slice(1);
  if (h.startsWith('b=')) return importFromHash(h.slice(2));
  const [name] = h.split('?');
  const fn = routes[name] || home;
  document.body.classList.toggle('focus', name === 'study' || (name === 'quiz' && quiz && !quiz.done));
  document.querySelectorAll('#tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === (name || 'home') || (name === 'teacher' && a.dataset.tab === 'me')));
  if (window.speechSynthesis) speechSynthesis.cancel();
  fn();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
const go = h => { if (location.hash === '#' + h) route(); else location.hash = h; };

/* ========== 首頁 ========== */
function home() {
  session = null; quiz = null;
  const b = curBook(), c = summary(b), s = stats(), t = today();
  const td = s[t] || { n: 0, r: 0 };
  const newLeft = Math.max(0, Math.min(settings.dailyNew - newToday(b), c.new));
  const total = b.words.length;
  const pct = x => (x / total * 100).toFixed(1) + '%';
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = t - i; const x = s[d] || { n: 0, r: 0 }; days.push({ d, v: x.n + x.r }); }
  const max = Math.max(10, ...days.map(x => x.v));
  const wk = ['日', '一', '二', '三', '四', '五', '六'];
  const nothing = newLeft === 0 && c.due === 0;

  app.innerHTML = `<div class="fade">
    <a class="backsite" href="../#/lab/vocab-method">‹ English Cat Island</a>
    ${cloudBar()}
    <p class="sub">${new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
    <h1>${nothing ? '今日任務完成 🎉' : '今天也來背幾個字吧'}</h1>

    <div class="hero">
      <div class="card stat"><b>${newLeft}</b><span>待學新字</span></div>
      <div class="card stat"><b>${c.due}</b><span>待複習</span></div>
      <div class="card stat"><b>${td.n + td.r}</b><span>今日已完成</span></div>
      <div class="card stat"><b>${streak()}<small style="font-size:15px"> 天</small></b><span>連續打卡</span></div>
    </div>

    ${nothing
      ? `<button class="btn primary block startbtn" data-act="extra">再多學 5 個新字</button>`
      : `<button class="btn primary block startbtn" data-act="start">開始學習</button>`}

    <h2>目前單字書</h2>
    <div class="card">
      <div class="bookpick">
        <div><b>${esc(b.title)}</b><div class="small muted">共 ${total} 字 · 每日新字 ${settings.dailyNew} 個</div></div>
        <a class="btn sm" href="#me">更換</a>
      </div>
      <div class="bar" style="margin-top:14px"><i class="m" style="width:${pct(c.master + c.killed)}"></i><i class="l" style="width:${pct(c.learning)}"></i></div>
      <div class="legend">
        <span><i style="background:var(--accent)"></i>熟記 ${c.master + c.killed}</span>
        <span><i style="background:color-mix(in srgb,var(--accent) 40%,transparent)"></i>學習中 ${c.learning}</span>
        <span><i style="background:var(--line)"></i>未學 ${c.new}</span>
      </div>
    </div>

    <h2>最近 7 天</h2>
    <div class="card">
      <div class="week">${days.map(x => `<div class="${x.v ? '' : 'zero'}" title="${x.v} 個"><span>${x.v || ''}</span><i style="height:${Math.max(3, x.v / max * 64)}px"></i>${x.d === t ? '今' : wk[new Date(x.d * 86400000).getUTCDay()]}</div>`).join('')}</div>
    </div>
  </div>`;
}

/* ========== 學習 ========== */
function buildSession(extra = 0) {
  const b = curBook(), p = prog(b.id), t = today();
  const due = shuffle(b.words.filter(w => p[w.w] && p[w.w].s < KILLED && p[w.w].due <= t)).slice(0, 100);
  const newN = extra || Math.max(0, settings.dailyNew - newToday(b));
  const fresh = b.words.filter(w => !p[w.w]).slice(0, newN);
  // 新字每 3 個穿插在複習之間，避免一開始全是陌生字
  const q = [...due.map(w => ({ w, isNew: false }))];
  fresh.forEach((w, i) => q.splice(Math.min(q.length, i * 4 + 2), 0, { w, isNew: true }));
  q.forEach(it => { it.fails = 0; it.hint = false; });
  return { book: b, queue: q, total: q.length, done: 0, phase: 'q', cur: null };
}

function study() {
  if (!session) return go('home');
  const S = session;
  if (!S.cur) S.cur = S.queue.shift();
  if (!S.cur) return studyDone();
  const it = S.cur, w = it.w;
  const star = stars(S.book.id).has(w.w);
  const pct = (S.done / S.total * 100).toFixed(1);
  const tag = it.fails ? '<span class="tag bad">再試一次</span>' : it.isNew ? '<span class="tag new">新字</span>' : '<span class="tag">複習</span>';

  const head = `<div class="progress">
      <button class="iconbtn" data-act="quit" aria-label="離開">✕</button>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <span class="small muted">${S.done}/${S.total}</span>
    </div>`;
  const wordLine = `<div class="row"><div class="grow"><div class="word">${esc(w.w)}</div><div class="ph">${esc(w.ph || '')}</div></div>
      <button class="speak" data-act="say" aria-label="發音">🔊</button></div>`;
  const exLine = w.ex ? `<div class="ex" data-act="sayex" title="點一下聽例句">${markEx(w.ex, w.w)}</div>` : '';

  let body;
  if (S.phase === 'q') {
    body = `${wordLine}${exLine}
      <div class="spacer"></div>
      <div class="choices3">
        <button class="btn k" data-act="know">認識</button>
        <button class="btn f" data-act="fuzzy">提示一下</button>
        <button class="btn u" data-act="dunno">不認識</button>
      </div>
      <div class="kbd">鍵盤：1 認識 · 2 提示 · 3 不認識 · 空白鍵 發音</div>`;
  } else if (S.phase === 'hint') {
    body = `${wordLine}${exLine}
      <div class="hint">💡 ${esc(w.exZh || w.zh.slice(0, 1) + '…')}</div>
      <div class="spacer"></div>
      <div class="choices3" style="grid-template-columns:1fr 1fr">
        <button class="btn k" data-act="gotit">想起來了</button>
        <button class="btn u" data-act="dunno">還是不認識</button>
      </div>
      <div class="kbd">鍵盤：1 想起來了 · 3 還是不認識</div>`;
  } else {
    body = `${wordLine}
      <div class="meaning"><span class="pos">${esc(w.pos || '')}</span>${esc(w.zh)}</div>
      ${exLine}${w.exZh ? `<div class="exzh">${esc(w.exZh)}</div>` : ''}
      <div class="spacer"></div>
      <button class="btn primary block" data-act="next">下一個 →</button>
      ${S.phase === 'a-know' ? '<button class="btn ghost block" data-act="wrong" style="margin-top:6px">記錯了，其實不會</button>' : ''}
      <div class="kbd">鍵盤：空白鍵 / Enter 下一個${S.phase === 'a-know' ? ' · 3 記錯了' : ''}</div>`;
  }

  app.innerHTML = `${head}<div class="card studycard fade">
      <div class="cardtop">${tag}
        <div><button class="iconbtn" data-act="kill" title="太簡單，以後不再出現">✂︎</button>
        <button class="iconbtn ${star ? 'on' : ''}" data-act="star" title="加入生詞本">${star ? '★' : '☆'}</button></div>
      </div>${body}</div>`;
  if (S.phase === 'q' && settings.autoplay && !S.spoke) { S.spoke = true; speak(w.w); }
}

function requeue(it) {
  const S = session;
  S.queue.splice(Math.min(S.queue.length, 3 + Math.floor(Math.random() * 3)), 0, it);
}
function complete(it, killed) {
  const S = session, b = S.book, p = prog(b.id), t = today();
  const r = p[it.w.w] || { s: 0, due: t, l: 0, d0: t };
  if (killed) r.s = KILLED;
  else if (it.fails > 0) { r.s = 1; r.l = (r.l || 0) + 1; }
  else if (it.hint) r.s = Math.max(1, r.s);
  else r.s = it.isNew ? 2 : Math.min(r.s + 1, INTERVALS.length - 1);
  r.due = killed ? 1e9 : t + INTERVALS[r.s];
  r.u = Date.now();
  p[it.w.w] = r; saveProg(b.id, p);
  bump(b.id, it.isNew ? 'n' : 'r');
  S.done++;
}
function advance() { session.cur = null; session.phase = 'q'; session.spoke = false; study(); }

function studyAct(act) {
  const S = session, it = S.cur;
  switch (act) {
    case 'say': return speak(it.w.w);
    case 'sayex': return speak(it.w.ex);
    case 'know': S.phase = 'a-know'; return study();
    case 'fuzzy': S.phase = 'hint'; return study();
    case 'gotit': it.hint = true; S.phase = 'a'; return study();
    case 'dunno': it.fails++; S.phase = 'a-fail'; return study();
    case 'wrong': it.fails++; S.phase = 'a-fail'; return study();
    case 'next':
      if (S.phase === 'a-fail') { requeue(it); S.cur = null; S.phase = 'q'; S.spoke = false; return study(); }
      complete(it); return advance();
    case 'kill': complete(it, true); toast('已標記為「太簡單」，不會再出現'); return advance();
    case 'star': {
      const st = stars(S.book.id);
      st.has(it.w.w) ? st.delete(it.w.w) : st.add(it.w.w);
      saveStars(S.book.id, st); toast(st.has(it.w.w) ? '已加入生詞本 ★' : '已從生詞本移除');
      return study();
    }
    case 'quit': if (S.done === 0 || confirm('確定要離開嗎？已完成的字會保留進度。')) { session = null; go('home'); } return;
  }
}

function studyDone() {
  const S = session;
  document.body.classList.remove('focus');
  app.innerHTML = `<div class="card center fade" style="margin-top:40px;padding:32px 20px">
      <div style="font-size:54px">🎉</div>
      <h1>太棒了！</h1>
      <p class="muted">這一輪完成 ${S.total} 個單字，連續打卡 ${streak()} 天</p>
      <div class="row" style="margin-top:22px">
        <a class="btn block grow" href="#quiz">做個小測驗</a>
        <button class="btn primary block grow" data-act="home">回首頁</button>
      </div></div>`;
  session = null;
}

/* ========== 測驗 ========== */
const MODES = {
  choice: { name: '看字選義', ico: 'Aa', desc: '看英文，選出正確的中文' },
  listen: { name: '聽音辨字', ico: '🎧', desc: '聽發音，選出正確的單字' },
  spell: { name: '拼寫練習', ico: '✍︎', desc: '看中文與例句，拼出單字' }
};
function quizHome() {
  if (quiz && !quiz.done) return quizRender();
  quiz = null;
  const b = curBook(), p = prog(b.id);
  const learned = b.words.filter(w => p[w.w] && p[w.w].s < KILLED).length;
  const st = stars(b.id).size;
  app.innerHTML = `<div class="fade">
    <h1>小測驗</h1>
    <p class="sub">${esc(b.title)} · ${learned >= 4 ? `從已學過的 ${learned} 個字出題` : '還沒學幾個字，先從整本書出題'}</p>
    <div class="modes" style="margin-top:18px">
      ${Object.entries(MODES).map(([k, m]) => `<button class="btn card mode" data-act="quiz" data-mode="${k}"><span class="ico">${m.ico}</span><span><b>${m.name}</b><span class="small muted">${m.desc}</span></span></button>`).join('')}
    </div>
    <label class="switch" style="margin-top:14px"><span>只考生詞本（${st} 個）</span><input type="checkbox" id="onlystar" ${st >= 4 ? '' : 'disabled'}></label>
    <p class="small muted">答錯的字會自動排入今天的複習。</p>
  </div>`;
}
function startQuiz(mode, onlyStar) {
  const b = curBook(), p = prog(b.id);
  let pool = onlyStar ? b.words.filter(w => stars(b.id).has(w.w)) : b.words.filter(w => p[w.w] && p[w.w].s < KILLED);
  if (pool.length < 4) pool = b.words;
  if (mode === 'spell') pool = pool.filter(w => /^[a-z' -]+$/i.test(w.w));
  const items = sample(pool, Math.min(10, pool.length)).map(w => {
    const others = sample(b.words.filter(x => x.w !== w.w && x.zh !== w.zh), 3);
    return { w, opts: shuffle([w, ...others]) };
  });
  quiz = { mode, items, i: 0, score: 0, wrong: [], answered: false, book: b };
  document.body.classList.add('focus');
  quizRender();
}
function quizRender() {
  const Q = quiz;
  if (Q.i >= Q.items.length) return quizDone();
  const it = Q.items[Q.i], w = it.w;
  const head = `<div class="progress"><button class="iconbtn" data-act="qquit" aria-label="離開">✕</button>
    <div class="bar"><i style="width:${(Q.i / Q.items.length * 100).toFixed(1)}%"></i></div>
    <span class="small muted">${Q.i + 1}/${Q.items.length}</span></div>`;
  let body = '';
  if (Q.mode === 'choice') {
    body = `<div class="row"><div class="grow"><div class="word">${esc(w.w)}</div><div class="ph">${esc(w.ph || '')}</div></div><button class="speak" data-act="qsay">🔊</button></div>
      <div class="opts">${it.opts.map((o, k) => `<button class="btn opt" data-act="pick" data-k="${k}">${esc((o.pos ? o.pos + ' ' : '') + o.zh)}</button>`).join('')}</div>`;
  } else if (Q.mode === 'listen') {
    body = `<div class="center" style="padding:18px 0"><button class="speak" data-act="qsay" style="width:84px;height:84px;font-size:34px">🔊</button><p class="muted small">點喇叭再聽一次</p></div>
      <div class="opts">${it.opts.map((o, k) => `<button class="btn opt" data-act="pick" data-k="${k}" style="font-family:Georgia,serif;font-size:19px">${esc(o.w)}</button>`).join('')}</div>`;
  } else {
    body = `<div class="meaning" style="margin-top:0"><span class="pos">${esc(w.pos || '')}</span>${esc(w.zh)}</div>
      ${w.ex ? `<div class="cloze">${clozeEx(w.ex, w.w)}</div>` : ''}
      <p class="small muted">提示：${esc(w.w[0])}${'＿'.repeat(Math.max(0, w.w.length - 1))}（${w.w.length} 個字母，填原形）</p>
      <input class="spell" id="spell" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="輸入單字">
      <div id="spellfb" style="min-height:64px;margin-top:10px"></div>
      <button class="btn primary block" data-act="check" id="checkbtn">確認</button>`;
  }
  app.innerHTML = `${head}<div class="card fade" style="padding:24px 20px">${body}</div>`;
  if (Q.mode === 'listen') speak(w.w);
  if (Q.mode === 'spell') { const inp = $('#spell'); inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); quizAct(Q.answered ? 'qnext' : 'check'); } }); }
}
function markWrong(w) {
  const Q = quiz, p = prog(Q.book.id), t = today();
  Q.wrong.push(w);
  if (p[w.w] && p[w.w].s < KILLED) { p[w.w].due = t; p[w.w].s = Math.min(p[w.w].s, 1); p[w.w].u = Date.now(); saveProg(Q.book.id, p); }
}
function quizAct(act, el) {
  const Q = quiz; if (!Q) return;
  const it = Q.items[Q.i];
  if (act === 'qsay') return speak(it.w.w);
  if (act === 'qquit') { if (Q.i === 0 || confirm('確定要離開測驗嗎？')) { quiz = null; document.body.classList.remove('focus'); quizHome(); } return; }
  if (act === 'pick' && !Q.answered) {
    Q.answered = true;
    const k = +el.dataset.k, ok = it.opts[k].w === it.w.w;
    document.querySelectorAll('.opt').forEach((b, j) => { if (it.opts[j].w === it.w.w) b.classList.add('right'); else if (j === k) b.classList.add('wrong'); b.disabled = true; });
    if (ok) Q.score++; else markWrong(it.w);
    if (Q.mode === 'choice' || !ok) speak(it.w.w);
    setTimeout(() => { Q.i++; Q.answered = false; quizRender(); }, ok ? 800 : 1800);
  }
  if (act === 'check' && !Q.answered) {
    const inp = $('#spell'), v = inp.value.trim().toLowerCase();
    if (!v) return inp.focus();
    Q.answered = true;
    const ok = v === it.w.w.toLowerCase();
    inp.classList.add(ok ? 'right' : 'wrong'); inp.readOnly = true;
    $('#spellfb').innerHTML = ok ? `<b style="color:var(--good)">✓ 正確！</b>` : `<b style="color:var(--bad)">✗ 正確答案：</b><span class="word" style="font-size:26px">${esc(it.w.w)}</span>`;
    if (ok) Q.score++; else markWrong(it.w);
    speak(it.w.w);
    const btn = $('#checkbtn'); btn.textContent = '下一題 →'; btn.dataset.act = 'qnext';
  }
  if (act === 'qnext') { Q.i++; Q.answered = false; quizRender(); }
}
function quizDone() {
  const Q = quiz; Q.done = true;
  document.body.classList.remove('focus');
  const n = Q.items.length;
  app.innerHTML = `<div class="card center fade" style="margin-top:24px;padding:28px 20px">
      <p class="muted">${MODES[Q.mode].name}</p>
      <div class="bigscore">${Q.score}<span style="font-size:24px;color:var(--muted)"> / ${n}</span></div>
      <p>${Q.score === n ? '全對！太強了 💯' : Q.score >= n * 0.7 ? '很不錯，再接再厲！' : '多複習幾次就會記住的 💪'}</p>
      ${Q.wrong.length ? `<div style="text-align:left;margin-top:16px"><b>答錯的字</b>（已排入今日複習）<ul class="wlist">${Q.wrong.map(w => `<li><div class="top" data-act="sayw" data-w="${esc(w.w)}"><span class="ww">${esc(w.w)}</span><span class="zz">${esc(w.zh)}</span>🔊</div></li>`).join('')}</ul></div>` : ''}
      <div class="row" style="margin-top:18px">
        <button class="btn block grow" data-act="quiz" data-mode="${Q.mode}">再來一次</button>
        <button class="btn primary block grow" data-act="home">回首頁</button>
      </div></div>`;
}

/* ========== 單字本 ========== */
let listFilter = 'all', listQuery = '';
function list() {
  const b = curBook(), p = prog(b.id), st = stars(b.id), t = today();
  const F = { all: '全部', star: '生詞本 ★', learning: '學習中', master: '熟記', new: '未學' };
  const q = listQuery.toLowerCase();
  const words = b.words.filter(w => {
    const s = status(p[w.w]);
    if (listFilter === 'star' && !st.has(w.w)) return false;
    if (listFilter === 'master' && !(s === 'master' || s === 'killed')) return false;
    if ((listFilter === 'learning' || listFilter === 'new') && s !== listFilter) return false;
    return !q || w.w.toLowerCase().includes(q) || (w.zh || '').includes(q);
  });
  const chip = r => {
    const s = status(r);
    if (s === 'new') return '';
    if (s === 'killed') return '<span class="tag">太簡單</span>';
    if (s === 'master') return '<span class="tag">熟記</span>';
    const d = r.due - t;
    return `<span class="tag new">${d <= 0 ? '待複習' : d + ' 天後'}</span>`;
  };
  app.innerHTML = `<div class="fade">
    <h1>單字本</h1><p class="sub">${esc(b.title)} · ${words.length} 個</p>
    <div class="filters" style="margin-top:14px">${Object.entries(F).map(([k, v]) => `<button class="chip ${k === listFilter ? 'on' : ''}" data-act="filter" data-f="${k}">${v}</button>`).join('')}</div>
    <input class="search" id="lsearch" type="search" placeholder="搜尋英文或中文" value="${esc(listQuery)}">
    <ul class="wlist">${words.map(w => `<li>
      <div class="top" data-act="expand"><span class="ww">${esc(w.w)}</span><span class="zz">${esc(w.zh)}</span>${chip(p[w.w])}
      <button class="iconbtn ${st.has(w.w) ? 'on' : ''}" data-act="lstar" data-w="${esc(w.w)}" aria-label="生詞本">${st.has(w.w) ? '★' : '☆'}</button></div>
      <div class="more" hidden>
        <div class="row"><span class="muted">${esc(w.ph || '')}</span><span class="pos">${esc(w.pos || '')}</span><span class="grow"></span><button class="speak" data-act="sayw" data-w="${esc(w.w)}">🔊</button></div>
        ${w.ex ? `<div data-act="sayw" data-w="${esc(w.ex)}" style="cursor:pointer">${markEx(w.ex, w.w)}</div><div class="exzh">${esc(w.exZh || '')}</div>` : ''}
        ${p[w.w] && p[w.w].s >= KILLED ? `<button class="linkbtn small" data-act="unkill" data-w="${esc(w.w)}">取消「太簡單」，重新學習</button>` : ''}
      </div></li>`).join('') || '<p class="muted center" style="padding:30px 0">沒有符合的單字</p>'}</ul>
  </div>`;
  const s = $('#lsearch');
  s.addEventListener('input', () => { listQuery = s.value; const pos = s.selectionStart; list(); const n = $('#lsearch'); n.focus(); n.setSelectionRange(pos, pos); });
}

/* ========== 設定 ========== */
function me() {
  const books = allBooks();
  app.innerHTML = `<div class="fade">
    <h1>設定</h1>
    <h2>選擇單字書</h2>
    <div class="booklist">${books.map(b => {
      const c = summary(b), custom = !BUILTIN_BOOKS.includes(b);
      return `<div class="card bookitem ${b.id === settings.bookId ? 'on' : ''}">
        <div class="grow" data-act="pickbook" data-id="${esc(b.id)}" style="cursor:pointer"><b>${esc(b.title)}</b>
          <div class="small muted">${esc(b.desc || (custom ? '老師分享的單字書' : ''))}</div>
          <div class="small muted">${b.words.length} 字 · 已學 ${b.words.length - c.new}</div></div>
        ${b.id === settings.bookId ? '<span class="tag">使用中</span>' : `<button class="btn sm" data-act="pickbook" data-id="${esc(b.id)}">使用</button>`}
        ${custom ? `<button class="iconbtn" data-act="delbook" data-id="${esc(b.id)}" title="移除這本書">🗑</button>` : ''}
      </div>`;
    }).join('')}</div>

    <h2>學習</h2>
    <div class="card">
      <label class="switch"><span>每日新字數量</span>
        <select id="dailyNew" style="width:auto">${[5, 10, 15, 20, 30, 50].map(n => `<option ${n === settings.dailyNew ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label class="switch"><span>出現單字時自動發音</span><input type="checkbox" id="autoplay" ${settings.autoplay ? 'checked' : ''}></label>
      <label class="switch"><span>發音</span>
        <select id="voice" style="width:auto">
          <option value="youdao|2" ${settings.voice === 'youdao' && settings.accent === 2 ? 'selected' : ''}>真人・美式</option>
          <option value="youdao|1" ${settings.voice === 'youdao' && settings.accent === 1 ? 'selected' : ''}>真人・英式</option>
          <option value="browser|2" ${settings.voice === 'browser' ? 'selected' : ''}>裝置內建語音（離線可用）</option>
        </select></label>
      <div class="switch"><span>試聽</span><button class="speak" data-act="sayw" data-w="Practice makes perfect.">🔊</button></div>
    </div>

    <h2>進度備份</h2>
    <div class="card">
      <p class="small muted" style="margin-top:0">進度存在這台裝置的瀏覽器裡。換手機或電腦時，先在這裡複製備份碼，再到新裝置貼上。</p>
      <div class="row wrap"><button class="btn sm" data-act="backup">複製備份碼</button><button class="btn sm" data-act="restore">貼上備份碼還原</button>
      <button class="btn sm ghost" data-act="reset" style="color:var(--bad)">重設目前這本書的進度</button></div>
    </div>

    <h2>老師專區</h2>
    <a class="card btn block mode" href="#teacher" style="text-decoration:none"><span class="ico">🍎</span><span><b>建立並分享單字書</b><span class="small muted">貼上單字表，產生學生專用連結與 QR Code</span></span></a>
    <p class="small muted center" style="margin-top:28px">每日單字 · 進度只存在本機，不需登入</p>
  </div>`;
  $('#dailyNew').onchange = e => { settings.dailyNew = +e.target.value; saveSettings(); toast('已更新'); };
  $('#autoplay').onchange = e => { settings.autoplay = e.target.checked; saveSettings(); };
  $('#voice').onchange = e => { const [v, a] = e.target.value.split('|'); settings.voice = v; settings.accent = +a; saveSettings(); speak('Hello'); };
}

async function backup() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('vr:') && !k.startsWith('vr:t:')) data[k] = localStorage.getItem(k); }
  const code = 'VR1:' + await pack(JSON.stringify(data));
  try { await navigator.clipboard.writeText(code); toast('備份碼已複製，貼到記事本或傳給自己'); }
  catch { prompt('複製下面這串備份碼：', code); }
}
async function restore() {
  const code = (prompt('貼上備份碼：') || '').trim();
  if (!code) return;
  try {
    const data = JSON.parse(await unpack(code.replace(/^VR1:/, '')));
    if (!confirm('還原後，這台裝置目前的進度會被覆蓋，確定嗎？')) return;
    Object.entries(data).forEach(([k, v]) => { if (k.startsWith('vr:')) localStorage.setItem(k, v); });
    settings = { ...DEFAULT_SETTINGS, ...LS.get('vr:settings', {}) };
    toast('進度已還原'); go('home');
  } catch { alert('備份碼格式不正確'); }
}

/* ========== 壓縮（分享連結用） ========== */
const b64u = bytes => { let s = ''; bytes.forEach(b => s += String.fromCharCode(b)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = str => { str = str.replace(/-/g, '+').replace(/_/g, '/'); const s = atob(str); return Uint8Array.from(s, c => c.charCodeAt(0)); };
async function pack(text) {
  const bytes = new TextEncoder().encode(text);
  if (!window.CompressionStream) return 'j' + b64u(bytes);
  const out = await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer();
  return 'z' + b64u(new Uint8Array(out));
}
async function unpack(code) {
  const kind = code[0], bytes = unb64u(code.slice(1));
  if (kind === 'j') return new TextDecoder().decode(bytes);
  const out = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
  return new TextDecoder().decode(out);
}

async function importFromHash(code) {
  try {
    const book = JSON.parse(await unpack(decodeURIComponent(code)));
    if (!book.title || !Array.isArray(book.words) || !book.words.length) throw 0;
    book.id = book.id || 'c_' + Date.now().toString(36);
    book.words = book.words.filter(w => w && w.w && w.zh);
    const books = customBooks().filter(b => b.id !== book.id);
    books.push(book); LS.set('vr:books', books); markDirty(book.id);
    settings.bookId = book.id; saveSettings();
    history.replaceState(null, '', location.pathname + '#home');
    route();
    toast(`已加入單字書「${book.title}」`);
  } catch {
    history.replaceState(null, '', location.pathname + '#home');
    route();
    toast('連結無法讀取，請跟老師確認連結是否完整');
  }
}

/* ========== 老師專區 ========== */
let draft = LS.get('vr:t:draft', { id: '', title: '', desc: '', raw: '' });
let parsed = [];
const saveDraft = () => LS.set('vr:t:draft', draft);

function parseRaw(raw) {
  const out = [], seen = new Set();
  for (let line of raw.split(/\r?\n/)) {
    line = line.trim(); if (!line || line.startsWith('#')) continue;
    const sep = line.includes('\t') ? '\t' : line.includes('|') ? '|' : null;
    let f = sep ? line.split(sep).map(s => s.trim()) : null;
    if (!f) {
      // 允許「apple 蘋果」這種最簡寫法
      const m = line.match(/^([A-Za-z][A-Za-z'’ .-]*?)\s+([a-z]+\.)?\s*(.*)$/);
      f = m ? [m[1], m[2] || '', m[3]] : [line];
      f = [f[0], f[1] || '', f[2] || ''];
    }
    const [w, pos = '', zh = '', ex = '', exZh = '', ph = ''] = f;
    if (!w || seen.has(w.toLowerCase())) continue;
    seen.add(w.toLowerCase());
    out.push({ w, pos, zh, ex, exZh, ph });
  }
  return out;
}
const toRaw = words => words.map(w => [w.w, w.pos, w.zh, w.ex, w.exZh, w.ph].join(' | ').replace(/( \| )+$/, '')).join('\n');

function teacher() {
  const key = LS.get('vr:t:gkey', ''), model = LS.get('vr:t:gmodel', 'gemini-2.5-flash');
  parsed = parseRaw(draft.raw);
  const missing = parsed.filter(w => !w.zh || !w.ex).length;
  app.innerHTML = `<div class="fade">
    <a href="#me" class="linkbtn">‹ 設定</a>
    <h1>建立單字書</h1>
    <p class="sub">貼上單字 → 預覽 → 產生連結傳給學生。學生點開連結，單字書就會加進他們的 App。</p>

    <div class="card" style="margin-top:16px">
      <label class="field"><span>書名</span><input type="text" id="t-title" value="${esc(draft.title)}" placeholder="例如：七年級 Unit 3 單字"></label>
      <label class="field"><span>說明（選填）</span><input type="text" id="t-desc" value="${esc(draft.desc)}" placeholder="例如：第二次段考範圍"></label>
      <label class="field"><span>單字表（一行一個字）</span>
        <textarea id="t-raw" placeholder="單字 | 詞性 | 中文 | 例句 | 例句中譯&#10;apple | n. | 蘋果 | I eat an apple every day. | 我每天吃一顆蘋果。&#10;borrow | v. | 借入&#10;careful&#10;&#10;也可以直接從 Excel / Google 試算表複製貼上（欄位順序相同）">${esc(draft.raw)}</textarea></label>
      <details><summary>格式說明</summary>
        <p class="small">欄位用 <code>|</code> 或 Tab 分隔，順序：<b>單字、詞性、中文、例句、例句中譯、音標</b>。只有「單字」和「中文」是必要的；只填單字也行，再按下面的「AI 自動補齊」。以 # 開頭的行會被忽略。</p>
      </details>
    </div>

    <h2>自動補齊 <span class="small muted">（${parsed.length} 字，${missing} 字缺中文或例句）</span></h2>
    <div class="card">
      <div class="row wrap">
        <button class="btn sm" data-act="t-ph">查音標（免費）</button>
        <button class="btn sm primary" data-act="t-ai" ${missing ? '' : 'disabled'}>AI 補中文與例句</button>
      </div>
      <details style="margin-top:12px" ${key ? '' : 'open'}><summary>AI 設定（Google Gemini 免費金鑰）</summary>
        <label class="field"><span>Gemini API Key（只存在你這台電腦，不會分享給學生）</span><input type="password" id="t-key" value="${esc(key)}" placeholder="AIza…"></label>
        <label class="field"><span>模型</span><input type="text" id="t-model" value="${esc(model)}"></label>
        <p class="small muted">到 aistudio.google.com 免費申請金鑰。AI 產生的內容請先檢查再發給學生。</p>
      </details>
      <div id="t-status" class="small muted" style="margin-top:8px"></div>
    </div>

    <h2>預覽</h2>
    <div class="card tablewrap">
      ${parsed.length ? `<table class="preview"><tr><th>單字</th><th>詞性</th><th>中文</th><th>例句</th></tr>
        ${parsed.map(w => `<tr><td><b>${esc(w.w)}</b><div class="muted">${esc(w.ph)}</div></td><td>${esc(w.pos)}</td><td class="${w.zh ? '' : 'miss'}">${esc(w.zh)}</td><td class="${w.ex ? '' : 'miss'}">${esc(w.ex)}<div class="muted">${esc(w.exZh)}</div></td></tr>`).join('')}</table>`
        : '<p class="muted center">貼上單字後會顯示在這裡</p>'}
    </div>

    <h2>分享給學生</h2>
    <div class="card">
      <div class="row wrap">
        <button class="btn primary" data-act="t-share">產生學生連結</button>
        <button class="btn" data-act="t-use">我自己先試用</button>
        <button class="btn ghost sm" data-act="t-json">下載 JSON</button>
      </div>
      <div id="t-out"></div>
    </div>
    <p class="small muted" style="margin-top:12px">修改後再產生一次連結即可；同一本書重新分享，學生的進度會保留。<button class="linkbtn small" data-act="t-newbook">開新的一本</button></p>
  </div>`;

  const sync = () => { draft.title = $('#t-title').value; draft.desc = $('#t-desc').value; draft.raw = $('#t-raw').value; saveDraft(); };
  ['#t-title', '#t-desc'].forEach(s => $(s).addEventListener('input', sync));
  let tm; $('#t-raw').addEventListener('input', () => { sync(); clearTimeout(tm); tm = setTimeout(() => { const y = scrollY, sel = $('#t-raw').selectionStart; teacher(); scrollTo(0, y); const r = $('#t-raw'); r.focus(); r.setSelectionRange(sel, sel); }, 900); });
  $('#t-key').addEventListener('change', e => LS.set('vr:t:gkey', e.target.value.trim()));
  $('#t-model').addEventListener('change', e => LS.set('vr:t:gmodel', e.target.value.trim()));
}
const tStatus = m => { const s = $('#t-status'); if (s) s.textContent = m; };

function teacherBook() {
  parsed = parseRaw(draft.raw);
  const words = parsed.filter(w => w.w && w.zh).map(w => { const o = { w: w.w, zh: w.zh }; ['ph', 'pos', 'ex', 'exZh'].forEach(k => { if (w[k]) o[k] = w[k]; }); return o; });
  if (!draft.title.trim()) { toast('請先填書名'); $('#t-title').focus(); return null; }
  if (!words.length) { toast('至少需要一個有中文的單字'); return null; }
  if (words.length < parsed.length) toast(`${parsed.length - words.length} 個字沒有中文，已略過`);
  if (!draft.id) { draft.id = 'c_' + Date.now().toString(36); saveDraft(); }
  return { id: draft.id, title: draft.title.trim(), desc: draft.desc.trim(), words };
}

async function teacherAct(act) {
  if (act === 't-newbook') { if (!confirm('清空目前的草稿，開始新的一本？')) return; draft = { id: '', title: '', desc: '', raw: '' }; saveDraft(); return teacher(); }
  if (act === 't-ph') {
    parsed = parseRaw(draft.raw);
    const todo = parsed.filter(w => !w.ph && /^[a-z]+$/i.test(w.w));
    if (!todo.length) return toast('音標都有了');
    let n = 0;
    for (const w of todo) {
      tStatus(`查音標中… ${++n}/${todo.length}`);
      try {
        const r = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w.w.toLowerCase()));
        if (r.ok) {
          const j = await r.json(), e = j[0];
          const ph = e.phonetic || (e.phonetics || []).map(x => x.text).find(Boolean);
          if (ph) w.ph = ph.startsWith('/') ? ph : '/' + ph + '/';
          if (!w.pos && e.meanings && e.meanings[0]) w.pos = ({ noun: 'n.', verb: 'v.', adjective: 'adj.', adverb: 'adv.', preposition: 'prep.', conjunction: 'conj.', pronoun: 'pron.' })[e.meanings[0].partOfSpeech] || '';
        }
      } catch {}
    }
    draft.raw = toRaw(parsed); saveDraft(); teacher(); tStatus(`完成：${todo.filter(w => w.ph).length}/${todo.length} 個字找到音標（IPA）`); return;
  }
  if (act === 't-ai') {
    const key = ($('#t-key').value || '').trim(), model = ($('#t-model').value || 'gemini-2.5-flash').trim();
    if (!key) { toast('請先填 Gemini API Key'); $('#t-key').closest('details').open = true; $('#t-key').focus(); return; }
    LS.set('vr:t:gkey', key); LS.set('vr:t:gmodel', model);
    parsed = parseRaw(draft.raw);
    const todo = parsed.filter(w => !w.zh || !w.ex);
    for (let i = 0; i < todo.length; i += 30) {
      const batch = todo.slice(i, i + 30);
      tStatus(`AI 產生中… ${i}/${todo.length}`);
      const prompt = `你是台灣的英文老師。請為下列英文單字補齊資料，給台灣國高中生使用。
規則：
- pos：詞性縮寫（n. / v. / adj. / adv. / prep. / conj. / phr.）
- zh：繁體中文（台灣用語）常用意思，最多兩個，用「；」分隔
- ex：一句自然、簡短（15 字以內）、符合學生程度的英文例句，必須包含該單字（可變化時態/詞形）
- exZh：例句的繁體中文翻譯
- 若輸入已經有某欄位，保留原內容不要改
只輸出 JSON 陣列，每個元素格式：{"w":"","pos":"","zh":"","ex":"","exZh":""}，順序與輸入相同。
輸入：${JSON.stringify(batch.map(({ w, pos, zh, ex, exZh }) => ({ w, pos, zh, ex, exZh })))}`;
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.4 } })
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error?.message || r.status);
        const arr = JSON.parse(j.candidates[0].content.parts.map(p => p.text).join(''));
        for (const a of arr) {
          const w = batch.find(x => x.w.toLowerCase() === String(a.w || '').toLowerCase()); if (!w) continue;
          ['pos', 'zh', 'ex', 'exZh'].forEach(k => { if (!w[k] && a[k]) w[k] = String(a[k]).trim(); });
        }
      } catch (e) { tStatus('AI 發生錯誤：' + e.message); draft.raw = toRaw(parsed); saveDraft(); return; }
    }
    draft.raw = toRaw(parsed); saveDraft(); teacher(); tStatus('AI 補齊完成，請檢查預覽內容'); return;
  }
  const book = teacherBook(); if (!book) return;
  if (act === 't-use') {
    const books = customBooks().filter(b => b.id !== book.id); books.push(book); LS.set('vr:books', books);
    settings.bookId = book.id; saveSettings(); toast('已切換到這本書'); return go('home');
  }
  if (act === 't-json') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(book, null, 2)], { type: 'application/json' }));
    a.download = book.title.replace(/[\\/:*?"<>|]/g, '_') + '.json'; a.click(); return;
  }
  if (act === 't-share') {
    const url = location.origin + location.pathname + '#b=' + await pack(JSON.stringify(book));
    $('#t-out').innerHTML = `<p class="small muted" style="margin:14px 0 6px">學生連結（${book.words.length} 字）：</p>
      <div class="linkbox">${esc(url)}</div>
      <div class="row wrap" style="margin-top:10px"><button class="btn sm primary" data-act="t-copy">複製連結</button><a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener">開啟測試</a></div>
      <div class="qr" id="t-qr"></div>`;
    $('#t-out').dataset.url = url;
    if (location.protocol === 'file:') $('#t-out').insertAdjacentHTML('beforeend', '<p class="small" style="color:var(--warn)">⚠ 目前是本機檔案，連結要等網站上線後產生才能給學生用。</p>');
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js');
      const qr = qrcode(0, 'L'); qr.addData(url); qr.make();
      $('#t-qr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true }) + '<p class="small muted">投影這個 QR Code，學生用手機掃描即可</p>';
    } catch { $('#t-qr').innerHTML = '<p class="small muted">單字太多，QR Code 放不下，請改用連結（可貼到 Google Classroom / LINE 群組）。</p>'; }
  }
  if (act === 't-copy') {
    const url = $('#t-out').dataset.url;
    try { await navigator.clipboard.writeText(url); toast('連結已複製'); } catch { prompt('複製這個連結：', url); }
  }
}
function loadScript(src) {
  if (window.qrcode) return Promise.resolve();
  return new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
}

/* ========== 事件 ========== */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act;
  if (act === 'start' || act === 'extra') {
    session = buildSession(act === 'extra' ? 5 : 0);
    if (!session.total) { session = null; return toast('這本書的單字都學完了！可以換一本書'); }
    return go('study');
  }
  if (act === 'home') return go('home');
  if (session && location.hash === '#study') { e.preventDefault(); return studyAct(act); }
  if (act === 'quiz') return startQuiz(el.dataset.mode, $('#onlystar')?.checked);
  if (['qsay', 'qquit', 'pick', 'check', 'qnext'].includes(act)) return quizAct(act, el);
  if (act === 'sayw') { e.stopPropagation(); return speak(el.dataset.w); }
  if (act === 'filter') { listFilter = el.dataset.f; return list(); }
  if (act === 'expand') { const m = el.nextElementSibling; m.hidden = !m.hidden; return; }
  if (act === 'lstar') {
    e.stopPropagation();
    const b = curBook(), st = stars(b.id), w = el.dataset.w;
    st.has(w) ? st.delete(w) : st.add(w); saveStars(b.id, st);
    el.classList.toggle('on', st.has(w)); el.textContent = st.has(w) ? '★' : '☆'; return;
  }
  if (act === 'unkill') { const b = curBook(), p = prog(b.id); p[el.dataset.w] = { s: 1, due: today(), l: 0, d0: today(), u: Date.now() }; saveProg(b.id, p); toast('已放回學習中，今天會複習'); return list(); }
  if (act === 'pickbook') { settings.bookId = el.dataset.id; saveSettings(); toast('已切換單字書'); return me(); }
  if (act === 'delbook') {
    if (!confirm('移除這本單字書和它的學習進度？')) return;
    const id = el.dataset.id; LS.set('vr:books', customBooks().filter(b => b.id !== id)); LS.del('vr:p:' + id); LS.del('vr:star:' + id); LS.del('vr:bs:' + id); cloudDelete(id);
    if (settings.bookId === id) { settings.bookId = DEFAULT_SETTINGS.bookId; saveSettings(); }
    return me();
  }
  if (act === 'backup') return backup();
  if (act === 'restore') return restore();
  if (act === 'reset') { const id = curBook().id; if (confirm(`確定要清除「${curBook().title}」的所有學習進度嗎？`)) { LS.del('vr:p:' + id); LS.del('vr:star:' + id); LS.del('vr:bs:' + id); cloudDelete(id); toast('已重設'); } return; }
  if (act.startsWith('t-')) return teacherAct(act);
});

document.addEventListener('keydown', e => {
  if (e.target.matches('input, textarea, select')) return;
  if (session && location.hash === '#study' && session.cur) {
    const ph = session.phase;
    const map = ph === 'q' ? { '1': 'know', '2': 'fuzzy', '3': 'dunno', ' ': 'say' }
      : ph === 'hint' ? { '1': 'gotit', '3': 'dunno', ' ': 'say' }
      : { ' ': 'next', 'Enter': 'next', ...(ph === 'a-know' ? { '3': 'wrong' } : {}) };
    if (map[e.key]) { e.preventDefault(); studyAct(map[e.key]); }
  } else if (quiz && !quiz.done && location.hash === '#quiz' && /^[1-4]$/.test(e.key) && quiz.mode !== 'spell') {
    const b = document.querySelectorAll('.opt')[+e.key - 1]; if (b) quizAct('pick', b);
  }
});

if (window.speechSynthesis) speechSynthesis.getVoices();
route();
cloudInit();
