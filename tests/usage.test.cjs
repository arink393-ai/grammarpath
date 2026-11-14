const assert=require('assert'),U=require('../usage.js');
const now=Date.parse('2026-11-15T04:00:00Z');
assert.strictEqual(U.fmt(0),'—');assert.strictEqual(U.fmt(30),'不到 1 分');assert.strictEqual(U.fmt(35*60),'35 分');assert.strictEqual(U.fmt(7500),'2 小時 5 分');
assert.strictEqual(U.dayKey(Date.parse('2026-11-14T17:00:00Z')),'2026-11-15');   // 台灣日期
assert.strictEqual(U.routeKind('#/lesson/x'),'lesson');assert.strictEqual(U.routeKind('#/reading/a'),'reading');assert.strictEqual(U.routeKind('#/homework'),'homework');
assert.deepStrictEqual(U.routeItems('#/lesson/abc'),[{t:'lesson',id:'abc'}]);assert.deepStrictEqual(U.routeItems('#/home'),[]);
const as=[{id:'A',scope:[{t:'lesson',id:'abc'}]},{id:'B',scope:[{t:'reading',id:'abc'}]},{id:'C',active:false,scope:[{t:'lesson',id:'abc'}]}];
assert.deepStrictEqual(U.matchAssignments(U.routeItems('#/lesson/abc'),as,new Set()),['A']);
assert.deepStrictEqual(U.matchAssignments(U.routeItems('#/lesson/abc'),as,new Set(['A'])),[]);
const d={};U.addTo(d,{day:'2026-11-15',dev:'x',now,kinds:{lesson:100},asg:{A:100},newSession:true});
U.addTo(d,{day:'2026-11-15',dev:'y',now:now+1000,kinds:{reading:50},asg:{},newSession:true});
const m=U.daysMap(d)['2026-11-15'];assert.strictEqual(m.s,150);assert.strictEqual(m.n,2);assert.strictEqual(U.asgSec(d,'A'),100);
assert.strictEqual(U.sumDays(d,7,now).s,150);assert.strictEqual(U.sumDays(d,7,now+9*864e5).s,0);
U.prune(d,'2027-03-15');assert.ok(!d.usage['2026-11-15']);
assert.ok(U.panelHTML({},null,null,now).includes('沒有使用紀錄'));
assert.ok(U.panelHTML({usage:{'2026-11-15':{x:{s:600,n:1,f:now,l:now,k:{lesson:600}}}}},()=>'t',null,now).includes('10 分'));
console.log('usage ok');
