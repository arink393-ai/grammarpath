(function(root){
  const CACHE='eci-offline-v1';
  const CORE=['index.html','art/cat-dex/meme-cats-atlas.png','daily.css?v=17','adventure.css?v=1','progress-sync.js?v=1','word-checkin.js?v=1','curriculum-loader.js?v=3','offline-content.js?v=6','daily.js?v=18','adventure.js?v=1','vocab/books.js?v=6','vocab-quest.js?v=15','curriculum/basic.json?v=3','curriculum/intermediate.json?v=3','curriculum/advanced.json?v=3','vocab/','vocab/style.css?v=2','vocab/books.js','vocab/catalog.js?v=1','vocab/book-loader.js?v=3','vocab/account-storage.js?v=2','vocab/app.js?v=8','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'];
  // 單字補充資料（英美音標、派生、詞根、同義詞），跟著單字書一起下載
  const INFO=['vocab/info/a.js?v=10','vocab/info/b.js?v=10','vocab/info/c.js?v=10','vocab/info/d.js?v=10','vocab/info/e.js?v=10','vocab/info/f.js?v=10','vocab/info/g.js?v=10','vocab/info/h.js?v=10','vocab/info/i.js?v=10','vocab/info/j.js?v=10','vocab/info/k.js?v=10','vocab/info/l.js?v=10','vocab/info/m.js?v=10','vocab/info/n.js?v=10','vocab/info/o.js?v=10','vocab/info/p.js?v=10','vocab/info/q.js?v=10','vocab/info/r.js?v=10','vocab/info/s.js?v=10','vocab/info/t.js?v=10','vocab/info/u.js?v=10','vocab/info/v.js?v=10','vocab/info/w.js?v=10','vocab/info/y.js?v=10','vocab/info/z.js?v=10'];
  function createManager(base,cacheStorage,request){
    const urls=options=>[...CORE,...(options?.largeBook?['vocab/data/'+options.bookId+'.js?v=3',...INFO]:[])].map(path=>new URL(path,base).href);
    return {
      async ready(options){const cache=await cacheStorage.open(CACHE);return (await Promise.all(urls(options).map(url=>cache.match(url)))).every(Boolean);},
      async download(options,onProgress=()=>{}){
        const cache=await cacheStorage.open(CACHE),list=urls(options);let done=0;
        for(const url of list){
          const response=await request(url,{cache:'reload'});
          if(!response.ok)throw new Error('Download failed');
          await cache.put(url,response);onProgress(++done,list.length);
        }
      }
    };
  }
  if(typeof module==='object'){module.exports={createManager,CORE,INFO,CACHE};return;}
  const base=new URL('.',document.currentScript.src);
  const manager=createManager(base,caches,(...args)=>fetch(...args));
  if('serviceWorker' in navigator)navigator.serviceWorker.register(new URL('sw.js',base)).catch(()=>{});
  const active=new Map();
  root.OfflineContent={mount(element,options={}){
    if(!element)return;
    const title=options.bookTitle?'、目前選擇的單字書「'+options.bookTitle+'」':'';
    element.innerHTML='<h2>離線教材</h2><p class="small">下載範圍：文法課程與練習、基礎單字書'+title.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'。影片、線上發音、圖片與雲端同步仍需網路。教材儲存在此瀏覽器，清除網站資料後需重新下載。</p><button type="button" class="btn">下載離線教材</button><p role="status" aria-live="polite">正在確認下載狀態…</p>';
    const button=element.querySelector('button'),status=element.querySelector('[role=status]');
    if(!('serviceWorker' in navigator)||!root.isSecureContext){button.disabled=true;status.textContent='此瀏覽器目前不支援離線教材。';return;}
    const key=options.largeBook?options.bookId:'core';
    const report=(done,total)=>{status.textContent='下載中 '+done+' / '+total;};
    button.onclick=async()=>{
      button.disabled=true;status.textContent='準備下載…';
      try{
        if(!active.has(key))active.set(key,manager.download(options,report).finally(()=>active.delete(key)));
        await active.get(key);
        await navigator.serviceWorker.ready;
        if(!await manager.ready(options))throw new Error('Incomplete download');
        status.textContent='已下載，可離線使用上述教材。';button.textContent='重新下載／更新';
      }catch(e){status.textContent='下載未完成。請檢查網路與儲存空間後重試；已保存的進度不受影響。';}
      finally{button.disabled=false;}
    };
    manager.ready(options).then(ready=>{if(button.disabled)return;status.textContent=ready?'已下載，可離線使用上述教材。':'尚未完整下載。請在離線前按下載。';if(ready)button.textContent='重新下載／更新';}).catch(()=>{status.textContent='無法存取離線儲存空間，請檢查瀏覽器設定。';});
  }};
})(typeof window==='undefined'?{}:window);
