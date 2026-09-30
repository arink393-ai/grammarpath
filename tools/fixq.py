#!/usr/bin/env python3
"""小工具：python3 tools/fixq.py <book> '<word>' '<題目 || 選項 || 解析 || 中譯>' ['col=新搭配詞']
直接改寫某個字的文法題（第 7–10 欄）或搭配詞（第 6 欄）。"""
import sys, glob, os
book, word = sys.argv[1], sys.argv[2]
newq = sys.argv[3] if len(sys.argv) > 3 and not sys.argv[3].startswith('col=') else None
newcol = next((a[4:] for a in sys.argv[3:] if a.startswith('col=')), None)
hit = 0
for p in glob.glob(os.path.join(os.path.dirname(__file__), 'vocab-src', book, '*.txt')):
    out = []
    for l in open(p, encoding='utf-8').read().split('\n'):
        parts = l.split(' || ')
        if len(parts) == 10 and parts[0] == word:
            if newq: parts = parts[:6] + newq.split(' || ')
            if newcol: parts[5] = newcol
            hit += 1
        out.append(' || '.join(parts))
    open(p, 'w', encoding='utf-8').write('\n'.join(out))
print(word, '已更新' if hit else '找不到')
