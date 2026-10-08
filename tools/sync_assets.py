#!/usr/bin/env python3
"""
讓「離線教材清單」（offline-content.js 的 CORE）與 service worker 的 SHELL 永遠跟頁面實際載入的檔案版本一致。

改了任何 ?v= 版本號之後執行：python3 tools/sync_assets.py
（--check 只檢查不改檔，有不一致時回傳 1，可放進測試）

規則：
  - index.html、vocab/index.html 裡的 <script src> 與 stylesheet <link href>（同網域）全部列入
  - curriculum/*.json 的版本取自 curriculum-loader.js
  - 單字書資料版本取自 vocab/book-loader.js，並檢查 vocab-quest.js 的 VQ_DATA_V 一致
  - 單字補充資料（vocab/info/*.js）版本取自 vocab/app.js 的 INFO_V
"""
import glob, os, re, sys
from urllib.parse import urljoin

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://x.test/root/'
rd = lambda p: open(os.path.join(REPO, p), encoding='utf-8').read()

def page_assets(page):
    out = []
    for m in re.finditer(r'<(?:script[^>]*src|link[^>]*rel="stylesheet"[^>]*href)="([^"]+)"', rd(page)):
        u = urljoin(urljoin(BASE, page), m.group(1))
        if u.startswith(BASE): out.append(u[len(BASE):])
    return out

def main():
    check = '--check' in sys.argv
    errs = []
    cur_v = re.search(r"curriculum/'\+id\+'\.json\?v=(\d+)", rd('curriculum-loader.js')).group(1)
    data_v = re.search(r"data/'\+id\+'\.js\?v=(\d+)", rd('vocab/book-loader.js')).group(1)
    vq_v = re.search(r'const VQ_DATA_V = (\d+);', rd('vocab-quest.js')).group(1)
    if vq_v != data_v: errs.append(f'vocab-quest.js VQ_DATA_V={vq_v} 與 book-loader.js 的 v={data_v} 不一致')
    info_v = re.search(r'const INFO_V = (\d+);', rd('vocab/app.js')).group(1)
    shards = sorted(os.path.basename(f)[:-3] for f in glob.glob(os.path.join(REPO, 'vocab', 'info', '*.js')))

    idx, voc = page_assets('index.html'), page_assets('vocab/index.html')
    core = ['index.html'] + idx + [f'curriculum/{l}.json?v={cur_v}' for l in ('basic', 'intermediate', 'advanced')] + ['vocab/'] + voc
    core = list(dict.fromkeys(core)) + ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2']
    shell = ['./', './index.html'] + ['./' + a for a in idx] + ['./manifest.webmanifest', './vocab/'] + ['./' + a for a in voc] + \
            ['./icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-180.png']
    shell = list(dict.fromkeys(shell))

    # offline-content.js
    oc = rd('offline-content.js')
    new_core = "const CORE=[" + ','.join("'%s'" % c for c in core) + "];"
    oc2 = re.sub(r"const CORE=\[[^\]]*\];", lambda m: new_core, oc, count=1)
    oc2 = re.sub(r"'vocab/data/'\+options\.bookId\+'\.js\?v=\d+'", f"'vocab/data/'+options.bookId+'.js?v={data_v}'", oc2)
    new_info = "const INFO=[" + ','.join("'vocab/info/%s.js?v=%s'" % (s, info_v) for s in shards) + "];"
    if 'const INFO=[' in oc2: oc2 = re.sub(r"const INFO=\[[^\]]*\];", lambda m: new_info, oc2, count=1)
    else: errs.append('offline-content.js 沒有 INFO 清單')
    # sw.js
    sw = rd('sw.js')
    new_shell = 'const SHELL = [\n' + ',\n'.join('  "%s"' % s for s in shell) + '\n];'
    sw2 = re.sub(r'const SHELL = \[[^\]]*\];', lambda m: new_shell, sw, count=1)

    changed = []
    for path, old, new in (('offline-content.js', oc, oc2), ('sw.js', sw, sw2)):
        if old != new:
            changed.append(path)
            if not check: open(os.path.join(REPO, path), 'w', encoding='utf-8').write(new)
    for e in errs: print('✗', e)
    if check:
        if changed: print('✗ 版本清單過期：', ', '.join(changed), '— 請執行 python3 tools/sync_assets.py')
        sys.exit(1 if changed or errs else 0)
    print('已更新：', ', '.join(changed) if changed else '（無變更）')
    if changed and 'sw.js' in changed: print('提醒：記得把 sw.js 的 CACHE 名稱加一版')
    sys.exit(1 if errs else 0)

if __name__ == '__main__':
    main()
