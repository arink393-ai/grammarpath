/* Pure three-way merge + optimistic concurrency. No credentials or browser globals. */
(function(root){
  const copy = x => x === undefined ? undefined : JSON.parse(JSON.stringify(x));
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  const object = x => x && typeof x === 'object' && !Array.isArray(x);
  const safeKeys = (...xs) => [...new Set(xs.flatMap(x=>Object.keys(x||{})))].filter(k=>!['__proto__','constructor','prototype'].includes(k));
  function merge(base, local, remote, path=''){
    if(same(local,remote)) return copy(local);
    if(same(local,base)) return copy(remote);
    if(same(remote,base)) return copy(local);
    if(Array.isArray(local) && Array.isArray(remote)){
      // Account for removals relative to the last acknowledged snapshot.
      const b=new Set((Array.isArray(base)?base:[]).map(JSON.stringify));
      const l=new Set(local.map(JSON.stringify)),r=new Set(remote.map(JSON.stringify));
      return [...new Set([...l,...r])].filter(x=>!b.has(x)||(l.has(x)&&r.has(x))).map(x=>JSON.parse(x));
    }
    if(path==='streak' && object(local) && object(remote)){
      return copy((local.last||0)>(remote.last||0)?local:(local.last||0)<(remote.last||0)?remote:{last:local.last,count:Math.max(local.count||0,remote.count||0)});
    }
    if(object(local) && object(remote)){
      const out={}; for(const k of safeKeys(base,local,remote)){
        const v=merge(base?.[k],local[k],remote[k],path?path+'.'+k:k); if(v!==undefined)out[k]=v;
      } return out;
    }
    if(['xp','cans'].includes(path) && Number.isFinite(local) && Number.isFinite(remote)){
      return Number.isFinite(base)?Math.max(0,remote+local-base):Math.max(local,remote);
    }
    if(Number.isFinite(local)&&Number.isFinite(remote)&&(base===undefined || path.startsWith('best.') || path==='checkin.last'))return Math.max(local,remote);
    if(base===undefined && typeof local==='boolean' && typeof remote==='boolean')return local||remote;
    if(base===undefined && local===null)return copy(remote);
    // Conflicting edits retain this device's value; both snapshots are backed up by the caller.
    return copy(local === undefined ? remote : local);
  }
  async function synchronize({read,write,local,base,current,ack,backup,pending=()=>null,prepare=()=>{},nonce=()=>String(Date.now())+Math.random()}){
    for(let attempt=0;attempt<4;attempt++){
      const row=await read(); if(!current())return false;
      const before=copy(local()), remote=row?.data||{};
      const previous=pending();
      if(previous && remote._syncWrite===previous.token){
        ack(remote,merge(previous.before,before,remote)); return true;
      }
      const merged=row?merge(base(),before,remote):copy(before);
      backup(before,remote);
      if(!same(merged,remote) || !row){
        merged._syncWrite=nonce();
        prepare({token:merged._syncWrite,before});
        if(!await write(row,merged)){if(!current())return false;continue;}
      }
      if(!current())return false;
      // Edits made during the request remain local and will be sent by the next pass.
      const latest=merge(before,local(),merged);
      ack(merged,latest); return true;
    }
    throw new Error('Progress changed on another device; retry required');
  }
  root.ProgressSync={merge,synchronize,copy,same};
})(typeof module==='object'?module.exports:window);
