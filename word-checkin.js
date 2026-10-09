/* Five distinct studied words unlock one daily reward; no XP is awarded here. */
(function(root){
 const normalize=w=>String(w||'').trim().toLowerCase().replace(/\s+/g,' ');
 root.WordCheckin={
  record(data,date,word){const w=normalize(word);if(!w)return;data.wordDays=data.wordDays||{};const words=data.wordDays[date]||[];data.wordDays[date]=[...new Set([...words,w])];},
  words(data,date,storage,userId,day){
   const words=new Set((data.wordDays?.[date]||[]).map(normalize));
   if(storage&&userId){const prefix='vr:u:'+encodeURIComponent(userId)+':vr:p:';
    for(let i=0;i<storage.length;i++){const k=storage.key(i);if(!k?.startsWith(prefix))continue;
     try{for(const [w,r] of Object.entries(JSON.parse(storage.getItem(k)||'{}'))){if(r.studyDay===day)words.add(normalize(w));}}catch(_){}
    }
   }words.delete('');return [...words];
  },
  claimed(data,date,midnight){return !!data.wordClaims?.[date] || data.checkin?.last===midnight || data.checkin===midnight;},
  claim(data,date,midnight,words,reward=10){
   if(this.claimed(data,date,midnight)||new Set(words.map(normalize).filter(Boolean)).size<5)return false;
   data.wordClaims=data.wordClaims||{};data.wordClaims[date]=true;data.checkin={last:midnight};
   data.cans=(data.cans||0)+reward;return true;
  }
 };
})(typeof module==='object'?module.exports:window);
