#!/usr/bin/env python3
"""每日單字大字庫：驗證 tools/vocab-src/<book>/*.txt 並產生 vocab/data/<book>.js

每行 10 欄（Tab 或「 || 」分隔）：
  單字  詞性  中文  例句  例句中譯  搭配詞(en=中; en=中)  文法題(含一個 ___)  選項(正解|誘答|誘答)  解析  文法題中譯
規則：文法題與例句都要出現該字（或其規則變化），而且文法題的答案「不能是該字本身」。
用法：python3 tools/build_vocab.py [book ...]   （不帶參數＝全部）
"""
import json, re, sys, os, glob, random
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'vocab-src')
LISTS = json.load(open(os.path.join(SRC, 'lists.json')))
BOOKS = {
 'jh7':  ('國中七年級單字（教育部基本字）', '教育部基本 1,200 字中較基礎的一半'),
 'jh8':  ('國中八年級單字（教育部基本字）', '教育部基本 1,200 字中較進階的一半'),
 'jh9':  ('國中九年級單字（教育部常用 2,000 字）', '教育部常用 2,000 字中，基本字以外的 800 字'),
 'gsat3':('學測 Level 3（大考中心）', '大考中心高中英文參考詞彙表 第三級'),
 'gsat4':('學測 Level 4（大考中心）', '大考中心高中英文參考詞彙表 第四級'),
}
IRREG = {  # 不規則變化：例句/題目可用這些形式
}
def head(x): return re.sub(r'\s*\(.*?\)', '', x).split('/')[0].strip()
def forms(w):
    w0 = w.lower(); out = {w0}
    base = w0.split()[0] if ' ' in w0 else w0
    root = re.sub(r'(e|y|le)$', '', base) if len(base) > 4 else base
    out.add(root)
    for f in IRREG.get(w0, []): out.add(f)
    return out
def has_form(text, w):
    t = text.lower()
    if ' ' in w or '-' in w:  # 片語：只要主要字出現
        w = max(re.split(r'[ -]', w), key=len)
    return any(re.search(r"\b" + re.escape(f), t) for f in forms(w))
def build(book):
    rows = []; errs = []
    want = {head(x).lower(): x for x in LISTS[book]}
    for f in sorted(glob.glob(os.path.join(SRC, book, '*.txt'))):
        for n, line in enumerate(open(f, encoding='utf-8'), 1):
            line = line.rstrip('\n')
            if not line.strip() or line.startswith('#'): continue
            c = re.split(r'\t| \|\| ', line)
            where = f'{os.path.basename(f)}:{n}'
            if len(c) != 10: errs.append(f'{where} 欄位數 {len(c)} ≠ 10：{line[:60]}'); continue
            w, pos, zh, ex, exzh, col, qs, opts, why, qzh = [x.strip() for x in c]
            o = [x.strip() for x in opts.split('|')]
            if len(o) != 3 or len(set(o)) != 3: errs.append(f'{where} {w}：選項要 3 個且不重複')
            if qs.count('___') != 1: errs.append(f'{where} {w}：文法題要剛好一個 ___')
            a = o[0].lower()
            wl = w.lower()
            if a == wl or (len(wl) >= 4 and wl[:4] in a) or re.fullmatch(re.escape(wl) + r'(s|es|ed|d|ing)?', a):
                errs.append(f'{where} {w}：答案 "{o[0]}" 是該字本身')
            if not has_form(ex, w): errs.append(f'{where} {w}：例句沒有出現該字')
            if not has_form(qs, w): errs.append(f'{where} {w}：文法題沒有出現該字')
            if not all([zh, ex, exzh, why, qzh]): errs.append(f'{where} {w}：有空白欄位')
            if re.search(r'請見|請看解析|替換|改為下方|改用下方|下方版本|下方題目|此題改寫|改寫|注意：本題|注意：此題', why): errs.append(f'{where} {w}：解析含未完成的註記')
            cols = []
            for x in [x.strip() for x in re.split(r';', col) if x.strip()]:   # 只用半形分號分隔，中文意思裡可以有「；」
                if '=' not in x: errs.append(f'{where} {w}：搭配詞「{x}」缺 =中文'); continue
                en, z = x.split('=', 1); cols.append([en.strip(), z.strip()])
            if wl not in want: errs.append(f'{where} {w}：不在 {book} 字表中')
            rows.append({'w': w, 'pos': pos, 'zh': zh, 'ex': ex, 'exZh': exzh, 'col': cols, 'q': [qs, o, o[0], why, qzh]})
    seen = {}
    for r in rows:
        k = r['w'].lower()
        if k in seen: errs.append(f'{book}：{r["w"]} 重複')
        seen[k] = r
    missing = [x for k, x in want.items() if k not in seen]
    # 固定亂數排序，讓每 5 個字一組的單元穩定、又不會照字母排
    order = sorted(seen.values(), key=lambda r: r['w'].lower())
    random.Random(book).shuffle(order)
    title, desc = BOOKS[book]
    js = ('/* 自動產生：python3 tools/build_vocab.py — 請改 tools/vocab-src/' + book + '/*.txt */\n'
          'BUILTIN_BOOKS.push(' + json.dumps({'id': book, 'title': title, 'desc': desc, 'words': order}, ensure_ascii=False, separators=(',', ':')) + ');\n')
    if order:
        open(os.path.join(ROOT, 'vocab', 'data', book + '.js'), 'w', encoding='utf-8').write(js)
    print(f'{book}: {len(order)} / {len(want)} 字，錯誤 {len(errs)}，未完成 {len(missing)}')
    for e in errs: print('  ✗', e)
    return errs, missing
if __name__ == '__main__':
    books = sys.argv[1:] or list(BOOKS)
    bad = 0
    for b in books:
        os.makedirs(os.path.join(SRC, b), exist_ok=True)
        e, m = build(b); bad += len(e)
    sys.exit(1 if bad else 0)
