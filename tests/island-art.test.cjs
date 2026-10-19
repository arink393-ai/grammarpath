const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../index.html'),'utf8');
const helper=source.slice(source.indexOf('function islandCatArt('),source.indexOf('function exportProgress('));
function data(name){const a=source.indexOf('const '+name+' =');return source.slice(a,source.indexOf('\n];',a)+3);}
test('all 42 island portraits map to valid local atlas frames',()=>{
 const ctx=vm.createContext({});vm.runInContext(helper,ctx);
 const art=Array.from({length:42},(_,i)=>vm.runInContext(`islandCatArt(${i},'cat')`,ctx));
 assert.equal(new Set(art).size,42);assert.ok(art.every(s=>!s.includes('NaN')&&!s.includes('undefined')));
 assert.equal(art.filter(s=>s.includes('cats-4.png')).length,6);
});
test('island rendering preserves course unlocks, fed companions and all progress',()=>{
 const lessons=Array.from({length:34},(_,i)=>({id:'lesson'+i,n:i+1,title:'Lesson',zh:'課程'}));
 const store={data:{completed:{lesson0:true},fedCats:['orange','cream','choco','gray','calico','white','cow','black'],xp:123,catDex:{},mistakes:{}},streakCount:()=>3};
 const before=JSON.stringify(store.data),app={innerHTML:''};
 const ctx=vm.createContext({store,app,DATA:{lessons,levels:[{id:'basic',name:'Basic',zh:'初級'}]},lessonsOf:()=>lessons,CAT_DEX:[]});
 vm.runInContext(data('BREEDS')+data('FED_CATS')+helper+'renderIsland()',ctx);
 assert.equal(JSON.stringify(store.data),before);assert.equal((app.innerHTML.match(/class="cat-tile /g)||[]).length,42);
 assert.equal((app.innerHTML.match(/cat-tile locked/g)||[]).length,33);assert.equal((app.innerHTML.match(/catMeow\('/g)||[]).length,8);
 assert.ok(app.innerHTML.includes("#/lesson/lesson0"));assert.ok(app.innerHTML.includes('孟買貓'));assert.ok(!app.innerHTML.includes('data:image'));
});
