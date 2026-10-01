const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const {createAccountStorage}=require('../vocab/account-storage.js');
function harness(){
 const m=new Map(),storage={get length(){return m.size},key:i=>[...m.keys()][i],getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};
 const node={addEventListener(){},classList:{toggle(){}},querySelectorAll:()=>[]};
 const context=vm.createContext({console:{warn(){}},localStorage:storage,createAccountStorage,document:{querySelector:()=>node,addEventListener(){}},window:{addEventListener(){}},location:{search:'',hash:'#home'},URLSearchParams,BUILTIN_BOOKS:[{id:'jh-core',words:[],title:'test'}],setTimeout:()=>1,clearTimeout(){}});
 const source=fs.readFileSync(require.resolve('../vocab/app.js'),'utf8').replace(/app.innerHTML='<p class="muted">正在載入帳號與本機進度…<\/p>';\s*cloudInit\(\);\s*$/,'');
 vm.runInContext(source+`;route=()=>{};home=()=>{};globalThis.api={CLOUD,LS,switchAccount,cloudPull,cloudPush,markDirty,prog,saveProg,getSettings:()=>settings};`,context);
 return context.api;
}
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}}
test('late cloud read from A cannot write into B',async()=>{
 const a=harness(),d=deferred();a.switchAccount({id:'A'});a.CLOUD.sb={from:()=>({select:()=>({eq:()=>d.promise})})};
 const pending=a.cloudPull();a.switchAccount({id:'B'});d.resolve({data:[{book_id:'jh-core',words:{secret:{s:8}}}]});
 assert.equal(await pending,false);assert.equal(a.prog('jh-core').secret,undefined);
});
test('late failed write does not contaminate next account retry queue',async()=>{
 const a=harness(),d=deferred();a.switchAccount({id:'A'});a.CLOUD.pulled=true;a.saveProg('jh-core',{cat:{s:1}});a.CLOUD.sb={from:()=>({upsert:()=>d.promise})};
 const pending=a.cloudPush();a.switchAccount({id:'B'});d.resolve({error:{message:'offline'}});await pending;
 assert.equal(a.CLOUD.dirty.size,0);assert.equal(a.prog('jh-core').cat,undefined);
 a.switchAccount({id:'A'});assert.equal(a.prog('jh-core').cat.s,1);assert.equal(a.CLOUD.dirty.has('jh-core'),true);
});
test('local changes during an in-flight write remain pending on disk',async()=>{
 const a=harness(),d=deferred();a.switchAccount({id:'A'});a.CLOUD.pulled=true;a.markDirty('jh-core');a.CLOUD.sb={from:()=>({upsert:()=>d.promise})};
 const pending=a.cloudPush();a.markDirty('other');assert.deepEqual([...a.LS.get('vr:dirty')].sort(),['jh-core','other']);d.resolve({error:null});await pending;assert.deepEqual([...a.LS.get('vr:dirty')],['other']);
});
test('sign-out restores guest settings and hides account records',()=>{
 const a=harness();a.LS.set('vr:settings',{dailyNew:5});a.switchAccount({id:'A'});a.LS.set('vr:settings',{dailyNew:20});a.saveProg('jh-core',{cat:{s:1}});a.switchAccount(null);assert.equal(a.getSettings().dailyNew,5);assert.equal(a.prog('jh-core').cat,undefined);
});
