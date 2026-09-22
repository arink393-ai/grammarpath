/* Daily quests: source-inspired curriculum, authored exercises.
   Each day has THREE real question banks that differ by type AND sentence complexity:
     easy      → 選擇題 pick  · 簡單句（單一子句）
     core      → 填空題 fill  · 複合句（and / but / so / or 連接兩個子句）
     challenge → 打字填寫 type · 複合複雜句（含從屬子句與關係子句），完整打出答案
   Same grammar point each day, escalating difficulty. Add future weeks to DAILY_WEEKS. */
const DAILY_WEEKS = [{id:'2026-09-21', title:'貓咪島的日常冒險', days:[
 {date:'2026-09-21',title:'玩具找主人',topic:'所有格形容詞',level:'A1',icon:'🧶',cat:'calico',scene:'花娜 Hana（she）帶著毛線球；小歐 O（he）抱著小魚；小琥 Hu（it）守著紙箱。',rule:'my / your / his / her / its / our / their 放在名詞前，表示「誰的」。its 是所有格，it’s 則是 it is。',example:'This is Hana. Her tail is fluffy.',banks:{
  easy:[
   ['pick','Hana is a girl. This is ___ ball.',['her','his','its'],'her','Hana 用 she，所有格是 her。'],
   ['pick','O is a boy. This is ___ toy fish.',['her','his','my'],'his','O 用 he，所有格是 his。'],
   ['pick','Hu is a kitten. This is ___ box.',['it’s','its','your'],'its','it 的所有格是 its，不加撇號。'],
   ['pick','I have a hat. This is ___ hat.',['me','my','mine'],'my','I 的所有格是 my。']],
  core:[
   ['fill','Hana has a toy, and she keeps ___ toy in the basket.','her','Hana = she，所有格用 her；這是用 and 連接的複合句。'],
   ['fill','O is hungry, so I fill ___ bowl with fish.','his','O = he，所有格用 his。'],
   ['fill','The kitten is small, but ___ tail is very long.','its','it 的所有格是 its，不加撇號。'],
   ['fill','We love the cats, and they are ___ best friends.','our','we 的所有格是 our。']],
  challenge:[
   ['type','Because Hana trusts us, she lets us brush ___ fur, which makes her purr.（Hana）','her','從屬子句 Because… + 主句 + 關係子句 which…；Hana 用所有格 her。'],
   ['type','When O wakes up, he looks for ___ fish, which the staff hide in the garden.（O）','his','O 用所有格 his。'],
   ['type','Although Hu is tiny, it guards ___ box, which no other cat can enter.（Hu）','its','it 的所有格 its，無撇號。'],
   ['type','Since the cats live here, this island is ___ home, and we protect it together.（the cats）','their','the cats = they，所有格用 their。']]}},
 {date:'2026-09-22',title:'貓島守則分類站',topic:'祈使句',level:'A1',icon:'🪧',cat:'orange',scene:'幫小琥整理照顧貓咪的告示牌。肯定指令用原形動詞開頭；否定指令用 Don’t + 原形動詞。',rule:'肯定祈使句：原形動詞開頭。否定祈使句：Don’t + 原形動詞。',example:'Close the door. Don’t touch the cat’s tail.',banks:{
  easy:[
   ['pick','___ the door quietly.',['Close','Closes','Closing'],'Close','祈使句用原形動詞開頭。'],
   ['pick','___ touch the cat’s tail.',['No','Not','Don’t'],'Don’t','否定祈使句用 Don’t + 原形動詞。'],
   ['pick','Please ___ the water bowl every day.',['clean','cleans','cleaning'],'clean','祈使句用原形 clean。'],
   ['pick','___ shout near the kittens.',['Doesn’t','Not','Don’t'],'Don’t','否定祈使句用 Don’t。']],
  core:[
   ['fill','Feed the cats in the morning, and ___ the door when you leave.','close','兩個祈使句用 and 連接，第二句也用原形 close。'],
   ['fill','Be gentle, and don’t ___ the sleeping kitten.','wake','don’t 後面接原形 wake。'],
   ['fill','Give the cat some space, but ___ leave it alone all day.','don’t','語意是「別」整天不理牠，用 don’t。'],
   ['fill','Clean the bowl first, and then ___ it with fresh water.','fill','第二個指令用原形 fill。']],
  challenge:[
   ['type','When the kitten cries, pick it up gently, and ___ it close so that it feels safe.（動詞：抱）','hold','從屬子句 When… + 兩個祈使句；用原形 hold。'],
   ['type','If the cat scratches the sofa, don’t ___ at it; instead, give it a scratching post.（動詞：吼叫）','shout','don’t 後接原形 shout。'],
   ['type','Before you leave the room, check the window, and ___ the door so no cat escapes.（動詞：關）','close|lock','祈使句用原形 close（或 lock）。'],
   ['type','Because the cats sleep at noon, keep your voice low, and ___ turn on loud music.（別）','don’t','否定祈使用 Don’t/don’t。']]}},
 {date:'2026-09-23',title:'跟著貓咪找朋友',topic:'受格代名詞',level:'A1–A2',icon:'🐾',cat:'black',scene:'小歐跟著島民散步。動詞或介系詞後面，用受格代名詞取代重複的名字。',rule:'受格：I→me、you→you、he→him、she→her、it→it、we→us、they→them。',example:'The kitten follows me. I feed her.',banks:{
  easy:[
   ['pick','Hana is hungry. I feed ___.',['she','her','hers'],'her','feed 是動詞，後面用受格 her。'],
   ['pick','O is waiting. Please play with ___.',['he','his','him'],'him','介系詞 with 後用受格 him。'],
   ['pick','The cats are here. I can see ___.',['they','them','their'],'them','see 後面用受格 them。'],
   ['pick','I am here. The kitten looks at ___.',['I','me','my'],'me','介系詞 at 後用受格 me。']],
  core:[
   ['fill','Hana loves the ball, so I throw ___ to her.','it','the ball 是單數物品，用受格 it。'],
   ['fill','O and Hu are friends, and the children pet ___ every day.','them','O and Hu = they，受格用 them。'],
   ['fill','You are kind to the cats, and they follow ___ everywhere.','you','you 的受格還是 you。'],
   ['fill','We feed the kittens, so they trust ___.','us','we 的受格是 us。']],
  challenge:[
   ['type','When Hana meows at the door, open it for ___, because she wants to come inside.（Hana）','her','介系詞 for 後用受格 her。'],
   ['type','Although the kittens are shy, if you sit still, they will come to ___ on their own.（you）','you','you 的受格是 you。'],
   ['type','The staff clean the room while the cats watch ___ from the shelf, which they love.（the staff）','them','the staff = they，受格用 them。'],
   ['type','Since O trusts the vet, he stays calm while she examines ___, which keeps him safe.（O）','him','examines 後用受格 him。']]}},
 {date:'2026-09-24',title:'貓咪週末行事曆',topic:'be going to',level:'A2',icon:'🗓️',cat:'cow',scene:'週末計畫表：主詞 + am / is / are going to + 原形動詞，表示「已經計畫好的未來」。',rule:'I am / He-She-It is / We-You-They are going to + 原形動詞。',example:'We are going to take the cat to the vet.',banks:{
  easy:[
   ['pick','On Saturday, Hana ___ going to visit the vet.',['am','is','are'],'is','Hana 第三人稱單數，用 is。'],
   ['pick','We ___ going to buy cat food.',['am','is','are'],'are','we 用 are。'],
   ['pick','I ___ going to clean the room.',['am','is','are'],'am','I 用 am。'],
   ['pick','O and Hu ___ going to play in the garden.',['am','is','are'],'are','複數主詞用 are。']],
  core:[
   ['fill','Hana is tired, so she is going ___ sleep all afternoon.','to','be going + to + 原形。'],
   ['fill','I am going to clean the room, and then I ___ going to feed the cats.','am','I 搭配 am。'],
   ['fill','It is raining, so the cats are going to ___ inside today.（動詞：待）','stay','going to 後接原形 stay。'],
   ['fill','We are going to adopt a kitten, and we ___ going to name it Momo.','are','we 搭配 are。']],
  challenge:[
   ['type','Because the vet is coming tomorrow, Hana is going to ___ a check-up, which she does not enjoy.（動詞：接受/做）','have|get','going to 後接原形 have（或 get）。'],
   ['type','When the sun sets, the kittens are going to ___ in the garden, because that is when they are most active.（動詞：玩）','play','going to 後接原形 play。'],
   ['type','If the weather is nice, we are going to ___ the cats to the beach, which they have never seen.（動詞：帶）','take|bring','going to 後接原形 take（或 bring）。'],
   ['type','Although O is lazy today, he is going to ___ his fish later, since he never skips a meal.（動詞：吃）','eat','going to 後接原形 eat。']]}},
 {date:'2026-09-25',title:'貓咪動作觀察員',topic:'情態副詞',level:'A2',icon:'🔎',cat:'gray',scene:'觀察貓咪怎麼移動，用副詞描述動作。多數形容詞加 -ly；happy→happily；fast 不變；good→well。',rule:'副詞修飾動詞。quiet→quietly、careful→carefully、happy→happily、fast→fast、good→well。',example:'The shy cat walked quietly into the room.',banks:{
  easy:[
   ['pick','Hana walks ___.',['quiet','quietly','quieter'],'quietly','quiet + ly，修飾 walks。'],
   ['pick','O runs ___.',['fastly','fast','faster'],'fast','fast 本身就是副詞。'],
   ['pick','Hu jumps ___.',['careful','carefully','care'],'carefully','careful + ly。'],
   ['pick','Hana climbs ___.',['good','goodly','well'],'well','good 的副詞是 well。']],
  core:[
   ['fill','The room was noisy, but Hana walked ___ across it.（quiet）','quietly','quiet → quietly，修飾 walked。'],
   ['fill','O saw the ball, and he ran ___ to catch it.（fast → 副詞）','fast','fast 當副詞不加 -ly。'],
   ['fill','The shelf was high, so Hu jumped ___ onto it.（careful）','carefully','careful → carefully。'],
   ['fill','Hana practiced a lot, and now she climbs ___.（good → 副詞）','well','good 的副詞是 well。']],
  challenge:[
   ['type','Because the baby was sleeping, the cat moved ___ so that nobody woke up.（quiet）','quietly','quiet → quietly。'],
   ['type','When the door opened, O ran ___, although the wooden floor was slippery.（fast）','fast','fast 當副詞不變。'],
   ['type','Since the vase was fragile, Hu stepped ___ around it, which impressed everyone.（careful）','carefully','careful → carefully。'],
   ['type','Although Hana was nervous, she sang ___ at the show, which surprised the judges.（beautiful）','beautifully','beautiful → beautifully。']]}},
 {date:'2026-09-26',title:'貓咪願望泡泡',topic:'動名詞與不定詞',level:'A2–B1',icon:'💭',cat:'cream',scene:'enjoy / finish / keep 後接 V-ing；want / plan / decide / hope 後接 to + 原形動詞。',rule:'動詞 + V-ing：enjoy, finish, keep。動詞 + to + 原形：want, plan, decide, hope。',example:'Cats enjoy sleeping, but they want to play at night.',banks:{
  easy:[
   ['pick','Cats enjoy ___ in the sun.',['sleep','sleeping','to sleep'],'sleeping','enjoy 後接 V-ing。'],
   ['pick','Hu wants ___ with the ball.',['playing','play','to play'],'to play','want 後接 to + 原形。'],
   ['pick','We plan ___ a cat.',['adopting','to adopt','adopt'],'to adopt','plan 後接 to adopt。'],
   ['pick','O finished ___ his fish.',['eat','eating','to eat'],'eating','finish 後接 V-ing。']],
  core:[
   ['fill','Hana enjoys ___ on the sofa, but she wants to play at night.（nap）','napping','enjoy 後接 V-ing；nap 重複 p 加 -ing。'],
   ['fill','We decided ___ Hu, and we promised to love it forever.（adopt）','to adopt','decide 後接 to + 原形。'],
   ['fill','O keeps ___ under the bed, so we cannot find him.（hide）','hiding','keep 後接 V-ing；hide 去 e 加 -ing。'],
   ['fill','The kittens want ___ the garden, but the gate is closed.（explore）','to explore','want 後接 to + 原形。']],
  challenge:[
   ['type','Although Hana loves ___ , she agreed to go outside because the sun was warm.（sleep）','sleeping','love 後可接 V-ing。'],
   ['type','When the staff finished ___ the room, they decided to reward the cats, which purred happily.（clean）','cleaning','finish 後接 V-ing。'],
   ['type','Because O hopes ___ the island’s best hunter, he practices catching toys every day.（become）','to become','hope 後接 to + 原形。'],
   ['type','If the kittens keep ___ the curtains, we will need to train them, which takes patience.（climb）','climbing','keep 後接 V-ing。']]}},
 {date:'2026-09-27',title:'貓咪旅館的一天',topic:'現在式被動語態',level:'B1',icon:'🏡',cat:'orange',scene:'以「接受動作的對象」為主角：主詞 + am / is / are + 過去分詞。執行者不重要時可省略。',rule:'現在式被動：主詞 + is / are + 過去分詞（p.p.）。feed→fed、clean→cleaned、keep→kept。',example:'The cats are fed twice a day.',banks:{
  easy:[
   ['pick','The cats ___ fed twice a day.',['is','are','am'],'are','the cats 複數，用 are。'],
   ['pick','The room ___ cleaned every morning.',['is','are','be'],'is','the room 單數，用 is。'],
   ['pick','The bowls are ___ after every meal.',['wash','washing','washed'],'washed','被動用過去分詞 washed。'],
   ['pick','The door ___ closed at night.',['is','are','do'],'is','the door 單數，用 is。']],
  core:[
   ['fill','The cats are fed in the morning, and the water bowls are ___ at noon.（refill）','refilled','被動用過去分詞 refilled。'],
   ['fill','The room is cleaned daily, and the beds are ___ every week.（change）','changed','change 的過去分詞 changed。'],
   ['fill','The toys are collected at night, and they are ___ in a basket.（keep）','kept','keep 的過去分詞是 kept。'],
   ['fill','The sick cat is checked by the vet, and medicine ___ given to it.（be 動詞）','is','medicine 單數，用 is given。']],
  challenge:[
   ['type','Because the cats are loved by everyone, they ___ the best food, which comes from the market.（feed → 被動）','are fed','複數主詞：are + 過去分詞 fed。'],
   ['type','When a new kitten arrives, it ___ by the vet before it is allowed to meet the others.（check → 被動）','is checked','單數主詞：is + 過去分詞 checked。'],
   ['type','Although the room looks messy at night, it ___ every morning, so it always feels fresh.（clean → 被動）','is cleaned','is + 過去分詞 cleaned。'],
   ['type','Since the door is heavy, it ___ automatically, which keeps the cats safe indoors.（lock → 被動）','is locked','is + 過去分詞 locked。']]}}
]}];
let DQ = null;
/* Difficulty picks a whole different bank (type + sentence complexity), not a tweak. */
const DQ_TIER_LABEL = {easy:'🌱 簡單 Easy', core:'🐾 一般 Core', challenge:'🔥 挑戰 Challenge'};
const DQ_TIER_NOTE = {
 easy:'選擇題 · 簡單句 —— 三選一，先把句型看熟。',
 core:'填空題 · 複合句 —— 用 and / but / so 連接兩個子句，自己填入正確的字。',
 challenge:'打字填寫 · 複合複雜句 —— 句子含從屬子句與關係子句，完整打出答案。'};
const DQ_TYPE_LABEL = {pick:'選擇題', fill:'填空題', type:'打字填寫', sort:'分類', build:'句子拼拼樂'};
function dailyTierAuto(){ const xp=(store.data&&store.data.xp)||0; return xp>=250?'challenge':xp>=80?'core':'easy'; }
function dailyTier(){ const m=(store.data&&store.data.dailyDiff)||'auto'; return m==='auto'?dailyTierAuto():m; }
function dailySetDiff(m){ store.data.dailyDiff=m; store.save(); renderDaily(); }
function dailyBank(d){ const t=dailyTier(); return (d.banks&&d.banks[t])||(d.banks&&d.banks.easy)||[]; }
function dailyToday(now = new Date()) {
 const p = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 return ['year','month','day'].map(k=>p.find(x=>x.type===k).value).join('-');
}
function dailyWeek(){ const t=dailyToday(); return DAILY_WEEKS.filter(w=>w.id<=t).at(-1)||DAILY_WEEKS[0]; }
function dailyRecords(){ return store.data.dailyQuests || {}; }
function dailyStarted(rec){ return rec && rec.progress && Object.values(rec.progress).some(a=>a&&a.some(Boolean)); }
function dailyFeatured(){ const w=dailyWeek(),t=dailyToday(); return w.days.find(d=>d.date===t)||w.days.find(d=>!dailyRecords()[d.date]?.done)||w.days[0]; }
function dailyHomeCard(){ const d=dailyFeatured();return `<section class="dq-home card"><div><div class="eyebrow">DAILY CAT QUEST · 每天 5–10 分鐘</div><h2>每日任務 · ${d.title}</h2><p>${d.topic} · ${d.level}　陪貓咪玩一關，學會一個句型。</p></div><a class="btn btn-primary" href="#/daily">查看每日任務 →</a></section>`; }
function renderDaily(){
 DQ=null;const w=dailyWeek(),records=dailyRecords(),done=w.days.filter(d=>records[d.date]?.done).length,t=dailyToday();
 const diffMode=(store.data.dailyDiff)||'auto',tier=dailyTier(),xp=store.data.xp||0;
 const diffCard=`<section class="dq-diff card"><div class="dq-diff-head"><b>難易度 Difficulty</b><span>三種難度是完全不同的題型與句子，不只是換皮</span></div><div class="dq-diff-btns">${[['auto','⚙️ 自動 Auto'],['easy','🌱 簡單'],['core','🐾 一般'],['challenge','🔥 挑戰']].map(([k,l])=>`<button class="dq-diff-btn ${diffMode===k?'on':''}" onclick="dailySetDiff('${k}')">${l}</button>`).join('')}</div><p class="dq-diff-now">目前難度：<b>${DQ_TIER_LABEL[tier]}</b>${diffMode==='auto'?`（依你目前 ${xp} XP 自動判斷）`:''}<br><span class="dq-diff-desc">${DQ_TIER_NOTE[tier]}</span></p></section>`;
 app.innerHTML=`<div class="view dq"><a href="#/home">← 回到首頁</a><section class="dq-hero"><div><div class="eyebrow">DAILY CAT QUESTS / 01</div><h1 class="display">每天一小步，<br>陪貓咪探索英語島。</h1><p>七天、七個文法任務。從 A1 到 B1，先讀小提示，再依你的難度練習。</p><p class="dq-meta">${w.id.replaceAll('-', ' / ')} — ${w.days.at(-1).date.slice(5).replace('-', ' / ')} · 台灣時間每日中午建議練習</p><a class="btn btn-primary" href="#/daily/${dailyFeatured().date}">開始${t<w.id?'預習':'任務'}：${dailyFeatured().title} →</a></div><div class="dq-mascot">${catSVG(150,'calico')}<span>今天也一起進步，喵！</span></div></section><section class="dq-progress card"><div><b>本週探險足跡</b><span>${done} / 7 天完成</span></div><progress max="7" value="${done}" aria-label="本週任務完成進度"></progress><p>每關全部訂正後收集一枚貓掌，首次完成獲得 20 XP。進度隨本機帳號保存。</p></section>${diffCard}<div class="dq-heading"><h2>一週任務地圖 · ${esc(w.title)}</h2><span>可提前預習，也能隨時複習</span></div><div class="dq-grid">${w.days.map((d,i)=>`<a class="card dq-day ${d.date===t?'dq-today':''}" href="#/daily/${d.date}"><div class="dq-day-top"><span>DAY 0${i+1} · ${Number(d.date.slice(5,7))}/${Number(d.date.slice(8))} 週${'一二三四五六日'[i]}</span><b>${records[d.date]?.done?'🐾 已完成':d.date===t?'今日任務':d.date>t?'可預習':'可補做'}</b></div><span class="dq-icon" aria-hidden="true">${d.icon}</span><h3>${d.title}</h3><p>${d.topic}</p><div class="dq-day-bottom"><span>${d.level} · ${dailyBank(d).length} 題</span><span>${records[d.date]?.done?'再次練習':dailyStarted(records[d.date])?'繼續任務':'開始探索'} →</span></div></a>`).join('')}</div><p class="dq-source">改編自 <a href="https://chatgpt.com/share/6aafc1af-c410-83ee-afb5-e327a2efcb33" target="_blank" rel="noopener">英語貓咪島週企劃</a> 9/21–9/27；互動題目另行編寫。目前收錄此週，之後可新增週課表。</p></div>`;
}
function startDaily(date){
 const d=DAILY_WEEKS.flatMap(w=>w.days).find(d=>d.date===date);if(!d){renderDaily();return;}
 const tier=dailyTier(),bank=dailyBank(d),record=dailyRecords()[date];
 let answers=record?.done?[]:((record?.progress&&record.progress[tier])||[]).slice();
 if(answers.length!==bank.length) answers=[];
 DQ={d,tier,questions:bank,answers,index:0,tokens:[],selected:[],checked:false,owner:currentUser()?.email};
 DQ.index=DQ.questions.findIndex((q,i)=>!answers[i]);if(DQ.index<0){dailyFinish();return;}
 dailyQuestion();
}
function dailyQuestion(){
 if(!DQ)return;const {d,index}=DQ,q=DQ.questions[index];DQ.checked=false;DQ.selected=[];
 DQ.tokens=q[0]==='build'?shuffle(q[2].replace(/[.!?]$/,'').split(' ')):[];
 const choice=q[0]==='pick'||q[0]==='sort';
 const typing=q[0]==='fill'||q[0]==='type';
 const inputLabel=q[0]==='type'?'完整打出答案（可能不只一個字）':'填入空格中的英文';
 app.innerHTML=`<div class="view dq dq-play"><a href="#/daily">← 一週任務地圖</a><div class="dq-heading"><span>${d.date} · ${d.level} · ${DQ_TIER_LABEL[DQ.tier]}</span><span>第 ${index+1} / ${DQ.questions.length} 題</span></div><h1 class="display">${d.icon} ${d.title}</h1><section class="card dq-lesson"><div>${catSVG(72,d.cat)}</div><div><p>${esc(d.scene)}</p><b>${esc(d.rule)}</b><p lang="en">${esc(d.example)}</p></div></section><progress max="${DQ.questions.length}" value="${DQ.answers.filter(Boolean).length}" aria-label="本關已答對題數"></progress><section class="card dq-question"><div class="eyebrow">${DQ_TYPE_LABEL[q[0]]||''}</div><h2 id="dq-prompt" lang="en">${esc(q[1])}</h2><form id="dq-form">${choice?`<div class="dq-options">${shuffle(q[2]).map(a=>`<button class="dq-option" type="button" data-answer="${esc(a)}">${esc(a)}</button>`).join('')}</div>`:typing?`<label for="dq-input">${inputLabel}</label><input id="dq-input" lang="en" autocomplete="off" autocapitalize="off" spellcheck="false" required><button class="btn btn-primary" type="submit">檢查答案</button>`:`<p>依序點選字詞組句；點選上方字詞可放回。</p><div id="dq-built" class="dq-built" aria-label="已選句子"></div><div id="dq-words" class="dq-options"></div><button id="dq-check" class="btn btn-primary" type="submit" disabled>檢查句子</button>`}</form><div id="dq-feedback" role="status" tabindex="-1"></div><button id="dq-next" class="btn btn-primary" hidden> ${index===DQ.questions.length-1?'收集貓掌':'下一題'} →</button></section></div>`;
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
 const alts=String(answer).split('|').map(norm),correct=alts.includes(norm(value)),feedback=document.querySelector('#dq-feedback');
 feedback.className='dq-feedback '+(correct?'dq-correct':'dq-retry');
 feedback.textContent=correct?'✓ 答對了！'+explanation:'再試一次喵！'+(q[0]==='build'?DQ.d.rule:explanation);
 if(!correct){feedback.focus();return;}
 DQ.checked=true;DQ.answers[DQ.index]=true;
 store.data.dailyQuests=store.data.dailyQuests||{};
 const prev=store.data.dailyQuests[DQ.d.date]||{};
 const progress={...(prev.progress||{})};progress[DQ.tier]=DQ.answers.slice();
 store.data.dailyQuests[DQ.d.date]={...prev,progress};store.save();
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
 app.innerHTML=`<div class="view dq dq-result card">${catSVG(140,d.cat)}<div class="eyebrow">DAILY QUEST COMPLETE</div><h1 class="display">收集到一枚貓掌！🐾</h1><p>你已完成「${d.title}」${DQ_TIER_LABEL[DQ.tier]}的 ${d.questions?DQ.questions.length:''} 題挑戰與訂正。</p><strong>${first?'+20 XP · 首次完成獎勵':'複習完成 · 這關的獎勵已領取'}</strong><div class="dq-result-actions"><a class="btn btn-primary" href="#/daily">回到任務地圖</a>${next?`<a class="btn btn-ghost" href="#/daily/${next.date}">下一天：${next.title} →</a>`:''}<button class="btn btn-ghost" onclick="startDaily('${d.date}')">再練一次</button></div></div>`;
}
