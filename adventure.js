/* 🗺️ 小冒險 Mini-Adventures — short, varied stages for young learners.
   One stage ≈ 5 minutes = 4 rooms of 60–90 s (never the same kind of activity twice in a row)
   + a treasure chest. No timers, no typing; a wrong tap gives a hint and another try.
   World 1 "ABC 字母島" reuses the phonics data in index.html: ABC_PH (5 words + emoji per
   letter), ABC_WORD_ZH (Chinese), and the Kokoro MP3s played by phSpeak(). Speech checking
   uses the existing `sr` recognizer when the browser has one, else a self-check button.
   World 2 "Be 動詞森林" builds am/is/are sentences from small subject × feeling / animal tables
   (BE_SUBJ, BE_FEEL, BE_ANIMAL); its sentences have Kokoro MP3s in ADV_AUDIO
   (tools/gen_adv_audio.mjs renders them and rewrites the manifest below). World 3 "動作小鎮" does the
   same for present-simple verbs (VB_EASY / VB_ES × subjects) and adds a "is the cat right?" room.
   World 4 "位置小屋" (prepositions + There is/are) draws little scenes (plScene: SVG box / table / tree +
   emoji animals layered in front of or behind them) and adds a "tap where the animal goes" room.
   World 5 "遊樂園" (present continuous, VB_ING) adds the 📸 Freeze room: a 📸 now / 📅 every day tag decides
   between "is swimming" and "swims".
   World 6 "超能力學院" (can / can't / Can you…?, CN_ACT) draws a ✓ / ✗ ability badge on each picture and adds
   the 🙋 Answer room: the cat asks "Can he swim?" and the child picks the short answer. Its two traps are
   the other polarity and either the you → I slip ("Yes, you can.") or the World 3 habit ("Yes, he does.").
   World 7 "背包營地" (have / has / Do you have…?, HV_THING) adds the 🎒 Pack room: a sentence names what someone has
   ("I have a cap. She has a ball and a kite.") and the child taps only the owner's things from a tray of six. Its traps
   are the other person's thing and things nobody said; the 🧩 room drills have / has / haves, I am have, Do / Does and
   "Does she have" (not has). Each item's pack sentence is fixed (hvPack) so it can have Kokoro audio in item.say.
   World 8 "指指看市集" (this / that / these / those, DM_THING) tags every picture 👇 近 / 👉 遠 (far things drawn smaller) and adds
   the 👉 Point room: a little market scene with a near row (big) and a far row (small) — one / many of a thing in each — and the
   child taps the group the sentence means. Its traps are the same things at the other distance (this ↔ that), the other
   count (This is a cat ↔ These are cats) and a different thing; the 🧩 room drills the four words, is / are and "These are cat".
   Progress: store.data.adv = {stages:{<id>:{stars,at}}, day:{d,n}}. Loaded before the main
   script; everything here is only called after the page has booted. */
const ADV_WORLDS = [
 {id:"w1", kind:"abc", title:"ABC 字母島", en:"Alphabet Island", sub:"認識字母和它們的聲音", emoji:"🔤", stages:[
  {id:"w1s1", letters:"ABCDE", icon:"🍎"},
  {id:"w1s2", letters:"FGHIJ", icon:"🐟"},
  {id:"w1s3", letters:"KLMNO", icon:"🦁"},
  {id:"w1s4", letters:"PQRST", icon:"🐷"},
  {id:"w1s5", letters:"UVWXYZ", icon:"🦓"}]},
 {id:"w2", kind:"be", title:"Be 動詞森林", en:"Be-Verb Forest", sub:"am、is、are 要跟誰在一起？", emoji:"🌳",
  note:"會唸字母了？也可以直接從這裡開始 🐾", stages:[
  {id:"w2s1", label:"I am · You are", icon:"🙋", subj:["I","you"], kind:"feel",
   tip:"I（我）一定配 am；you（你）配 are。"},
  {id:"w2s2", label:"He is · She is", icon:"👧", subj:["he","she"], kind:"feel",
   tip:"一個人——he（他）、she（她）——都用 is。"},
  {id:"w2s3", label:"It is · They are", icon:"🐶", subj:["it","they"], kind:"animal",
   tip:"一隻用 is：It is a dog.　很多隻用 are，動物後面加 s：They are dogs."},
  {id:"w2s4", label:"We are · They are", icon:"🙌", subj:["we","they"], kind:"feel",
   tip:"兩個人以上——we（我們）、they（他們）——都用 are。"},
  {id:"w2s5", label:"am · is · are", icon:"🦉", subj:["I","you","he","she","it","we","they"], kind:"mix", boss:true,
   tip:"森林大魔王：全部混在一起！先看清楚主角是誰，再選 am、is、are。"}]},
 {id:"w3", kind:"verb", title:"動作小鎮", en:"Action Town", sub:"他、她做動作，動詞要加 s！", emoji:"🏘️", stages:[
  {id:"w3s1", label:"I · You + 動作", icon:"🏃", subj:["I","you"], verbs:"easy",
   tip:"I（我）、you（你）做動作：動詞用原本的樣子——I swim. You run."},
  {id:"w3s2", label:"He · She + s", icon:"🏊", subj:["he","she"], verbs:"easy",
   tip:"一個人——he（他）、she（她）——做動作，動詞後面要加 s：He swims. She sings."},
  {id:"w3s3", label:"es · ies", icon:"📺", subj:["he","she"], verbs:"es",
   tip:"字尾是 ch、sh、o → 加 es：watches、washes、goes。子音 + y → 去掉 y 加 ies：flies、studies。"},
  {id:"w3s4", label:"We · They 不加 s", icon:"💃", subj:["we","they","he","she"], verbs:"easy",
   tip:"兩個人以上——we（我們）、they（他們）——不加 s：They dance. 一個人才加 s：She dances."},
  {id:"w3s5", label:"加不加 s", icon:"🐲", subj:["I","you","he","she","we","they"], verbs:"all", boss:true,
   tip:"小鎮大魔王：全部混在一起！主角是 he、she 才加 s（或 es、ies）。"}]},
 {id:"w4", kind:"place", title:"位置小屋", en:"Where's the Cat?", sub:"in、on、under… 動物躲在哪裡？", emoji:"🏠", stages:[
  {id:"w4s1", label:"in · on", icon:"📦", preps:["in","on"],
   tip:"in 是「在…裡面」，on 是「在…上面」：The cat is in the box. The dog is on the table."},
  {id:"w4s2", label:"under · next to", icon:"🪑", preps:["under","next to"],
   tip:"under 是「在…下面」，next to 是「在…旁邊」（兩個字一起用！）"},
  {id:"w4s3", label:"behind · in front of", icon:"🌳", preps:["behind","in front of"],
   tip:"behind 是「在…後面」（被擋住一點點）；in front of 是「在…前面」（三個字一起用！）"},
  {id:"w4s4", label:"There is · There are", icon:"🔢", preps:["in","on","under","next to"], there:true,
   tip:"「有…」：一隻用 There is a cat…；兩隻以上用 There are two cats…（動物加 s）"},
  {id:"w4s5", label:"在哪裡？", icon:"🦊", preps:["in","on","under","next to","behind","in front of"], there:"mix", boss:true,
   tip:"小屋大魔王：全部混在一起！看清楚動物在哪裡、有幾隻。"}]},
 {id:"w5", kind:"prog", title:"遊樂園", en:"Fun Park", sub:"正在做什麼？am / is / are + 動詞ing", emoji:"🎡", stages:[
  {id:"w5s1", label:"I am · You are + ing", icon:"🎠", subj:["I","you"], verbs:"add", learn:"subj",
   tip:"「正在」做一件事：I am + 動詞ing、You are + 動詞ing——I am singing. You are reading."},
  {id:"w5s2", label:"He is · She is + ing", icon:"🎢", subj:["he","she"], verbs:"add", learn:"subj",
   tip:"他、她「正在」做：He is + 動詞ing——She is cooking. 別忘了 is！"},
  {id:"w5s3", label:"ing 怎麼拼", icon:"✂️", subj:["he","she","they"], verbs:"spell", learn:"spell",
   tip:"大部分直接加 ing（sing → singing）；短短的字尾「母音＋子音」要重複最後一個字母（run → running）；字尾是 e 就去掉 e（dance → dancing）。"},
  {id:"w5s4", label:"now · every day", icon:"⏰", subj:["he","she","we","they"], verbs:"all", tense:true, learn:"tense",
   tip:"📸 now（現在正在做）→ is / are + ing：He is swimming now.　📅 every day（每天都做）→ 世界 3 的樣子：He swims every day."},
  {id:"w5s5", label:"ing 大魔王", icon:"🎪", subj:["I","you","he","she","we","they"], verbs:"all", tense:true, learn:"tense", boss:true,
   tip:"遊樂園大魔王：全部混在一起！先看 now 還是 every day，再看主角是誰。"}]},
 {id:"w6", kind:"can", title:"超能力學院", en:"Super Skills", sub:"會不會？can / can't · Can you…?", emoji:"🦸", stages:[
  {id:"w6s1", label:"I can · You can", icon:"🦸", subj:["I","you"], modes:["s"], focus:"verb", learn:"verb",
   tip:"can（會）後面接「動詞原形」：I can swim. You can sing.　被問 Can you…? 要用 I 回答：Yes, I can."},
  {id:"w6s2", label:"He can · She can", icon:"🧚", subj:["he","she"], modes:["s"], focus:"verb", learn:"verb",
   tip:"he、she 用 can，動詞也不加 s！He can swim.（不是 He cans swims）　回答：Yes, he can."},
  {id:"w6s3", label:"can · can't", icon:"🙅", subj:["I","you","he","she"], modes:["s"], neg:true, focus:"modal", learn:"neg",
   tip:"✓ 會 → can；✗ 不會 → can't（= cannot）。can't 後面一樣接原形：She can't skate."},
  {id:"w6s4", label:"Can you…?", icon:"🙋", subj:["you","he","she","they"], modes:["q"], neg:true, focus:"q", learn:"q",
   tip:"問「會不會」：Can + 誰 + 動詞原形？　回答：Yes, he can. / No, he can't.（問 you，要用 I 回答）"},
  {id:"w6s5", label:"can 大魔王", icon:"🦹", subj:["I","you","he","she","we","they"], modes:["s","q"], neg:true, focus:"mix", learn:"mix", boss:true,
   tip:"學院大魔王：全部混在一起！看 ✓ ✗ 決定 can 還是 can't；有問號就用 Yes / No 回答。"}]},
 {id:"w7", kind:"have", title:"背包營地", en:"Pack Your Bag", sub:"誰有什麼？have / has · Do you have…?", emoji:"🎒", stages:[
  {id:"w7s1", label:"I have · You have", icon:"🎒", subj:["I","you"], modes:["s"], focus:"verb", learn:"verb", pack:1,
   tip:"「有」東西：I（我）、you（你）用 have——I have a ball. You have a kite.　不要說 I am have！"},
  {id:"w7s2", label:"He has · She has", icon:"👧", subj:["he","she"], modes:["s"], focus:"verb", learn:"verb", pack:1,
   tip:"he（他）、she（她）要用 has——She has a book.　has 是特別的字，不是 haves！"},
  {id:"w7s3", label:"have · has", icon:"🧢", subj:["I","you","he","she","we","they"], modes:["s"], focus:"verb", learn:"verb", pack:2,
   tip:"一個人 he、she → has；I、you、we、they → have：We have a kite. He has a ball."},
  {id:"w7s4", label:"Do you have…?", icon:"🙋", subj:["you","he","she","they"], modes:["q"], neg:true, focus:"q", learn:"q", pack:2,
   tip:"問「有沒有」：Do you have a cap? → Yes, I do. / No, I don't.　he、she 用 Does，後面還是 have：Does she have a cap? → Yes, she does."},
  {id:"w7s5", label:"have 大魔王", icon:"🐻", subj:["I","you","he","she","we","they"], modes:["s","q"], neg:true, focus:"mix", learn:"mix", pack:3, boss:true,
   tip:"營地大魔王：全部混在一起！he、she 用 has；問問題用 Do / Does，Does 後面要用 have。"}]},
 {id:"w8", kind:"this", title:"指指看市集", en:"Point & Say Market", sub:"近的？遠的？this / that / these / those", emoji:"👉", stages:[
  {id:"w8s1", label:"this · that", icon:"👇", nums:[1], focus:"dem", learn:"one",
   tip:"一個東西：近的（在你身邊 👇）用 this，遠的（在那邊 👉）用 that——This is a cat. That is a dog."},
  {id:"w8s2", label:"these · those", icon:"📚", nums:[2], focus:"dem", learn:"many",
   tip:"很多個東西：近的用 these，遠的用 those，後面用 are，東西要加 s——These are balls. Those are birds."},
  {id:"w8s3", label:"is · are", icon:"🧺", nums:[1,2], focus:"agree", learn:"agree",
   tip:"this、that（一個）配 is a…；these、those（很多個）配 are …s。不要說 These is 或 This are！"},
  {id:"w8s4", label:"近近遠遠", icon:"🔭", nums:[1,2], focus:"dem", learn:"all",
   tip:"先看近還是遠，再數一個還是很多個：this（近・一個）、that（遠・一個）、these（近・很多）、those（遠・很多）。"},
  {id:"w8s5", label:"指指大魔王", icon:"🦜", nums:[1,2], focus:"mix", learn:"all", boss:true,
   tip:"市集大魔王：全部混在一起！近 → this / these，遠 → that / those；一個用 is，很多個用 are。"}]}
];
/*ADV_AUDIO_START*/const ADV_AUDIO={"I am happy.":"audio/adv/a_a85a5e31ada1.mp3","I am sad.":"audio/adv/a_ad010de98ce1.mp3","I am hungry.":"audio/adv/a_f20f9c38780c.mp3","I am sleepy.":"audio/adv/a_e7ef9e7a6778.mp3","I am hot.":"audio/adv/a_9c34429fa1bd.mp3","I am cold.":"audio/adv/a_429360649df6.mp3","I am angry.":"audio/adv/a_826017315c79.mp3","I am sick.":"audio/adv/a_b825a638fc72.mp3","You are happy.":"audio/adv/a_3755df596d0d.mp3","You are sad.":"audio/adv/a_46b518e37532.mp3","You are hungry.":"audio/adv/a_658a98b1b9fd.mp3","You are sleepy.":"audio/adv/a_9dacde09c6df.mp3","You are hot.":"audio/adv/a_c01f26e13c30.mp3","You are cold.":"audio/adv/a_bf0d90a42a25.mp3","You are angry.":"audio/adv/a_6a6c6b4f7d03.mp3","You are sick.":"audio/adv/a_76de963f1e41.mp3","He is happy.":"audio/adv/a_3c0d84017aa7.mp3","He is sad.":"audio/adv/a_f6dc18458732.mp3","He is hungry.":"audio/adv/a_a623704685ee.mp3","He is sleepy.":"audio/adv/a_2c1f43776814.mp3","He is hot.":"audio/adv/a_35b36f973f22.mp3","He is cold.":"audio/adv/a_73788d970df6.mp3","He is angry.":"audio/adv/a_c28793426a13.mp3","He is sick.":"audio/adv/a_a18940de3c33.mp3","She is happy.":"audio/adv/a_39196cd583b7.mp3","She is sad.":"audio/adv/a_85d1b9a6ee68.mp3","She is hungry.":"audio/adv/a_57747d138474.mp3","She is sleepy.":"audio/adv/a_0113bc32ce02.mp3","She is hot.":"audio/adv/a_8a78ec572358.mp3","She is cold.":"audio/adv/a_3c11b2b10448.mp3","She is angry.":"audio/adv/a_b9ff75381932.mp3","She is sick.":"audio/adv/a_2674c05d99f3.mp3","It is a dog.":"audio/adv/a_4803ad338863.mp3","They are dogs.":"audio/adv/a_0bbe01b727cb.mp3","It is a cat.":"audio/adv/a_94361c485925.mp3","They are cats.":"audio/adv/a_da3fe27c4ab4.mp3","It is a bird.":"audio/adv/a_33f853ee07f6.mp3","They are birds.":"audio/adv/a_27047a859f5c.mp3","It is a rabbit.":"audio/adv/a_feaf01cac562.mp3","They are rabbits.":"audio/adv/a_ba57d591eefe.mp3","It is a frog.":"audio/adv/a_70c432be5e61.mp3","They are frogs.":"audio/adv/a_9d112913c03b.mp3","It is a duck.":"audio/adv/a_78d8b8a581ab.mp3","They are ducks.":"audio/adv/a_92e5605370f6.mp3","We are happy.":"audio/adv/a_3642390e7b23.mp3","We are sad.":"audio/adv/a_b04765f9e33e.mp3","We are hungry.":"audio/adv/a_a46fa74ab81c.mp3","We are sleepy.":"audio/adv/a_32a1c2ba6cb8.mp3","We are hot.":"audio/adv/a_56691cd16786.mp3","We are cold.":"audio/adv/a_532254122d9e.mp3","We are angry.":"audio/adv/a_2707f70ba826.mp3","We are sick.":"audio/adv/a_2535806879e9.mp3","They are happy.":"audio/adv/a_51ee05b71de3.mp3","They are sad.":"audio/adv/a_a39f59e1dfb2.mp3","They are hungry.":"audio/adv/a_3884bb1e6a39.mp3","They are sleepy.":"audio/adv/a_085b969b028c.mp3","They are hot.":"audio/adv/a_d8283390293a.mp3","They are cold.":"audio/adv/a_dfd31ab8e713.mp3","They are angry.":"audio/adv/a_da392c126574.mp3","They are sick.":"audio/adv/a_b1c59711c454.mp3","I run.":"audio/adv/a_0de8919f4889.mp3","I swim.":"audio/adv/a_f93e4a1ee9c9.mp3","I sing.":"audio/adv/a_f2cea30ba86b.mp3","I dance.":"audio/adv/a_ae97c949ac28.mp3","I read.":"audio/adv/a_b519f67bba90.mp3","I cook.":"audio/adv/a_583884d50afd.mp3","I draw.":"audio/adv/a_c93a036931ea.mp3","I walk.":"audio/adv/a_2287d5387075.mp3","You run.":"audio/adv/a_27b4bd15eac2.mp3","You swim.":"audio/adv/a_05d0fd37de48.mp3","You sing.":"audio/adv/a_cbbd9894e938.mp3","You dance.":"audio/adv/a_5f38b3b1fb4a.mp3","You read.":"audio/adv/a_03c807e97ccb.mp3","You cook.":"audio/adv/a_02dac1679343.mp3","You draw.":"audio/adv/a_16cc8f2fb92e.mp3","You walk.":"audio/adv/a_1b75bad13dcb.mp3","He runs.":"audio/adv/a_66ac6ea453a5.mp3","He swims.":"audio/adv/a_842fc0a3374a.mp3","He sings.":"audio/adv/a_1e903c5f288b.mp3","He dances.":"audio/adv/a_0bce6fa305aa.mp3","He reads.":"audio/adv/a_472b813f7ab7.mp3","He cooks.":"audio/adv/a_98e918ecbeb2.mp3","He draws.":"audio/adv/a_0380dcf2fa9d.mp3","He walks.":"audio/adv/a_3a0f7b37800b.mp3","She runs.":"audio/adv/a_1b0f71d0bc3f.mp3","She swims.":"audio/adv/a_e96bdfd5c35a.mp3","She sings.":"audio/adv/a_5c09cdda2c84.mp3","She dances.":"audio/adv/a_7ea42ca0bf69.mp3","She reads.":"audio/adv/a_921b601830f9.mp3","She cooks.":"audio/adv/a_6e2982084131.mp3","She draws.":"audio/adv/a_ebef0dc995e7.mp3","She walks.":"audio/adv/a_a501b2a6bdde.mp3","He watches TV.":"audio/adv/a_0a414d2d7f87.mp3","He goes to school.":"audio/adv/a_94128ff0e0cb.mp3","He washes the dishes.":"audio/adv/a_1e3fe9661aee.mp3","He catches the ball.":"audio/adv/a_d36a6cbea77b.mp3","He does homework.":"audio/adv/a_e2d2f1424bab.mp3","He flies a kite.":"audio/adv/a_cc64e88297e6.mp3","He studies English.":"audio/adv/a_2863d3b88b32.mp3","He cries.":"audio/adv/a_ff48304cc292.mp3","She watches TV.":"audio/adv/a_6418587e75a6.mp3","She goes to school.":"audio/adv/a_23790b6c786e.mp3","She washes the dishes.":"audio/adv/a_587a24a2c338.mp3","She catches the ball.":"audio/adv/a_e9991dd1e8e1.mp3","She does homework.":"audio/adv/a_ca4ebc911356.mp3","She flies a kite.":"audio/adv/a_b91de462a5b6.mp3","She studies English.":"audio/adv/a_192d74a96b9b.mp3","She cries.":"audio/adv/a_0202835244a1.mp3","We run.":"audio/adv/a_af144a16259d.mp3","We swim.":"audio/adv/a_a0344d60b708.mp3","We sing.":"audio/adv/a_891aaa17ae7a.mp3","We dance.":"audio/adv/a_bb6d6ee21a43.mp3","We read.":"audio/adv/a_7813cc9a085c.mp3","We cook.":"audio/adv/a_a5ad99f4a683.mp3","We draw.":"audio/adv/a_d593cf84a250.mp3","We walk.":"audio/adv/a_0a1d335447b7.mp3","They run.":"audio/adv/a_46bb87314d2a.mp3","They swim.":"audio/adv/a_80a6706dda7c.mp3","They sing.":"audio/adv/a_5b0aa117ba86.mp3","They dance.":"audio/adv/a_a47e51953a1e.mp3","They read.":"audio/adv/a_60e0baed2999.mp3","They cook.":"audio/adv/a_3db275560d6d.mp3","They draw.":"audio/adv/a_a3e247b2b4c3.mp3","They walk.":"audio/adv/a_15f33b0ec402.mp3","I watch TV.":"audio/adv/a_cbfd344be4d7.mp3","I go to school.":"audio/adv/a_71312fc6f0f7.mp3","I wash the dishes.":"audio/adv/a_c5a8f117d14f.mp3","I catch the ball.":"audio/adv/a_29e6ab50af45.mp3","I do homework.":"audio/adv/a_e7036095f972.mp3","I fly a kite.":"audio/adv/a_3fff38278316.mp3","I study English.":"audio/adv/a_5cd3a04f91e1.mp3","I cry.":"audio/adv/a_aa68c21a2402.mp3","You watch TV.":"audio/adv/a_66d7d50d0afd.mp3","You go to school.":"audio/adv/a_d7c5169c6310.mp3","You wash the dishes.":"audio/adv/a_b6efca0c7e85.mp3","You catch the ball.":"audio/adv/a_d9bd8f370fea.mp3","You do homework.":"audio/adv/a_14508b66e232.mp3","You fly a kite.":"audio/adv/a_d2a9e17907ed.mp3","You study English.":"audio/adv/a_194a9f12423e.mp3","You cry.":"audio/adv/a_708808d9cb27.mp3","We watch TV.":"audio/adv/a_08c49953f6bd.mp3","We go to school.":"audio/adv/a_0f1e4f7e1e0e.mp3","We wash the dishes.":"audio/adv/a_2fa939517716.mp3","We catch the ball.":"audio/adv/a_5459337f3b5b.mp3","We do homework.":"audio/adv/a_e2f0de2fec78.mp3","We fly a kite.":"audio/adv/a_c721c7784f70.mp3","We study English.":"audio/adv/a_d214f6405e6b.mp3","We cry.":"audio/adv/a_009e2deae59e.mp3","They watch TV.":"audio/adv/a_a8a3efb8ab22.mp3","They go to school.":"audio/adv/a_1c22f9f1625b.mp3","They wash the dishes.":"audio/adv/a_65827262f7e9.mp3","They catch the ball.":"audio/adv/a_3aa5a8ea591e.mp3","They do homework.":"audio/adv/a_82f81be01bd0.mp3","They fly a kite.":"audio/adv/a_c89b79a4dc7e.mp3","They study English.":"audio/adv/a_9dc02bd27b26.mp3","They cry.":"audio/adv/a_6c2b86a95df9.mp3","The cat is in the box.":"audio/adv/a_56f90dc10a2d.mp3","The dog is in the box.":"audio/adv/a_f99400b3470d.mp3","The rabbit is in the box.":"audio/adv/a_b34f8d388e79.mp3","The duck is in the box.":"audio/adv/a_6c162dff2d06.mp3","The cat is on the box.":"audio/adv/a_843453f9ac6e.mp3","The dog is on the box.":"audio/adv/a_e656a2d120ca.mp3","The rabbit is on the box.":"audio/adv/a_6f4e145a0946.mp3","The duck is on the box.":"audio/adv/a_c73c0213735b.mp3","The cat is on the table.":"audio/adv/a_ad2e171603bb.mp3","The dog is on the table.":"audio/adv/a_3179cbc26901.mp3","The rabbit is on the table.":"audio/adv/a_806e19848da0.mp3","The duck is on the table.":"audio/adv/a_b459254eb154.mp3","The cat is next to the box.":"audio/adv/a_4557a87415ed.mp3","The dog is next to the box.":"audio/adv/a_81c6fa4459d0.mp3","The rabbit is next to the box.":"audio/adv/a_d13ea44c4ec0.mp3","The duck is next to the box.":"audio/adv/a_d27f5776605b.mp3","The cat is under the table.":"audio/adv/a_095bcdbf65e1.mp3","The dog is under the table.":"audio/adv/a_4ebb8972fa37.mp3","The rabbit is under the table.":"audio/adv/a_0e3f5f103bb8.mp3","The duck is under the table.":"audio/adv/a_7918d8138da1.mp3","The cat is next to the table.":"audio/adv/a_adc57ac8c9b2.mp3","The dog is next to the table.":"audio/adv/a_6c46898b8418.mp3","The rabbit is next to the table.":"audio/adv/a_ce2a67e09b20.mp3","The duck is next to the table.":"audio/adv/a_16c809892a00.mp3","The cat is next to the tree.":"audio/adv/a_da1457cc1333.mp3","The dog is next to the tree.":"audio/adv/a_4760a7c2214f.mp3","The rabbit is next to the tree.":"audio/adv/a_de048633044f.mp3","The duck is next to the tree.":"audio/adv/a_a4b3cffce171.mp3","The cat is behind the tree.":"audio/adv/a_04d1b005504f.mp3","The dog is behind the tree.":"audio/adv/a_afcb3f749af7.mp3","The rabbit is behind the tree.":"audio/adv/a_247a0b06c836.mp3","The duck is behind the tree.":"audio/adv/a_8d2dce37e90c.mp3","The cat is in front of the tree.":"audio/adv/a_9c098fc2f768.mp3","The dog is in front of the tree.":"audio/adv/a_dd655ca34aea.mp3","The rabbit is in front of the tree.":"audio/adv/a_6f24a7da08f3.mp3","The duck is in front of the tree.":"audio/adv/a_2c2db7a627f2.mp3","There is a cat in the box.":"audio/adv/a_0577a43228cb.mp3","There are two cats in the box.":"audio/adv/a_e359ddca3dca.mp3","There is a dog in the box.":"audio/adv/a_e5f40269a171.mp3","There are two dogs in the box.":"audio/adv/a_19240d5b9d48.mp3","There is a rabbit in the box.":"audio/adv/a_e65e1fea007c.mp3","There are two rabbits in the box.":"audio/adv/a_6291ca15d962.mp3","There is a duck in the box.":"audio/adv/a_ea85934b03db.mp3","There are two ducks in the box.":"audio/adv/a_6f650abee6ed.mp3","There is a cat on the box.":"audio/adv/a_1528f84d4a28.mp3","There are two cats on the box.":"audio/adv/a_6bc328268c58.mp3","There is a dog on the box.":"audio/adv/a_39979171edcb.mp3","There are two dogs on the box.":"audio/adv/a_1aa6ebbc67b4.mp3","There is a rabbit on the box.":"audio/adv/a_d14388effbe3.mp3","There are two rabbits on the box.":"audio/adv/a_515e53fc989e.mp3","There is a duck on the box.":"audio/adv/a_46a35d1bac69.mp3","There are two ducks on the box.":"audio/adv/a_abd9d131cd43.mp3","There is a cat next to the box.":"audio/adv/a_465ad36b62b1.mp3","There are two cats next to the box.":"audio/adv/a_bd021850cee5.mp3","There is a dog next to the box.":"audio/adv/a_94ba03ea0a5f.mp3","There are two dogs next to the box.":"audio/adv/a_2c24e21dfd36.mp3","There is a rabbit next to the box.":"audio/adv/a_0ad4c4ecbc90.mp3","There are two rabbits next to the box.":"audio/adv/a_062c5765b3fa.mp3","There is a duck next to the box.":"audio/adv/a_a652f439cbae.mp3","There are two ducks next to the box.":"audio/adv/a_36da443d53d8.mp3","There is a cat on the table.":"audio/adv/a_810611a69308.mp3","There are two cats on the table.":"audio/adv/a_230c0cf7803a.mp3","There is a dog on the table.":"audio/adv/a_9e60cb86ec33.mp3","There are two dogs on the table.":"audio/adv/a_d92458e0f409.mp3","There is a rabbit on the table.":"audio/adv/a_4499c61ccdbc.mp3","There are two rabbits on the table.":"audio/adv/a_2fbd64aec466.mp3","There is a duck on the table.":"audio/adv/a_e3a71769cd6d.mp3","There are two ducks on the table.":"audio/adv/a_fed0e7011718.mp3","There is a cat under the table.":"audio/adv/a_b6606e779291.mp3","There are two cats under the table.":"audio/adv/a_b8dec70b511c.mp3","There is a dog under the table.":"audio/adv/a_c9e023c7f5ea.mp3","There are two dogs under the table.":"audio/adv/a_638d38cb2d9a.mp3","There is a rabbit under the table.":"audio/adv/a_cfc5b28d70af.mp3","There are two rabbits under the table.":"audio/adv/a_815684fd8e32.mp3","There is a duck under the table.":"audio/adv/a_9e795a9a35a2.mp3","There are two ducks under the table.":"audio/adv/a_e366b14309fd.mp3","There is a cat next to the table.":"audio/adv/a_5cdec5d15944.mp3","There are two cats next to the table.":"audio/adv/a_a7938fb858f5.mp3","There is a dog next to the table.":"audio/adv/a_ad2dd4daf631.mp3","There are two dogs next to the table.":"audio/adv/a_28b34ecceef3.mp3","There is a rabbit next to the table.":"audio/adv/a_4a4a5df5cf2f.mp3","There are two rabbits next to the table.":"audio/adv/a_7a2f10b97a09.mp3","There is a duck next to the table.":"audio/adv/a_aa46d319744d.mp3","There are two ducks next to the table.":"audio/adv/a_4bb431a6cc1d.mp3","I am singing.":"audio/adv/a_f800b18037ef.mp3","I am reading.":"audio/adv/a_8ae6c8bba5e8.mp3","I am cooking.":"audio/adv/a_1d09d4a9715c.mp3","I am drawing.":"audio/adv/a_a8985918a5a2.mp3","I am playing soccer.":"audio/adv/a_27e8aa41aba1.mp3","I am eating lunch.":"audio/adv/a_c528e42abbd3.mp3","You are singing.":"audio/adv/a_b8997f007ef7.mp3","You are reading.":"audio/adv/a_c4dc27c57534.mp3","You are cooking.":"audio/adv/a_29a550b11b82.mp3","You are drawing.":"audio/adv/a_3e6b24f8bdc9.mp3","You are playing soccer.":"audio/adv/a_86a4de9be106.mp3","You are eating lunch.":"audio/adv/a_087a12dd2045.mp3","He is singing.":"audio/adv/a_ea8cfbf537f3.mp3","He is reading.":"audio/adv/a_a4577faac184.mp3","He is cooking.":"audio/adv/a_ac702d87c2ca.mp3","He is drawing.":"audio/adv/a_1a5103c6c4ab.mp3","He is playing soccer.":"audio/adv/a_2bacce01a783.mp3","He is eating lunch.":"audio/adv/a_9ac48d86f5bc.mp3","She is singing.":"audio/adv/a_7eb648eb6dab.mp3","She is reading.":"audio/adv/a_81f725242cb2.mp3","She is cooking.":"audio/adv/a_f1b2a0312776.mp3","She is drawing.":"audio/adv/a_fb1224299f3e.mp3","She is playing soccer.":"audio/adv/a_f9ebc8522f8d.mp3","She is eating lunch.":"audio/adv/a_c90ba5d3cc77.mp3","He is running.":"audio/adv/a_d281d5ee4fff.mp3","He is swimming.":"audio/adv/a_d2b82ee42a5a.mp3","He is shopping.":"audio/adv/a_90a1cbdd709e.mp3","He is clapping.":"audio/adv/a_635529d8799d.mp3","He is dancing.":"audio/adv/a_29a3a47b570a.mp3","He is riding a bike.":"audio/adv/a_5a43b253dde3.mp3","He is writing.":"audio/adv/a_0b1f0d1acdee.mp3","He is making a cake.":"audio/adv/a_35d8dfc7dba6.mp3","She is running.":"audio/adv/a_a0b5d3d09856.mp3","She is swimming.":"audio/adv/a_de1ca8dbebd4.mp3","She is shopping.":"audio/adv/a_98d1d19231ca.mp3","She is clapping.":"audio/adv/a_c86229504c57.mp3","She is dancing.":"audio/adv/a_60f312d2a47f.mp3","She is riding a bike.":"audio/adv/a_01ec8b36aa1a.mp3","She is writing.":"audio/adv/a_53fb84441f9c.mp3","She is making a cake.":"audio/adv/a_27d21b3b09c0.mp3","They are running.":"audio/adv/a_a3edb3eecd5a.mp3","They are swimming.":"audio/adv/a_3cff1e4d5b00.mp3","They are shopping.":"audio/adv/a_0c64c7b71562.mp3","They are clapping.":"audio/adv/a_df2df9d0467b.mp3","They are dancing.":"audio/adv/a_e29c5d6238db.mp3","They are riding a bike.":"audio/adv/a_3858009efc73.mp3","They are writing.":"audio/adv/a_2f54c404178b.mp3","They are making a cake.":"audio/adv/a_1aafbde98e9f.mp3","He is singing now.":"audio/adv/a_2e784cda5be0.mp3","He sings every day.":"audio/adv/a_f9fc99d89147.mp3","He is reading now.":"audio/adv/a_13b291fb17c4.mp3","He reads every day.":"audio/adv/a_9cbe74c68738.mp3","He is cooking now.":"audio/adv/a_e63ebe82783a.mp3","He cooks every day.":"audio/adv/a_f82eb43c203e.mp3","He is drawing now.":"audio/adv/a_286a69bf2423.mp3","He draws every day.":"audio/adv/a_7b50135df6e8.mp3","He is playing soccer now.":"audio/adv/a_2c60e2e5e26f.mp3","He plays soccer every day.":"audio/adv/a_4b45ab26ce54.mp3","He is eating lunch now.":"audio/adv/a_67420096072d.mp3","He eats lunch every day.":"audio/adv/a_f583d4be7279.mp3","He is running now.":"audio/adv/a_752a14a74905.mp3","He runs every day.":"audio/adv/a_077305c8b0de.mp3","He is swimming now.":"audio/adv/a_7b27e37988e9.mp3","He swims every day.":"audio/adv/a_5847a4bcc54c.mp3","He is shopping now.":"audio/adv/a_3d70678a2a2f.mp3","He shops every day.":"audio/adv/a_b45e5d4ca42b.mp3","He is clapping now.":"audio/adv/a_eb63dea3edc9.mp3","He claps every day.":"audio/adv/a_425efdf9fd26.mp3","He is dancing now.":"audio/adv/a_09277521bf45.mp3","He dances every day.":"audio/adv/a_f402ba59f1b0.mp3","He is riding a bike now.":"audio/adv/a_ce01502f7072.mp3","He rides a bike every day.":"audio/adv/a_36ecfbcde56f.mp3","He is writing now.":"audio/adv/a_426902155e1f.mp3","He writes every day.":"audio/adv/a_7c8e77fdd676.mp3","He is making a cake now.":"audio/adv/a_0cad649d657b.mp3","He makes a cake every day.":"audio/adv/a_a6712595260e.mp3","She is singing now.":"audio/adv/a_13b5b450f8fe.mp3","She sings every day.":"audio/adv/a_56a7f2c76b9d.mp3","She is reading now.":"audio/adv/a_3516f8e560bf.mp3","She reads every day.":"audio/adv/a_0fb8c278d2e9.mp3","She is cooking now.":"audio/adv/a_0a06252b4dd1.mp3","She cooks every day.":"audio/adv/a_baeb03208b66.mp3","She is drawing now.":"audio/adv/a_5c95e7bf60a7.mp3","She draws every day.":"audio/adv/a_7a60cfda7ae3.mp3","She is playing soccer now.":"audio/adv/a_f5dff7b91832.mp3","She plays soccer every day.":"audio/adv/a_20d4d507d437.mp3","She is eating lunch now.":"audio/adv/a_8e8b6c269315.mp3","She eats lunch every day.":"audio/adv/a_7fc70f99e1c6.mp3","She is running now.":"audio/adv/a_37a3193ac8f7.mp3","She runs every day.":"audio/adv/a_9f2d9578bcbe.mp3","She is swimming now.":"audio/adv/a_e83194302482.mp3","She swims every day.":"audio/adv/a_6b509970f9e0.mp3","She is shopping now.":"audio/adv/a_3b6d59ae1720.mp3","She shops every day.":"audio/adv/a_a639477b68de.mp3","She is clapping now.":"audio/adv/a_5b43265c68e9.mp3","She claps every day.":"audio/adv/a_8f1dec73da7e.mp3","She is dancing now.":"audio/adv/a_88a71151ef63.mp3","She dances every day.":"audio/adv/a_b5106d3b691f.mp3","She is riding a bike now.":"audio/adv/a_ce4eb4af65de.mp3","She rides a bike every day.":"audio/adv/a_0b9b9887d456.mp3","She is writing now.":"audio/adv/a_4316664a4544.mp3","She writes every day.":"audio/adv/a_3061fc62fe77.mp3","She is making a cake now.":"audio/adv/a_f5a07cc6b165.mp3","She makes a cake every day.":"audio/adv/a_c69651cd1010.mp3","We are singing now.":"audio/adv/a_9d82ffa0506a.mp3","We sing every day.":"audio/adv/a_cc5505572b84.mp3","We are reading now.":"audio/adv/a_80cdd023f9b3.mp3","We read every day.":"audio/adv/a_43016e009fba.mp3","We are cooking now.":"audio/adv/a_10ba8ddf6de4.mp3","We cook every day.":"audio/adv/a_ffbd43ec0a9f.mp3","We are drawing now.":"audio/adv/a_37fe268e060c.mp3","We draw every day.":"audio/adv/a_7f258dd5cebf.mp3","We are playing soccer now.":"audio/adv/a_bda0b02d8136.mp3","We play soccer every day.":"audio/adv/a_37705beeaed6.mp3","We are eating lunch now.":"audio/adv/a_492ec3b4bec0.mp3","We eat lunch every day.":"audio/adv/a_435af2dd6c18.mp3","We are running now.":"audio/adv/a_dc7fb0dd09c1.mp3","We run every day.":"audio/adv/a_f8e96c84839f.mp3","We are swimming now.":"audio/adv/a_346a3c0486ef.mp3","We swim every day.":"audio/adv/a_b037cdad4555.mp3","We are shopping now.":"audio/adv/a_fc723adce0c9.mp3","We shop every day.":"audio/adv/a_6367da50a4b2.mp3","We are clapping now.":"audio/adv/a_348b8f9788c6.mp3","We clap every day.":"audio/adv/a_d7877e14e532.mp3","We are dancing now.":"audio/adv/a_51fad0f5df45.mp3","We dance every day.":"audio/adv/a_10bfa69ad8ab.mp3","We are riding a bike now.":"audio/adv/a_2245fb42e80f.mp3","We ride a bike every day.":"audio/adv/a_f6d5b1343712.mp3","We are writing now.":"audio/adv/a_c0d445ce71db.mp3","We write every day.":"audio/adv/a_d6777faccc5f.mp3","We are making a cake now.":"audio/adv/a_268db6ec4468.mp3","We make a cake every day.":"audio/adv/a_592468f40ca8.mp3","They are singing now.":"audio/adv/a_309eef01c6f9.mp3","They sing every day.":"audio/adv/a_84e895a5144f.mp3","They are reading now.":"audio/adv/a_19177a9e4486.mp3","They read every day.":"audio/adv/a_50f374941bea.mp3","They are cooking now.":"audio/adv/a_824b631c86ea.mp3","They cook every day.":"audio/adv/a_ca4ae309ee26.mp3","They are drawing now.":"audio/adv/a_2d9ebfaa4308.mp3","They draw every day.":"audio/adv/a_00312260ef66.mp3","They are playing soccer now.":"audio/adv/a_b55c2a6dee0b.mp3","They play soccer every day.":"audio/adv/a_842417b97b98.mp3","They are eating lunch now.":"audio/adv/a_5f80143b7556.mp3","They eat lunch every day.":"audio/adv/a_aa603c65ac13.mp3","They are running now.":"audio/adv/a_cd369cdb4b34.mp3","They run every day.":"audio/adv/a_87b62a9b59f6.mp3","They are swimming now.":"audio/adv/a_4cdd7fcf900b.mp3","They swim every day.":"audio/adv/a_ebc82c6f7aa6.mp3","They are shopping now.":"audio/adv/a_d9440fdd4197.mp3","They shop every day.":"audio/adv/a_5a51f8e69e62.mp3","They are clapping now.":"audio/adv/a_50055dd10cbf.mp3","They clap every day.":"audio/adv/a_cd230a86ef71.mp3","They are dancing now.":"audio/adv/a_187845b73a8a.mp3","They dance every day.":"audio/adv/a_eadb6c651030.mp3","They are riding a bike now.":"audio/adv/a_bef636d0d7c5.mp3","They ride a bike every day.":"audio/adv/a_71a1681de6d8.mp3","They are writing now.":"audio/adv/a_e826e1672912.mp3","They write every day.":"audio/adv/a_b0c96033f9cd.mp3","They are making a cake now.":"audio/adv/a_acb54e198f80.mp3","They make a cake every day.":"audio/adv/a_f170008558c8.mp3","I am singing now.":"audio/adv/a_96537317fa60.mp3","I sing every day.":"audio/adv/a_2094902ab0dc.mp3","I am reading now.":"audio/adv/a_32b3473ff6d9.mp3","I read every day.":"audio/adv/a_a842b1249589.mp3","I am cooking now.":"audio/adv/a_c9dd4ab016ff.mp3","I cook every day.":"audio/adv/a_3e3fb6fdde2f.mp3","I am drawing now.":"audio/adv/a_549f198e2d20.mp3","I draw every day.":"audio/adv/a_2c68c76e55e1.mp3","I am playing soccer now.":"audio/adv/a_9bbc94179a0e.mp3","I play soccer every day.":"audio/adv/a_04d6ec75c028.mp3","I am eating lunch now.":"audio/adv/a_ea6d613b4ffe.mp3","I eat lunch every day.":"audio/adv/a_7dd63e4bd40a.mp3","I am running now.":"audio/adv/a_4be47f244ad1.mp3","I run every day.":"audio/adv/a_a5fb4e05b0a1.mp3","I am swimming now.":"audio/adv/a_cb211119abfa.mp3","I swim every day.":"audio/adv/a_27d855d0b0f7.mp3","I am shopping now.":"audio/adv/a_04e37b88058d.mp3","I shop every day.":"audio/adv/a_7276916b9b64.mp3","I am clapping now.":"audio/adv/a_eb0948b7a5ff.mp3","I clap every day.":"audio/adv/a_cd58f3c623b6.mp3","I am dancing now.":"audio/adv/a_2a7ab9a30332.mp3","I dance every day.":"audio/adv/a_75af61d118cb.mp3","I am riding a bike now.":"audio/adv/a_b55ed429ed3a.mp3","I ride a bike every day.":"audio/adv/a_04886ea983ed.mp3","I am writing now.":"audio/adv/a_c7f9c0e55d56.mp3","I write every day.":"audio/adv/a_9a28a4e3c7af.mp3","I am making a cake now.":"audio/adv/a_4884507d5bb2.mp3","I make a cake every day.":"audio/adv/a_7471096641b9.mp3","You are singing now.":"audio/adv/a_3f8e45ba7480.mp3","You sing every day.":"audio/adv/a_dab59d33b330.mp3","You are reading now.":"audio/adv/a_71f02b1fea3a.mp3","You read every day.":"audio/adv/a_c502eb776b92.mp3","You are cooking now.":"audio/adv/a_9ce196624655.mp3","You cook every day.":"audio/adv/a_42f0001b8bd0.mp3","You are drawing now.":"audio/adv/a_228cd7eb3c5c.mp3","You draw every day.":"audio/adv/a_5e5f1b676cdd.mp3","You are playing soccer now.":"audio/adv/a_05bdf6658ac8.mp3","You play soccer every day.":"audio/adv/a_4e4be31d7c83.mp3","You are eating lunch now.":"audio/adv/a_79e79a9db0ce.mp3","You eat lunch every day.":"audio/adv/a_0fdd27d43dae.mp3","You are running now.":"audio/adv/a_0d31080cf6ca.mp3","You run every day.":"audio/adv/a_63527c4885b6.mp3","You are swimming now.":"audio/adv/a_356631e3fd55.mp3","You swim every day.":"audio/adv/a_35e7a6ae1af6.mp3","You are shopping now.":"audio/adv/a_ca8f40e3d64f.mp3","You shop every day.":"audio/adv/a_34f1604e6888.mp3","You are clapping now.":"audio/adv/a_c54be1ca6642.mp3","You clap every day.":"audio/adv/a_9e7fef117ffb.mp3","You are dancing now.":"audio/adv/a_784e69b3a5a7.mp3","You dance every day.":"audio/adv/a_ebf0b7a8d3c9.mp3","You are riding a bike now.":"audio/adv/a_cef9d0255a5f.mp3","You ride a bike every day.":"audio/adv/a_402cb1a03962.mp3","You are writing now.":"audio/adv/a_37b83c0a8ddf.mp3","You write every day.":"audio/adv/a_25300e5a7822.mp3","You are making a cake now.":"audio/adv/a_aae9d452df5c.mp3","You make a cake every day.":"audio/adv/a_c2eb4df96063.mp3","I can swim.":"audio/adv/a_0f988d26566e.mp3","I can ride a bike.":"audio/adv/a_9a7466297c16.mp3","I can cook.":"audio/adv/a_c1a334c699b0.mp3","I can dance.":"audio/adv/a_062bce38c42c.mp3","I can sing.":"audio/adv/a_be631a7b5565.mp3","I can draw.":"audio/adv/a_fce005fcff9b.mp3","I can play the piano.":"audio/adv/a_e508c959c001.mp3","I can skate.":"audio/adv/a_e5bc0136042c.mp3","You can swim.":"audio/adv/a_5f44a5abbb34.mp3","Can you swim?":"audio/adv/a_5af202b0c611.mp3","Yes, I can.":"audio/adv/a_ee5e38d26aba.mp3","You can ride a bike.":"audio/adv/a_46f6dd955e21.mp3","Can you ride a bike?":"audio/adv/a_4c4d4bbae862.mp3","You can cook.":"audio/adv/a_72e2f9236a2b.mp3","Can you cook?":"audio/adv/a_6a992546ef6a.mp3","You can dance.":"audio/adv/a_d502dd53c252.mp3","Can you dance?":"audio/adv/a_55fae2f57ffb.mp3","You can sing.":"audio/adv/a_a67914ac3417.mp3","Can you sing?":"audio/adv/a_efe50c63b17f.mp3","You can draw.":"audio/adv/a_b4de75af1870.mp3","Can you draw?":"audio/adv/a_c828d905e43b.mp3","You can play the piano.":"audio/adv/a_1ab624ae2c06.mp3","Can you play the piano?":"audio/adv/a_0f4f505d52e7.mp3","You can skate.":"audio/adv/a_7797c7e1e79e.mp3","Can you skate?":"audio/adv/a_02d088ce0ce8.mp3","He can swim.":"audio/adv/a_ff4b5277e128.mp3","Can he swim?":"audio/adv/a_eff215f29263.mp3","Yes, he can.":"audio/adv/a_7345ba538b3a.mp3","He can ride a bike.":"audio/adv/a_3eb665eda649.mp3","Can he ride a bike?":"audio/adv/a_c26c93976f73.mp3","He can cook.":"audio/adv/a_20bb576e52f0.mp3","Can he cook?":"audio/adv/a_f7014836f7c4.mp3","He can dance.":"audio/adv/a_1f930c246425.mp3","Can he dance?":"audio/adv/a_a5f5618f501b.mp3","He can sing.":"audio/adv/a_81e3e312c8b1.mp3","Can he sing?":"audio/adv/a_2a29356b8738.mp3","He can draw.":"audio/adv/a_94dcc5d44e3f.mp3","Can he draw?":"audio/adv/a_5bb43b8a803d.mp3","He can play the piano.":"audio/adv/a_efe28e74179a.mp3","Can he play the piano?":"audio/adv/a_2c00504216bd.mp3","He can skate.":"audio/adv/a_79e532275303.mp3","Can he skate?":"audio/adv/a_946748efdb5f.mp3","She can swim.":"audio/adv/a_529ecb1a217e.mp3","Can she swim?":"audio/adv/a_ed31df354442.mp3","Yes, she can.":"audio/adv/a_4b1b071e1e94.mp3","She can ride a bike.":"audio/adv/a_6cfa6217e2ec.mp3","Can she ride a bike?":"audio/adv/a_78adb94a37bd.mp3","She can cook.":"audio/adv/a_75a8bfa0addd.mp3","Can she cook?":"audio/adv/a_392ce5a47d75.mp3","She can dance.":"audio/adv/a_3c8b86986cc1.mp3","Can she dance?":"audio/adv/a_c5bd40bae8a2.mp3","She can sing.":"audio/adv/a_a83feead5f7b.mp3","Can she sing?":"audio/adv/a_2a4d944693cd.mp3","She can draw.":"audio/adv/a_eec0d4004545.mp3","Can she draw?":"audio/adv/a_dbb7feb60144.mp3","She can play the piano.":"audio/adv/a_94ceccfd40d8.mp3","Can she play the piano?":"audio/adv/a_8951ca486769.mp3","She can skate.":"audio/adv/a_27053d85e10e.mp3","Can she skate?":"audio/adv/a_77ece5969b47.mp3","I can't swim.":"audio/adv/a_0be94b7ab0fa.mp3","I can't ride a bike.":"audio/adv/a_4f2f8f0fe038.mp3","I can't cook.":"audio/adv/a_cfa52af90773.mp3","I can't dance.":"audio/adv/a_9732f1ce72f8.mp3","I can't sing.":"audio/adv/a_c908dda74120.mp3","I can't draw.":"audio/adv/a_56ec744b2419.mp3","I can't play the piano.":"audio/adv/a_ae5d2e22c874.mp3","I can't skate.":"audio/adv/a_0b4f23cc5089.mp3","You can't swim.":"audio/adv/a_efc281afa4c1.mp3","No, I can't.":"audio/adv/a_d95c1865ab92.mp3","You can't ride a bike.":"audio/adv/a_a1ac00d02842.mp3","You can't cook.":"audio/adv/a_aaff0ae7d07c.mp3","You can't dance.":"audio/adv/a_20efd5a65744.mp3","You can't sing.":"audio/adv/a_ee96ceb67be8.mp3","You can't draw.":"audio/adv/a_b48fd2ac1640.mp3","You can't play the piano.":"audio/adv/a_89593502dc29.mp3","You can't skate.":"audio/adv/a_fa9e1dacb5c7.mp3","He can't swim.":"audio/adv/a_a160770fba1e.mp3","No, he can't.":"audio/adv/a_7e55c7ef13a9.mp3","He can't ride a bike.":"audio/adv/a_391246337f25.mp3","He can't cook.":"audio/adv/a_4c2341b73f40.mp3","He can't dance.":"audio/adv/a_d3b56cfb0be9.mp3","He can't sing.":"audio/adv/a_eda74a87c1d2.mp3","He can't draw.":"audio/adv/a_a6dd9f70b350.mp3","He can't play the piano.":"audio/adv/a_39ce397bdd53.mp3","He can't skate.":"audio/adv/a_49b4a0b6bbc6.mp3","She can't swim.":"audio/adv/a_bac85aa0e0b9.mp3","No, she can't.":"audio/adv/a_4e40718c4ed9.mp3","She can't ride a bike.":"audio/adv/a_e6f96fb5ccf2.mp3","She can't cook.":"audio/adv/a_618b0e99f69f.mp3","She can't dance.":"audio/adv/a_510a53feff24.mp3","She can't sing.":"audio/adv/a_ac3f2c62ea5b.mp3","She can't draw.":"audio/adv/a_4e13961098c8.mp3","She can't play the piano.":"audio/adv/a_68f716da76e5.mp3","She can't skate.":"audio/adv/a_3ea18897b12d.mp3","Can they swim?":"audio/adv/a_14260a19ff9a.mp3","Yes, they can.":"audio/adv/a_981357cd2d27.mp3","No, they can't.":"audio/adv/a_15323b50a78e.mp3","Can they ride a bike?":"audio/adv/a_77f0e8510102.mp3","Can they cook?":"audio/adv/a_3405ca1becc1.mp3","Can they dance?":"audio/adv/a_8dfe7a252407.mp3","Can they sing?":"audio/adv/a_39340d945510.mp3","Can they draw?":"audio/adv/a_7659bbe44a51.mp3","Can they play the piano?":"audio/adv/a_fb77b1481c74.mp3","Can they skate?":"audio/adv/a_ec0c68249c3b.mp3","We can swim.":"audio/adv/a_9c880edf7dfe.mp3","We can't swim.":"audio/adv/a_024d58f6a265.mp3","We can ride a bike.":"audio/adv/a_ba214c9301d0.mp3","We can't ride a bike.":"audio/adv/a_e94e46cea828.mp3","We can cook.":"audio/adv/a_a19a026ed1ea.mp3","We can't cook.":"audio/adv/a_5f7c556d517f.mp3","We can dance.":"audio/adv/a_f1c3c8dc8c52.mp3","We can't dance.":"audio/adv/a_5fef9939f5ab.mp3","We can sing.":"audio/adv/a_2f97b8e1166b.mp3","We can't sing.":"audio/adv/a_3b3258cf52ff.mp3","We can draw.":"audio/adv/a_c111bc289715.mp3","We can't draw.":"audio/adv/a_9e74b60a860f.mp3","We can play the piano.":"audio/adv/a_536c2227ed5a.mp3","We can't play the piano.":"audio/adv/a_581641535538.mp3","We can skate.":"audio/adv/a_0ad31f0907d0.mp3","We can't skate.":"audio/adv/a_af3f8a7c7084.mp3","They can swim.":"audio/adv/a_162e20527899.mp3","They can't swim.":"audio/adv/a_38070c27db5b.mp3","They can ride a bike.":"audio/adv/a_00b4c5228d6b.mp3","They can't ride a bike.":"audio/adv/a_4321f6318c3f.mp3","They can cook.":"audio/adv/a_8b30dee12b85.mp3","They can't cook.":"audio/adv/a_4f8c87924dfb.mp3","They can dance.":"audio/adv/a_ee8ee736e4b6.mp3","They can't dance.":"audio/adv/a_69b7c2abf149.mp3","They can sing.":"audio/adv/a_73440051e7fd.mp3","They can't sing.":"audio/adv/a_5e07e35f1cba.mp3","They can draw.":"audio/adv/a_9ff0df67f01a.mp3","They can't draw.":"audio/adv/a_69ed247bf154.mp3","They can play the piano.":"audio/adv/a_30234e1530b3.mp3","They can't play the piano.":"audio/adv/a_ad3f0385e145.mp3","They can skate.":"audio/adv/a_f6ee28261d65.mp3","They can't skate.":"audio/adv/a_f4f906f84897.mp3","I have a ball.":"audio/adv/a_e639c790084f.mp3","I have a ball and a kite.":"audio/adv/a_c69f2f1f361b.mp3","I have a kite.":"audio/adv/a_80b7aa525379.mp3","I have a kite and a book.":"audio/adv/a_bbbc41fbb30b.mp3","I have a book.":"audio/adv/a_d55434a29897.mp3","I have a book and a pencil.":"audio/adv/a_d0a183d90b6c.mp3","I have a pencil.":"audio/adv/a_da5a158ec62c.mp3","I have a pencil and a ruler.":"audio/adv/a_fa30b6413845.mp3","I have a ruler.":"audio/adv/a_6a39b0c395b8.mp3","I have a ruler and a banana.":"audio/adv/a_bd761e052f12.mp3","I have a banana.":"audio/adv/a_d986724b7ba0.mp3","I have a banana and a cap.":"audio/adv/a_70c2c027d29a.mp3","I have a cap.":"audio/adv/a_011f61386c31.mp3","I have a cap and a sandwich.":"audio/adv/a_c8c3417c9991.mp3","I have a sandwich.":"audio/adv/a_1859d67c7417.mp3","I have a sandwich and a ball.":"audio/adv/a_bf147f594cbd.mp3","You have a ball.":"audio/adv/a_eb41433b5149.mp3","You have a ball and a kite.":"audio/adv/a_59e32a6fc2c1.mp3","You have a kite.":"audio/adv/a_238e6830d9ed.mp3","You have a kite and a book.":"audio/adv/a_3ab6490342a7.mp3","You have a book.":"audio/adv/a_c001e2df9de2.mp3","You have a book and a pencil.":"audio/adv/a_3d8e86183c6e.mp3","You have a pencil.":"audio/adv/a_3335ddefc118.mp3","You have a pencil and a ruler.":"audio/adv/a_198b01c93308.mp3","You have a ruler.":"audio/adv/a_b2a3ccd72d31.mp3","You have a ruler and a banana.":"audio/adv/a_6aaae7c08123.mp3","You have a banana.":"audio/adv/a_1a2dd83fa7f2.mp3","You have a banana and a cap.":"audio/adv/a_59a6c340ca29.mp3","You have a cap.":"audio/adv/a_1518be3139a0.mp3","You have a cap and a sandwich.":"audio/adv/a_aad6776c9534.mp3","You have a sandwich.":"audio/adv/a_3169ce84907e.mp3","You have a sandwich and a ball.":"audio/adv/a_c3b5b7a3a881.mp3","He has a ball.":"audio/adv/a_672315ddce6c.mp3","He has a ball and a kite.":"audio/adv/a_678d9cdf9247.mp3","He has a kite.":"audio/adv/a_0a97312fa6dc.mp3","He has a kite and a book.":"audio/adv/a_5f11334d3bf7.mp3","He has a book.":"audio/adv/a_7f2e5459b44e.mp3","He has a book and a pencil.":"audio/adv/a_7fdd62b0b889.mp3","He has a pencil.":"audio/adv/a_4b1906c1108b.mp3","He has a pencil and a ruler.":"audio/adv/a_fbc4ee02be48.mp3","He has a ruler.":"audio/adv/a_be37963f655f.mp3","He has a ruler and a banana.":"audio/adv/a_8ad4ab98d56b.mp3","He has a banana.":"audio/adv/a_c341f05c5135.mp3","He has a banana and a cap.":"audio/adv/a_81c8da5a7934.mp3","He has a cap.":"audio/adv/a_061afe8ca8ce.mp3","He has a cap and a sandwich.":"audio/adv/a_083a4d2a6419.mp3","He has a sandwich.":"audio/adv/a_705c7f642bba.mp3","He has a sandwich and a ball.":"audio/adv/a_7fa3fd96e56c.mp3","She has a ball.":"audio/adv/a_10e30ae26606.mp3","She has a ball and a kite.":"audio/adv/a_7aab61784e05.mp3","She has a kite.":"audio/adv/a_91e64277ac20.mp3","She has a kite and a book.":"audio/adv/a_7f1b3af0e573.mp3","She has a book.":"audio/adv/a_b25509befedd.mp3","She has a book and a pencil.":"audio/adv/a_c38ac25321a4.mp3","She has a pencil.":"audio/adv/a_aabb4975c2a2.mp3","She has a pencil and a ruler.":"audio/adv/a_d32601d2d35b.mp3","She has a ruler.":"audio/adv/a_ff5fde36f6bc.mp3","She has a ruler and a banana.":"audio/adv/a_9eda39d7d709.mp3","She has a banana.":"audio/adv/a_6de9e942a7a2.mp3","She has a banana and a cap.":"audio/adv/a_4bc19b220456.mp3","She has a cap.":"audio/adv/a_0c75263e3246.mp3","She has a cap and a sandwich.":"audio/adv/a_1045e2c060ee.mp3","She has a sandwich.":"audio/adv/a_36127e1f3f50.mp3","She has a sandwich and a ball.":"audio/adv/a_de201c68a897.mp3","She has a ruler. I have a ball and a kite.":"audio/adv/a_151e80558ebe.mp3","She has a banana. I have a kite and a book.":"audio/adv/a_352535d24a24.mp3","She has a cap. I have a book and a pencil.":"audio/adv/a_20ad3d3d6b56.mp3","She has a sandwich. I have a pencil and a ruler.":"audio/adv/a_cc09db9750e7.mp3","She has a ball. I have a ruler and a banana.":"audio/adv/a_43f7c9587ed8.mp3","She has a kite. I have a banana and a cap.":"audio/adv/a_5e41bd06e3fa.mp3","She has a book. I have a cap and a sandwich.":"audio/adv/a_b79f005a019c.mp3","She has a pencil. I have a sandwich and a ball.":"audio/adv/a_43c7e9cf1e3e.mp3","She has a ruler. You have a ball and a kite.":"audio/adv/a_cbae6e0d7f33.mp3","She has a banana. You have a kite and a book.":"audio/adv/a_cb51e4fb7fd9.mp3","She has a cap. You have a book and a pencil.":"audio/adv/a_c9464466b5b8.mp3","She has a sandwich. You have a pencil and a ruler.":"audio/adv/a_17e176d0572b.mp3","She has a ball. You have a ruler and a banana.":"audio/adv/a_16369aac2bda.mp3","She has a kite. You have a banana and a cap.":"audio/adv/a_26781b69548d.mp3","She has a book. You have a cap and a sandwich.":"audio/adv/a_8be970854cf0.mp3","She has a pencil. You have a sandwich and a ball.":"audio/adv/a_65a1ce630584.mp3","I have a ruler. He has a ball and a kite.":"audio/adv/a_27f735e94a11.mp3","I have a banana. He has a kite and a book.":"audio/adv/a_6f559a22e44f.mp3","I have a cap. He has a book and a pencil.":"audio/adv/a_2c360f1d7900.mp3","I have a sandwich. He has a pencil and a ruler.":"audio/adv/a_56564c92de71.mp3","I have a ball. He has a ruler and a banana.":"audio/adv/a_8195caab6aae.mp3","I have a kite. He has a banana and a cap.":"audio/adv/a_4b6905e329fe.mp3","I have a book. He has a cap and a sandwich.":"audio/adv/a_4a89d079cbf6.mp3","I have a pencil. He has a sandwich and a ball.":"audio/adv/a_ced73ab68309.mp3","I have a ruler. She has a ball and a kite.":"audio/adv/a_52efb2a43d7f.mp3","I have a banana. She has a kite and a book.":"audio/adv/a_7268724a575c.mp3","I have a cap. She has a book and a pencil.":"audio/adv/a_a6b4e7be3b5f.mp3","I have a sandwich. She has a pencil and a ruler.":"audio/adv/a_073d56bc844b.mp3","I have a ball. She has a ruler and a banana.":"audio/adv/a_2d2e85bb657f.mp3","I have a kite. She has a banana and a cap.":"audio/adv/a_4806f8d062f7.mp3","I have a book. She has a cap and a sandwich.":"audio/adv/a_356ad44c2dd1.mp3","I have a pencil. She has a sandwich and a ball.":"audio/adv/a_30eee1f354d6.mp3","We have a ball.":"audio/adv/a_32bbec1ab169.mp3","She has a ruler. We have a ball and a kite.":"audio/adv/a_94e1d9e4b7ee.mp3","We have a kite.":"audio/adv/a_36616a186322.mp3","She has a banana. We have a kite and a book.":"audio/adv/a_64a22842a461.mp3","We have a book.":"audio/adv/a_c672ea6a9e25.mp3","She has a cap. We have a book and a pencil.":"audio/adv/a_a5aa94cd6eca.mp3","We have a pencil.":"audio/adv/a_f60531e66af5.mp3","She has a sandwich. We have a pencil and a ruler.":"audio/adv/a_85558a702ea8.mp3","We have a ruler.":"audio/adv/a_c799fb12828a.mp3","She has a ball. We have a ruler and a banana.":"audio/adv/a_a024608892f8.mp3","We have a banana.":"audio/adv/a_91e9505b2e6c.mp3","She has a kite. We have a banana and a cap.":"audio/adv/a_e3127db28dab.mp3","We have a cap.":"audio/adv/a_965c81e49978.mp3","She has a book. We have a cap and a sandwich.":"audio/adv/a_34a4d03145a7.mp3","We have a sandwich.":"audio/adv/a_37b77a35f2d1.mp3","She has a pencil. We have a sandwich and a ball.":"audio/adv/a_9344a38c3f90.mp3","They have a ball.":"audio/adv/a_5bda2a24a90a.mp3","She has a ruler. They have a ball and a kite.":"audio/adv/a_6e7a03ffb268.mp3","They have a kite.":"audio/adv/a_87a7f8a7f0ac.mp3","She has a banana. They have a kite and a book.":"audio/adv/a_ab96051ca1cd.mp3","They have a book.":"audio/adv/a_2e415419fa05.mp3","She has a cap. They have a book and a pencil.":"audio/adv/a_c2cd917ebd34.mp3","They have a pencil.":"audio/adv/a_77ae01a9928d.mp3","She has a sandwich. They have a pencil and a ruler.":"audio/adv/a_d6d4daa89144.mp3","They have a ruler.":"audio/adv/a_67322cba3e1d.mp3","She has a ball. They have a ruler and a banana.":"audio/adv/a_427b5ce87baf.mp3","They have a banana.":"audio/adv/a_01ad14a50552.mp3","She has a kite. They have a banana and a cap.":"audio/adv/a_b95121240f3f.mp3","They have a cap.":"audio/adv/a_9fed5ffe3bb4.mp3","She has a book. They have a cap and a sandwich.":"audio/adv/a_d1fc6bd4d49b.mp3","They have a sandwich.":"audio/adv/a_7caea52378b1.mp3","She has a pencil. They have a sandwich and a ball.":"audio/adv/a_6409381ea840.mp3","Do you have a ball?":"audio/adv/a_117565c98b69.mp3","Do you have a kite?":"audio/adv/a_744d2ca3e150.mp3","Do you have a book?":"audio/adv/a_8ec2d9b98c24.mp3","Do you have a pencil?":"audio/adv/a_65ce9c596b1b.mp3","Do you have a ruler?":"audio/adv/a_eeba228b937b.mp3","Do you have a banana?":"audio/adv/a_3509053c010c.mp3","Do you have a cap?":"audio/adv/a_6a145fa2dfbc.mp3","Do you have a sandwich?":"audio/adv/a_864e83cd1e0b.mp3","Does he have a ball?":"audio/adv/a_e8de7bf691f5.mp3","Does he have a kite?":"audio/adv/a_177ee7ad12d0.mp3","Does he have a book?":"audio/adv/a_c70f2374fe5b.mp3","Does he have a pencil?":"audio/adv/a_0ad3190589bb.mp3","Does he have a ruler?":"audio/adv/a_78b9de204391.mp3","Does he have a banana?":"audio/adv/a_03069c93b76d.mp3","Does he have a cap?":"audio/adv/a_9deab31c2f9f.mp3","Does he have a sandwich?":"audio/adv/a_5a60688ff9d4.mp3","Does she have a ball?":"audio/adv/a_4f49bc4211dd.mp3","Does she have a kite?":"audio/adv/a_8f7d5c866558.mp3","Does she have a book?":"audio/adv/a_213ab6eb95c4.mp3","Does she have a pencil?":"audio/adv/a_70e50e01f8fb.mp3","Does she have a ruler?":"audio/adv/a_5183b66b63a5.mp3","Does she have a banana?":"audio/adv/a_ba21cd113d02.mp3","Does she have a cap?":"audio/adv/a_fd496a3f5d20.mp3","Does she have a sandwich?":"audio/adv/a_a72647123788.mp3","Do they have a ball?":"audio/adv/a_ecf6c262fe29.mp3","Do they have a kite?":"audio/adv/a_ab08d410eaf3.mp3","Do they have a book?":"audio/adv/a_3fcb4b1d164b.mp3","Do they have a pencil?":"audio/adv/a_52dd54eb5d62.mp3","Do they have a ruler?":"audio/adv/a_e8e4d3edab77.mp3","Do they have a banana?":"audio/adv/a_27c3549101c0.mp3","Do they have a cap?":"audio/adv/a_60a072f61daf.mp3","Do they have a sandwich?":"audio/adv/a_c6c3d9c0b2c8.mp3","She has a ruler. I have a ball, a kite and a book.":"audio/adv/a_aebd7c6b1966.mp3","She has a banana. I have a kite, a book and a pencil.":"audio/adv/a_65b3614d83b3.mp3","She has a cap. I have a book, a pencil and a ruler.":"audio/adv/a_0c8195b497d4.mp3","She has a sandwich. I have a pencil, a ruler and a banana.":"audio/adv/a_69c71d610bb2.mp3","She has a ball. I have a ruler, a banana and a cap.":"audio/adv/a_a926e1ca3eeb.mp3","She has a kite. I have a banana, a cap and a sandwich.":"audio/adv/a_6a5aeff59e61.mp3","She has a book. I have a cap, a sandwich and a ball.":"audio/adv/a_7991d17f996c.mp3","She has a pencil. I have a sandwich, a ball and a kite.":"audio/adv/a_f7ad06c78f2d.mp3","She has a ruler. You have a ball, a kite and a book.":"audio/adv/a_05017f23d45a.mp3","She has a banana. You have a kite, a book and a pencil.":"audio/adv/a_d300fe644364.mp3","She has a cap. You have a book, a pencil and a ruler.":"audio/adv/a_d9d7d010e3ce.mp3","She has a sandwich. You have a pencil, a ruler and a banana.":"audio/adv/a_25489788ea4c.mp3","She has a ball. You have a ruler, a banana and a cap.":"audio/adv/a_f4969f9c7c3b.mp3","She has a kite. You have a banana, a cap and a sandwich.":"audio/adv/a_94c46196ca2c.mp3","She has a book. You have a cap, a sandwich and a ball.":"audio/adv/a_dccecb80ce22.mp3","She has a pencil. You have a sandwich, a ball and a kite.":"audio/adv/a_ce089cbfbf0f.mp3","I have a ruler. He has a ball, a kite and a book.":"audio/adv/a_cec63082f117.mp3","I have a banana. He has a kite, a book and a pencil.":"audio/adv/a_7618856662b3.mp3","I have a cap. He has a book, a pencil and a ruler.":"audio/adv/a_5e5de41db952.mp3","I have a sandwich. He has a pencil, a ruler and a banana.":"audio/adv/a_1bb3f0ea9ce7.mp3","I have a ball. He has a ruler, a banana and a cap.":"audio/adv/a_e8222f1840eb.mp3","I have a kite. He has a banana, a cap and a sandwich.":"audio/adv/a_c74969ee8d66.mp3","I have a book. He has a cap, a sandwich and a ball.":"audio/adv/a_c8e94164330a.mp3","I have a pencil. He has a sandwich, a ball and a kite.":"audio/adv/a_dcd958762c37.mp3","I have a ruler. She has a ball, a kite and a book.":"audio/adv/a_5d33ebe589c6.mp3","I have a banana. She has a kite, a book and a pencil.":"audio/adv/a_f9b0bed75432.mp3","I have a cap. She has a book, a pencil and a ruler.":"audio/adv/a_b2409f1898f3.mp3","I have a sandwich. She has a pencil, a ruler and a banana.":"audio/adv/a_50cdf13388da.mp3","I have a ball. She has a ruler, a banana and a cap.":"audio/adv/a_774500d9e232.mp3","I have a kite. She has a banana, a cap and a sandwich.":"audio/adv/a_87a7309d021e.mp3","I have a book. She has a cap, a sandwich and a ball.":"audio/adv/a_beb0a50869d3.mp3","I have a pencil. She has a sandwich, a ball and a kite.":"audio/adv/a_7d4797ea5ded.mp3","She has a ruler. We have a ball, a kite and a book.":"audio/adv/a_c1919e915b39.mp3","She has a banana. We have a kite, a book and a pencil.":"audio/adv/a_34a9437337a2.mp3","She has a cap. We have a book, a pencil and a ruler.":"audio/adv/a_8abf21c64108.mp3","She has a sandwich. We have a pencil, a ruler and a banana.":"audio/adv/a_bd9d176349f5.mp3","She has a ball. We have a ruler, a banana and a cap.":"audio/adv/a_076797d084c8.mp3","She has a kite. We have a banana, a cap and a sandwich.":"audio/adv/a_1e67c49240de.mp3","She has a book. We have a cap, a sandwich and a ball.":"audio/adv/a_b95ee369ab17.mp3","She has a pencil. We have a sandwich, a ball and a kite.":"audio/adv/a_035ed3deac57.mp3","She has a ruler. They have a ball, a kite and a book.":"audio/adv/a_a3017448f49d.mp3","She has a banana. They have a kite, a book and a pencil.":"audio/adv/a_b6e9ba1bdebb.mp3","She has a cap. They have a book, a pencil and a ruler.":"audio/adv/a_652a9f36afc1.mp3","She has a sandwich. They have a pencil, a ruler and a banana.":"audio/adv/a_a77f1fce0563.mp3","She has a ball. They have a ruler, a banana and a cap.":"audio/adv/a_d62e8517f61b.mp3","She has a kite. They have a banana, a cap and a sandwich.":"audio/adv/a_cb1eaa56d13e.mp3","She has a book. They have a cap, a sandwich and a ball.":"audio/adv/a_25076d26d43d.mp3","She has a pencil. They have a sandwich, a ball and a kite.":"audio/adv/a_3f99aa2eece6.mp3","This is a cat.":"audio/adv/a_f13ff7e5b378.mp3","That is a cat.":"audio/adv/a_36e960532a98.mp3","This is a dog.":"audio/adv/a_26a87c701be9.mp3","That is a dog.":"audio/adv/a_b7d50bb21cf6.mp3","This is a ball.":"audio/adv/a_644579bf7b01.mp3","That is a ball.":"audio/adv/a_0d44eadd8c75.mp3","This is a book.":"audio/adv/a_97825a9545fb.mp3","That is a book.":"audio/adv/a_6b067c507f49.mp3","This is a kite.":"audio/adv/a_8745b1dc6f14.mp3","That is a kite.":"audio/adv/a_e9d3c637b042.mp3","This is a bird.":"audio/adv/a_59df8e7ae7cf.mp3","That is a bird.":"audio/adv/a_548871bd96f9.mp3","This is a banana.":"audio/adv/a_3dabb3035492.mp3","That is a banana.":"audio/adv/a_db8533ebb210.mp3","This is a duck.":"audio/adv/a_65c779476eaf.mp3","That is a duck.":"audio/adv/a_1b408e8b8d7b.mp3","These are cats.":"audio/adv/a_06a9d4ad6441.mp3","Those are cats.":"audio/adv/a_b482b47c09f4.mp3","These are dogs.":"audio/adv/a_b72e98ea90b9.mp3","Those are dogs.":"audio/adv/a_8a58cdacae77.mp3","These are balls.":"audio/adv/a_af8cbe3cb37e.mp3","Those are balls.":"audio/adv/a_bf9fd1fc2ccc.mp3","These are books.":"audio/adv/a_242ce331433e.mp3","Those are books.":"audio/adv/a_96985cd37fe9.mp3","These are kites.":"audio/adv/a_7456f02b1e58.mp3","Those are kites.":"audio/adv/a_ce96a2bdf379.mp3","These are birds.":"audio/adv/a_151e0b142673.mp3","Those are birds.":"audio/adv/a_06a3e54f47e6.mp3","These are bananas.":"audio/adv/a_0be570d825c2.mp3","Those are bananas.":"audio/adv/a_73c02ade8299.mp3","These are ducks.":"audio/adv/a_7b75ee234099.mp3","Those are ducks.":"audio/adv/a_4df1c9074e92.mp3"};/*ADV_AUDIO_END*/
const BE_SUBJ = {
 I:   {w:"I",    e:"🙋",   zh:"我",   be:"am"},
 you: {w:"You",  e:"👉",   zh:"你",   be:"are"},
 he:  {w:"He",   e:"👦",   zh:"他",   be:"is"},
 she: {w:"She",  e:"👧",   zh:"她",   be:"is"},
 it:  {w:"It",   e:"🐶",   zh:"牠",   be:"is"},
 we:  {w:"We",   e:"🙋🙋", zh:"我們", be:"are"},
 they:{w:"They", e:"👫",   zh:"他們", be:"are"}};
const BE_FEEL = [["happy","😄","很開心"],["sad","😢","很難過"],["hungry","😋","肚子餓了"],["sleepy","😴","想睡覺"],
 ["hot","🥵","好熱"],["cold","🥶","好冷"],["angry","😠","很生氣"],["sick","🤒","生病了"]];
/* [base, he/she form, object, emoji, 中文] */
const VB_EASY = [["run","runs","","🏃","跑步"],["swim","swims","","🏊","游泳"],["sing","sings","","🎤","唱歌"],["dance","dances","","💃","跳舞"],
 ["read","reads","","📖","看書"],["cook","cooks","","🍳","煮飯"],["draw","draws","","🎨","畫畫"],["walk","walks","","🚶","走路"]];
const VB_ES = [["watch","watches","TV","📺","看電視"],["go","goes","to school","🏫","去上學"],["wash","washes","the dishes","🧽","洗碗"],
 ["catch","catches","the ball","⚾","接球"],["do","does","homework","📝","寫功課"],["fly","flies","a kite","🪁","放風箏"],
 ["study","studies","English","📚","讀英文"],["cry","cries","","😭","哭"]];
/* World 5: [base, he/she form, -ing, object, emoji, 中文, spelling rule] */
const VB_ING = [
 ["sing","sings","singing","","🎤","唱歌","add"], ["read","reads","reading","","📖","看書","add"],
 ["cook","cooks","cooking","","🍳","煮飯","add"], ["draw","draws","drawing","","🎨","畫畫","add"],
 ["play","plays","playing","soccer","⚽","踢足球","add"], ["eat","eats","eating","lunch","🍱","吃午餐","add"],
 ["run","runs","running","","🏃","跑步","double"], ["swim","swims","swimming","","🏊","游泳","double"],
 ["shop","shops","shopping","","🛍️","買東西","double"], ["clap","claps","clapping","","👏","拍手","double"],
 ["dance","dances","dancing","","💃","跳舞","drop"], ["ride","rides","riding","a bike","🚲","騎腳踏車","drop"],
 ["write","writes","writing","","✏️","寫字","drop"], ["make","makes","making","a cake","🎂","做蛋糕","drop"]];
/* World 6: [base, he/she form, -ing, object, emoji, 中文] — the two wrong forms are the "can swims / can swimming" traps */
const CN_ACT = [
 ["swim","swims","swimming","","🏊","游泳"], ["ride","rides","riding","a bike","🚲","騎腳踏車"],
 ["cook","cooks","cooking","","🍳","煮飯"], ["dance","dances","dancing","","💃","跳舞"],
 ["sing","sings","singing","","🎤","唱歌"], ["draw","draws","drawing","","🎨","畫畫"],
 ["play","plays","playing","the piano","🎹","彈鋼琴"], ["skate","skates","skating","","⛸️","溜冰"]];
/* who can be asked "Can … ?" (no "Can I…?" — that asks permission — and no "Can we…?") */
const CN_ASK = ["you","he","she","they"];
/* World 7: [thing, emoji, 中文, 量詞] — all take "a"; the 🎒 room packs thing i, i+1 (, i+2), the other person has i+4 */
const HV_THING = [["ball","⚽","球","一顆"],["kite","🪁","風箏","一個"],["book","📖","書","一本"],["pencil","✏️","鉛筆","一支"],
 ["ruler","📏","尺","一把"],["banana","🍌","香蕉","一根"],["cap","🧢","帽子","一頂"],["sandwich","🥪","三明治","一個"]];
const HV_ASK = ["you","he","she","they"];
/* World 8: [one, many, emoji, 中文, 量詞] — all regular -s plurals and all take "a" (World 9 does the hard plurals) */
const DM_THING = [["cat","cats","🐱","貓","一隻"],["dog","dogs","🐶","狗","一隻"],["ball","balls","⚽","球","一顆"],["book","books","📖","書","一本"],
 ["kite","kites","🪁","風箏","一個"],["bird","birds","🐦","鳥","一隻"],["banana","bananas","🍌","香蕉","一根"],["duck","ducks","🦆","鴨子","一隻"]];
/* World 4: [one, many, emoji, 中文]; objects and which places make sense for each */
const PL_ANIMAL = [["cat","cats","🐱","貓"],["dog","dogs","🐶","狗"],["rabbit","rabbits","🐰","兔子"],["duck","ducks","🦆","鴨子"]];
const PL_OBJ = {box:{zh:"箱子", preps:["in","on","next to"]}, table:{zh:"桌子", preps:["on","under","next to"]}, tree:{zh:"樹", preps:["behind","in front of","next to"]}};
const PL_PREP = {"in":"裡面", "on":"上面", "under":"下面", "next to":"旁邊", "behind":"後面", "in front of":"前面"};
/* where the animal is drawn (x, y in %, back = behind the object, s = size) and where its tap zone sits */
const PL_POS = {
 box:  {"in":{x:37,y:47,back:1,zx:37,zy:74}, "on":{x:37,y:38,zx:37,zy:34}, "next to":{x:82,y:73,zx:82,zy:73}},
 table:{"on":{x:37,y:37,zx:37,zy:33}, "under":{x:37,y:76,zx:37,zy:76}, "next to":{x:83,y:74,zx:83,zy:74}},
 tree: {"behind":{x:43,y:64,back:1,s:.85,zx:47,zy:60,zback:1}, "in front of":{x:37,y:80,s:1.1,zx:37,zy:86}, "next to":{x:82,y:76,zx:82,zy:75}}};
const BE_ANIMAL = [["dog","🐶","狗"],["cat","🐱","貓"],["bird","🐦","鳥"],["rabbit","🐰","兔子"],["frog","🐸","青蛙"],["duck","🦆","鴨子"]];
const ADV_DAILY_GOAL = 2;      // stages per day before the "time for a break" message
const ADV_CLEAR_CANS = 5;      // 🥫 for a stage's first clear
const ADV_CLEAR_XP = 10;
const ADV_ROOMS = [   // World 1
 {k:"listen", ic:"👂", zh:"聽聲音，找到對的圖片"},
 {k:"letter", ic:"🔤", zh:"這個東西是哪個字母開頭？"},
 {k:"memory", ic:"🃏", zh:"翻牌配對：圖片和英文配成一對"},
 {k:"speak",  ic:"🗣️", zh:"聽一聽，再大聲說出來"}];
const ADV_ROOMS_BE = [   // World 2
 {k:"learn",  ic:"📖", zh:"先看一看：誰配哪一個？"},
 {k:"listen", ic:"👂", zh:"聽句子，找到對的圖片"},
 {k:"be",     ic:"🧩", zh:"選一選：am、is 還是 are？"},
 {k:"build",  ic:"🚂", zh:"照順序點字卡，排出句子"},
 {k:"speak",  ic:"🗣️", zh:"聽一聽，再大聲說出來"}];
const ADV_ROOMS_VERB = [   // World 3
 {k:"learn",  ic:"📖", zh:"先看一看：什麼時候加 s？"},
 {k:"listen", ic:"👂", zh:"聽句子，找到對的圖片"},
 {k:"judge",  ic:"🐱", zh:"貓咪說得對不對？"},
 {k:"be",     ic:"🧩", zh:"選一選：動詞長什麼樣子？"},
 {k:"build",  ic:"🚂", zh:"照順序點字卡，排出句子"},
 {k:"speak",  ic:"🗣️", zh:"聽一聽，再大聲說出來"}];
const ADV_ROOMS_PLACE = [   // World 4
 {k:"learn",  ic:"📖", zh:"先看一看：動物在哪裡？"},
 {k:"listen", ic:"👂", zh:"聽句子，找到對的圖片"},
 {k:"place",  ic:"🐾", zh:"放放看：動物要放在哪裡？"},
 {k:"be",     ic:"🧩", zh:"選一選：哪個字放進去？"},
 {k:"build",  ic:"🚂", zh:"照順序點字卡，排出句子"},
 {k:"speak",  ic:"🗣️", zh:"聽一聽，再大聲說出來"}];
const ADV_ROOMS_PROG = [   // World 5
 {k:"learn",  ic:"📖", zh:"先看一看：正在做什麼？"},
 {k:"listen", ic:"👂", zh:"聽句子，找到對的圖片"},
 {k:"freeze", ic:"📸", zh:"快拍！現在？還是每天？"},
 {k:"be",     ic:"🧩", zh:"選一選：哪個放進去？"},
 {k:"build",  ic:"🚂", zh:"照順序點字卡，排出句子"},
 {k:"speak",  ic:"🗣️", zh:"聽一聽，再大聲說出來"}];
const ADV_ROOMS_HAVE = [   // World 7
 {k:"learn",  ic:"📖", zh:"先看一看：have 還是 has？"},
 {k:"listen", ic:"👂", zh:"聽句子，找到對的圖片"},
 {k:"pack",   ic:"🎒", zh:"打包！點出他有的東西"},
 {k:"be",     ic:"🧩", zh:"選一選：哪個放進去？"},
 {k:"build",  ic:"🚂", zh:"照順序點字卡，排出句子"},
 {k:"speak",  ic:"🗣️", zh:"聽一聽，再大聲說出來"}];
const ADV_ROOMS_THIS = [   // World 8
 {k:"learn",  ic:"📖", zh:"先看一看：近的？遠的？一個？很多個？"},
 {k:"listen", ic:"👂", zh:"聽句子，找到對的圖片"},
 {k:"point",  ic:"👉", zh:"指指看！句子說的是哪一個？"},
 {k:"be",     ic:"🧩", zh:"選一選：哪個放進去？"},
 {k:"build",  ic:"🚂", zh:"照順序點字卡，排出句子"},
 {k:"speak",  ic:"🗣️", zh:"聽一聽，再大聲說出來"}];
const ADV_ROOMS_CAN = [   // World 6
 {k:"learn",  ic:"📖", zh:"先看一看：會不會做？"},
 {k:"listen", ic:"👂", zh:"聽句子，找到對的圖片"},
 {k:"answer", ic:"🙋", zh:"回答問題：Yes 還是 No？"},
 {k:"be",     ic:"🧩", zh:"選一選：哪個放進去？"},
 {k:"build",  ic:"🚂", zh:"照順序點字卡，排出句子"},
 {k:"speak",  ic:"🗣️", zh:"聽一聽，再大聲說出來"}];
let ADV = null;

function advData(){ const a = store.data.adv = store.data.adv || {}; a.stages = a.stages || {}; a.day = a.day || {d:null, n:0}; return a; }
function advAll(){ return ADV_WORLDS.flatMap(w=>w.stages); }
function advStage(id){ return advAll().find(s=>s.id===id); }
function advWorldOf(st){ return ADV_WORLDS.find(w=>w.stages.includes(st)); }
/* each world's first stage is open (older kids can skip the ABCs); inside a world, one by one */
function advUnlocked(st){ const w=advWorldOf(st), i=w.stages.indexOf(st); return i===0 || !!advData().stages[w.stages[i-1].id]; }
function advToday(){ const a=advData(); return a.day.d===todayKey() ? a.day.n : 0; }
/* next stage = keep going in the world played most recently, else the first uncleared stage */
function advNext(){
  const a=advData(); let last=null, at="";
  advAll().forEach(s=>{ const r=a.stages[s.id]; if(r && (r.at||"")>=at){ at=r.at||""; last=s; } });
  const inWorld = last && advWorldOf(last).stages.find(s=>!a.stages[s.id]);
  return inWorld || advAll().find(s=>!a.stages[s.id]) || null;
}
function advLabel(st){ return st.label || st.letters.split("").join(" "); }
function advStars(n){ return "⭐".repeat(n) + "☆".repeat(3-n); }

function advWords(st){
  const out=[];
  st.letters.split("").forEach(L=>{
    const g = (typeof ABC_PH!=="undefined") && ABC_PH[L]; if(!g) return;
    g.w.forEach(([w,e])=> out.push({w, e, zh:(typeof ABC_WORD_ZH!=="undefined" && ABC_WORD_ZH[w])||"", L, starts:w[0].toUpperCase()===L}));
  });
  return out;
}
function advSayZh(text){
  try{
    if(!window.speechSynthesis) return;
    tts.stop(); speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "zh-TW"; u.rate = 0.95;
    const v = speechSynthesis.getVoices().find(v=>/^zh[-_](TW|HK)/i.test(v.lang)) || speechSynthesis.getVoices().find(v=>/^zh/i.test(v.lang));
    if(v) u.voice = v;
    speechSynthesis.speak(u);
  }catch(e){}
}
function advWord(w){
  if(typeof PH_AUDIO!=="undefined" && !advWord.merged){ Object.assign(PH_AUDIO, ADV_AUDIO); advWord.merged=true; }
  if(typeof phSpeak==="function") phSpeak(w, 0.9); else speak(w);
}

/* ---------- World 2 sentence data ---------- */
function beFeel(sk, f){
  const S = BE_SUBJ[sk];
  return {w:`${S.w} ${S.be} ${f[0]}.`, words:[S.w, S.be, f[0]], subj:sk, be:S.be, key:f[0], kind:"feel",
    e:S.e+f[1], lab:S.zh, zh:`${S.zh}${f[2]}。`};
}
function beAnimal(many, a){
  return many
    ? {w:`They are ${a[0]}s.`, words:["They","are",a[0]+"s"], subj:"they", be:"are", key:a[0], many:true, kind:"animal", e:a[1]+a[1], lab:"", zh:`牠們是${a[2]}。`}
    : {w:`It is a ${a[0]}.`, words:["It","is","a",a[0]], subj:"it", be:"is", key:a[0], many:false, kind:"animal", e:a[1], lab:"", zh:`牠是一隻${a[2]}。`};
}
function beItems(st){
  const feel = sks => sks.flatMap(sk=>BE_FEEL.map(f=>beFeel(sk, f)));
  const animals = () => BE_ANIMAL.flatMap(a=>[beAnimal(false,a), beAnimal(true,a)]);
  if(st.kind==="feel") return feel(st.subj);
  if(st.kind==="animal") return animals();
  return [...feel(["I","you","he","she","we","they"]), ...animals()];
}
/* ---------- World 3 verb data ---------- */
function vbThird(sk){ return sk==="he" || sk==="she"; }
function vbMake(sk, v){
  const S = BE_SUBJ[sk], form = vbThird(sk) ? v[1] : v[0], obj = v[2] ? v[2].split(" ") : [];
  const opts = [...new Set([v[0], v[0]+"s", v[1]])];   // e.g. watch / watchs / watches
  return {w:[S.w, form, ...obj].join(" ")+".", words:[S.w, form, ...obj], subj:sk, key:v[0], v, kind:"verb",
    ans:form, opts, e:S.e+v[3], lab:S.zh, zh:`${S.zh}${v[4]}。`};
}
/* a wrong version for the "is the cat right?" room: he/she without s (or watchs), I/you/we/they with s */
function vbWrong(t){
  const v = t.v, bad = vbThird(t.subj) ? (v[0]+"s"!==v[1] && Math.random()<.5 ? v[0]+"s" : v[0]) : v[1];
  return [BE_SUBJ[t.subj].w, bad, ...(v[2]?v[2].split(" "):[])].join(" ")+".";
}
function vbItems(st){
  const vs = st.verbs==="easy" ? VB_EASY : st.verbs==="es" ? VB_ES : [...VB_EASY, ...VB_ES];
  return st.subj.flatMap(sk=>vs.map(v=>vbMake(sk, v)));
}
/* ---------- World 4 place data ---------- */
/* n: 0 = "The cat is in the box."  1 = "There is a cat in the box."  2 = "There are two cats in the box." */
function plMake(a, obj, prep, n){
  const O = PL_OBJ[obj], where = [prep, "the", obj];
  const base = {kind:"place", subj:a[0], key:prep+"|"+obj, prep, obj, n, a, e:"", lab:"",
    scene:{e:a[2], n:n===2?2:1, obj, prep}};
  if(!n) return {...base, w:`The ${a[0]} is ${prep} the ${obj}.`, words:["The",a[0],"is",...where], bi:3, ans:prep,
    opts:shuffle(O.preps.slice()), /* the three places that make sense for this object */ zh:`${a[3]}在${O.zh}${PL_PREP[prep]}。`};
  if(n===1) return {...base, w:`There is a ${a[0]} ${prep} the ${obj}.`, words:["There","is","a",a[0],...where], bi:1, ans:"is",
    opts:["is","are"], zh:`${O.zh}${PL_PREP[prep]}有一隻${a[3]}。`};
  return {...base, w:`There are two ${a[1]} ${prep} the ${obj}.`, words:["There","are","two",a[1],...where], bi:1, ans:"are",
    opts:["is","are"], zh:`${O.zh}${PL_PREP[prep]}有兩隻${a[3]}。`};
}
function plItems(st){
  const ns = st.there==="mix" ? [0,1,2] : st.there ? [1,2] : [0];
  const out = [];
  Object.keys(PL_OBJ).forEach(obj=>PL_OBJ[obj].preps.forEach(prep=>{
    if(!st.preps.includes(prep)) return;
    PL_ANIMAL.forEach(a=>ns.forEach(n=>{ if(n && obj==="tree") return; out.push(plMake(a, obj, prep, n)); }));
  }));
  return out;
}
/* a little scene: SVG object + emoji animal(s) layered behind or in front of it */
function plObjSVG(obj){
  const svg = {
    box:`<rect x="11" y="52" width="52" height="5" rx="1.5" fill="#8a5a2e"/><rect x="12" y="56" width="50" height="34" rx="2" fill="#c8915a"/><path d="M12 64h50" stroke="#a8743f" stroke-width="1.6"/><path d="M33 56v34" stroke="#b17d47" stroke-width="1" opacity=".6"/>`,
    table:`<rect x="6" y="51" width="62" height="7" rx="2" fill="#9c6b3f"/><rect x="11" y="57" width="6" height="35" fill="#86582f"/><rect x="57" y="57" width="6" height="35" fill="#86582f"/>`,
    tree:`<circle cx="37" cy="32" r="25" fill="#6fbf73"/><circle cx="24" cy="38" r="13" fill="#5fae64"/><circle cx="51" cy="36" r="14" fill="#5fae64"/><rect x="30.5" y="50" width="13" height="44" rx="2" fill="#8b5a2b"/>`}[obj];
  return `<svg class="pl-obj" viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="94" rx="48" ry="4" fill="#000" opacity=".06"/>${svg}</svg>`;
}
function plAnimals(sc, prep){
  const P = PL_POS[sc.obj][prep||sc.prep], two = sc.n===2;
  const dx = (prep||sc.prep)==="next to" ? 9 : 11, x0 = (prep||sc.prep)==="next to" && two ? P.x-2 : P.x;
  return [two?-1:0, ...(two?[1]:[])].map(d=>`<span class="pl-ani${P.back?" back":""}" style="left:${x0+d*dx}%;top:${P.y}%;--s:${(P.s||1)*(two?.72:1)}">${sc.e}</span>`).join("");
}
function plScene(sc, zones){
  return `<span class="pl-scene">${plObjSVG(sc.obj)}${sc.hide?"":plAnimals(sc)}${zones||""}</span>`;
}
/* ---------- World 5 data ---------- */
/* mode: "p" = She is swimming.  "pn" = She is swimming now.  "se" = She swims every day. */
function pgMake(sk, v, mode){
  const S = BE_SUBJ[sk], obj = v[3] ? [v[3]] : [], prog = mode!=="se";
  const simple = vbThird(sk) ? v[1] : v[0], phrase = `${S.be} ${v[2]}`;
  const words = prog ? [S.w, S.be, v[2], ...obj, ...(mode==="pn"?["now"]:[])] : [S.w, simple, ...obj, "every day"];
  const it = {kind:"prog", subj:sk, key:v[0], v, mode, words, w:words.join(" ")+".", e:S.e+v[4], lab:S.zh,
    tag: mode==="pn" ? "now" : mode==="se" ? "every" : "",
    zh: prog ? `${S.zh}${mode==="pn"?"現在":""}正在${v[5]}。` : `${S.zh}每天${v[5]}。`,
    fans: prog ? phrase : simple, fopts: [phrase, simple]};
  if(mode==="p"){   /* the blank is the -ing word: singing / sing / sings, or a misspelling (runing, danceing) */
    it.bi = 2; it.ans = v[2];
    it.opts = [v[2], v[6]==="add" ? v[0] : v[0]+"ing", v[1]];
  } else {          /* the blank is the whole verb part: is swimming / swims / swimming */
    it.bi = 1; it.bl = prog ? 2 : 1; it.ans = it.fans;
    it.opts = [phrase, simple, v[2]];
  }
  return it;
}
function pgItems(st){
  const vs = st.verbs==="add" ? VB_ING.filter(v=>v[6]==="add") : st.verbs==="spell" ? VB_ING.filter(v=>v[6]!=="add") : VB_ING;
  const modes = st.tense ? ["pn","se"] : ["p"];
  return st.subj.flatMap(sk=>vs.flatMap(v=>modes.map(m=>pgMake(sk, v, m))));
}
/* ---------- World 6 data ---------- */
/* the short answer's subject: asked "you", you answer "I" */
function cnPron(sk){ return sk==="you" ? "I" : sk; }
/* mode "s" = He can swim. / He can't swim.   mode "q" = Can he swim?
   focus picks the 🧩 blank: "verb" (can ___ → swim / swims / swimming), "modal" (can / can't from the ✓ ✗),
   "q" (___ he swim? → Can / Does / Is), "mix" = verb for can, modal for can't, q for questions */
function cnMake(sk, v, yes, mode, focus){
  const S = BE_SUBJ[sk], obj = v[3] ? v[3].split(" ") : [], q = mode==="q", modal = yes ? "can" : "can't";
  const words = q ? ["Can", sk==="I" ? "I" : sk, v[0], ...obj] : [S.w, modal, v[0], ...obj];
  const ap = cnPron(sk), okAns = yes ? `Yes, ${ap} can.` : `No, ${ap} can't.`;
  const it = {kind:"can", subj:sk, key:v[0], v, yes, mode, mark: yes ? "yes" : "no", words, end: q ? "?" : ".",
    w: words.join(" ")+(q ? "?" : "."), e:S.e+v[4], lab:S.zh, okAns,
    zh: q ? `${S.zh}會${v[5]}嗎？` : `${S.zh}${yes?"會":"不會"}${v[5]}。`};
  const f = focus==="mix" ? (q ? "q" : yes ? "verb" : "modal") : focus;
  if(f==="q"){ it.bi = 0; it.ans = "Can"; it.opts = ["Can","Does","Is"]; it.cls = "q"; }
  else if(f==="modal"){ it.bi = 1; it.ans = modal; it.opts = ["can","can't"]; it.cls = yes ? "can" : "cant"; }
  else { it.bi = 2; it.ans = v[0]; it.opts = [v[0], v[1], v[2]]; it.cls = yes ? "can" : "cant"; }
  /* the 🙋 room asks about this picture and plays the short answer — both need audio */
  if(CN_ASK.includes(sk)) it.say = [`Can ${sk} ${[v[0], ...obj].join(" ")}?`, okAns];
  return it;
}
function cnItems(st){
  const pol = st.neg ? [true, false] : [true], out = [];
  if(st.modes.includes("s")) st.subj.forEach(sk=>CN_ACT.forEach(v=>pol.forEach(y=>out.push(cnMake(sk, v, y, "s", st.focus)))));
  if(st.modes.includes("q")) st.subj.filter(sk=>CN_ASK.includes(sk)).forEach(sk=>CN_ACT.forEach(v=>pol.forEach(y=>out.push(cnMake(sk, v, y, "q", st.focus)))));
  return out;
}
/* 🙋 room: the question about t's picture, the right short answer and two traps */
function cnAnswer(t){
  const sk = t.subj, ap = cnPron(sk), q = `Can ${sk} ${[t.v[0], ...(t.v[3] ? [t.v[3]] : [])].join(" ")}?`;
  const flip = t.yes ? `No, ${ap} can't.` : `Yes, ${ap} can.`;
  const trap = sk==="you" ? (t.yes ? "Yes, you can." : "No, you can't.")
    : sk==="they" ? (t.yes ? "Yes, they do." : "No, they don't.")
    : (t.yes ? `Yes, ${sk} does.` : `No, ${sk} doesn't.`);
  const pairs = shuffle([[t.okAns,"ok"], [flip,"flip"], [trap, sk==="you" ? "you" : "do"]]);
  return {t, q, ok:t.okAns, opts:pairs.map(p=>p[0]), types:pairs.map(p=>p[1])};
}
function cnAnswerSet(st, core, pool){
  const want = st.boss ? 4 : 3, src = [...core, ...pool].filter(x=>CN_ASK.includes(x.subj)), picked = [], seen = {};
  const take = x => { const k = x.subj+"|"+x.key; if(!seen[k] && picked.length<want){ seen[k] = 1; picked.push(x); } };
  if(st.neg){ const y = src.find(x=>x.yes), n = src.find(x=>!x.yes); if(y) take(y); if(n) take(n); }   // both ✓ and ✗
  src.forEach(take);
  return shuffle(picked).map(cnAnswer);
}
function cnLearn(st, core, pool){
  const c = core[0];
  if(st.learn==="verb") return st.subj.map(sk=>({ex: core.find(x=>x.subj===sk) || pool.find(x=>x.subj===sk)}));
  if(st.learn==="neg") return [true, false].map(y=>({ex: cnMake(c.subj, c.v, y, "s", "modal")}));
  if(st.learn==="q") return [{ex: cnMake("you", c.v, true, "q", "q")}, {ex: cnMake(c.subj==="you" ? "she" : c.subj, c.v, false, "q", "q")}];
  return [{ex: cnMake("she", c.v, true, "s", "verb")}, {ex: cnMake("he", c.v, false, "s", "modal")}, {ex: cnMake("you", c.v, true, "q", "q")}];
}
function cnMark(m, k){ const hv = k==="have"; return `<small class="cn-mark ${m}">${m==="yes" ? (hv ? "✓ 有" : "✓ 會") : (hv ? "✗ 沒有" : "✗ 不會")}</small>`; }
function cnBeHint(t){
  return `<div class="adv-hint">${t.bi===0 ? "問「會不會」，用 Can 開頭：Can he swim?"
    : t.bi===1 ? "看圖：✓ 會 → can　✗ 不會 → can't"
    : `can 後面接動詞原形：can ${t.v[0]}（不加 s，也不加 ing）`}</div>`;
}
/* ---------- World 7 data ---------- */
function hvForm(sk){ return vbThird(sk) ? "has" : "have"; }
/* mode "s" = She has a ball.   mode "q" = Does she have a ball? (mark ✓ / ✗ = the true short answer)
   focus picks the 🧩 blank: "verb" (have / has / haves, or have / has / am), "q" (Do / Does, or "Does she ___" → have),
   "mix" = verb for statements, q for questions */
function hvMake(sk, th, yes, mode, focus){
  const S = BE_SUBJ[sk], third = vbThird(sk), q = mode==="q", aux = third ? "Does" : "Do", hv = hvForm(sk);
  const words = q ? [aux, sk, "have", "a", th[0]] : [S.w, hv, "a", th[0]];
  const ap = cnPron(sk), okAns = yes ? `Yes, ${ap} ${third?"does":"do"}.` : `No, ${ap} ${third?"doesn't":"don't"}.`;
  const it = {kind:"have", subj:sk, key:th[0], th, yes, mode, mark: q ? (yes ? "yes" : "no") : "", words, end: q ? "?" : ".",
    w: words.join(" ")+(q ? "?" : "."), e:S.e+th[1], lab:S.zh, okAns,
    zh: q ? `${S.zh}有${th[3]}${th[2]}嗎？` : `${S.zh}有${th[3]}${th[2]}。`};
  const f = focus==="mix" ? (q ? "q" : "verb") : focus;
  if(f==="q"){
    if(third && HV_THING.indexOf(th)%2){ it.bi = 2; it.ans = "have"; it.opts = ["have","has","haves"]; }   // Does she ___ ? → have
    else { it.bi = 0; it.ans = aux; it.opts = third ? ["Does","Do","Is"] : ["Do","Does","Are"]; }
    it.cls = "q";
  } else { it.bi = 1; it.ans = hv; it.opts = third ? ["has","have","haves"] : ["have","has",S.be]; it.cls = hv; }
  return it;
}
/* the 🎒 sentence for subject sk and thing i: n 1 = "I have a ball and a kite."  n 2 adds the other person first
   ("She has a ruler. I have a ball and a kite.")  n 3 = the same with three things */
function hvPack(sk, i, n){
  const S = BE_SUBJ[sk], own = (n===3 ? [0,1,2] : [0,1]).map(k=>(i+k)%HV_THING.length), nm = own.map(j=>"a "+HV_THING[j][0]);
  const list = nm.length===3 ? `${nm[0]}, ${nm[1]} and ${nm[2]}` : `${nm[0]} and ${nm[1]}`;
  let sent = `${S.w} ${hvForm(sk)} ${list}.`, other = null;
  if(n>=2){ const o = vbThird(sk) ? "I" : "she", oi = (i+4)%HV_THING.length;
    other = {subj:o, idx:oi}; sent = `${BE_SUBJ[o].w} ${hvForm(o)} a ${HV_THING[oi][0]}. ${sent}`; }
  return {subj:sk, own, other, sent};
}
function hvItems(st){
  const pol = st.neg ? [true, false] : [true], out = [];
  if(st.modes.includes("s")) st.subj.forEach(sk=>HV_THING.forEach(th=>out.push(hvMake(sk, th, true, "s", st.focus))));
  if(st.modes.includes("q")) st.subj.filter(sk=>HV_ASK.includes(sk)).forEach(sk=>HV_THING.forEach(th=>pol.forEach(y=>out.push(hvMake(sk, th, y, "q", st.focus)))));
  out.forEach(it=>{ it.say = [hvPack(it.subj, HV_THING.indexOf(it.th), st.pack).sent]; });   // the 🎒 room's sentence needs audio
  return out;
}
function hvLearn(st, core){
  const c = core[0], i = HV_THING.indexOf(c.th);
  if(st.learn==="verb") return (st.subj.length>2 ? ["I","she","they"] : st.subj).map(sk=>({ex: hvMake(sk, c.th, true, "s", "verb")}));
  if(st.learn==="q") return [{ex: hvMake("you", c.th, true, "q", "q")}, {ex: hvMake("she", HV_THING[(i+1)%HV_THING.length], false, "q", "q")}];
  return [{ex: hvMake("I", c.th, true, "s", "verb")}, {ex: hvMake("she", c.th, true, "s", "verb")}, {ex: hvMake("he", c.th, true, "q", "q")}];
}
function hvBeHint(t){
  const S = BE_SUBJ[t.subj];
  return `<div class="adv-hint">${t.mode==="q" && t.bi===0 ? "問「有沒有」：he、she 用 Does；I、you、we、they 用 Do"
    : t.mode==="q" ? "Does 後面的動詞要變回 have：Does she have…?（不是 has）"
    : vbThird(t.subj) ? `${S.w}（${S.zh}）用 has——不是 have，也不是 haves`
    : `${S.w}（${S.zh}）用 have——前面不用 ${S.be}：${S.w} have a ${t.key}.`}</div>`;
}
/* ---------- World 8 data ---------- */
function dmWord(dist, n){ return n===1 ? (dist==="near" ? "This" : "That") : (dist==="near" ? "These" : "Those"); }
/* dist "near" / "far" × n 1 / 2: This is a cat. / That is a cat. / These are cats. / Those are cats.
   focus picks the 🧩 blank: "dem" (the first word; options depend on which counts the stage has), "agree" (is / are, or
   "These are ___" → cats / cat), "mix" = dem for even things, agree for odd ones */
function dmMake(dist, n, th, focus, nums){
  const one = n===1, near = dist==="near", dem = dmWord(dist, n), i = DM_THING.indexOf(th);
  const words = one ? [dem, "is", "a", th[0]] : [dem, "are", th[1]];
  const it = {kind:"this", subj:dem.toLowerCase(), key:th[0], th, n, dist, words, end:".", w:words.join(" ")+".",
    e: th[2].repeat(n), lab:"", zh:`${near ? (one?"這":"這些") : (one?"那":"那些")}是${one ? th[4] : ""}${th[3]}。`};
  const f = focus==="mix" ? (i%2 ? "agree" : "dem") : focus;
  if(f==="agree"){
    if(!one && i%2){ it.bi = 2; it.ans = th[1]; it.opts = [th[1], th[0]]; it.cls = "are"; }   // These are ___ → cats (not cat)
    else { it.bi = 1; it.ans = one ? "is" : "are"; it.opts = ["is","are"]; it.cls = one ? "is" : "are"; }
  } else {
    it.bi = 0; it.ans = dem; it.cls = dist;
    const ns = nums || [1,2];
    it.opts = ns.length>1 ? ["This","That","These","Those"]
      : one ? ["This","That"] : [dem, dmWord(near ? "far" : "near", 2), dmWord(dist, 1)];   // these / those / this (the "This are" trap)
  }
  return it;
}
function dmItems(st){
  const out = [];
  DM_THING.forEach(th=>st.nums.forEach(n=>["near","far"].forEach(d=>out.push(dmMake(d, n, th, st.focus, st.nums)))));
  return out;
}
function dmTag(dist){ return `<small class="dm-tag ${dist}">${dist==="near" ? "👇 近" : "👉 遠"}</small>`; }
function dmLearn(st, core){
  const th = core[0].th, mk = (d, n) => ({ex: dmMake(d, n, th, "dem", [1,2])});
  if(st.learn==="one") return [mk("near",1), mk("far",1)];
  if(st.learn==="many") return [mk("near",2), mk("far",2)];
  if(st.learn==="agree") return [mk("near",1), mk("near",2)];
  return [mk("near",1), mk("far",1), mk("near",2), mk("far",2)];
}
/* 👉 room: four groups — every near / far × one / many — three of t's thing and one of another thing.
   type: ok · dist (right count, wrong distance) · num (right distance, wrong count) · noun (the other thing) */
function dmPointSet(st, core){
  return shuffle(core).slice(0, st.boss?4:3).map(t=>{
    const other = shuffle(DM_THING.filter(x=>x!==t.th))[0];
    const groups = [["far",1],["far",2],["near",1],["near",2]].map(([d,n])=>{
      const type = d===t.dist && n===t.n ? "ok" : d!==t.dist && n!==t.n ? "noun" : d!==t.dist ? "dist" : "num";
      return {d, n, th: type==="noun" ? other : t.th, type};
    });
    return {t, groups:[...shuffle(groups.slice(0,2)), ...shuffle(groups.slice(2))]};   // 0–1 far row, 2–3 near row
  });
}
function dmBeHint(t){
  return `<div class="adv-hint">${t.bi===0
    ? `先看${t.dist==="near"?"近 👇":"遠 👉"}，再數${t.n===1?"一個":"很多個"}<br><span class="adv-hint-rule"><span>近 👇 → this（一個）/ these（很多個）</span><span>遠 👉 → that（一個）/ those（很多個）</span></span>`
    : t.bi===1 ? `${t.words[0]} 是${t.n===1?"一個 → is":"很多個 → are"}<br><span class="adv-hint-rule"><span>this / that → is</span><span>these / those → are</span></span>`
    : `${t.words[0]}（很多個）後面的東西要加 s：${t.th[1]}`}</div>`;
}
function advItems(st){ const k = advWorldOf(st).kind; return k==="verb" ? vbItems(st) : k==="place" ? plItems(st) : k==="prog" ? pgItems(st) : k==="can" ? cnItems(st) : k==="have" ? hvItems(st) : k==="this" ? dmItems(st) : beItems(st); }
/* the "who" distractor: same feeling / animal / action, someone else */
function advWho(t){
  if(t.kind==="animal") return beAnimal(!t.many, BE_ANIMAL.find(a=>a[0]===t.key));
  if(t.kind==="this") return dmMake(t.dist==="near" ? "far" : "near", t.n, t.th, "dem");   // this ↔ that, these ↔ those
  if(t.kind==="have") return hvMake(shuffle((t.mode==="q" ? HV_ASK : ["I","you","he","she","we","they"]).filter(k=>k!==t.subj))[0], t.th, t.yes, t.mode, "verb");
  if(t.kind==="can") return cnMake(shuffle((t.mode==="q" ? CN_ASK : ["I","you","he","she","we","they"]).filter(k=>k!==t.subj))[0], t.v, t.yes, t.mode, "verb");
  const other = shuffle(["I","you","he","she","we","they"].filter(k=>k!==t.subj))[0];
  if(t.kind==="prog") return pgMake(other, t.v, t.mode);
  return t.kind==="verb" ? vbMake(other, t.v) : beFeel(other, BE_FEEL.find(f=>f[0]===t.key));
}
function vbMark(base, form){ let i=0; while(i<base.length && base[i]===form[i]) i++; return form.slice(0,i)+(i<form.length?`<u>${form.slice(i)}</u>`:""); }
/* every sentence Worlds 2–8 can say (plus World 6's questions and short answers, World 7's 🎒 sentences) — tools/gen_adv_audio.mjs renders these */
function advAllSentences(){
  const out = new Set();
  ADV_WORLDS.filter(w=>w.kind!=="abc").forEach(w=>w.stages.forEach(st=>advItems(st).forEach(it=>{ out.add(it.w); (it.say||[]).forEach(s=>out.add(s)); })));
  return [...out];
}
/* a recognizer result counts if it has every word of the target (contractions expanded, "a" optional) */
function advExpand(s){
  return (" "+s+" ").replace(/ i'm /g," i am ").replace(/ (you|we|they)'re /g," $1 are ").replace(/ (he|she|it)'s /g," $1 is ")
    .replace(/ that's /g," that is ").replace(/ can ?not | can t /g," can't ").trim();   // "cannot", or a curly apostrophe srNorm turned into a space
}
function advHeardOk(alts, t){
  const want = srNorm(t.w).split(" ").filter(x=>x && x!=="a" && x!=="the");
  return alts.some(a=>{ const got = advExpand(srNorm(a)).split(" "); return want.every(x=>got.includes(x)); });
}

/* ---------- home card + map ---------- */
function advHomeCard(){
  if(typeof currentUser==="function" && !currentUser()) return "";
  const nx = advNext(), today = advToday();
  const line = nx ? `下一關：${advWorldOf(nx).title} · ${advLabel(nx)}` : "所有世界都破關了！🏆";
  return `<section class="card adv-home"><div class="adv-home-art">🗺️</div>
    <div class="adv-home-txt"><div class="eyebrow">小冒險 · 每關 5 分鐘</div><h2>${line}</h2>
    <p>聽一聽、點一點、排一排、說說看——每關幾個小遊戲，玩完開寶箱。今天已完成 <b>${today}</b> / ${ADV_DAILY_GOAL} 關</p></div>
    <a class="btn btn-primary adv-home-go" href="#/adventure${nx?"/"+nx.id:""}">▶ ${nx?"開始冒險":"回到地圖"}</a></section>`;
}
function renderAdventure(){
  advQuit(true);
  const a = advData(), today = advToday(), nx = advNext();
  const nodes = ADV_WORLDS.map((w,wi)=>{
    const items = w.stages.map((st,i)=>{
      const rec = a.stages[st.id], open = advUnlocked(st), isNext = !rec && open;
      const cls = rec ? "done" : open ? "next" : "locked";
      const inner = `<span class="adv-node-ic">${open?st.icon:"🔒"}</span><span class="adv-node-lv">${st.boss?"大魔王":`第 ${i+1} 關`}</span><span class="adv-node-l">${advLabel(st).split(" · ").length===2?advLabel(st).replace(" · ","<br>"):advLabel(st)}</span>`;
      const stars = rec ? `<span class="adv-node-stars">${advStars(rec.stars||1)}</span>` : isNext ? `<span class="adv-node-stars go">${st===nx?"▶ 從這裡開始":"▶ 可以挑戰"}</span>` : "";
      return `<div class="adv-step ${i%2?"r":"l"}">${open
        ? `<a class="adv-node ${cls}${st.boss?" boss":""}" href="#/adventure/${st.id}">${inner}</a>`
        : `<div class="adv-node ${cls}${st.boss?" boss":""}" aria-disabled="true">${inner}</div>`}${stars}</div>`;
    }).join("");
    const cleared = w.stages.filter(st=>a.stages[st.id]).length;
    return `<section class="adv-world adv-${w.kind}" id="adv-${w.id}"><div class="adv-world-h"><span>${w.emoji}</span><div><b>世界 ${wi+1} · ${w.title}</b><small>${w.en}：${w.sub}　（${cleared}/${w.stages.length}）</small>${w.note&&!cleared?`<small class="adv-world-note">${w.note}</small>`:""}</div></div>
      <div class="adv-path">${items}</div></section>`;
  }).join("");
  const rest = today >= ADV_DAILY_GOAL
    ? `<div class="adv-rest">🎉 今天的冒險完成了（${today} 關）！眼睛休息一下，明天再來找貓咪。<span>還想玩也可以繼續 🐾</span></div>`
    : `<div class="adv-today">今天的冒險：<b>${today}</b> / ${ADV_DAILY_GOAL} 關 ${"🐾".repeat(today)}${"·".repeat(Math.max(0,ADV_DAILY_GOAL-today))}</div>`;
  app.innerHTML = `<div class="view adv">
    <div class="crumb"><a href="#/home">Home</a> › 小冒險</div>
    <div class="adv-hero"><div><div class="eyebrow">Mini Adventures · 小冒險</div>
      <h1 class="display">貓咪島小冒險 🗺️</h1>
      <p>一關只要 5 分鐘：聽一聽 → 點一點 → 排一排 → 說說看 → 🎁 開寶箱！破關拿罐罐 🥫，一關一關往前走。</p></div>
      <div class="adv-hero-cat">${typeof catSVG==="function"?catSVG(110,"orange"):""}</div></div>
    ${rest}
    ${nodes}
  </div>`;
  /* three worlds make a long map: jump to where this child is */
  if(nx && Object.keys(a.stages).length) setTimeout(()=>{ const el=document.querySelector(`.adv-node[href="#/adventure/${nx.id}"]`); if(el) el.scrollIntoView({block:"center"}); }, 60);
}

/* ---------- a stage ---------- */
function advStart(id){
  const st = advStage(id);
  if(!st){ location.hash = "#/adventure"; return; }
  if(!advUnlocked(st)){ toast("先完成前面的關卡喔 🐾"); location.hash = "#/adventure"; return; }
  advQuit(true);
  if(advWorldOf(st).kind!=="abc"){ advStartSent(st); return; }
  const words = advWords(st);
  const starters = words.filter(x=>x.starts);
  /* core = 4 words from different letters → reused across rooms for repetition */
  const core = [];
  shuffle(st.letters.split("")).forEach(L=>{ if(core.length>=4) return; const c=shuffle(starters.filter(x=>x.L===L))[0]; if(c) core.push(c); });
  const distract = (target, pool, n) => shuffle(pool.filter(x=>x.e!==target.e && x.w!==target.w)).slice(0,n);
  const listen = core.map(t=>({t, opts:shuffle([t, ...distract(t, words, 2)])}));
  const letters = [...new Set(st.letters.split("").filter(L=>starters.some(x=>x.L===L)))];
  const letter = shuffle(core).map(t=>({t, opts:shuffle([t.L, ...shuffle(letters.filter(L=>L!==t.L)).slice(0,2)])}));
  const pairs = shuffle(core).slice(0,3);
  const cards = shuffle(pairs.flatMap((p,i)=>[{i, kind:"pic"}, {i, kind:"word"}]));
  const speakW = shuffle(core).slice(0,3);
  ADV = {st, rooms:ADV_ROOMS, room:0, step:0, first:{ok:0,n:0}, tried:false, wrong:{}, locked:false,
    listen, letter, mem:{pairs, cards, open:[], done:{}, busy:false}, speak:speakW, sp:{tries:0, state:"idle", heard:""}};
  advRender(); advAutoAudio();
}
/* Worlds 2–3: one small set of sentences ("core") travels through every room */
function advStartSent(st){
  const verb = advWorldOf(st).kind==="verb", place = advWorldOf(st).kind==="place", prog = advWorldOf(st).kind==="prog", can = advWorldOf(st).kind==="can", have = advWorldOf(st).kind==="have", dm = advWorldOf(st).kind==="this";
  const pool = shuffle(advItems(st)), n = st.boss ? 5 : 4;
  const subs = [...new Set(pool.map(x=>x.subj))], cap = Math.ceil(n/subs.length);
  const core = [], seen = {}, per = {};
  for(const it of pool){
    if(core.length>=n) break;
    if(seen[it.key] || (per[it.subj]||0)>=cap) continue;
    seen[it.key]=1; per[it.subj]=(per[it.subj]||0)+1; core.push(it);
  }
  for(const it of pool){ if(core.length>=n) break; if(!core.includes(it)) core.push(it); }
  const all = advItems(st);
  const pic = x => x.e+"|"+x.lab+"|"+(x.tag||"")+"|"+(x.mark||"")+"|"+(x.scene?JSON.stringify(x.scene):"");
  const listen = (verb||place||prog||can||have||dm ? core.slice(0, st.boss?4:3) : core).map(t=>{
    /* World 8: the other distance (This ↔ That — different words, so you can hear it) + the other count, or another thing */
    if(dm){
      const what = st.nums.length>1 ? dmMake(t.dist, t.n===1?2:1, t.th, "dem") : dmMake(t.dist, t.n, shuffle(DM_THING.filter(x=>x!==t.th))[0], "dem");
      return {t, opts:shuffle([t, advWho(t), what])};
    }
    /* World 6: once can't is taught, the same picture with the other ✓ ✗ is the trap; questions never use it (you can't hear ✓ ✗ in "Can he swim?") */
    if(can||have){
      const opts = [t, advWho(t)];
      if(can && st.neg && t.mode==="s") opts.push(cnMake(t.subj, t.v, !t.yes, "s", "verb"));
      else { const what = shuffle(all.filter(x=>x.key!==t.key && x.subj===t.subj && x.mode===t.mode && x.yes===t.yes))[0]; if(what) opts.push(what); }
      return {t, opts:shuffle(opts)};
    }
    /* World 5 with tags: the same picture with the other tag is the trap */
    if(prog && t.mode!=="p") return {t, opts:shuffle([t, pgMake(t.subj, t.v, t.mode==="pn"?"se":"pn"), advWho(t)])};
    /* World 4: the other pictures are the same animal + object, somewhere else (or a different count) */
    if(place){
      const alt = t.n ? [plMake(t.a, t.obj, t.prep, t.n===1?2:1), plMake(t.a, t.obj, shuffle(PL_OBJ[t.obj].preps.filter(p=>p!==t.prep))[0], t.n)]
                      : PL_OBJ[t.obj].preps.filter(p=>p!==t.prep).map(p=>plMake(t.a, t.obj, p, 0));
      return {t, opts:shuffle([t, ...alt])};
    }
    /* one distractor changes "who", one changes "what" — both have to be heard to choose */
    const who  = advWho(t);
    const what = shuffle(all.filter(x=>x.kind===t.kind && x.key!==t.key && (t.kind==="animal" ? x.many===t.many : x.subj===t.subj)))[0];
    const opts = [t, who, what].filter((x,i,arr)=>x && arr.findIndex(y=>y && pic(y)===pic(x))===i);
    return {t, opts:shuffle(opts)};
  });
  const be = shuffle(core).slice(0, verb||place||prog||can||have||dm ? (st.boss?4:3) : n).map(t=>({t, opts: verb||prog||can||have||dm ? shuffle(t.opts) : place ? t.opts : ["am","is","are"]}));
  const answer = can ? cnAnswerSet(st, core, pool) : [];
  const point = dm ? dmPointSet(st, core) : [];
  /* 🎒 the owner's things + the other person's thing (stage 3 on) + things nobody said = a tray of six */
  const pack = have ? shuffle(core).slice(0, st.boss?4:3).map(t=>{
    const p = hvPack(t.subj, HV_THING.indexOf(t.th), st.pack), used = [...p.own, ...(p.other ? [p.other.idx] : [])];
    const rest = shuffle(HV_THING.map((_,j)=>j).filter(j=>!used.includes(j))).slice(0, 6-used.length);
    return {...p, t, tray:shuffle([...used, ...rest]), got:{}};
  }) : [];
  /* half 📸 now, half 📅 every day */
  const freeze = prog ? shuffle(shuffle(core).slice(0,4).map((t,i)=>{ const f = pgMake(t.subj, t.v, i%2?"pn":"se"); return {t:f, opts:shuffle(f.fopts.slice())}; })) : [];
  const placeQ = place ? shuffle(core).slice(0,4).map(t=>({t, zones:shuffle(PL_OBJ[t.obj].preps.slice())})) : [];
  /* half of the cat's sentences are wrong */
  const judge = verb ? shuffle(shuffle(core).slice(0,4).map((t,i)=>({t, bad: i%2===0, text: i%2===0 ? vbWrong(t) : t.w}))) : [];
  const build = shuffle(core).slice(0, place||prog||can||have||dm?2:3).map(t=>{
    let order; do{ order = shuffle(t.words.map((_,i)=>i)); }while(order.every((v,i)=>v===i));
    return {t, order};
  });
  const speakS = shuffle(core).slice(0,3);
  const learn = dm ? dmLearn(st, core) : have ? hvLearn(st, core) : can ? cnLearn(st, core, pool)
    : prog
    ? (st.learn==="spell" ? ["add","double","drop"].map(r=>({ex: pgMake(st.subj[0], VB_ING.find(v=>v[6]===r), "p")}))
      : st.learn==="tense" ? ["pn","se"].map(m=>({ex: pgMake(core[0].subj, core[0].v, m)}))
      : st.subj.map(sk=>({sk, ex: core.find(x=>x.subj===sk) || pool.find(x=>x.subj===sk)})))
    : place
    ? (st.there===true ? [1,2].map(k=>({ex: pool.find(x=>x.n===k)})) : st.preps.map(p=>({ex: pool.find(x=>x.prep===p && !x.n) || pool.find(x=>x.prep===p)})))
    : (st.boss ? ["I","she","they"] : st.subj).map(sk=>({sk, ex: core.find(x=>x.subj===sk) || pool.find(x=>x.subj===sk)}));
  ADV = {st, rooms: verb ? ADV_ROOMS_VERB : place ? ADV_ROOMS_PLACE : prog ? ADV_ROOMS_PROG : can ? ADV_ROOMS_CAN : have ? ADV_ROOMS_HAVE : dm ? ADV_ROOMS_THIS : ADV_ROOMS_BE, room:0, step:0, first:{ok:0,n:0}, tried:false, wrong:{}, locked:false,
    learn, listen, be, judge, place:placeQ, freeze, answer, pack, point, build, bd:{step:-1, placed:[], err:false}, speak:speakS, sp:{tries:0, state:"idle", heard:""}};
  advRender(); advAutoAudio();
}
function advQuit(silent){
  if(ADV && typeof sr!=="undefined" && sr.busy) sr.stop();
  clearTimeout(advQuit._t); ADV = null;
}
function advPaws(){
  const n = ADV.rooms.length;
  return `<div class="adv-paws">${Array.from({length:n+1},(_,i)=>`<span class="${i<ADV.room?"on":i===ADV.room?"cur":""}">${i<n?"🐾":"🎁"}</span>`).join("")}</div>`;
}
function advRender(){
  if(!ADV) return;
  const R = ADV.rooms[ADV.room];
  if(!R){ advChest(); return; }
  const body = {listen:advListenHTML, letter:advLetterHTML, memory:advMemoryHTML, speak:advSpeakHTML,
    learn:advLearnHTML, be:advBeHTML, build:advBuildHTML, judge:advJudgeHTML, place:advPlaceHTML, freeze:advFreezeHTML, answer:advAnswerHTML, pack:advPackHTML, point:advPointHTML}[R.k]();
  app.innerHTML = `<div class="view adv adv-play">
    <div class="adv-top"><a class="adv-x" href="#/adventure" aria-label="回地圖">✕</a>${advPaws()}<span class="adv-stagelbl">${advLabel(ADV.st)}</span></div>
    <div class="adv-room-h"><span class="adv-room-ic">${R.ic}</span><span class="adv-room-zh">${R.zh}</span>
      <button class="adv-hear-zh" onclick="advSayZh(ADV.rooms[ADV.room].zh)" aria-label="唸題目給我聽">🔈</button></div>
    <div class="adv-body">${body}</div></div>`;
}
function advAutoAudio(){
  if(!ADV) return; const R = ADV.rooms[ADV.room]; if(!R) return;
  clearTimeout(advQuit._t);
  const say = w => { advQuit._t = setTimeout(()=>ADV && advWord(w), 350); };
  if(R.k==="listen") say(ADV.listen[ADV.step].t.w);
  else if(R.k==="speak") say(ADV.speak[ADV.step].w);
  else if(R.k==="build") say(ADV.build[ADV.step].t.w);
  else if(R.k==="place") say(ADV.place[ADV.step].t.w);
  else if(R.k==="answer") say(ADV.answer[ADV.step].q);
  else if(R.k==="pack") say(ADV.pack[ADV.step].sent);
  else if(R.k==="point") say(ADV.point[ADV.step].t.w);
}
function advNextRoom(){ if(!ADV) return; ADV.room++; ADV.step=0; ADV.tried=false; ADV.wrong={}; ADV.locked=false; advRender(); advAutoAudio(); }
function advStepDone(total){
  ADV.locked = true; advRender();   // show the ✓ state before moving on
  advQuit._t = setTimeout(()=>{ if(!ADV) return; ADV.locked=false; ADV.tried=false; ADV.wrong={};
    if(ADV.step+1 >= total) advNextRoom(); else { ADV.step++; advRender(); advAutoAudio(); } }, 950);
}
function advFirst(ok){ if(!ADV.tried){ ADV.tried=true; ADV.first.n++; if(ok) ADV.first.ok++; } }
function advDots(total){ return `<div class="adv-dots">${Array.from({length:total},(_,i)=>`<i class="${i<ADV.step?"on":i===ADV.step?"cur":""}"></i>`).join("")}</div>`; }
function advPicInner(o){ if(o.scene) return plScene(o.scene); return `<span class="adv-pic-e${Array.from(o.e).length>1?" duo":""}${o.tag==="now"?" pg-moving":""}${o.dist==="far"?" dm-far":""}">${o.e}</span>${o.lab?`<small class="adv-pic-lab">${o.lab}</small>`:""}${o.tag?advTag(o.tag):""}${o.mark?cnMark(o.mark, o.kind):""}${o.dist?dmTag(o.dist):""}`; }
function advTag(tag){ return `<small class="pg-tag ${tag}">${tag==="now"?"📸 現在":"📅 每天"}</small>`; }

/* room 1 · listen → tap the picture */
function advListenHTML(){
  const r = ADV.listen[ADV.step];
  return `${advDots(ADV.listen.length)}
    <button class="adv-big-hear" onclick="advWord(ADV.listen[ADV.step].t.w)">🔊 再聽一次</button>
    <div class="adv-pics">${r.opts.map((o,k)=>`<button class="adv-pic ${ADV.wrong[k]?"no":""} ${ADV.locked&&o===r.t?"yes":""}" ${ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advListenPick(${k})">${advPicInner(o)}</button>`).join("")}</div>
    ${ADV.locked?`<div class="adv-yay">✓ ${r.t.w}　${r.t.zh}</div>`:Object.keys(ADV.wrong).length?`<div class="adv-hint">${ADV.st.letters?"再聽一次，仔細聽喔 👂":"聽清楚：是誰？怎麼了？再試一次 👂"}</div>`:""}`;
}
function advListenPick(k){
  if(!ADV || ADV.locked) return;
  const r = ADV.listen[ADV.step], ok = r.opts[k]===r.t;
  advFirst(ok);
  if(ok){ advRender(); advWord(r.t.w); advStepDone(ADV.listen.length); }
  else { ADV.wrong[k]=1; advRender(); setTimeout(()=>ADV && advWord(r.t.w), 250); }
}

/* room 2 · which letter does it start with */
function advLetterHTML(){
  const r = ADV.letter[ADV.step], w = r.t.w;
  const shown = ADV.locked ? `<b class="adv-first">${w[0]}</b>${w.slice(1)}` : "";
  return `${advDots(ADV.letter.length)}
    <button class="adv-emoji" onclick="advWord('${w}')" aria-label="聽單字">${r.t.e}<span>🔊</span></button>
    <div class="adv-word-reveal">${shown||"&nbsp;"}</div>
    <div class="adv-letters">${r.opts.map((L,k)=>`<button class="adv-letter ${ADV.wrong[k]?"no":""} ${ADV.locked&&L===r.t.L?"yes":""}" ${ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advLetterPick(${k})">${L}<small>${L.toLowerCase()}</small></button>`).join("")}</div>
    ${ADV.locked?`<div class="adv-yay">✓ ${w} 是 ${r.t.L} 開頭！</div>`:Object.keys(ADV.wrong).length?`<div class="adv-hint">仔細聽第一個聲音，再試一次 👂</div>`:""}`;
}
function advLetterPick(k){
  if(!ADV || ADV.locked) return;
  const r = ADV.letter[ADV.step], ok = r.opts[k]===r.t.L;
  advFirst(ok);
  if(ok){ advRender(); advWord(r.t.w); advStepDone(ADV.letter.length); }
  else { ADV.wrong[k]=1; advRender(); setTimeout(()=>ADV && advWord(r.t.w), 250); }
}

/* room 3 · memory flip (picture ↔ word) */
function advMemoryHTML(){
  const m = ADV.mem;
  const cards = m.cards.map((c,k)=>{
    const p = m.pairs[c.i], up = m.open.includes(k) || m.done[c.i];
    return `<button class="adv-card ${up?"up":""} ${m.done[c.i]?"done":""}" ${m.done[c.i]?"disabled":""} onclick="advFlip(${k})">${up?(c.kind==="pic"?`<span class="adv-card-pic">${p.e}</span>`:`<span class="adv-card-w">${p.w}</span>`):`<span class="adv-card-back">🐾</span>`}</button>`;
  }).join("");
  const left = m.pairs.length - Object.keys(m.done).length;
  return `<div class="adv-memo">${cards}</div><div class="adv-hint">${left? `還有 ${left} 對，翻兩張一樣的就配成功！` : "全部配好了！🎉"}</div>`;
}
function advFlip(k){
  if(!ADV) return; const m = ADV.mem;
  if(m.busy || m.open.includes(k) || m.done[m.cards[k].i]) return;
  m.open.push(k);
  const c = m.cards[k]; advWord(m.pairs[c.i].w);
  if(m.open.length===2){
    const [a,b] = m.open.map(x=>m.cards[x]);
    if(a.i===b.i){ m.done[a.i]=1; m.open=[]; advRender();
      if(Object.keys(m.done).length===m.pairs.length){ ADV.locked=true; advQuit._t=setTimeout(advNextRoom, 1100); } }
    else { m.busy=true; advRender(); setTimeout(()=>{ if(!ADV) return; m.open=[]; m.busy=false; advRender(); }, 900); }
  } else advRender();
}

/* room 4 · say it */
function advSpeakHTML(){
  const t = ADV.speak[ADV.step], s = ADV.sp, canHear = typeof sr!=="undefined" && sr.ok;
  let ctl;
  if(s.state==="ok") ctl = `<div class="adv-yay">⭐ 說得好！${s.heard?`我聽到「${esc(s.heard)}」`:""}</div>`;
  else if(s.state==="listening") ctl = `<button class="adv-mic on" disabled>👂 正在聽…</button>`;
  else if(!canHear || s.tries>=2) ctl = `${s.tries>=2?`<div class="adv-hint">沒關係！跟著聲音唸一次就好 😺</div>`:`<div class="adv-hint">聽完跟著大聲唸一次 🗣️</div>`}<button class="btn btn-primary adv-done-btn" onclick="advSpeakSelf()">✓ 我唸好了</button>`;
  else ctl = `<button class="adv-mic" onclick="advListenMe()">🎤 按我，說出來</button>${s.tries?`<div class="adv-hint">很接近了！再說一次 💪${s.heard?`（我聽到「${esc(s.heard)}」）`:""}</div>`:""}`;
  return `${advDots(ADV.speak.length)}
    <div class="adv-say-card"><span class="adv-say-e">${t.scene?plScene(t.scene):t.e}${t.mark?cnMark(t.mark, t.kind):""}${t.dist?dmTag(t.dist):""}</span><span class="adv-say-w${t.w.includes(" ")?" long":""}">${t.w}</span><span class="adv-say-zh">${t.zh}</span></div>
    <button class="adv-big-hear" onclick="advWord(ADV.speak[ADV.step].w)">🔊 聽示範</button>
    <div class="adv-say-ctl">${ctl}</div>`;
}
function advListenMe(){
  if(!ADV || ADV.sp.state==="listening") return;
  tts.stop(); ADV.sp.state="listening"; advRender();
  const t = ADV.speak[ADV.step];
  sr.start(alts=>{
    if(!ADV) return;
    const hit = advHeardOk(alts, t);
    ADV.sp.heard = alts[0]||"";
    if(hit){ ADV.sp.state="ok"; advRender(); advSpeakNext(); }
    else { ADV.sp.tries++; ADV.sp.state="idle"; advRender(); }
  }, err=>{
    if(!ADV || ADV.sp.state!=="listening") return;
    ADV.sp.state="idle";
    if(err==="not-allowed"||err==="service-not-allowed"){ ADV.sp.tries=2; toast("沒有麥克風權限，改成跟著唸就好 🐾"); }
    else if(err){ ADV.sp.tries++; }
    advRender();
  });
}
function advSpeakSelf(){ if(!ADV) return; ADV.sp.state="ok"; ADV.sp.heard=""; advRender(); advSpeakNext(); }
function advSpeakNext(){
  ADV.locked = true;
  advQuit._t = setTimeout(()=>{ if(!ADV) return; ADV.locked=false; ADV.sp={tries:0,state:"idle",heard:""};
    if(ADV.step+1 >= ADV.speak.length) advNextRoom(); else { ADV.step++; advRender(); advAutoAudio(); } }, 1100);
}

/* World 2 · room 0 · learn: who goes with am / is / are (no score) */
function advLearnHTML(){
  if(ADV.rooms===ADV_ROOMS_VERB) return advLearnVerbHTML();
  if(ADV.rooms===ADV_ROOMS_PLACE) return advLearnPlaceHTML();
  if(ADV.rooms===ADV_ROOMS_PROG) return advLearnProgHTML();
  if(ADV.rooms===ADV_ROOMS_CAN) return advLearnCanHTML();
  if(ADV.rooms===ADV_ROOMS_HAVE) return advLearnHaveHTML();
  if(ADV.rooms===ADV_ROOMS_THIS) return advLearnThisHTML();
  const groups = [["am",["I"]],["is",["he","she","it"]],["are",["you","we","they"]]];
  const inStage = sk => ADV.st.subj.includes(sk);
  const cards = ADV.learn.map((x,k)=>{ const S=BE_SUBJ[x.sk], ex=x.ex;
    return `<button class="adv-learn-card" onclick="advWord(ADV.learn[${k}].ex.w)">
      <span class="adv-learn-e">${ex.kind==="animal"?ex.e:S.e}</span>
      <span class="adv-learn-pair"><b>${S.w}</b> <i class="be-${S.be}">${S.be}</i></span>
      <span class="adv-learn-ex">${ex.w} 🔊</span><small>${ex.zh}</small></button>`; }).join("");
  const table = `<div class="adv-rule">${groups.map(([be,sks])=>`<div class="adv-rule-row"><i class="be-${be}">${be}</i><span>${sks.map(sk=>`<b class="${inStage(sk)?"on":""}">${BE_SUBJ[sk].w}</b>`).join("")}</span></div>`).join("")}</div>`;
  return `<div class="adv-learn">${cards}</div>
    <p class="adv-tip">💡 ${ADV.st.tip}</p>${table}
    <button class="btn btn-primary adv-done-btn" onclick="advNextRoom()">我記住了，出發 ▶</button>`;
}

/* World 3 · learn: base verb vs he/she + s */
function advLearnVerbHTML(){
  const inStage = sk => ADV.st.subj.includes(sk), v = ADV.learn[0].ex.v;
  const cards = ADV.learn.map((x,k)=>{ const S=BE_SUBJ[x.sk], ex=x.ex;
    return `<button class="adv-learn-card" onclick="advWord(ADV.learn[${k}].ex.w)">
      <span class="adv-learn-e">${ex.e}</span>
      <span class="adv-learn-pair"><b>${S.w}</b> <i class="${vbThird(x.sk)?"be-is":"be-are"}">${vbMark(ex.v[0], ex.ans)}</i></span>
      <span class="adv-learn-ex">${ex.w} 🔊</span><small>${ex.zh}</small></button>`; }).join("");
  const row = (form, sks, cls) => `<div class="adv-rule-row"><i class="${cls}">${form}</i><span>${sks.map(sk=>`<b class="${inStage(sk)?"on":""}">${BE_SUBJ[sk].w}</b>`).join("")}</span></div>`;
  const table = `<div class="adv-rule vb">${row(v[0], ["I","you","we","they"], "be-are")}${row(vbMark(v[0], v[1]), ["he","she"], "be-is")}</div>`;
  return `<div class="adv-learn">${cards}</div>
    <p class="adv-tip">💡 ${ADV.st.tip}</p>${table}
    <button class="btn btn-primary adv-done-btn" onclick="advNextRoom()">我記住了，出發 ▶</button>`;
}

/* World 5 · learn: subject + be + -ing, the three spelling rules, or now vs every day */
function advLearnProgHTML(){
  const kind = ADV.st.learn, ruleZh = {add:"直接加 ing", double:"重複最後一個字母", drop:"去掉 e 再加 ing"};
  const cards = ADV.learn.map((x,k)=>{ const ex=x.ex, S=BE_SUBJ[ex.subj];
    const big = kind==="spell" ? `${ex.v[0]} → ${vbMark(ex.v[0], ex.v[2])}`
      : kind==="tense" ? (ex.mode==="pn" ? `<i class="be-is">${S.be} ${ex.v[2]}</i>` : `<i class="be-are">${ex.fans}</i>`)
      : `<b>${S.w}</b> <i class="be-${S.be}">${S.be}</i> ${vbMark(ex.v[0], ex.v[2])}`;
    const sub = kind==="spell" ? ruleZh[ex.v[6]] : kind==="tense" ? (ex.mode==="pn"?"📸 現在正在做":"📅 每天都做") : ex.zh;
    return `<button class="adv-learn-card" onclick="advWord(ADV.learn[${k}].ex.w)">
      <span class="adv-learn-e">${ex.e}</span>${ex.tag?advTag(ex.tag):""}
      <span class="adv-learn-pair pg">${big}</span>
      <span class="adv-learn-ex">${ex.w} 🔊</span><small>${sub}</small></button>`; }).join("");
  return `<div class="adv-learn">${cards}</div>
    <p class="adv-tip">💡 ${ADV.st.tip}</p>
    <button class="btn btn-primary adv-done-btn" onclick="advNextRoom()">我記住了，出發 ▶</button>`;
}

/* World 5 · 📸 Freeze: the tag (now / every day) decides "is swimming" or "swims" */
function advFreezeHTML(){
  const r = ADV.freeze[ADV.step], t = r.t, S = BE_SUBJ[t.subj], obj = t.v[3] ? " "+t.v[3] : "";
  const blank = ADV.locked ? `<b class="adv-blank fill be-${t.mode==="pn"?"is":"are"}">${t.fans}</b>` : `<span class="adv-blank">？</span>`;
  return `${advDots(ADV.freeze.length)}
    <div class="adv-be-pic pg-freeze ${t.tag}">${advPicInner(t)}</div>
    <div class="adv-sent">${S.w} ${blank}${obj}${ADV.locked?` <span class="pg-time">${t.mode==="pn"?"now":"every day"}</span>`:""}.</div>
    <div class="adv-letters">${r.opts.map((b,k)=>`<button class="adv-letter adv-be-opt pg-opt ${ADV.wrong[k]?"no":""} ${ADV.locked&&b===t.fans?"yes":""}" ${ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advFreezePick(${k})">${b}</button>`).join("")}</div>
    ${ADV.locked?`<div class="adv-yay">✓ ${t.w}　${t.zh}</div>`:Object.keys(ADV.wrong).length?`<div class="adv-hint">看標籤！<br><span class="adv-hint-rule"><span>📸 現在正在做 → am / is / are + ing</span><span>📅 每天都做 → 原形 / 加 s</span></span></div>`:""}`;
}
function advFreezePick(k){
  if(!ADV || ADV.locked) return;
  const r = ADV.freeze[ADV.step], ok = r.opts[k]===r.t.fans;
  advFirst(ok);
  if(ok){ advWord(r.t.w); advStepDone(ADV.freeze.length); }
  else { ADV.wrong[k]=1; advRender(); }
}

/* World 6 · learn: can + base verb, ✓ can vs ✗ can't, or Can … ? with its short answer */
function advLearnCanHTML(){
  const cards = ADV.learn.map((x,k)=>{ const ex = x.ex, S = BE_SUBJ[ex.subj], q = ex.mode==="q";
    const big = q ? `<i class="be-q">Can</i> ${ex.words[1]} <u>${ex.v[0]}</u>`
      : `<b>${S.w}</b> <i class="be-${ex.yes?"can":"cant"}">${ex.yes?"can":"can't"}</i> <u>${ex.v[0]}</u>`;
    return `<button class="adv-learn-card" onclick="advWord(ADV.learn[${k}].ex.w)">
      <span class="adv-learn-e">${ex.e}</span>${cnMark(ex.mark)}
      <span class="adv-learn-pair pg">${big}</span>
      <span class="adv-learn-ex">${ex.w} 🔊</span><small>${q ? `→ ${ex.okAns}` : ex.zh}</small></button>`; }).join("");
  const rule = ADV.st.learn==="verb" ? `<div class="adv-rule vb">
      <div class="adv-rule-row"><i class="be-can">can</i><span>+ 動詞原形：swim、ride、cook</span></div>
      <div class="adv-rule-row"><i class="be-cant">✗</i><span>cans、can swims、can swimming</span></div></div>` : "";
  return `<div class="adv-learn${ADV.learn.length>3?" many":""}">${cards}</div>
    <p class="adv-tip">💡 ${ADV.st.tip}</p>${rule}
    <button class="btn btn-primary adv-done-btn" onclick="advNextRoom()">我記住了，出發 ▶</button>`;
}

/* World 6 · 🙋 answer: the cat asks about the picture, the child picks the short answer */
function advAnswerHTML(){
  const r = ADV.answer[ADV.step], t = r.t;
  const why = {flip:"看圖：✓ 會 → Yes, … can.　✗ 不會 → No, … can't.",
    you:"問「you（你）」，回答要說「I（我）」：Yes, I can. / No, I can't.",
    do:"Can 開頭的問題，就用 can 回答，不用 does / do。"}[ADV.ansWhy] || "";
  return `${advDots(ADV.answer.length)}
    <div class="adv-judge"><div class="adv-be-pic small">${advPicInner(t)}</div>
      <div class="adv-bubble"><span class="adv-bubble-cat">🐱</span><span>${r.q}</span><button class="adv-hear-zh" onclick="advWord(ADV.answer[ADV.step].q)" aria-label="再聽一次">🔊</button></div></div>
    <div class="adv-letters cn-ans-btns">${r.opts.map((o,k)=>`<button class="adv-letter adv-be-opt cn-ans ${ADV.wrong[k]?"no":""} ${ADV.locked&&o===r.ok?"yes":""}" ${ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advAnswerPick(${k})">${o}</button>`).join("")}</div>
    ${ADV.locked?`<div class="adv-yay">✓ ${r.q}　${r.ok}</div>`:Object.keys(ADV.wrong).length?`<div class="adv-hint">${why}</div>`:`<div class="adv-hint soft">看圖上的 ✓ ✗，選出對的回答 🙋</div>`}`;
}
function advAnswerPick(k){
  if(!ADV || ADV.locked) return;
  const r = ADV.answer[ADV.step], ok = r.opts[k]===r.ok;
  advFirst(ok);
  if(ok){ advWord(r.ok); advStepDone(ADV.answer.length); }
  else { ADV.wrong[k]=1; ADV.ansWhy = r.types[k]; advRender(); setTimeout(()=>ADV && advWord(r.q), 250); }
}

/* World 7 · learn: have vs has, or Do / Does … have? with its short answer */
function advLearnHaveHTML(){
  const on = sk => ADV.st.subj.includes(sk) ? "on" : "";
  const cards = ADV.learn.map((x,k)=>{ const ex = x.ex, S = BE_SUBJ[ex.subj], q = ex.mode==="q", hv = hvForm(ex.subj);
    const big = q ? `<i class="be-q">${ex.words[0]}</i> ${ex.words[1]} <u>have</u>` : `<b>${S.w}</b> <i class="be-${hv}">${hv}</i>`;
    return `<button class="adv-learn-card" onclick="advWord(ADV.learn[${k}].ex.w)">
      <span class="adv-learn-e">${ex.e}</span>${ex.mark?cnMark(ex.mark, "have"):""}
      <span class="adv-learn-pair pg">${big}</span>
      <span class="adv-learn-ex">${ex.w} 🔊</span><small>${q ? `→ ${ex.okAns}` : ex.zh}</small></button>`; }).join("");
  const row = (lead, cls, sks, tail) => `<div class="adv-rule-row"><i class="${cls}">${lead}</i><span>${sks.map(sk=>`<b class="${on(sk)}">${BE_SUBJ[sk].w}</b>`).join("")}${tail||""}</span></div>`;
  const rule = ADV.st.learn==="q"
    ? `<div class="adv-rule vb">${row("Do", "be-q", ["you","we","they"], " + have？")}${row("Does", "be-q", ["he","she"], " + <u>have</u>？")}</div>`
    : `<div class="adv-rule vb">${row("have", "be-have", ["I","you","we","they"])}${row("has", "be-has", ["he","she"])}
      <div class="adv-rule-row"><i class="be-cant">✗</i><span>haves、I am have、She is has</span></div></div>`;
  return `<div class="adv-learn">${cards}</div>
    <p class="adv-tip">💡 ${ADV.st.tip}</p>${rule}
    <button class="btn btn-primary adv-done-btn" onclick="advNextRoom()">我記住了，出發 ▶</button>`;
}

/* World 7 · 🎒 pack: tap only the owner's things (not the other person's, not things nobody said) */
function advPackHTML(){
  const r = ADV.pack[ADV.step], S = BE_SUBJ[r.subj], why = ADV.packWhy;
  const slots = r.own.map(i=>`<span class="hv-slot ${r.got[i]?"on":""}">${r.got[i] ? HV_THING[i][1] : "？"}</span>`).join("");
  const tray = r.tray.map((i,k)=>`<button class="hv-item ${ADV.wrong[k]?"no":""} ${r.got[i]?"got":""}" ${r.got[i]||ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advPackPick(${k})"><span>${HV_THING[i][1]}</span><small>${HV_THING[i][0]}</small></button>`).join("");
  let msg;
  if(ADV.locked) msg = `<div class="adv-yay">✓ ${S.zh}的背包打包好了！${r.own.map(i=>HV_THING[i][1]).join(" ")}</div>`;
  else if(why && why.other){ const O = BE_SUBJ[r.other.subj];
    msg = `<div class="adv-hint">那是${O.zh}的 ${HV_THING[why.i][0]}！<br><span class="adv-hint-rule"><span>${S.w} ${hvForm(r.subj)} … 後面的東西才是${S.zh}的 🎒</span></span></div>`; }
  else if(why) msg = `<div class="adv-hint">句子裡沒有 ${HV_THING[why.i][0]} 喔！再聽一次 👂</div>`;
  else msg = `<div class="adv-hint soft">聽一聽，點出${S.zh}有的東西 🎒</div>`;
  return `${advDots(ADV.pack.length)}
    <div class="adv-place-sent hv-sent">${esc(r.sent)} <button class="adv-hear-zh" onclick="advWord(ADV.pack[ADV.step].sent)" aria-label="再聽一次">🔊</button></div>
    <div class="hv-bag"><span class="hv-owner">${S.e}<small>${S.zh}的背包</small></span><span class="hv-bag-ic">🎒</span><span class="hv-slots">${slots}</span></div>
    <div class="hv-tray">${tray}</div>
    ${msg}`;
}
function advPackPick(k){
  if(!ADV || ADV.locked) return;
  const r = ADV.pack[ADV.step], i = r.tray[k];
  if(r.got[i] || ADV.wrong[k]) return;
  if(r.own.includes(i)){
    r.got[i] = 1; ADV.packWhy = null;
    if(r.own.every(j=>r.got[j])){ advFirst(true); ADV.packWhy = null; advStepDone(ADV.pack.length); }
    else advRender();
  } else {
    advFirst(false); ADV.wrong[k] = 1; ADV.packWhy = {other: !!(r.other && r.other.idx===i), i}; advRender();
    setTimeout(()=>ADV && advWord(r.sent), 250);
  }
}

/* World 8 · learn: near / far × one / many, and the 2 × 2 table */
function advLearnThisHTML(){
  const cards = ADV.learn.map((x,k)=>{ const ex = x.ex;
    return `<button class="adv-learn-card" onclick="advWord(ADV.learn[${k}].ex.w)">
      <span class="adv-learn-e${ex.dist==="far"?" dm-far":""}">${ex.e}</span>${dmTag(ex.dist)}
      <span class="adv-learn-pair pg"><i class="be-${ex.dist}">${ex.words[0]}</i> ${ex.words[1]}</span>
      <span class="adv-learn-ex">${ex.w} 🔊</span><small>${ex.zh}</small></button>`; }).join("");
  const on = n => ADV.st.nums.includes(n) ? " on" : "";
  const grid = `<div class="dm-grid"><span></span><b>一個</b><b>很多個</b>
    <b>👇 近</b><i class="be-near${on(1)}">this + is</i><i class="be-near${on(2)}">these + are</i>
    <b>👉 遠</b><i class="be-far${on(1)}">that + is</i><i class="be-far${on(2)}">those + are</i></div>`;
  const bad = ADV.st.nums.length>1 || ADV.st.nums[0]===2
    ? `<div class="adv-rule vb"><div class="adv-rule-row"><i class="be-cant">✗</i><span>This are…、These is…、These are cat.</span></div></div>` : "";
  return `<div class="adv-learn${ADV.learn.length>3?" many":""}">${cards}</div>
    <p class="adv-tip">💡 ${ADV.st.tip}</p>${grid}${bad}
    <button class="btn btn-primary adv-done-btn" onclick="advNextRoom()">我記住了，出發 ▶</button>`;
}

/* World 8 · 👉 point: a near row (big) and a far row (small); tap the group the sentence means */
function advPointHTML(){
  const r = ADV.point[ADV.step], t = r.t, why = ADV.pointWhy;
  const grps = r.groups.map((g,k)=>{ const far = g.d==="far";
    return `<button class="dm-grp ${far?"far":"near"} ${ADV.wrong[k]?"no":""} ${ADV.locked&&g.type==="ok"?"yes":""}" style="left:${k%2?74:26}%;top:${far?46:76}%" ${ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advPointPick(${k})" aria-label="${g.n===1?g.th[0]:g.th[1]}">${g.th[2].repeat(g.n)}</button>`; }).join("");
  const scene = `<div class="dm-scene"><svg class="dm-road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="43,30 57,30 92,100 8,100" fill="#f3e3c3"/></svg>
    <span class="dm-lbl far">👉 那裡 far</span><span class="dm-lbl near">👇 這裡 near</span>${grps}<span class="dm-me">🧒<small>你</small></span></div>`;
  let msg;
  if(ADV.locked) msg = `<div class="adv-yay">✓ ${t.w}　${t.zh}</div>`;
  else if(why==="dist") msg = `<div class="adv-hint">${t.words[0]} 是${t.dist==="near"?"近的 👇（在你身邊）":"遠的 👉（在那邊）"}<br><span class="adv-hint-rule"><span>this / these → 近 👇</span><span>that / those → 遠 👉</span></span></div>`;
  else if(why==="num") msg = `<div class="adv-hint">${t.n===1?`${t.words[0]} is a ${t.th[0]}——只有一個`:`${t.words[0]} are ${t.th[1]}——很多個`}<br><span class="adv-hint-rule"><span>this / that → 一個</span><span>these / those → 很多個</span></span></div>`;
  else if(why) msg = `<div class="adv-hint">句子說的是 ${t.n===1?t.th[0]:t.th[1]}（${t.th[3]}），再聽一次 👂</div>`;
  else msg = `<div class="adv-hint soft">聽一聽，指出句子說的是哪一個 👉</div>`;
  return `${advDots(ADV.point.length)}
    <div class="adv-place-sent">${t.w} <button class="adv-hear-zh" onclick="advWord(ADV.point[ADV.step].t.w)" aria-label="再聽一次">🔊</button></div>
    ${scene}
    ${msg}`;
}
function advPointPick(k){
  if(!ADV || ADV.locked) return;
  const r = ADV.point[ADV.step], g = r.groups[k], ok = g.type==="ok";
  advFirst(ok);
  if(ok){ ADV.pointWhy = null; advWord(r.t.w); advStepDone(ADV.point.length); }
  else { ADV.wrong[k] = 1; ADV.pointWhy = g.type; advRender(); setTimeout(()=>ADV && advWord(r.t.w), 250); }
}

/* World 4 · learn: one card per place word (or There is / There are) */
function advLearnPlaceHTML(){
  const cards = ADV.learn.map((x,k)=>{ const ex=x.ex, big = ex.n ? (ex.n===1?"There is":"There are") : ex.prep;
    return `<button class="adv-learn-card pl" onclick="advWord(ADV.learn[${k}].ex.w)">
      <span class="adv-learn-scene">${plScene(ex.scene)}</span>
      <span class="adv-learn-pair"><i class="be-${ex.n?(ex.n===1?"is":"are"):"pl"}">${big}</i></span>
      <span class="adv-learn-ex">${ex.w} 🔊</span><small>${ex.n?(ex.n===1?"一隻":"兩隻以上"):PL_PREP[ex.prep]}・${ex.zh}</small></button>`; }).join("");
  return `<div class="adv-learn${ADV.learn.length>3?" many":""}">${cards}</div>
    <p class="adv-tip">💡 ${ADV.st.tip}</p>
    <button class="btn btn-primary adv-done-btn" onclick="advNextRoom()">我記住了，出發 ▶</button>`;
}

/* World 4 · tap the spot where the animal goes */
function advPlaceHTML(){
  const r = ADV.place[ADV.step], t = r.t;
  const zones = r.zones.map((p,k)=>{ const P = PL_POS[t.obj][p];
    return ADV.locked && p===t.prep ? "" : `<button class="pl-zone${P.zback?" back":""} ${ADV.wrong[k]?"no":""}" style="left:${P.zx}%;top:${P.zy}%" ${ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advPlacePick(${k})" aria-label="放這裡">${ADV.wrong[k]?"✗":"？"}</button>`; }).join("");
  return `${advDots(ADV.place.length)}
    <div class="adv-place-sent">${t.w} <button class="adv-hear-zh" onclick="advWord(ADV.place[ADV.step].t.w)" aria-label="再聽一次">🔊</button></div>
    <div class="adv-place-box">${plScene({...t.scene, hide:!ADV.locked}, zones)}<span class="adv-place-hold">${ADV.locked?"":t.scene.e.repeat(t.scene.n)}</span></div>
    ${ADV.locked?`<div class="adv-yay">✓ ${t.zh}</div>`:Object.keys(ADV.wrong).length?`<div class="adv-hint">再聽一次：${t.prep} 是哪裡？🔊</div>`:`<div class="adv-hint soft">點一個 ？，把${t.scene.n===2?"牠們":"牠"}放上去</div>`}`;
}
function advPlacePick(k){
  if(!ADV || ADV.locked) return;
  const r = ADV.place[ADV.step], ok = r.zones[k]===r.t.prep;
  advFirst(ok);
  if(ok){ advWord(r.t.w); advStepDone(ADV.place.length); }
  else { ADV.wrong[k]=1; advRender(); setTimeout(()=>ADV && advWord(r.t.w), 250); }
}

/* World 3 · is the cat right? (half the sentences have a verb mistake) */
function advJudgeHTML(){
  const r = ADV.judge[ADV.step], t = r.t;
  let res = "";
  if(ADV.locked) res = r.bad
    ? `<div class="adv-yay">✓ 抓到了！<s class="adv-bad">${esc(r.text)}</s> → ${t.w}</div>`
    : `<div class="adv-yay">✓ 貓咪說對了！${t.w}　${t.zh}</div>`;
  else if(Object.keys(ADV.wrong).length) res = `<div class="adv-hint">再看一次動詞：主角是「${t.lab}」，要不要加 s？</div>`;
  return `${advDots(ADV.judge.length)}
    <div class="adv-judge"><div class="adv-be-pic small">${advPicInner(t)}</div>
      <div class="adv-bubble"><span class="adv-bubble-cat">🐱</span><span>${esc(r.text)}</span></div></div>
    <div class="adv-letters adv-judge-btns">
      <button class="adv-letter adv-be-opt adv-yes ${ADV.wrong[0]?"no":""} ${ADV.locked&&!r.bad?"yes":""}" ${ADV.wrong[0]||ADV.locked?"disabled":""} onclick="advJudgePick(0)">⭕ 對</button>
      <button class="adv-letter adv-be-opt adv-no ${ADV.wrong[1]?"no":""} ${ADV.locked&&r.bad?"yes":""}" ${ADV.wrong[1]||ADV.locked?"disabled":""} onclick="advJudgePick(1)">❌ 不對</button></div>
    ${res}`;
}
function advJudgePick(k){
  if(!ADV || ADV.locked) return;
  const r = ADV.judge[ADV.step], ok = (k===1)===r.bad;
  advFirst(ok);
  if(ok){ ADV.locked=true; advRender(); advWord(r.t.w); advQuit._t = setTimeout(()=>{ if(!ADV) return; ADV.locked=false; ADV.tried=false; ADV.wrong={};
      if(ADV.step+1 >= ADV.judge.length) advNextRoom(); else { ADV.step++; advRender(); } }, r.bad ? 1900 : 1300); }
  else { ADV.wrong[k]=1; advRender(); }
}

/* World 2 · room 2 · pick am / is / are (World 3: pick the verb form) */
function advBeHTML(){
  const r = ADV.be[ADV.step], t = r.t, ans = t.ans || t.be, bi = t.bi!=null ? t.bi : 1, bl = t.bl || 1, verb = t.kind==="verb", place = t.kind==="place", prog = t.kind==="prog", can = t.kind==="can", have = t.kind==="have", dm = t.kind==="this";
  const pre = t.words.slice(0,bi).join(" "), rest = t.words.slice(bi+bl).join(" ");
  const cls = can||have||dm ? t.cls : verb ? (vbThird(t.subj)?"is":"are") : place ? (ans==="is"||ans==="are" ? ans : "pl") : prog ? (t.mode==="se"?"are":"is") : t.be;
  const blank = ADV.locked ? `<b class="adv-blank fill be-${cls}">${verb?vbMark(t.v[0], ans):prog&&t.mode==="p"?vbMark(t.v[0], ans):ans}</b>` : `<span class="adv-blank">？</span>`;
  const progHint = !prog ? "" : t.mode==="p"
    ? `<div class="adv-hint">${t.v[6]==="add"?"正在做：am / is / are 後面要用「動詞ing」":t.v[6]==="double"?`短短的 ${t.v[0]}：重複最後一個字母再加 ing`:`${t.v[0]} 字尾是 e：去掉 e 再加 ing`}</div>`
    : `<div class="adv-hint">看時間：${t.mode==="pn"?"now → 現在正在做":"every day → 每天都做"}<br><span class="adv-hint-rule"><span>now → am / is / are + ing</span><span>every day → 原形 / 加 s</span></span></div>`;
  return `${advDots(ADV.be.length)}
    <div class="adv-be-pic">${advPicInner(t)}</div>
    <div class="adv-sent">${pre} ${blank}${rest?" "+rest:""}${t.end||"."}</div>
    <div class="adv-letters">${r.opts.map((b,k)=>`<button class="adv-letter adv-be-opt be-${b} ${ADV.wrong[k]?"no":""} ${ADV.locked&&b===ans?"yes":""}" ${ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advBePick(${k})">${b}</button>`).join("")}</div>
    ${ADV.locked?`<div class="adv-yay">✓ ${t.w}　${t.zh}${have&&t.mode==="q"?`<br>→ ${t.okAns}`:""}</div>`:Object.keys(ADV.wrong).length&&dm?dmBeHint(t):Object.keys(ADV.wrong).length&&have?hvBeHint(t):Object.keys(ADV.wrong).length&&can?cnBeHint(t):Object.keys(ADV.wrong).length&&prog?progHint:Object.keys(ADV.wrong).length&&place?`<div class="adv-hint">${t.n?"數一數：一隻用 is，兩隻以上用 are":`看圖：${t.a[3]}在${PL_OBJ[t.obj].zh}的哪裡？`}</div>`:Object.keys(ADV.wrong).length?`<div class="adv-hint">想一想：主角是「${t.lab||(t.many?"很多隻":"一隻")}」<br><span class="adv-hint-rule">${verb
      ? `<span>I / you / we / they → 原本的樣子</span><span>he / she → 加 s、es、ies</span>`
      : `<span>I → am</span><span>he / she / it → is</span><span>you / we / they → are</span>`}</span></div>`:""}`;
}
function advBePick(k){
  if(!ADV || ADV.locked) return;
  const r = ADV.be[ADV.step], ok = r.opts[k]===(r.t.ans || r.t.be);
  advFirst(ok);
  if(ok){ advRender(); advWord(r.t.w); advStepDone(ADV.be.length); }
  else { ADV.wrong[k]=1; advRender(); }
}

/* World 2 · room 3 · sentence train: tap the word cards in order */
function advBuildHTML(){
  const r = ADV.build[ADV.step], t = r.t, bd = ADV.bd;
  if(bd.step!==ADV.step) ADV.bd = {step:ADV.step, placed:[], err:false};
  const placed = ADV.bd.placed, done = placed.length===t.words.length;
  const line = t.words.map((w,i)=>`<span class="adv-slot ${i<placed.length?"on":""}">${i<placed.length?w:""}</span>`).join("") + (done?`<span class="adv-dot">${t.end||"."}</span>`:"");
  const tiles = r.order.map(i=>`<button class="adv-tile ${ADV.wrong[i]?"no":""}" ${placed.includes(i)?"style=\"visibility:hidden\"":""} ${done?"disabled":""} onclick="advTile(${i})">${t.words[i]}</button>`).join("");
  return `${advDots(ADV.build.length)}
    <div class="adv-be-pic small">${advPicInner(t)}</div>
    <div class="adv-line">🚂${line}</div>
    <div class="adv-tiles">${tiles}</div>
    <button class="adv-big-hear" onclick="advWord(ADV.build[ADV.step].t.w)">🔊 聽句子</button>
    ${done?`<div class="adv-yay">✓ ${t.w}　${t.zh}</div>`:ADV.bd.err?`<div class="adv-hint">${placed.length?"再聽一次，下一個字是什麼？🔊":"聽一次句子，第一個字是誰？🔊"}</div>`:""}`;
}
function advTile(i){
  if(!ADV || ADV.locked) return;
  const t = ADV.build[ADV.step].t, bd = ADV.bd;
  if(bd.placed.includes(i)) return;
  if(t.words[i]===t.words[bd.placed.length]){
    bd.placed.push(i); ADV.wrong={};
    if(bd.placed.length===t.words.length){ ADV.tried=false; advFirst(!bd.err); advRender(); advWord(t.w); advStepDone(ADV.build.length); }
    else advRender();
  } else {
    bd.err = true; ADV.wrong = {[i]:1}; advRender();
    setTimeout(()=>{ if(ADV && ADV.wrong[i]){ ADV.wrong={}; advRender(); } }, 650);
  }
}

/* chest */
function advChest(){
  const a = advData(), st = ADV.st, f = ADV.first;
  const stars = f.n ? (f.ok/f.n>=0.875 ? 3 : f.ok/f.n>=0.6 ? 2 : 1) : 3;
  const prev = a.stages[st.id], firstClear = !prev;
  a.stages[st.id] = {stars: Math.max(stars, prev?prev.stars:0), at: new Date().toISOString()};
  if(a.day.d!==todayKey()) a.day = {d:todayKey(), n:0};
  a.day.n++;
  store.save();
  if(firstClear){ store.addCans(ADV_CLEAR_CANS); store.addXP(ADV_CLEAR_XP); }
  const w = advWorldOf(st), nx = advNext(), worldDone = w.stages.every(x=>a.stages[x.id]), today = a.day.n;
  const restMsg = today===ADV_DAILY_GOAL ? `<div class="adv-rest">🎉 今天的 ${ADV_DAILY_GOAL} 關完成了！眼睛休息一下，明天再來冒險 🐾</div>` : "";
  app.innerHTML = `<div class="view adv adv-play">
    <div class="adv-top"><a class="adv-x" href="#/adventure" aria-label="回地圖">✕</a>${advPaws()}<span class="adv-stagelbl">${advLabel(st)}</span></div>
    <div class="adv-chest">
      <div class="adv-chest-ic">🎁</div>
      <h2>破關成功！</h2>
      <div class="adv-chest-stars">${advStars(stars)}</div>
      <p>${f.ok} / ${f.n} 題一次就答對${stars===3?"，太厲害了！":stars===2?"，很棒喔！":"，下次會更好！"}</p>
      ${firstClear?`<div class="adv-loot">+${ADV_CLEAR_CANS} 🥫 罐罐　+${ADV_CLEAR_XP} XP</div>`:`<div class="adv-loot soft">再玩一次也很棒！（罐罐只在第一次破關給）</div>`}
      ${restMsg}
      <div class="adv-chest-btns">
        ${worldDone?`<div class="adv-yay">🏆 ${w.title}全部破關！</div>`:""}
        ${nx?`<a class="btn btn-primary" href="#/adventure/${nx.id}">${advWorldOf(nx)!==w?`前往${advWorldOf(nx).title}：`:"下一關："}${advLabel(nx)} →</a>`:""}
        <a class="btn btn-ghost" href="#/adventure">回到地圖</a>
        <a class="btn btn-ghost" href="#/cats">🐱 看貓咪</a>
      </div>
    </div></div>`;
  ADV = null;
}
window.addEventListener("hashchange", ()=>{ const h=(location.hash||"").slice(2).split("/"); if(ADV && !(h[0]==="adventure" && h[1]===ADV.st.id)) advQuit(true); });
