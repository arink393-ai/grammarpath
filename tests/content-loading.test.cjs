const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {createCurriculumLoader}=require('../curriculum-loader.js');
const {createBookLoader}=require('../vocab/book-loader.js');
const {createManager,CORE,INFO,CACHE}=require('../offline-content.js');
function metadata(){const text=fs.readFileSync('index.html','utf8');return vm.runInNewContext(text.slice(text.indexOf('const DATA ='),text.indexOf('\n\n/* =====================================================\n   Store'))+';DATA');}
test('curriculum loads one requested level, preserving catalog object identities',async()=>{
 const data=metadata(),first=data.lessons[0],calls=[];
 const loader=createCurriculumLoader(data,async url=>{calls.push(url);return {ok:true,json:async()=>JSON.parse(fs.readFileSync(url.split('?')[0]))}});
 assert.equal(first.q,undefined);await Promise.all([loader.load('basic'),loader.load('basic')]);assert.equal(calls.length,1);assert.equal(first,data.lessons[0]);assert.ok(first.q.length);assert.equal(data.lessons.find(l=>data.units.find(u=>u.id===l.unit).level==='advanced').q,undefined);
 await loader.load('intermediate');await loader.load('advanced');assert.ok(data.lessons.length>=81);assert.ok(data.lessons.every(l=>l.q.length&&l.form&&l.uses));
});
test('incomplete curriculum is rejected without partially mutating lessons and can retry',async()=>{
 const data=metadata();let fail=true;
 const loader=createCurriculumLoader(data,async()=>({ok:true,json:async()=>fail?[]:JSON.parse(fs.readFileSync('curriculum/basic.json'))}));
 await assert.rejects(loader.load('basic'));assert.equal(loader.loaded.size,0);assert.equal(data.lessons[0].q,undefined);fail=false;await loader.load('basic');assert.ok(data.lessons[0].q);
});
test('word books are loaded once on demand and a failed download can retry',async()=>{
 const books=[],catalog=[{id:'jh7'},{id:'jh8'}];let fail=true,calls=0;
 const loader=createBookLoader(books,catalog,async()=>{calls++;if(fail)throw Error('offline');books.push({id:'jh7',words:[{w:'cat'}]})});
 assert.equal(calls,0);await assert.rejects(loader.load('jh7'));fail=false;await Promise.all([loader.load('jh7'),loader.load('jh7')]);assert.equal(calls,2);await loader.load('jh7');assert.equal(calls,2);assert.equal(books.length,1);
});
function cacheStore(){const stores=new Map();return {stores,keys:async()=>[...stores.keys()],delete:async k=>stores.delete(k),open:async name=>{if(!stores.has(name))stores.set(name,new Map());const m=stores.get(name);return {match:async url=>m.get(new URL(typeof url==='string'?url:url.url,'https://example.test/grammarpath/').href),put:async(url,response)=>m.set(new URL(url,'https://example.test/grammarpath/').href,response)}}};}
test('offline downloads use Pages subpath and include only selected large word book',async()=>{
 const caches=cacheStore(),seen=[],manager=createManager('https://example.test/grammarpath/',caches,async url=>{seen.push(url);return new Response('ok')});
 const options={largeBook:true,bookId:'jh7'};assert.equal(await manager.ready(options),false);let progress;
 await manager.download(options,(n,total)=>{progress=[n,total]});assert.equal(await manager.ready(options),true);const total=CORE.length+1+INFO.length;assert.deepEqual(progress,[total,total]);assert.ok(seen.some(u=>/vocab\/data\/jh7\.js\?v=\d+$/.test(u)));assert.ok(INFO.length>=20&&INFO.every(u=>seen.some(s=>s.endsWith(u))));assert.ok(!seen.some(u=>u.includes('jh8.js')));
 assert.equal(await manager.ready({largeBook:true,bookId:'jh8'}),false);
});
test('failed offline download never reports complete and can retry',async()=>{
 const caches=cacheStore();let failed=true;const manager=createManager('https://example.test/grammarpath/',caches,async url=>new Response('',{status:failed&&url.includes('curriculum/basic')?503:200}));
 await assert.rejects(manager.download({}));assert.equal(await manager.ready({}),false);failed=false;await manager.download({});assert.equal(await manager.ready({}),true);
});
test('offline manifest includes exact script and stylesheet versions used by both entry pages',()=>{
 for(const file of ['index.html','vocab/index.html']){const base=new URL(file,'https://example.test/grammarpath/');for(const match of fs.readFileSync(file,'utf8').matchAll(/<(?:script[^>]*src|link[^>]*rel="stylesheet"[^>]*href)="([^"]+)"/g)){
 const url=new URL(match[1],base);if(url.origin!==base.origin)continue;
 assert.ok(CORE.some(path=>new URL(path,'https://example.test/grammarpath/').href===url.href),'Missing '+match[1]);
 }}
});
test('service worker keeps offline downloads and unrelated caches during upgrade; offline vocab stays vocab',async()=>{
 const caches=cacheStore();await caches.open('eci-v50-account-safety');await caches.open('another-app');const offline=await caches.open(CACHE);await offline.put('./vocab/',new Response('vocab shell'));
 const events={},context={URL,Response,caches,location:{origin:'https://example.test'},fetch:async()=>{throw Error('offline')},self:{registration:{scope:'https://example.test/grammarpath/'},clients:{claim:async()=>{}},addEventListener:(name,fn)=>events[name]=fn}};
 vm.runInNewContext(fs.readFileSync('sw.js','utf8'),context);let done;events.activate({waitUntil:p=>done=p});await done;assert.ok(caches.stores.has(CACHE));assert.ok(caches.stores.has('another-app'));assert.ok(!caches.stores.has('eci-v50-account-safety'));
 let response;events.fetch({request:{method:'GET',mode:'navigate',url:'https://example.test/grammarpath/vocab/?book=jh7'},respondWith:p=>response=p});assert.equal(await(await response).text(),'vocab shell');
});
test('offline and service-worker asset lists match the pages (tools/sync_assets.py --check)',()=>{const r=require('node:child_process').spawnSync('python3',['tools/sync_assets.py','--check'],{encoding:'utf8'});assert.equal(r.status,0,r.stdout+r.stderr);});
