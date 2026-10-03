(function(root){
  root.createBookLoader=function(books,catalog,insert){
    const jobs=new Map();
    return {load(id){
      if(books.some(b=>b.id===id))return Promise.resolve();
      if(!catalog.some(b=>b.id===id))return Promise.resolve();
      if(jobs.has(id))return jobs.get(id);
      const job=(insert?insert('data/'+id+'.js?v=1'):new Promise((resolve,reject)=>{
        const script=document.createElement('script');script.src='data/'+id+'.js?v=1';
        script.onload=resolve;script.onerror=()=>{script.remove();reject(new Error('Book unavailable'));};
        document.head.appendChild(script);
      })).then(()=>{if(!books.some(b=>b.id===id))throw new Error('Missing book data');}).finally(()=>jobs.delete(id));
      jobs.set(id,job);return job;
    }};
  };
})(typeof module==='object'?module.exports:window);
