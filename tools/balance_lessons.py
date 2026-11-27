#!/usr/bin/env python3
"""Spread the correct answers of multiple-choice questions evenly over A / B / C / D.

The lessons were written with the correct option mostly in the second slot (57% "B"), which students
learn to spot — online and on the printed worksheets. This moves each question's correct option to a
target slot and leaves the other options in their order, so nothing but the letter changes.

Targets are deterministic and stable: per lesson, a seeded stream of shuffled blocks [0..k-1]
(k = number of options), so balancing twice changes nothing and adding a question later doesn't move
the earlier ones.

Covers
  curriculum/<level>.json   every lesson's q items with t == "mcq" (online practice + worksheet part A + 素養題)
  index.html WORKSHEETS     the extra worksheet questions  {q:"…", opts:[…], a:N}

  python3 tools/balance_lessons.py           rewrite the files
  python3 tools/balance_lessons.py --check   exit 1 if anything is unbalanced (run by tests)
"""
import json, random, re, sys
from collections import Counter

LEVELS = ("basic", "intermediate", "advanced")


def targets(seed):
    """yields target slots for questions of k options; a separate block stream per k"""
    rng, blocks = random.Random(seed), {}
    def nxt(k):
        b = blocks.setdefault(k, [])
        if not b:
            b.extend(range(k)); rng.shuffle(b)
        return b.pop(0)
    return nxt


def move(opts, a, t):
    if a == t: return opts, a
    o = opts[:]; right = o.pop(a); o.insert(t, right)
    return o, t


def balance_curriculum(write):
    changed, spread = [], Counter()
    for lv in LEVELS:
        path = f"curriculum/{lv}.json"
        raw = open(path, encoding="utf-8").read(); data = json.loads(raw)
        for l in data:
            nxt = targets("lesson:" + l["id"])
            for q in l.get("q", []):
                if q.get("t") != "mcq": continue
                opts, a = move(q["opts"], q["a"], nxt(len(q["opts"])))
                if a != q["a"]: q["opts"], q["a"] = opts, a
                spread[a] += 1
        out = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        if out != raw:
            changed.append(path)
            if write: open(path, "w", encoding="utf-8").write(out)
    return changed, spread


MCQ = re.compile(r'(\{q:"(?:[^"\\]|\\.)*",\s*opts:)(\[.*?\])(,\s*a:)(\d)(\})')
KEY = re.compile(r'^"([a-z0-9-]+)": ?\{', re.M)


def balance_worksheets(write):
    path = "index.html"; s = open(path, encoding="utf-8").read()
    a0 = s.index("const WORKSHEETS = {"); b0 = s.index("\n};", a0)
    block = s[a0:b0]; keys = [(m.start(), m.group(1)) for m in KEY.finditer(block)]
    streams, spread = {}, Counter()
    def repl(m):
        lid = [k for p, k in keys if p < m.start()][-1]
        nxt = streams.setdefault(lid, targets("ws:" + lid))
        opts, a = json.loads(m.group(2)), int(m.group(4))
        opts, a = move(opts, a, nxt(len(opts))); spread[a] += 1
        return m.group(1) + json.dumps(opts, ensure_ascii=False, separators=(",", ":")) + m.group(3) + str(a) + m.group(5)
    new = MCQ.sub(repl, block)
    changed = new != block
    if changed and write: open(path, "w", encoding="utf-8").write(s[:a0] + new + s[b0:])
    return (["index.html (WORKSHEETS)"] if changed else []), spread


def main():
    check = "--check" in sys.argv
    c1, s1 = balance_curriculum(not check)
    c2, s2 = balance_worksheets(not check)
    fmt = lambda c: " ".join(f"{'ABCD'[k]} {v}" for k, v in sorted(c.items()))
    print(f"lessons: {fmt(s1)}   worksheets: {fmt(s2)}")
    if check and (c1 or c2):
        print("✗ answers are not spread evenly in: " + ", ".join(c1 + c2) + " — run python3 tools/balance_lessons.py")
        sys.exit(1)
    if not check: print("rebalanced: " + (", ".join(c1 + c2) or "nothing to change"))


if __name__ == "__main__":
    main()
