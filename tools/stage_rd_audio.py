#!/usr/bin/env python3
"""
只把 index.html 裡的 RD_AUDIO 音檔清單（/*RD_AUDIO_START*/…/*RD_AUDIO_END*/ 那一行）加進 git 暫存區，
不碰 index.html 其他還沒提交的修改（別的工作階段可能正在改）。

做法：取「最後一次提交的 index.html」，只把 RD_AUDIO 那段換成工作目錄裡的新版本，寫進暫存區。
用法：python3 tools/stage_rd_audio.py   （update.sh 會自動呼叫）
回傳：0＝已暫存（或本來就一樣）；1＝找不到標記
"""
import os, re, subprocess, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAT = re.compile(r'/\*RD_AUDIO_START\*/[\s\S]*?/\*RD_AUDIO_END\*/')

def git(*args, inp=None):
    return subprocess.run(['git', *args], cwd=REPO, input=inp, capture_output=True, check=True).stdout

def main():
    work = open(os.path.join(REPO, 'index.html'), encoding='utf-8').read()
    head = git('show', 'HEAD:index.html').decode('utf-8')
    mw, mh = PAT.search(work), PAT.search(head)
    if not mw or not mh:
        print('✗ 找不到 RD_AUDIO 標記'); return 1
    staged = head[:mh.start()] + mw.group(0) + head[mh.end():]
    if staged == head:
        print('  RD_AUDIO 沒有變動'); return 0
    blob = git('hash-object', '-w', '--stdin', inp=staged.encode('utf-8')).decode().strip()
    mode = git('ls-files', '-s', 'index.html').decode().split()[0]
    git('update-index', '--cacheinfo', f'{mode},{blob},index.html')
    others = work != staged
    print('  已暫存 index.html 的 RD_AUDIO 音檔清單' + ('（index.html 其他未提交的修改保留在工作目錄，沒有一起發佈）' if others else ''))
    return 0

if __name__ == '__main__':
    sys.exit(main())
