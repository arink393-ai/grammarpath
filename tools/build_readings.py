#!/usr/bin/env python3
"""
閱讀文章（READINGS）的來源檔與建置。

★ 新增／修改閱讀文章：編輯 readings/<YYYY-MM>.json（依 day 或 date 的月份放），
  每篇格式跟以前 index.html 的 READINGS 一模一樣（id / cat / topic / zh / src / date / day / week / tag / icon /
  levels.{a,b,c}{title,cefr,text[],gloss[],q[]} / discuss[] / proper[]…），然後執行：
      python3 tools/build_readings.py
  它會檢查資料，並把「不含內文的目錄」（每篇約 150 字元）寫回 index.html 的 READINGS（/*READINGS_START*/…/*READINGS_END*/），
  內文（levels / discuss / proper）留在 readings/*.json，學生打開文章時才下載（index.html 不再每天變大）。
  接著照常：python3 tools/sync_assets.py、改 sw.js 的 CACHE、node tools/gen_audio.mjs（要生音檔時）。

用法：
  python3 tools/build_readings.py            建置（寫 index.html）
  python3 tools/build_readings.py --check    只檢查（測試用；index.html 與 readings/*.json 不一致就回傳 1）
  python3 tools/build_readings.py --extract  一次性：把 index.html 裡完整的 READINGS 拆成 readings/*.json
"""
import glob, hashlib, json, os, re, subprocess, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(REPO, 'readings')
HTML = os.path.join(REPO, 'index.html')
BODY_KEYS = ('levels', 'discuss', 'proper')          # 只在打開文章時才需要的內容
MARK = re.compile(r'/\*READINGS_START\*/[\s\S]*?/\*READINGS_END\*/')
month = lambda r: str(r.get('day') or r.get('date') or '')[:7]

def extract():
    js = r'''
const fs=require("fs"); const s=fs.readFileSync(process.argv[1],"utf8");
const a=s.indexOf("const READINGS = ["); if(a<0){console.error("no READINGS literal");process.exit(1);}
let i=s.indexOf("[",a),d=0,str=null,esc=false;
for(;i<s.length;i++){const c=s[i]; if(str){ if(esc)esc=false; else if(c=="\\")esc=true; else if(c==str)str=null; continue;}
  if(c=='"'||c=="'"||c=="`"){str=c;continue;} if(c=="[")d++; else if(c=="]"){d--; if(d==0)break;}}
const lit=s.slice(s.indexOf("[",a),i+1);
const data=eval(lit);
// 用 node 直接換掉（JS 與 Python 的字串位置算法不同，emoji 會錯位，所以不能把位置交給 Python）
let end=i+1; if(s[end]===";") end++;
fs.writeFileSync(process.argv[1], s.slice(0,a)+"/*READINGS_START*//*READINGS_END*/"+s.slice(end));
process.stdout.write(JSON.stringify({data}));'''
    out = json.loads(subprocess.run(['node', '-e', js, HTML], capture_output=True, text=True, check=True).stdout)
    os.makedirs(DIR, exist_ok=True)
    by = {}
    for r in out['data']:
        m = month(r); assert re.fullmatch(r'\d{4}-\d{2}', m), ('no day/date', r.get('id'))
        by.setdefault(m, []).append(r)
    for m, rs in by.items():
        write_month(m, rs)
    print(f'拆出 {len(out["data"])} 篇到 readings/：', ', '.join(f'{m}({len(v)})' for m, v in sorted(by.items())))

def write_month(m, rs):
    rs = sorted(rs, key=lambda r: (str(r.get('day') or r.get('date') or ''), r['id']))
    with open(os.path.join(DIR, m + '.json'), 'w', encoding='utf-8') as f:
        f.write('[\n' + ',\n'.join(json.dumps(r, ensure_ascii=False) for r in rs) + '\n]\n')

def load():
    errs, all_rs, files = [], [], {}
    for p in sorted(glob.glob(os.path.join(DIR, '*.json'))):
        m = os.path.basename(p)[:-5]
        raw = open(p, 'rb').read()
        try: rs = json.loads(raw)
        except Exception as e: errs.append(f'{m}.json 不是合法 JSON：{e}'); continue
        if not isinstance(rs, list): errs.append(f'{m}.json 要是陣列'); continue
        files[m] = f'readings/{m}.json?v={hashlib.sha1(raw).hexdigest()[:8]}'
        for r in rs:
            rid = r.get('id', '?')
            if month(r) != m: errs.append(f'{rid}：day/date 是 {month(r) or "（空）"}，卻放在 {m}.json')
            for k in ('id', 'topic', 'zh', 'levels'):
                if not r.get(k): errs.append(f'{rid}：缺少 {k}')
            for lv in ('a', 'b', 'c'):
                L = (r.get('levels') or {}).get(lv)
                if not L: errs.append(f'{rid}：缺少 levels.{lv}'); continue
                if not L.get('text'): errs.append(f'{rid}/{lv}：缺少 text')
                for qi, q in enumerate(L.get('q') or []):
                    if not (isinstance(q.get('a'), int) and 0 <= q['a'] < len(q.get('opts') or [])):
                        errs.append(f'{rid}/{lv} 第 {qi+1} 題答案索引不對')
            all_rs.append(r)
    ids = [r.get('id') for r in all_rs]
    for d in sorted({i for i in ids if ids.count(i) > 1}): errs.append(f'重複的 id：{d}')
    return all_rs, files, errs

def block(all_rs, files):
    meta = [{k: v for k, v in r.items() if k not in BODY_KEYS} for r in
            sorted(all_rs, key=lambda r: (str(r.get('day') or r.get('date') or ''), r['id']), reverse=True)]
    lines = ',\n'.join(json.dumps(x, ensure_ascii=False) for x in meta)
    return ('/*READINGS_START*/\n/* ⚠️ 自動產生：請改 readings/<YYYY-MM>.json，再執行 python3 tools/build_readings.py（內文在 json，打開文章才下載） */\n'
            f'const READINGS = [\n{lines}\n];\nconst READINGS_FILES = {json.dumps(files, ensure_ascii=False)};\n/*READINGS_END*/')

def main():
    if '--extract' in sys.argv: extract()
    all_rs, files, errs = load()
    for e in errs: print('✗', e)
    if errs: sys.exit(1)
    s = open(HTML, encoding='utf-8').read()
    if not MARK.search(s): print('✗ index.html 找不到 /*READINGS_START*/ 標記'); sys.exit(1)
    new = MARK.sub(lambda m: block(all_rs, files), s, count=1)
    if '--check' in sys.argv:
        if new != s: print('✗ index.html 的 READINGS 目錄過期，請執行 python3 tools/build_readings.py'); sys.exit(1)
        print(f'readings ok：{len(all_rs)} 篇，{len(files)} 個月份檔'); return
    if new != s: open(HTML, 'w', encoding='utf-8').write(new)
    print(f'已建置 READINGS：{len(all_rs)} 篇（{", ".join(sorted(files))}）')

if __name__ == '__main__':
    main()
