const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
function harness(){
 const audio=[],spoken=[];class Audio{constructor(url){this.url=url;audio.push(this)}pause(){}play(){return new Promise((_,reject)=>{this.reject=reject})}}
 const speechSynthesis={cancel(){},speak(u){spoken.push(u)}};
 const source=fs.readFileSync(require.resolve('../vocab-quest.js'),'utf8');
 const c=vm.createContext({Audio,window:{speechSynthesis},speechSynthesis,SpeechSynthesisUtterance:class{constructor(text){this.text=text}}});
 vm.runInContext(source.slice(source.indexOf('let vqAudio='),source.indexOf('const vqMark='))+';globalThis.say=vqSay;',c);
 return {audio,spoken,say:c.say};
}
test('audio error plus rejected play starts each fallback only once',async()=>{
 const h=harness();h.say('sleeping pill');const a=h.audio[0];a.onerror();a.reject(new Error('missing'));await Promise.resolve();assert.equal(h.audio.length,2);
 const b=h.audio[1];b.onerror();b.reject(new Error('network'));await Promise.resolve();assert.equal(h.spoken.length,1);assert.equal(h.spoken[0].text,'sleeping pill');
});
test('a cancelled request cannot start fallback or advance the new queue',async()=>{
 const h=harness();h.say(['old','old sentence']);const old=h.audio[0],ended=old.onended;h.say(['new','new sentence']);old.reject(new Error('late'));ended();await Promise.resolve();assert.equal(h.audio.length,2);h.audio[1].onended();assert.equal(h.audio.length,3);assert.match(h.audio[2].url,/new-sentence/);
});
test('successful audio advances the queue once even with a late failure',async()=>{
 const h=harness();h.say(['word','sentence']);const a=h.audio[0];a.onended();a.reject(new Error('late'));await Promise.resolve();assert.equal(h.audio.length,2);assert.equal(h.spoken.length,0);
});
