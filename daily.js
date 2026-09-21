/* Daily quests: source-inspired curriculum, authored exercises. Add future weeks to DAILY_WEEKS. */
const DAILY_WEEKS = [{id:'2026-09-21', title:'貓咪島的日常冒險', days:[
 {date:'2026-09-21',title:'玩具找主人',topic:'所有格形容詞',level:'A1',icon:'🧶',cat:'calico',scene:'花娜 Hana（she）帶著毛線球；小歐 O（he）抱著小魚；小琥 Hu（it）守著紙箱。',rule:'my / your / his / her / its 放在名詞前，表示「誰的」。its 是所有格，it’s 則是 it is。',example:'This is Hana. Her tail is fluffy.',questions:[
 ['pick','Hana is a girl. This is ___ ball.',['her','his','its'],'her','Hana 用 she，所有格是 her。'],
 ['pick','O is a boy. This is ___ toy fish.',['her','his','my'],'his','O 用 he，所有格是 his。'],
 ['pick','Hu is a kitten. This is ___ box.',['it’s','its','your'],'its','it 的所有格是 its，不加撇號。'],
 ['fill','I have a cat. This is ___ cat.','my','I 的所有格是 my。'],
 ['fill','You have a toy. This is ___ toy.','your','you 的所有格是 your。']]},
 {date:'2026-09-22',title:'貓島守則分類站',topic:'祈使句',level:'A1',icon:'🪧',cat:'orange',scene:'幫小琥把照顧貓咪的告示牌，放進「Do 肯定指令」或「Don’t 否定指令」。',rule:'肯定祈使句用原形動詞開頭；否定祈使句用 Don’t + 原形動詞。',example:'Close the door. Don’t touch the cat’s tail.',questions:[
 ...[['Close the door.','Do'],['Don’t touch the cat’s tail.','Don’t'],['Give the cat some space.','Do'],['Don’t shout at the kitten.','Don’t'],['Clean the water bowl.','Do'],['Don’t wake the sleeping cat.','Don’t']].map(([s,a])=>['sort',s,['Do','Don’t'],a,a==='Do'?'原形動詞開頭，是肯定指令。':'Don’t + 原形動詞，是否定指令。'])]},
 {date:'2026-09-23',title:'跟著貓咪找朋友',topic:'受格代名詞',level:'A1–A2',icon:'🐾',cat:'black',scene:'小歐跟著島民散步。用受格代名詞取代重複的名字，讓句子更自然。',rule:'動詞或介系詞後用受格：I → me、he → him、she → her、we → us、they → them。',example:'The kitten follows me. I feed her.',questions:[
 ['pick','Hana is hungry. I feed ___.',['she','her','hers'],'her','feed 是動詞，後面用受格 her。'],
 ['pick','O is waiting. Please play with ___.',['he','his','him'],'him','介系詞 with 後面用受格 him。'],
 ['fill','The cats are here. I can see ___.','them','the cats 是複數，用 them。'],
 ['fill','We are walking. The kitten follows ___.','us','we 的受格是 us。'],
 ['fill','I am here. The kitten looks at ___.','me','介系詞 at 後用 I 的受格 me。']]},
 {date:'2026-09-24',title:'貓咪週末行事曆',topic:'be going to',level:'A2',icon:'🗓️',cat:'cow',scene:'週六：I → clean the room；Hana → visit the vet。週日：We → buy cat food；O and Hu → play in the garden。',rule:'已有計畫的未來：主詞 + am / is / are going to + 原形動詞。',example:'We are going to take the cat to the vet.',questions:[
 ['build','週六我要打掃房間。','I am going to clean the room.','I 搭配 am，going to 後接原形 clean。'],
 ['pick','On Saturday, Hana ___ going to visit the vet.',['am','is','are'],'is','Hana 是第三人稱單數，用 is。'],
 ['build','週日我們要買貓食。','We are going to buy cat food.','We 搭配 are，to 後接 buy。'],
 ['fill','O and Hu ___ going to play in the garden.','are','O and Hu 是複數主詞，用 are。']]},
 {date:'2026-09-25',title:'貓咪動作觀察員',topic:'情態副詞',level:'A2',icon:'🔎',cat:'gray',scene:'觀察花娜安靜地走路、小歐飛快奔跑、小琥小心跳躍，替牠們選出動作描述。',rule:'副詞描述動作。多數形容詞加 -ly；happy → happily；fast 不變；good → well。',example:'The shy cat walked quietly into the room.',questions:[
 ['fill','Hana walks ___ .（quiet → 副詞）','quietly','quiet + ly → quietly，修飾 walks。'],
 ['pick','O runs ___ .（fast → 副詞）',['fastly','fast','faster'],'fast','fast 本身就能當副詞，不用加 -ly。'],
 ['fill','Hu jumps ___ .（careful → 副詞）','carefully','careful + ly → carefully。'],
 ['fill','The kitten plays ___ .（happy → 副詞）','happily','子音 + y 結尾，y 改 i 再加 -ly。'],
 ['pick','Hana climbs ___ .（good → 副詞）',['good','goodly','well'],'well','good 的副詞是 well。']]},
 {date:'2026-09-26',title:'貓咪願望泡泡',topic:'動名詞與不定詞',level:'A2–B1',icon:'💭',cat:'cream',scene:'睡覺是享受，玩耍是願望。幫貓咪把動詞放進正確的想法泡泡。',rule:'enjoy / finish 後接 V-ing；want / plan / decide 後接 to + 原形動詞。',example:'Cats enjoy sleeping, but they want to play at night.',questions:[
 ['pick','Cats enjoy ___ in the sun.',['sleep','sleeping','to sleep'],'sleeping','enjoy 後接動名詞 sleeping。'],
 ['pick','Hu wants ___ with the ball.',['playing','play','to play'],'to play','want 後接 to + 原形動詞。'],
 ['pick','We plan ___ a cat.',['adopting','to adopt','adopt'],'to adopt','plan 後接 to adopt。'],
 ['fill','O enjoys ___ .（hide）','hiding','enjoy 後接 V-ing；hide 去 e 加 -ing。'],
 ['build','花娜想要吃東西。','Hana wants to eat.','第三人稱單數用 wants，後接 to eat。']]},
 {date:'2026-09-27',title:'貓咪旅館的一天',topic:'現在式被動語態',level:'B1',icon:'🏡',cat:'orange',scene:'早上餵貓 → 清洗碗盆 → 打掃房間 → 晚上關門。以接受動作的對象為主角，重寫旅館工作紀錄。',rule:'現在式被動：主詞 + am / is / are + 過去分詞。動作執行者可用 by 帶出，不重要時可省略。',example:'The cats are fed twice a day.',questions:[
 ['build','The staff feed the cats. → 以 The cats 開頭，省略執行者。','The cats are fed.','cats 是複數，用 are；feed 的過去分詞是 fed。'],
 ['build','The staff wash the bowls. → 以 The bowls 開頭。','The bowls are washed.','bowls 是複數，用 are washed。'],
 ['build','The staff clean the room. → 以 The room 開頭。','The room is cleaned.','room 是單數，用 is cleaned。'],
 ['build','The staff close the door. → 以 The door 開頭。','The door is closed.','door 是單數，用 is closed。']]}
]}];
let DQ = null;
/* Difficulty adapts to the student's XP (or a manual choice). The 'challenge'
   tier turns multiple-choice questions into type-the-answer for real rigour. */
const DQ_TIER_LABEL = {easy:'🌱 簡單 Easy', core:'🐾 一般 Core', challenge:'🔥 挑戰 Challenge'};
function dailyTierAuto(){ const xp=(store.data&&store.data.xp)||0; return xp>=250?'challenge':xp>=80?'core':'easy'; }
function dailyTier(){ const m=(store.data&&store.data.dailyDiff)||'auto'; return m==='auto'?dailyTierAuto():m; }
function dailySetDiff(m){ store.data.dailyDiff=m; store.save(); renderDaily(); }
function dailyPrep(q){
 const tier=dailyTier();
 if(tier==='challenge' && q[0]==='pick') return ['fill', q[1], q[3], q[4]];            // 選擇題 → 直接拼出答案
 if(tier==='easy' && q[0]==='pick' && q[2].length>2){ const ans=q[3], dis=q[2].find(o=>o!==ans); return ['pick', q[1], [ans, dis], ans, q[4]]; }  // 只留兩個選項
 return q;
}
function dailyToday(now = new Date()) {
 const p = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 return ['year','month','day'].map(k=>p.find(x=>x.type===k).value).join('-');
}
function dailyWeek(){ const t=dailyToday(); return DAILY_WEEKS.filter(w=>w.id<=t).at(-1)||DAILY_WEEKS[0]; }
function dailyRecords(){ return store.data.dailyQuests || {}; }
function dailyFeatured(){ const w=dailyWeek(),t=dailyToday(); return w.days.find(d=>d.date===t)||w.days.find(d=>!dailyRecords()[d.date]?.done)||w.days[0]; }
function dailyHomeCard(){ const d=dailyFeatured();return `<section class="dq-home card"><div><div class="eyebrow">DAILY CAT QUEST · 每天 5–10 分鐘</div><h2>每日任務 · ${d.title}</h2><p>${d.topic} · ${d.level}　陪貓咪玩一關，學會一個句型。</p></div><a class="btn btn-primary" href="#/daily">查看每日任務 →</a></section>`; }
function renderDaily(){
 DQ=null;const w=dailyWeek(),records=dailyRecords(),done=w.days.filter(d=>records[d.date]?.done).length,t=dailyToday();
 const diffMode=(store.data.dailyDiff)||'auto',tier=dailyTier(),xp=store.data.xp||0;
 const diffCard=`<section class="dq-diff card"><div class="dq-diff-head"><b>難易度 Difficulty</b><span>依你的程度自動調整，也可自己選</span></div><div class="dq-diff-btns">${[['auto','⚙️ 自動 Auto'],['easy','🌱 簡單'],['core','🐾 一般'],['challenge','🔥 挑戰']].map(([k,l])=>`<button class="dq-diff-btn ${diffMode===k?'on':''}" onclick="dailySetDiff('${k}')">${l}</button>`).join('')}</div><p class="dq-diff-now">目前難度：<b>${DQ_TIER_LABEL[tier]}</b>${diffMode==='auto'?`（依你目前 ${xp} XP 自動判斷）`:''}${tier==='challenge'?'　—　選擇題會變成「自己拼出答案」，更有挑戰！':tier==='easy'?'　—　選項精簡、提示清楚，先打好基礎。':''}</p></section>`;
 app.innerHTML=`<div class="view dq"><a href="#/home">← 回到首頁</a><section class="dq-hero"><div><div class="eyebrow">DAILY CAT QUESTS / 01</div><h1 class="display">每天一小步，<br>陪貓咪探索英語島。</h1><p>七天、七個文法任務。從 A1 到 B1，先讀小提示，再用遊戲練習。</p><p class="dq-meta">${w.id.replaceAll('-', ' / ')} — ${w.days.at(-1).date.slice(5).replace('-', ' / ')} · 台灣時間每日中午建議練習</p><a class="btn btn-primary" href="#/daily/${dailyFeatured().date}">開始${t<w.id?'預習':'任務'}：${dailyFeatured().title} →</a></div><div class="dq-mascot">${catSVG(150,'calico')}<span>今天也一起進步，喵！</span></div></section><section class="dq-progress card"><div><b>本週探險足跡</b><span>${done} / 7 天完成</span></div><progress max="7" value="${done}" aria-label="本週任務完成進度"></progress><p>每關全部訂正後收集一枚貓掌，首次完成獲得 20 XP。進度隨本機帳號保存。</p></section>${diffCard}<div class="dq-heading"><h2>一週任務地圖 · ${esc(w.title)}</h2><span>可提前預習，也能隨時複習</span></div><div class="dq-grid">${w.days.map((d,i)=>`<a class="card dq-day ${d.date===t?'dq-today':''}" href="#/daily/${d.date}"><div class="dq-day-top"><span>DAY 0${i+1} · ${Number(d.date.slice(5,7))}/${Number(d.date.slice(8))} 週${'一二三四五六日'[i]}</span><b>${records[d.date]?.done?'🐾 已完成':d.date===t?'今日任務':d.date>t?'可預習':'可補做'}</b></div><span class="dq-icon" aria-hidden="true">${d.icon}</span><h3>${d.title}</h3><p>${d.topic}</p><div class="dq-day-bottom"><span>${d.level} · ${d.questions.length} 題</span><span>${records[d.date]?.done?'再次練習':records[d.date]?.answers?.some(Boolean)?'繼續任務':'開始探索'} →</span></div></a>`).join('')}</div><p class="dq-source">改編自 <a href="https://chatgpt.com/share/6aafc1af-c410-83ee-afb5-e327a2efcb33" target="_blank" rel="noopener">英語貓咪島週企劃</a> 9/21–9/27；互動題目另行編寫。目前收錄此週，之後可新增週課表。</p></div>`;
}
function startDaily(date){
 const d=DAILY_WEEKS.flatMap(w=>w.days).find(d=>d.date===date);if(!d){renderDaily();return;}
 const saved=dailyRecords()[date];const answers=saved?.done?[]:(saved?.answers||[]).slice();
 DQ={d,questions:d.questions.map(dailyPrep),answers,index:0,tokens:[],selected:[],checked:false,owner:currentUser()?.email,tier:dailyTier()};
 DQ.index=DQ.questions.findIndex((q,i)=>!answers[i]);if(DQ.index<0){dailyFinish();return;}
 dailyQuestion();
}
function dailyQuestion(){
 if(!DQ)return;const {d,index}=DQ,q=DQ.questions[index];DQ.checked=false;DQ.selected=[];
 DQ.tokens=q[0]==='build'?shuffle(q[2].replace(/[.!?]$/,'').split(' ')):[];
 app.innerHTML=`<div class="view dq dq-play"><a href="#/daily">← 一週任務地圖</a><div class="dq-heading"><span>${d.date} · ${d.level} · ${DQ_TIER_LABEL[DQ.tier]}</span><span>第 ${index+1} / ${DQ.questions.length} 題</span></div><h1 class="display">${d.icon} ${d.title}</h1><section class="card dq-lesson"><div>${catSVG(72,d.cat)}</div><div><p>${esc(d.scene)}</p><b>${esc(d.rule)}</b><p lang="en">${esc(d.example)}</p></div></section><progress max="${DQ.questions.length}" value="${DQ.answers.filter(Boolean).length}" aria-label="本關已答對題數"></progress><section class="card dq-question"><div class="eyebrow">${{pick:'選詞挑戰',sort:'告示牌分類',fill:'文法練習',build:'句子拼拼樂'}[q[0]]}</div><h2 id="dq-prompt">${esc(q[1])}</h2><form id="dq-form">${q[0]==='pick'||q[0]==='sort'?`<div class="dq-options">${shuffle(q[2]).map(a=>`<button class="dq-option" type="button" data-answer="${esc(a)}">${esc(a)}</button>`).join('')}</div>`:q[0]==='fill'?'<label for="dq-input">填入空格中的英文</label><input id="dq-input" autocomplete="off" autocapitalize="off" spellcheck="false" required><button class="btn btn-primary" type="submit">檢查答案</button>':`<p>依序點選字詞組句；點選上方字詞可放回。</p><div id="dq-built" class="dq-built" aria-label="已選句子"></div><div id="dq-words" class="dq-options"></div><button id="dq-check" class="btn btn-primary" type="submit" disabled>檢查句子</button>`}</form><div id="dq-feedback" role="status" tabindex="-1"></div><button id="dq-next" class="btn btn-primary" hidden> ${index===DQ.questions.length-1?'收集貓掌':'下一題'} →</button></section></div>`;
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>dailyCheck(b.dataset.answer));
 document.querySelector('#dq-form').onsubmit=e=>{e.preventDefault();dailyCheck(q[0]==='build'?DQ.selected.map(i=>DQ.tokens[i]).join(' '):document.querySelector('#dq-input').value);};
 document.querySelector('#dq-next').onclick=()=>{if(!DQ.checked)return;DQ.index++;if(DQ.index>=DQ.questions.length)dailyFinish();else dailyQuestion();};
 if(q[0]==='build')dailyWords();
}
function dailyWords(){
 const chosen=document.querySelector('#dq-built'),bank=document.querySelector('#dq-words');
 chosen.innerHTML=DQ.selected.length?DQ.selected.map((i,pos)=>`<button type="button" class="dq-option" data-remove="${pos}" aria-label="放回 ${esc(DQ.tokens[i])}">${esc(DQ.tokens[i])}</button>`).join(''):'<span>你的句子會出現在這裡…</span>';
 bank.innerHTML=DQ.tokens.map((word,i)=>`<button type="button" class="dq-option" data-word="${i}" ${DQ.selected.includes(i)?'disabled':''}>${esc(word)}</button>`).join('');
 chosen.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{if(DQ.checked)return;DQ.selected.splice(Number(b.dataset.remove),1);dailyWords();});
 bank.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{if(DQ.checked)return;DQ.selected.push(Number(b.dataset.word));dailyWords();});
 document.querySelector('#dq-check').disabled=DQ.selected.length!==DQ.tokens.length;
}
function dailyCheck(value){
 if(!DQ||DQ.checked||currentUser()?.email!==DQ.owner)return;
 const q=DQ.questions[DQ.index],choice=q[0]==='pick'||q[0]==='sort',answer=q[choice?3:2],explanation=q[choice?4:3];
 if(!value.trim())return;
 const correct=norm(value)===norm(answer),feedback=document.querySelector('#dq-feedback');
 feedback.className='dq-feedback '+(correct?'dq-correct':'dq-retry');
 feedback.textContent=correct?'✓ 答對了！'+explanation:'再試一次喵！'+(q[0]==='build'?DQ.d.rule:explanation);
 if(!correct){feedback.focus();return;}
 DQ.checked=true;DQ.answers[DQ.index]=true;
 store.data.dailyQuests=store.data.dailyQuests||{};
 const prev=store.data.dailyQuests[DQ.d.date]||{};
 store.data.dailyQuests[DQ.d.date]={...prev,answers:DQ.answers.slice()};store.save();
 document.querySelectorAll('#dq-form button, #dq-form input').forEach(el=>el.disabled=true);
 document.querySelector('#dq-next').hidden=false;document.querySelector('#dq-next').focus();
}
function dailyFinish(){
 if(!DQ||currentUser()?.email!==DQ.owner||!DQ.questions.every((q,i)=>DQ.answers[i]))return;
 const d=DQ.d,record=store.data.dailyQuests[d.date],first=!record.done;
 record.done=true;record.completedAt=record.completedAt||new Date().toISOString();
 if(first)store.data.xp+=20;
 store.save();store.touchStreak();paintHeader();
 const next=DAILY_WEEKS.flatMap(w=>w.days).find(x=>x.date>d.date);
 app.innerHTML=`<div class="view dq dq-result card">${catSVG(140,d.cat)}<div class="eyebrow">DAILY QUEST COMPLETE</div><h1 class="display">收集到一枚貓掌！🐾</h1><p>你已完成「${d.title}」的 ${d.questions.length} 題挑戰與訂正。</p><strong>${first?'+20 XP · 首次完成獎勵':'複習完成 · 這關的獎勵已領取'}</strong><div class="dq-result-actions"><a class="btn btn-primary" href="#/daily">回到任務地圖</a>${next?`<a class="btn btn-ghost" href="#/daily/${next.date}">下一天：${next.title} →</a>`:''}<button class="btn btn-ghost" onclick="startDaily('${d.date}')">再練一次</button></div></div>`;
}
