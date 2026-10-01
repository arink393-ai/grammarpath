/* Account-scoped storage. Legacy data is copied once, never deleted on sign-out. */
(function(root){
  function createAccountStorage(storage){
    let owner=null, epoch=0;
    const prefix=id=>'vr:u:'+encodeURIComponent(id || 'guest')+':';
    const allowed=k=>/^vr:(?:p:|star:|bs:|t:|settings$|books$|stats$|dirty$)/.test(k);
    const keys=()=>Array.from({length:storage.length},(_,i)=>storage.key(i));
    // Do not adopt a previous account's records into the next account.
    const marker='vr:scoped-v1';
    if(!storage.getItem(marker)){
      let legacy=null; try{legacy=JSON.parse(storage.getItem('vr:owner'));}catch(_){}
      for(const k of keys().filter(allowed)){
        const target=prefix(legacy)+k;
        if(storage.getItem(target)===null)storage.setItem(target,storage.getItem(k));
      }
      storage.setItem(marker,'1');
    }
    return {
      switchTo(id){if(owner!==(id||null)){owner=id||null;epoch++;}},
      token(){return epoch;}, current(token){return token===epoch;},
      get(k,d){try{const v=storage.getItem(prefix(owner)+k);return v===null?d:JSON.parse(v);}catch(_){return d;}},
      set(k,v){if(!allowed(k))throw new Error('Invalid storage key');storage.setItem(prefix(owner)+k,JSON.stringify(v));},
      del(k){storage.removeItem(prefix(owner)+k);},
      exportData(){const out={};for(const k of keys()){if(k.startsWith(prefix(owner))){const logical=k.slice(prefix(owner).length);if(allowed(logical)&&!logical.startsWith('vr:t:')&&logical!=='vr:dirty')out[logical]=storage.getItem(k);}}return out;},
      restore(data){const entries=Object.entries(data).filter(([k])=>allowed(k)&&!k.startsWith('vr:t:')&&k!=='vr:dirty');entries.forEach(([,v])=>JSON.parse(v));entries.forEach(([k,v])=>storage.setItem(prefix(owner)+k,v));}
    };
  }
  root.createAccountStorage=createAccountStorage;
})(typeof module==='object'?module.exports:window);
