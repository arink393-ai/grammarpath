const {test}=require('node:test');
const assert=require('node:assert/strict');
const {ProgressSync:S}=require('../progress-sync.js');
const {createAccountStorage}=require('../vocab/account-storage.js');
function memory(){const m=new Map();return {get length(){return m.size},key:i=>[...m.keys()][i],getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}}
test('first sync retains remote streak, scores and independent completions',()=>{
 const m=S.merge(undefined,{xp:0,streak:{last:null,count:0},best:{a:5},completed:{a:true}},{xp:90,streak:{last:10,count:3},best:{a:8},completed:{b:true}});
 assert.equal(m.xp,90);assert.equal(m.streak.count,3);assert.equal(m.best.a,8);assert.deepEqual(m.completed,{a:true,b:true});
});
test('three-way merge preserves local spending and remote earnings',()=>assert.equal(S.merge({cans:100},{cans:70},{cans:120}).cans,90));
test('failed read never writes or acknowledges',async()=>{
 await assert.rejects(S.synchronize({read:async()=>{throw Error('offline')},write:()=>assert.fail(),ack:()=>assert.fail()}),/offline/);
});
function harness(){let local={xp:15,completed:{local:true}},base={xp:10},row={data:{xp:20,completed:{remote:true}},updated_at:'1'},pending;
 return {opts:{read:async()=>row,write:async(_,data)=>{row={data};return true},local:()=>local,base:()=>base,current:()=>true,ack:(b,l)=>{base=b;local=l;pending=null},backup:()=>{},pending:()=>pending,prepare:p=>{pending=p}},get local(){return local},set local(v){local=v},get row(){return row},set row(v){row=v}};
}
test('CAS conflict retries with latest cloud progress',async()=>{const h=harness();let n=0;h.opts.write=async(_,data)=>{if(!n++){h.row={data:{xp:30,completed:{other:true}}};return false}h.row={data};return true};await S.synchronize(h.opts);assert.equal(h.local.xp,35);assert.deepEqual(h.local.completed,{local:true,other:true});});
test('edits made while write is pending survive acknowledgement',async()=>{const h=harness();const w=h.opts.write;h.opts.write=async(r,d)=>{h.local={...h.local,xp:18,completed:{...h.local.completed,later:true}};return w(r,d)};await S.synchronize(h.opts);assert.equal(h.local.xp,28);assert.equal(h.local.completed.later,true);});
test('account switch ignores response',async()=>{const h=harness();h.opts.current=()=>false;h.opts.ack=()=>assert.fail();h.opts.write=()=>assert.fail();assert.equal(await S.synchronize(h.opts),false);});
test('uncertain write response does not award XP twice on retry',async()=>{const h=harness(),w=h.opts.write;h.opts.write=async(r,d)=>{await w(r,d);throw Error('response lost')};await assert.rejects(S.synchronize(h.opts));h.opts.write=w;await S.synchronize(h.opts);assert.equal(h.local.xp,25);});
test('missing cloud row restores full local data despite old baseline',async()=>{const h=harness();h.row=null;await S.synchronize(h.opts);assert.equal(h.local.xp,15);assert.equal(h.local.completed.local,true)});
test('account switching isolates progress, drafts and guest; returning preserves records',()=>{const ls=createAccountStorage(memory());ls.set('vr:p:b',{guest:true});ls.switchTo('A');ls.set('vr:p:b',{A:true});ls.set('vr:t:gkey','private');const old=ls.token();ls.switchTo('B');assert.equal(ls.current(old),false);assert.deepEqual(ls.get('vr:p:b',{}),{});assert.equal(ls.get('vr:t:gkey',null),null);ls.switchTo('A');assert.deepEqual(ls.get('vr:p:b'),{A:true});ls.switchTo(null);assert.deepEqual(ls.get('vr:p:b'),{guest:true});});
test('legacy records migrate only to recorded owner and backup excludes other users and keys',()=>{const raw=memory();raw.setItem('vr:owner','"A"');raw.setItem('vr:p:b','{"old":true}');const ls=createAccountStorage(raw);assert.deepEqual(ls.exportData(),{});ls.switchTo('A');ls.set('vr:t:gkey','secret');assert.deepEqual(ls.exportData(),{'vr:p:b':'{"old":true}'});ls.switchTo('B');ls.restore({'vr:p:b':'{"B":true}','vr:owner':'"A"','vr:u:A:vr:p:b':'{}','vr:t:gkey':'"injected"'});assert.equal(ls.get('vr:t:gkey',null),null);ls.switchTo('A');assert.deepEqual(ls.get('vr:p:b'),{old:true});});
