/* 課程詳解：中文詳解＋表格、滑過看解析的例題、「想想看，錯在哪？」改錯
   資料：curriculum/notes/<level>.json → { lessonId: { zh:[區塊], mc:[例題], err:[改錯], mkZh:[既有 mistakes 的中文說明] } }
   區塊：{h,p} 段落（p 可含 HTML）｜{t:"table",cap,head:[],rows:[[]],note}｜{t:"tip",p}
   改錯句：用 [錯|對] 標出錯處，例如 "The only thing that matters [are|is] money." */
(function(){
  const LN_V = 2;
  const cache = {}, jobs = {};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function load(level){
    if(cache[level]) return Promise.resolve(cache[level]);
    if(!jobs[level]) jobs[level] = fetch('curriculum/notes/'+level+'.json?v='+LN_V)
      .then(r => { if(!r.ok) throw new Error('notes'); return r.json(); })
      .then(d => (cache[level] = d))
      .catch(e => { delete jobs[level]; throw e; });
    return jobs[level];
  }

  /* 由 ✗/✓ 兩句自動找出錯處，轉成 [錯|對] 格式 */
  function diffMark(no, yes){
    const tok = t => String(t).replace(/<[^>]+>/g, '').match(/\s+|[\w'’-]+|[^\s\w'’-]/g) || [];
    const a = tok(no), b = tok(yes);
    if(a.join('') === b.join('')) return null;
    let i = 0; while(i < a.length && i < b.length && a[i] === b[i]) i++;
    let j = 0; while(j < a.length-i && j < b.length-i && a[a.length-1-j] === b[b.length-1-j]) j++;
    let s = i, e = a.length-j, wb = b.slice(i, b.length-j).join('');
    while(s < e && /^\s+$/.test(a[s])) s++;          // 錯處不含前後空白
    while(e > s && /^\s+$/.test(a[e-1])) e--;
    if(s === e){ // 少了字：把相鄰的字當錯處
      let k = s-1; while(k >= 0 && !/\w/.test(a[k])) k--;
      if(k >= 0){ wb = a.slice(k, s).join('') + wb; s = k; }
      else { k = e; while(k < a.length && !/\w/.test(a[k])) k++; if(k >= a.length) return null; wb = wb + a.slice(e, k+1).join(''); e = k+1; }
    }
    while(e > s && /^\s+$/.test(a[e-1])) e--;
    const wa = a.slice(s, e).join('');
    return a.slice(0, s).join('') + '[' + wa + '|' + wb.trim() + ']' + a.slice(e).join('');
  }
  function errSentenceHTML(s){
    // 拆成字；[錯|對] 成為可滑過的錯處
    const out = []; const re = /\[([^\]|]*)\|([^\]]*)\]/g; let last = 0, m;
    const words = t => t.split(/(\s+)/).map(w => /^\s+$/.test(w) || !w ? w : `<span class="lnw">${esc(w)}</span>`).join('');
    while((m = re.exec(s))){ out.push(words(s.slice(last, m.index)));
      out.push(`<span class="lnw lnbad" tabindex="0" role="button" aria-label="可能的錯處">${esc(m[1]||'⋯')}</span>${m[2] ? `<ins class="lnfix">${esc(m[2])}</ins>` : ''}`);
      last = re.lastIndex; }
    out.push(words(s.slice(last)));
    return out.join('');
  }
  function errItem(e, n){
    return `<li class="lnerr" data-n="${n}">
      ${e.zh ? `<div class="lnerr-zh">${esc(e.zh)}</div>` : ''}
      <div class="lnerr-s">${errSentenceHTML(e.s)}</div>
      <div class="lnerr-why">💡 ${e.why}</div></li>`;
  }

  function blockHTML(b){
    if(b.t === 'table') return `<div class="lntable-wrap"><table class="lntable">
      ${b.cap ? `<caption>${b.cap}</caption>` : ''}
      ${b.head ? `<thead><tr>${b.head.map(h => `<th>${h}</th>`).join('')}</tr></thead>` : ''}
      <tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
      ${b.note ? `<div class="lntable-note">${b.note}</div>` : ''}</div>`;
    if(b.t === 'tip') return `<div class="lntip">📌 ${b.p}</div>`;
    return `${b.h ? `<h3 class="lnh">${b.h}</h3>` : ''}${b.p ? `<div class="lnp">${b.p}</div>` : ''}`;
  }
  function mcHTML(q, n){
    const parts = esc(q.q).split('___');
    return `<div class="lnmc" data-a="${q.a}">
      <div class="lnmc-q"><span class="lnmc-n">${n+1}.</span> ${parts[0]}<span class="lnmc-blank">＿＿＿</span>${parts.slice(1).join('___')}</div>
      <div class="lnmc-opts">${q.opts.map((o,i) => `<button type="button" class="lnmc-o" data-i="${i}">(${'ABCD'[i]}) ${esc(o)}</button>`).join('')}</div>
      <div class="lnmc-why">${q.zh ? `<div class="lnmc-zh">${esc(q.zh)}</div>` : ''}💡 ${q.why}</div></div>`;
  }

  function render(box, l, d){
    const mistakes = (l.mistakes || []).map((m, i) => {
      const s = / \/ /.test(m.yes) ? null : diffMark(m.no, m.yes);
      const bad = s && s.match(/\[([^\]|]*)\|/)[1];
      if(!s || bad.split(/\s+/).length > 4) return null; // 差太多就不自動標
      return { s, why: (d.mkZh && d.mkZh[i]) || m.why };
    }).filter(Boolean);
    const errs = [...(d.err || []), ...mistakes];
    const zhBox = document.getElementById('ln-zh');
    if(zhBox) zhBox.innerHTML = (d.zh||[]).length ? `<h2 class="section">文法詳解 <span class="ln-sub">中文說明＋表格整理</span></h2><div class="lnzh">${d.zh.map(blockHTML).join('')}</div>` : '';
    box.innerHTML = `
      ${(d.mc||[]).length ? `<h2 class="section">例題 <span class="ln-sub">滑鼠移到正確答案上（手機點選），就會看到解析</span></h2><div class="lnmcs">${d.mc.map(mcHTML).join('')}</div>` : ''}
      ${errs.length ? `<h2 class="section">想想看，錯在哪？ <span class="ln-sub">滑鼠移到錯的字上（手機點選），就會改正並說明</span></h2><ol class="lnerrs">${errs.map(errItem).join('')}</ol>` : ''}`;
    bind(box);
  }

  function reveal(li){
    if(li.classList.contains('done')) return;
    li.classList.add('done');
    setTimeout(() => li.classList.add('fixed'), 450);
    setTimeout(() => li.classList.add('why'), 1100);
  }
  function answer(mc, btn){
    const ok = +btn.dataset.i === +mc.dataset.a;
    if(!ok){ btn.classList.add('no'); return; }
    if(mc.classList.contains('done')) return;
    mc.classList.add('done'); btn.classList.add('ok');
    const t = btn.textContent.replace(/^\([A-D]\)\s*/, '');
    mc.querySelector('.lnmc-blank').textContent = /^（?不填）?$/.test(t) ? '∅（不填）' : t;
  }
  function bind(box){
    box.addEventListener('mouseover', e => {
      const bad = e.target.closest('.lnbad'); if(bad) return reveal(bad.closest('.lnerr'));
      const o = e.target.closest('.lnmc-o'); const mc = o && o.closest('.lnmc');
      if(o && +o.dataset.i === +mc.dataset.a) answer(mc, o);
    });
    box.addEventListener('click', e => {
      const w = e.target.closest('.lnw');
      if(w){ const li = w.closest('.lnerr');
        if(w.classList.contains('lnbad')) return reveal(li);
        if(!li.classList.contains('done')){ w.classList.remove('nope'); void w.offsetWidth; w.classList.add('nope'); }
        return; }
      const o = e.target.closest('.lnmc-o'); if(o) answer(o.closest('.lnmc'), o);
    });
    box.addEventListener('keydown', e => {
      const bad = e.target.closest('.lnbad');
      if(bad && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); reveal(bad.closest('.lnerr')); }
    });
  }

  /* 給 renderLesson 用：先放占位，再非同步填入 */
  function fill(l, level){
    const box = document.getElementById('ln-box'); if(!box) return;
    load(level).then(all => {
      if(document.getElementById('ln-box') !== box) return; // 已換頁
      render(box, l, all[l.id] || {});
    }).catch(() => render(box, l, {}));
  }
  window.LessonNotes = { fill, load, diffMark, LN_V };
})();
