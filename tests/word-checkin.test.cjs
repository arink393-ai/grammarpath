const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {WordCheckin:W}=require('../word-checkin.js');
const date='2026-10-09',mid=12345,five=['cat','dog','bird','fish','fox'];
test('five distinct words required; daily reward adds ten cans and never XP',()=>{const d={cans:4,xp:1010};assert.equal(W.claim(d,date,mid,['cat','CAT',' cat ','dog','fish']),false);assert.equal(W.claim(d,date,mid,five),true);assert.equal(d.cans,14);assert.equal(d.xp,1010);assert.equal(W.claim(d,date,mid,five),false);assert.equal(d.cans,14);assert.equal(W.claim(d,'2026-10-10',mid+86400000,five),true);});
test('legacy check-in cannot be claimed again and word progress resets by date',()=>{for(const checkin of [{last:mid},mid])assert.equal(W.claim({checkin},date,mid,five),false);const d={};W.record(d,date,' Cat ');W.record(d,date,'cat');assert.deepEqual(W.words(d,date),['cat']);assert.deepEqual(W.words(d,'2026-10-10'),[]);});
test('standalone study records combine distinct words only for current owner and day',()=>{const values={'vr:u:A:vr:p:book':JSON.stringify({cat:{studyDay:42},dog:{studyDay:42},old:{studyDay:41},skipped:{s:99}}),'vr:u:B:vr:p:book':JSON.stringify({private:{studyDay:42}})};const storage={length:2,key:i=>Object.keys(values)[i],getItem:k=>values[k]};assert.deepEqual(W.words({wordDays:{[date]:['cat','fox']}},date,storage,'A',42).sort(),['cat','dog','fox']);});
test('capsule draws only new cats, charges fifty once and preserves XP; empty pool and insufficient balance are safe',()=>{
 const source=fs.readFileSync(require.resolve('../index.html'),'utf8');const fn=source.slice(source.indexOf('function dexDraw()'),source.indexOf('function dexShowPrize('));
 const store={data:{cans:99,xp:1010,catDex:{grumpy:'old'}},save(){}};let modal=false,prizes=[];
 const c=vm.createContext({store,document:{getElementById:()=>modal},CAT_DEX:[{id:'grumpy'},{id:'box'}],CATDEX_COST:50,catDexOwned:id=>!!store.data.catDex[id],toast(){},paintHeader(){},renderCatDex(){},dexShowPrize(cat){modal=true;prizes.push(cat.id)}});
 vm.runInContext(fn+'dexDraw();dexDraw();',c);assert.equal(store.data.cans,49);assert.equal(store.data.xp,1010);assert.equal(store.data.catDex.grumpy,'old');assert.deepEqual(prizes,['box']);
 modal=false;store.data.cans=100;vm.runInContext('dexDraw()',c);assert.equal(store.data.cans,100);assert.equal(prizes.length,1);
 delete store.data.catDex.box;store.data.cans=49;vm.runInContext('dexDraw()',c);assert.equal(store.data.cans,49);assert.equal(store.data.catDex.box,undefined);
});
test('inline application scripts parse',()=>{const source=fs.readFileSync(require.resolve('../index.html'),'utf8');for(const [,script] of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(script.trim()&&!script.trim().startsWith('{'))new vm.Script(script);});
test('expanded collection gives previous collectors six new unique draws without changing XP',()=>{
 const source=fs.readFileSync(require.resolve('../index.html'),'utf8');
 const data=source.slice(source.indexOf('const CATDEX_COST'),source.indexOf('const catDexOwned'));
 const draw=source.slice(source.indexOf('function dexDraw()'),source.indexOf('function dexShowPrize('));
 const store={data:{cans:300,xp:42,catDex:{}},save(){}};const prizes=[];
 const ctx=vm.createContext({store,document:{getElementById:()=>null},catDexOwned:id=>!!store.data.catDex[id],paintHeader(){},renderCatDex(){},toast(){},dexShowPrize:c=>prizes.push(c.id)});
 vm.runInContext(data+';globalThis.cats=CAT_DEX;globalThis.art=CAT_DEX.map(catDexArt);'+draw,ctx);
 assert.equal(ctx.cats.length,24);assert.equal(new Set(ctx.cats.map(c=>c.id)).size,24);
 for(const cat of ctx.cats.slice(0,18))store.data.catDex[cat.id]='old';
 for(let i=0;i<7;i++)vm.runInContext('dexDraw()',ctx);
 assert.equal(prizes.length,6);assert.equal(new Set(prizes).size,6);assert.equal(store.data.cans,0);assert.equal(store.data.xp,42);assert.equal(Object.keys(store.data.catDex).length,24);
 for(const markup of ctx.art)assert.ok(!/undefined|NaN/.test(markup));
 assert.equal(ctx.art.filter(s=>s.includes('meme-cats-atlas-2.png')).length,6);
});
