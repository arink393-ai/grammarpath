const assert=require('assert'),G=require('../ving-game.js');
assert.ok(G.BANK.length>=30);
assert.ok(G.BANK.filter(q=>q.tag==='with').length>=20);
const n=G.BANK.filter(q=>q.a==='ing').length;assert.ok(n>=12&&G.BANK.length-n>=12,'答案要 V-ing / p.p. 平均');
G.BANK.forEach(q=>{assert.strictEqual(q.s.split('___').length,2,q.s);assert.ok(q.v&&q.zh&&q.why,q.s);assert.notStrictEqual(q.ing,q.pp,q.s);assert.ok(/ing$/.test(q.ing),q.s);});
assert.strictEqual(new Set(G.BANK.map(q=>q.s)).size,G.BANK.length);
const p=G.pick('with');assert.strictEqual(p.length,G.ROUND);assert.ok(p.every(q=>q.tag==='with'));
console.log('ving-game ok');
