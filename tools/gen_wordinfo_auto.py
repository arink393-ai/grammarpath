#!/usr/bin/env python3
"""
產生字庫單字的「自動資料」：英式／美式音標、派生詞 → tools/vocab-src/wordinfo-auto.json
（同義詞與詞根拆解是人工寫的，放在 tools/vocab-src/roots/*.txt，由 build_wordinfo.py 合併。）

需要的外部資料（都很大，不進 git；放在 WORDINFO_SRC 目錄，預設 ~/wordinfo-src）：
  ecdict.csv   https://github.com/skywind3000/ECDICT （MIT）— 英式音標、派生詞中文、詞頻
  en_US.txt    https://github.com/open-dict-data/ipa-dict （MIT，源自 CMUdict）— 美式音標
  WordNet      nltk.download('wordnet', download_dir=WORDINFO_SRC+'/nltk') — 派生詞候選
另需 pip：nltk、opencc-python-reimplemented（簡轉繁）。

用法：python gen_wordinfo_auto.py
"""
import csv, json, os, re, sys, glob

SRC = os.path.expanduser(os.environ.get('WORDINFO_SRC', '~/wordinfo-src'))
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
csv.field_size_limit(10**9)

import nltk
nltk.data.path.insert(0, os.path.join(SRC, 'nltk'))
from nltk.corpus import wordnet as wn
from opencc import OpenCC
s2t = OpenCC('s2twp').convert

# ---------- 字庫 ----------
def bank_words():
    out = {}
    for f in sorted(glob.glob(os.path.join(REPO, 'vocab', 'data', '*.js'))) + [os.path.join(REPO, 'vocab', 'books.js')]:
        s = open(f, encoding='utf-8').read()
        for m in re.finditer(r'\{"w":"((?:[^"\\]|\\.)*)","pos":"((?:[^"\\]|\\.)*)","zh":"((?:[^"\\]|\\.)*)"', s):
            w, pos, zh = (json.loads('"%s"' % x) for x in m.groups())
            out.setdefault(w, (pos, zh))
        for m in re.finditer(r"\bw:\s*'([^']+)'[^}]*?pos:\s*'([^']*)'[^}]*?zh:\s*'([^']*)'", s):
            out.setdefault(m.group(1), (m.group(2), m.group(3)))
    return out

# ---------- 音標 ----------
def uk_ipa(p):
    """ECDICT 舊式音標 → 現代英式 IPA（劍橋／牛津風格）"""
    if not p: return ''
    vs = [v for v in re.split(r'[,;]\s*|\.\s+', p.strip()) if v]
    if len(vs) == 1 and '.' in vs[0]:
        a, b = vs[0].split('.', 1)
        if a and b and a[0] == b[0] and abs(len(a) - len(b)) <= 2 and "'" not in vs[0]: vs = [a, b]
    p = next((v for v in vs if 'ɑ:' in v), vs[0]) if len(vs) > 1 and any('æ' in v for v in vs) else vs[0]
    p = p.replace('ә', 'ə').replace('є', 'e').replace('ε', 'e').replace(':', 'ː').replace("'", 'ˈ').replace('.', 'ˌ').replace('ɡ', 'g')
    for a, b in [('eiə', 'eɪə'), ('aiə', 'aɪə'), ('ei', 'eɪ'), ('ai', 'aɪ'), ('ɔi', 'ɔɪ'), ('ɒi', 'ɔɪ'), ('əu', 'əʊ'), ('ou', 'əʊ'), ('au', 'aʊ'),
                 ('iə', 'ɪə'), ('uə', 'ʊə'), ('ɒː', 'ɔː'), ('əː', 'ɜː')]:
        p = p.replace(a, b)
    p = re.sub(r'i(?!ː)', 'ɪ', p)                     # 短 i → ɪ
    p = re.sub(r'(?<![ɔaeʊ])ɪ$', 'i', p)               # 字尾非重讀 happy 的 i（雙母音除外）
    p = re.sub(r'(?<![ʊ])u(?!ː)', 'ʊ', p)              # 短 u → ʊ
    p = re.sub(r'ɔ(?![ːɪ])', 'ɒ', p)                    # 短 ɔ → ɒ
    p = re.sub(r'fʊl$', 'fəl', p).replace(' ', '')
    syl = len(re.findall(r'aɪ|aʊ|eɪ|əʊ|ɔɪ|ɪə|eə|ʊə|[iɪeæaɑɒɔoʊuʌəɜ]ː?', p)) + len(re.findall(r'(?<=[^aeiouɪʊʌɒɔɜæəː])[ln]$', p))
    if syl <= 1: p = p.replace('ˈ', '')
    return '/' + p + '/'

VOW = 'iɪeɛæaɑɒɔoʊuʌəɜɝɚ'
def us_ipa(p):
    """ipa-dict（CMUdict）窄式美音 → 字典常見寬式（劍橋美式風格）"""
    if not p: return ''
    p = p.strip('/').replace('ɹ', 'r').replace('ɫ', 'l').replace('ɡ', 'g').replace('ɛ', 'e')
    out, i = [], 0
    stress = not ('ˈ' in p or 'ˌ' in p)          # 沒有重音記號的單音節字視為重讀
    while i < len(p):
        c = p[i]
        if c in 'ˈˌ': stress = True; out.append(c); i += 1; continue
        if c in VOW:
            two = p[i:i+2]
            if two in ('aɪ', 'aʊ', 'eɪ', 'oʊ', 'ɔɪ'):
                out.append(two); i += 2; stress = False; continue
            if c in 'ɝɚ': out.append('ɜːr' if stress else 'ər')
            elif c == 'ə' and stress: out.append('ʌ')
            elif stress and c in 'iuɑɔɜ': out.append(c + 'ː')
            else: out.append(c)
            stress = False; i += 1; continue
        out.append(c); i += 1
    s = ''.join(out)
    nv = lambda t: len(re.findall(r'aɪ|aʊ|eɪ|oʊ|ɔɪ|ɜːr|ər|[iɪeæaɑɒɔoʊuʌəɜ]', t))
    if nv(s) <= 1: s = s.replace('ˈ', '').replace('ˌ', '')          # 單音節不標重音
    if 'ˈ' in s:
        pre, post = s.split('ˈ', 1)
        post = post.replace('ˌ', '')                               # 重音後的次重音拿掉
        if 'ˌ' in pre and nv(pre.split('ˌ', 1)[1]) < 2: pre = pre.replace('ˌ', '')
        s = pre + 'ˈ' + post
    return '/' + s + '/'

def load_ipa(f):
    d = {}
    for l in open(f, encoding='utf-8'):
        if '\t' not in l: continue
        k, v = l.rstrip('\n').split('\t', 1)
        d.setdefault(k.lower(), v.split(',')[0].strip())
    return d

# ---------- 中文釋義 ----------
POSMAP = {'n': 'n.', 'v': 'v.', 'vt': 'v.', 'vi': 'v.', 'a': 'adj.', 'adj': 'adj.', 'ad': 'adv.', 'adv': 'adv.', 'prep': 'prep.', 'conj': 'conj.'}
def gloss(tr):
    """ECDICT translation 第一行 → (詞性, 前兩個中文意思，繁體)"""
    for line in (tr or '').split('\\n'):
        line = line.strip()
        m = re.match(r'([a-z]+)\.\s*(.+)', line)
        if not m or m.group(1) not in POSMAP: continue
        zh = re.sub(r'\[[^\]]*\]|（[^）]*）|\([^)]*\)', '', m.group(2))
        parts = [x.strip() for x in re.split(r'[；;,，]', zh) if x.strip()][:2]
        if parts: return POSMAP[m.group(1)], s2t('；'.join(parts))
    return '', ''

def main():
    bank = bank_words()
    need = {w.lower() for w in bank}
    ec = {}
    for r in csv.DictReader(open(os.path.join(SRC, 'ecdict.csv'), encoding='utf-8')):
        k = r['word'].lower()
        if k not in ec: ec[k] = r
    us = load_ipa(os.path.join(SRC, 'en_US.txt'))

    def common(w):
        r = ec.get(w)
        if not r: return False
        frq = int(r['frq'] or 0); bnc = int(r['bnc'] or 0)
        return r['oxford'] == '1' or (r['collins'] or '0') not in ('', '0') or bool(r['tag']) or 0 < frq <= 30000 or 0 < bnc <= 30000

    def zh_of(w):
        if w in bank: return bank[w]
        lw = w.lower()
        for k, v in bank.items():
            if k.lower() == lw: return v
        return gloss(ec.get(lw, {}).get('translation', ''))

    def inflections(w):
        ex = ec.get(w, {}).get('exchange', '')
        return {x.split(':', 1)[1].lower() for x in ex.split('/') if ':' in x and x[0] in 'pdi3rts'}

    POS_WN = {'n.': 'n', 'v.': 'v', 'adj.': 'as', 'adv.': 'r'}
    result, stats = {}, {'uk': 0, 'us': 0, 'der': 0}
    for w, (pos, zh) in sorted(bank.items(), key=lambda x: x[0].lower()):
        lw = w.lower()
        info = {}
        parts = lw.split()
        ukp = uk_ipa(ec.get(lw, {}).get('phonetic', ''))
        if not ukp and len(parts) > 1 and all(ec.get(x, {}).get('phonetic') for x in parts):
            ukp = '/' + ' '.join(uk_ipa(ec[x]['phonetic']).strip('/') for x in parts) + '/'
        usp = us_ipa(us.get(lw, ''))
        if not usp and len(parts) > 1 and all(us.get(x) for x in parts):
            usp = '/' + ' '.join(us_ipa(us[x]).strip('/') for x in parts) + '/'
        if ukp: info['uk'] = ukp; stats['uk'] += 1
        if usp: info['us'] = usp; stats['us'] += 1

        if ' ' not in lw and '-' not in lw:
            infl = inflections(lw) | {lw}
            # 派生詞：WordNet derivationally related forms，限常用字、同字首、非屈折變化
            der = []
            for l in wn.lemmas(lw):
                for d in l.derivationally_related_forms():
                    n = d.name().lower()
                    if '_' in n or n in infl or n in [x[0] for x in der]: continue
                    if n[:3] != lw[:3] or not common(n): continue
                    p, z = zh_of(n)
                    if z: der.append((n, p, z))
            der.sort(key=lambda x: (x[0] not in bank, len(x[0])))
            if der: info['der'] = [list(x) for x in der[:5]]; stats['der'] += 1
        result[w] = info
    out = os.path.join(ROOT, 'vocab-src', 'wordinfo-auto.json')
    json.dump(result, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
    print(len(result), 'words', stats, '→', out)

if __name__ == '__main__':
    main()
