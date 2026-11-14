/* =====================================================
   V-ing／p.p. 判斷小遊戲（分詞頁 #/participles 裡）
   每題一個空格，兩個大按鈕：V-ing（主動／進行）或 p.p.（被動／已完成），點了馬上看解析。
   一局 10 題，可選「全部」或「只練 with + O + OC」。完成給 XP、每日一次罐罐（awardPractice）。
   純資料與判斷在上方，方便 node 測試；畫面在 vgRender。
   ===================================================== */
(function(root){
  const w = (s, ing, pp, a, zh, why, tag) => ({s, ing, pp, a, zh, why, tag});
  const BANK = [
    /* ---- with + O + V-ing：O 自己在做、同時發生 ---- */
    w("He ran away with the house ___ behind him.","collapsing","collapsed","ing","他逃跑時，房子正在他身後倒塌。","房子「正在」倒塌（主動、進行中）→ V-ing。","with"),
    w("She walked with her hair ___ in the wind.","blowing","blown","ing","她走著，頭髮隨風飄動。","頭髮自己在飄動（主動、同時發生）→ V-ing。","with"),
    w("She played in the park with her dog ___ beside her.","running","run","ing","她在公園玩，狗在旁邊跑。","狗自己在跑 → V-ing。","with"),
    w("We stayed inside with the rain ___ outside.","falling","fallen","ing","外面下著雨，我們待在室內。","雨正在下（進行中）→ V-ing。","with"),
    w("The teacher entered the classroom with the students ___ loudly.","talking","talked","ing","老師走進教室，學生們正大聲聊天。","學生自己在說話 → V-ing。","with"),
    w("The little girl fell asleep with tears ___ down her cheeks.","rolling","rolled","ing","小女孩睡著了，眼淚沿著臉頰滑落。","眼淚正在滑落 → V-ing。","with"),
    w("He stood there with his heart ___ wildly.","pounding","pounded","ing","他站在那裡，心狂跳著。","心臟自己在跳 → V-ing。","with"),
    w("She listened with her baby ___ in her arms.","sleeping","slept","ing","她聽著，寶寶在她懷裡睡著。","寶寶自己在睡（主動、進行中）→ V-ing。","with"),
    w("He ate dinner with the TV ___ in the background.","playing","played","ing","他吃晚餐，電視在背景播放著。","電視正在播（進行中）→ V-ing。","with"),
    w("They waited with the engine ___.","running","run","ing","他們等著，引擎開著。","引擎「運轉中」→ V-ing。","with"),
    w("He gave the speech with his knees ___.","shaking","shaken","ing","他發表演說，雙膝發抖。","膝蓋自己在抖 → V-ing。","with"),
    w("She smiled with the sun ___ on her face.","shining","shone","ing","她笑著，陽光照在臉上。","陽光正在照（進行中）→ V-ing。","with"),
    /* ---- with + O + p.p.：O 被…／呈現結果狀態 ---- */
    w("She sat quietly with her eyes ___.","closed","closing","pp","她閉著眼睛安靜地坐著。","眼睛是「被閉上」的狀態 → p.p.。","with"),
    w("He walked home with his phone ___.","broken","breaking","pp","他的手機壞了，走路回家。","手機是「壞掉」的結果狀態 → p.p.。","with"),
    w("He sat there with his arms ___.","crossed","crossing","pp","他雙臂交叉坐在那裡。","手臂是「被交叉」的狀態 → p.p.。","with"),
    w("She fell asleep with the lights ___ on.","turned","turning","pp","她開著燈睡著了。","燈是「被打開」的狀態 → p.p.。","with"),
    w("Don't talk with your mouth ___ with food.","filled","filling","pp","嘴裡塞滿食物時不要說話。","嘴巴是「被填滿」→ p.p.。","with"),
    w("He stood in the doorway with his hands ___ behind his back.","tied","tying","pp","他雙手被綁在背後站在門口。","手是「被綁住」→ p.p.。","with"),
    w("She came in with her face ___ with mud.","covered","covering","pp","她滿臉是泥地走進來。","臉是「被覆蓋」→ p.p.。","with"),
    w("He walked around with his coat ___ around him.","wrapped","wrapping","pp","他把外套裹在身上走來走去。","外套是「被裹住」→ p.p.。","with"),
    w("He went out with his shirt ___ wrongly.","buttoned","buttoning","pp","他襯衫釦子扣錯就出門了。","襯衫是「被扣上」（扣錯了）→ p.p.。","with"),
    w("She stood there with her mouth ___ in surprise.","opened","opening","pp","她驚訝得嘴巴張著站在那裡。","嘴巴是「被張開」的狀態 → p.p.。","with"),
    /* ---- 一般句型：進行式／被動／完成／感官／形容詞 ---- */
    w("Look! The leaves are ___ from the tree.","falling","fallen","ing","看！葉子正從樹上落下。","正在落下（進行中）→ V-ing。","gen"),
    w("The leaves have ___ from the tree.","falling","fallen","pp","葉子已經從樹上落下了。","have + p.p. 完成式，已經落下 → fallen。","gen"),
    w("The window is ___, so it's cold in here.","breaking","broken","pp","窗戶破了，所以這裡很冷。","窗戶「破了」是結果狀態 → p.p.。","gen"),
    w("The boy is ___ the window.","breaking","broken","ing","男孩正在打破窗戶。","男孩「正在」做動作（主動、進行）→ V-ing。","gen"),
    w("Someone is ___ the door.","opening","opened","ing","有人正在開門。","有人「正在」開（進行中）→ V-ing。","gen"),
    w("The door is ___.","closing","closed","pp","門關著。","門是「被關上」的狀態 → p.p.。","gen"),
    w("The workers are ___ the road.","repairing","repaired","ing","工人正在修路。","工人主動、正在修 → V-ing。","gen"),
    w("The road has been ___.","repairing","repaired","pp","路已經被修好了。","has been + p.p. 被動完成 → repaired。","gen"),
    w("I heard the baby ___ in the next room.","crying","cried","ing","我聽到隔壁房間的嬰兒在哭。","聽到「進行中」的哭聲 → V-ing。","gen"),
    w("I heard my name ___ in the crowd.","calling","called","pp","我聽到人群中有人叫我的名字。","名字是「被叫」→ p.p.。","gen"),
    w("The movie was so ___ that I almost fell asleep.","boring","bored","ing","電影太無聊，我差點睡著。","形容事物「令人…」→ -ing。","gen"),
    w("I was very ___ in class today.","boring","bored","pp","我今天上課覺得很無聊。","形容人「感到…」→ -ed。","gen"),
    w("I had my hair ___ yesterday.","cutting","cut","pp","我昨天去剪了頭髮。","have + O + p.p.：頭髮「被剪」→ p.p.。","gen"),
    w("He kept me ___ for an hour.","waiting","waited","ing","他讓我等了一個小時。","keep + O + V-ing：持續讓我在等 → V-ing。","gen"),
    w("The ___ leaves covered the ground.","falling","fallen","pp","落下的葉子鋪滿了地面。","已經落下的葉子 → fallen（完成）。","gen"),
    w("He found the door ___.","locking","locked","pp","他發現門被鎖住了。","門是「被鎖」的狀態 → p.p.。","gen")
  ];
  const BASE = {collapsing:"collapse",blowing:"blow",running:"run",falling:"fall",talking:"talk",rolling:"roll",pounding:"pound",sleeping:"sleep",playing:"play",shaking:"shake",shining:"shine",closed:"close",broken:"break",crossed:"cross",turned:"turn",filled:"fill",tied:"tie",covered:"cover",wrapped:"wrap",buttoned:"button",opened:"open",breaking:"break",opening:"open",repairing:"repair",crying:"cry",boring:"bore",cutting:"cut",waiting:"wait",locking:"lock",calling:"call",fallen:"fall",closing:"close"};
  BANK.forEach(q => { if(!/ing$/.test(q.ing) && /ing$/.test(q.pp)){ const t=q.ing; q.ing=q.pp; q.pp=t; }   /* 資料裡 V-ing 欄放到 p.p. 欄的，自動對調 */
    q.v = BASE[q.ing] || BASE[q.pp]; });
  const ROUND = 10;
  const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const pick = (mode, n) => shuffle(BANK.filter(q => mode==="with" ? q.tag==="with" : true)).slice(0, n||ROUND);
  const fillSentence = (q, form) => q.s.replace("___", `<b>${form}</b>`);
  const API = {BANK, pick, fillSentence, ROUND};
  if(typeof module === "object") module.exports = API;
  root.VingGame = API;
  if(typeof document === "undefined") return;

  let G = {mode:"all", items:[], i:0, right:0, answered:null, done:false, streak:0, best:0};
  const $box = () => document.getElementById("vgBox");
  function start(mode){ G = {mode:mode||G.mode, items:pick(mode||G.mode), i:0, right:0, answered:null, done:false, streak:0, best:0}; render(); }
  function answer(a){
    if(G.answered || G.done) return; const q = G.items[G.i];
    G.answered = a; if(a === q.a){ G.right++; G.streak++; G.best = Math.max(G.best, G.streak); } else G.streak = 0;
    render();
  }
  function next(){ if(G.i < G.items.length-1){ G.i++; G.answered = null; } else { G.done = true; } render(); }
  function finish(){
    const total = G.items.length, xp = G.right*2 + (G.right===total ? 6 : 0);
    let msg = `🎉 完成！＋${xp} XP`;
    if(!G.rewarded){
      G.rewarded = true;
      try{
        if(xp>0) store.addXP(xp);
        if(G.right/total >= 0.7){ const g = awardPractice("ving-game", PRACTICE_CANS);
          msg += g.n ? `　＋${g.n} 🥫` : g.capped ? "　（今日練習罐罐已達上限 🥫）" : "　（今日罐罐已領 🥫）"; }
      }catch(e){}
      G.msg = msg;
    }
    return G.msg;
  }
  function render(){
    const box = $box(); if(!box) return;
    const modes = `<div class="vg-modes"><button class="rg-opt ${G.mode==="all"?"correct":""}" onclick="VingGame.start('all')">全部題型</button><button class="rg-opt ${G.mode==="with"?"correct":""}" onclick="VingGame.start('with')">只練 with + O + OC</button></div>`;
    if(G.done){
      const t = G.items.length;
      box.innerHTML = `${modes}<div class="rg-q"><div class="rg-prompt"><span>答對 <b>${G.right} / ${t}</b>${G.right===t?"　完美！🏆":G.right>=t*0.7?"　不錯喔！🐾":"　再看一次判斷口訣"}　・最長連對 ${G.best}</span></div>
        <div class="rg-why" style="font-weight:700">${finish()}</div><button class="btn btn-navy" onclick="VingGame.start()">再玩一局 ▶</button></div>`;
      return;
    }
    const q = G.items[G.i], a = G.answered;
    const btn = (k, label, sub) => { let c = "rg-opt vg-btn"; if(a){ if(k===q.a) c += " correct"; else if(k===a) c += " wrong"; }
      return `<button class="${c}" ${a?"disabled":""} onclick="VingGame.answer('${k}')"><b>${label}</b><br><small>${sub}</small></button>`; };
    const fb = a ? `<div class="rg-why">${a===q.a?"✅ ":"💡 "}完整句子：${fillSentence(q, q[q.a])}<br>${q.zh}<br>${q.why}</div><button class="btn btn-navy" onclick="VingGame.next()">${G.i<G.items.length-1?"下一題 ›":"看結果"}</button>` : "";
    box.innerHTML = `${modes}<div class="rg-q"><div class="rg-prompt"><span class="rg-n">${G.i+1}/${G.items.length}</span><span>${q.s.replace("___","<b>＿＿＿</b>")}</span></div>
      <div class="tc-sub" style="margin:4px 0 8px">空格的動詞：<b>${q.v}</b> 　${G.streak>1?`🔥 連對 ${G.streak}`:""}</div>
      <div class="rg-opts vg-opts">${btn("ing","V-ing","主動／進行中")}${btn("pp","p.p.","被動／已完成的狀態")}</div>${fb}</div>
      <div class="rg-why" style="margin-top:8px">💡 口訣：①空格前的人事物是<b>自己在做</b>，還是<b>被做／呈現結果</b>？②動作<b>正在進行</b>，還是<b>已經完成</b>？</div>`;
  }
  root.VingGame.start = start; root.VingGame.answer = answer; root.VingGame.next = next; root.VingGame.render = render;
  root.VingGame.init = () => { G.items.length ? render() : start("all"); };
})(typeof window !== "undefined" ? window : globalThis);
