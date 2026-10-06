(function(root){
  root.createCurriculumLoader=function(data,request=(url)=>fetch(url)){
    const loaded=new Set(),jobs=new Map();
    return {loaded,load(id){
      if(!data.levels.some(l=>l.id===id))return Promise.reject(new Error('Unknown curriculum'));
      if(loaded.has(id))return Promise.resolve();
      if(jobs.has(id))return jobs.get(id);
      const job=(async()=>{
        const response=await request('curriculum/'+id+'.json?v=2');
        if(!response.ok)throw new Error('Curriculum unavailable');
        const lessons=await response.json();
        const expected=data.lessons.filter(l=>data.units.find(u=>u.id===l.unit)?.level===id);
        if(!Array.isArray(lessons)||lessons.length!==expected.length||!expected.every(l=>lessons.some(x=>x.id===l.id&&Array.isArray(x.q)&&Array.isArray(x.uses))))throw new Error('Incomplete curriculum');
        for(const item of lessons)Object.assign(data.lessons.find(l=>l.id===item.id),item);
        loaded.add(id);
      })().finally(()=>jobs.delete(id));
      jobs.set(id,job);return job;
    }};
  };
})(typeof module==='object'?module.exports:window);
