#!/usr/bin/env python3
"""
把 tools/notes-src/<level>/<lessonId>.txt 編成 curriculum/notes/<level>.json（給 lesson-notes.js 用）。

用法：python3 tools/build_notes.py            （全部重建＋檢查）
      python3 tools/build_notes.py --check    （只檢查）

來源格式（一行一件事，空行忽略）：
  # zh                  ← 中文詳解區
  ## 小標題
  一般文字＝段落（可用 <b>…</b>、<span class="en">…</span>）
  - 項目               ← 連續的 - 行會變成清單
  表：表格標題          ← 可省略
  | 欄1 | 欄2 |         ← 第一列是表頭，下一列 |---| 分隔線
  | … | … |
  註：表格下方的小字
  > 重點提醒（黃色框）
  # mc                  ← 例題（滑過正確答案看解析）
  Q: She ___ a student. || 她是學生。
  A: am | is* | are     ← * 標正確答案
  W: 解說
  # err                 ← 想想看，錯在哪？
  S: The only thing that matters [are|is] money. || 唯一重要的是錢。
  W: 解說
  # mk                  ← 課程原有 Common mistakes 的中文說明（依序）
  - 第 1 條的中文說明
"""
import json, os, re, sys, html

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO, 'tools', 'notes-src')
OUT = os.path.join(REPO, 'curriculum', 'notes')
LEVELS = ('basic', 'intermediate', 'advanced')

def inline(t):
    # 允許少量 HTML（b/i/span.en/br/u/sub/sup），其他 < > 轉義
    keep = re.compile(r'</?(b|i|u|br|sup|sub)\s*/?>|<span class="en">|</span>')
    out, last = [], 0
    for m in keep.finditer(t):
        out.append(html.escape(t[last:m.start()], quote=False)); out.append(m.group(0)); last = m.end()
    out.append(html.escape(t[last:], quote=False))
    return ''.join(out)

def parse(path, lesson, errs):
    sec, zh, mc, err, mk = None, [], [], [], []
    para, lst, tbl, cap = [], [], None, None
    def flush(note=None):
        nonlocal para, lst, tbl, cap
        if lst: para.append('<ul>' + ''.join('<li>%s</li>' % x for x in lst) + '</ul>'); lst = []
        if para: zh.append({'p': ''.join(para)}); para = []
        if tbl is not None:
            if len(tbl) < 2: errs.append(f'{path}: 表格至少要表頭＋一列')
            for r in tbl[1:]:
                if len(r) != len(tbl[0]): errs.append(f'{path}: 表格欄數不一致：{r}')
            t = {'t': 'table', 'head': tbl[0], 'rows': tbl[1:]}
            if cap: t['cap'] = cap
            if note: t['note'] = note
            zh.append(t)
        tbl, cap = None, None
    lines = open(path, encoding='utf-8').read().split('\n')
    for n, raw in enumerate(lines, 1):
        ln = raw.rstrip()
        if not ln.strip():
            if sec == 'zh': flush()
            continue
        if ln.startswith('# '):
            if sec == 'zh': flush()
            sec = ln[2:].strip()
            if sec not in ('zh', 'mc', 'err', 'mk'): errs.append(f'{path}:{n} 未知區段 {sec}')
            continue
        if sec == 'zh':
            if ln.startswith('## '): flush(); zh.append({'h': inline(ln[3:].strip())})
            elif ln.startswith('|'):
                cells = [c.strip() for c in ln.strip().strip('|').split('|')]
                if all(re.fullmatch(r':?-{2,}:?', c) for c in cells): continue
                if tbl is None:
                    c = cap; flush(); cap = c; tbl = []
                tbl.append([inline(c) for c in cells])
            elif ln.startswith('表：'):
                flush(); cap = inline(ln[2:].strip())
            elif ln.startswith('註：'):
                if tbl is None: errs.append(f'{path}:{n} 註： 要接在表格後面')
                flush(inline(ln[2:].strip()))
            elif ln.startswith('> '): flush(); zh.append({'t': 'tip', 'p': inline(ln[2:].strip())})
            elif ln.startswith('- '):
                if tbl is not None: flush()
                lst.append(inline(ln[2:].strip()))
            else:
                if tbl is not None or lst: flush()
                para.append(('<br>' if para else '') + inline(ln.strip()))
        elif sec == 'mc':
            if ln.startswith('Q:'):
                q, _, z = ln[2:].strip().partition('||')
                q = q.strip()
                if q.count('___') != 1: errs.append(f'{path}:{n} 例題要有一個 ___')
                mc.append({'q': q, 'zh': z.strip()})
            elif ln.startswith('A:') and mc:
                opts = [o.strip() for o in ln[2:].split('|')]
                star = [i for i, o in enumerate(opts) if o.endswith('*')]
                if len(star) != 1: errs.append(f'{path}:{n} 選項要剛好一個 *')
                mc[-1]['opts'] = [o.rstrip('*').strip() for o in opts]
                mc[-1]['a'] = star[0] if star else 0
                if len(set(mc[-1]['opts'])) != len(opts) or not 2 <= len(opts) <= 4: errs.append(f'{path}:{n} 選項重複或數量不對')
            elif ln.startswith('W:') and mc: mc[-1]['why'] = inline(ln[2:].strip())
            else: errs.append(f'{path}:{n} mc 區無法辨識：{ln}')
        elif sec == 'err':
            if ln.startswith('S:'):
                s, _, z = ln[2:].strip().partition('||')
                s = s.strip()
                if not re.search(r'\[[^\]|]*\|[^\]]*\]', s): errs.append(f'{path}:{n} 改錯句要有 [錯|對]')
                if re.search(r'\[\s*\|', s): errs.append(f'{path}:{n} [錯|對] 的「錯」不能是空的（少字時把前一個字一起框進去）')
                err.append({'s': s, 'zh': z.strip()})
            elif ln.startswith('W:') and err: err[-1]['why'] = inline(ln[2:].strip())
            else: errs.append(f'{path}:{n} err 區無法辨識：{ln}')
        elif sec == 'mk':
            if ln.startswith('- '): mk.append(inline(ln[2:].strip()))
            else: errs.append(f'{path}:{n} mk 區每行用 - 開頭')
        else: errs.append(f'{path}:{n} 內容不在任何區段')
    if sec == 'zh': flush()
    for q in mc:
        if 'opts' not in q or 'why' not in q: errs.append(f'{path}: 例題缺 A: 或 W:（{q["q"]}）')
    for e in err:
        if 'why' not in e: errs.append(f'{path}: 改錯句缺 W:（{e["s"]}）')
    nm = len(lesson.get('mistakes', []))
    if len(mk) > nm: errs.append(f'{path}: mk 有 {len(mk)} 條，但課程只有 {nm} 條 mistakes')
    out = {}
    if zh: out['zh'] = zh
    if mc: out['mc'] = mc
    if err: out['err'] = err
    if mk: out['mkZh'] = mk
    return out

def main():
    check = '--check' in sys.argv
    errs, total = [], 0
    os.makedirs(OUT, exist_ok=True)
    for lv in LEVELS:
        lessons = {l['id']: l for l in json.load(open(os.path.join(REPO, 'curriculum', lv + '.json'), encoding='utf-8'))}
        d = os.path.join(SRC, lv); res = {}
        for f in sorted(os.listdir(d)) if os.path.isdir(d) else []:
            if not f.endswith('.txt'): continue
            lid = f[:-4]
            if lid not in lessons: errs.append(f'{lv}/{f}: 找不到課程 {lid}'); continue
            res[lid] = parse(os.path.join(d, f), lessons[lid], errs)
        total += len(res)
        js = json.dumps(res, ensure_ascii=False, separators=(',', ':'))
        p = os.path.join(OUT, lv + '.json')
        old = open(p, encoding='utf-8').read() if os.path.exists(p) else None
        if old != js:
            if check: errs.append(f'curriculum/notes/{lv}.json 過期，請執行 python3 tools/build_notes.py')
            else: open(p, 'w', encoding='utf-8').write(js)
        print(f'{lv}: {len(res)} / {len(lessons)} 課有詳解')
    for e in errs: print('✗', e)
    sys.exit(1 if errs else 0)

if __name__ == '__main__':
    main()
