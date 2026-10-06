#!/usr/bin/env python3
"""
合併單字補充資料 → vocab/info/<字首>.js（每日單字 App 點開單字時才載入）

來源：
  tools/vocab-src/wordinfo-auto.json   英式／美式音標、派生詞（gen_wordinfo_auto.py 產生）
  tools/vocab-src/wordinfo/*.txt       人工撰寫：每行「單字 || 詞根拆解 || 同義詞」
      詞根拆解：沒有可拆的寫 -
      同義詞：以「;」分隔；字庫裡有的字只寫英文（中文自動帶入），其他寫成 英文=中文；沒有寫 -
      例：accommodate || ac-（=ad 往）+ com-（加強）+ mod（尺寸、方式）+ -ate（動詞）→ 調整成合適的大小 → 容納、使適應 || hold; house=提供住處; adapt

用法：python3 tools/build_wordinfo.py      （會檢查格式並印出覆蓋率）
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
OUT = os.path.join(REPO, 'vocab', 'info')
PLACEHOLDER = re.compile(r'TODO|待補|請見|同上')

def bank():
    d = {}
    for f in sorted(glob.glob(os.path.join(REPO, 'vocab', 'data', '*.js'))) + [os.path.join(REPO, 'vocab', 'books.js')]:
        s = open(f, encoding='utf-8').read()
        for m in re.finditer(r'\{"w":"((?:[^"\\]|\\.)*)","pos":"((?:[^"\\]|\\.)*)","zh":"((?:[^"\\]|\\.)*)"', s):
            w, pos, zh = (json.loads('"%s"' % x) for x in m.groups())
            d.setdefault(w.lower(), (w, pos, zh))
        for m in re.finditer(r"\bw:\s*'([^']+)'[^}]*?pos:\s*'([^']*)'[^}]*?zh:\s*'([^']*)'", s):
            d.setdefault(m.group(1).lower(), m.groups())
    return d

def main():
    B = bank()
    auto = json.load(open(os.path.join(ROOT, 'vocab-src', 'wordinfo-auto.json'), encoding='utf-8'))
    info = {k.lower(): dict(v) for k, v in auto.items()}
    errs, n_rt, n_syn, seen = [], 0, 0, {}
    for f in sorted(glob.glob(os.path.join(ROOT, 'vocab-src', 'wordinfo', '*.txt'))):
        for i, line in enumerate(open(f, encoding='utf-8'), 1):
            line = line.strip()
            if not line or line.startswith('#'): continue
            where = f'{os.path.basename(f)}:{i}'
            c = [x.strip() for x in line.split(' || ')]
            if len(c) != 3: errs.append(f'{where} 欄位數 {len(c)}（要 3 欄）'); continue
            w, rt, syn = c
            k = w.lower()
            if k not in B: errs.append(f'{where} {w}：字庫沒有這個字'); continue
            if k in seen: errs.append(f'{where} {w}：重複（{seen[k]}）'); continue
            seen[k] = where
            if PLACEHOLDER.search(rt + syn): errs.append(f'{where} {w}：有未完成的註記'); continue
            e = info.setdefault(k, {})
            if rt != '-':
                if len(rt) < 4: errs.append(f'{where} {w}：詞根太短'); continue
                e['rt'] = rt; n_rt += 1
            if syn != '-':
                out = []
                for s in [x.strip() for x in syn.split(';') if x.strip()]:
                    if '=' in s: en, zh = [x.strip() for x in s.split('=', 1)]
                    else:
                        en = s
                        if en.lower() not in B: errs.append(f'{where} {w}：同義詞 {en} 不在字庫，請寫成 {en}=中文'); continue
                        zh = B[en.lower()][2]
                    if en.lower() == k: errs.append(f'{where} {w}：同義詞不可是自己'); continue
                    out.append([en, zh])
                if out: e['syn'] = out[:5]; n_syn += 1
    os.makedirs(OUT, exist_ok=True)
    shards = {}
    for k, v in info.items():
        if not v: continue
        c = k[0] if 'a' <= k[0] <= 'z' else '_'
        shards.setdefault(c, {})[k] = v
    for old in glob.glob(os.path.join(OUT, '*.js')): os.remove(old)
    for c, d in sorted(shards.items()):
        js = '/* 自動產生：python3 tools/build_wordinfo.py — 音標、派生詞來自 ECDICT／ipa-dict／WordNet；詞根與同義詞為本站編寫 */\n'
        js += 'VOCAB_INFO_ADD(%s,%s);\n' % (json.dumps(c), json.dumps(d, ensure_ascii=False, separators=(',', ':'), sort_keys=True))
        open(os.path.join(OUT, c + '.js'), 'w', encoding='utf-8').write(js)
    tot = len(B)
    print(f'字庫 {tot} 字｜音標 {sum(1 for k in B if info.get(k,{}).get("uk"))}｜派生 {sum(1 for k in B if info.get(k,{}).get("der"))}｜詞根 {n_rt}｜同義 {n_syn}｜已寫 {len(seen)}｜錯誤 {len(errs)}')
    for e in errs[:40]: print('  ✗', e)
    missing = [B[k][0] for k in B if k not in seen]
    if '--todo' in sys.argv: print('未寫：', ' '.join(missing[:int(sys.argv[sys.argv.index('--todo')+1])]))
    sys.exit(1 if errs else 0)

if __name__ == '__main__':
    main()
