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
   tip:"遊樂園大魔王：全部混在一起！先看 now 還是 every day，再看主角是誰。"}]}
];
/*ADV_AUDIO_START*/const ADV_AUDIO={"I am happy.":"audio/adv/a_a85a5e31ada1.mp3","I am sad.":"audio/adv/a_ad010de98ce1.mp3","I am hungry.":"audio/adv/a_f20f9c38780c.mp3","I am sleepy.":"audio/adv/a_e7ef9e7a6778.mp3","I am hot.":"audio/adv/a_9c34429fa1bd.mp3","I am cold.":"audio/adv/a_429360649df6.mp3","I am angry.":"audio/adv/a_826017315c79.mp3","I am sick.":"audio/adv/a_b825a638fc72.mp3","You are happy.":"audio/adv/a_3755df596d0d.mp3","You are sad.":"audio/adv/a_46b518e37532.mp3","You are hungry.":"audio/adv/a_658a98b1b9fd.mp3","You are sleepy.":"audio/adv/a_9dacde09c6df.mp3","You are hot.":"audio/adv/a_c01f26e13c30.mp3","You are cold.":"audio/adv/a_bf0d90a42a25.mp3","You are angry.":"audio/adv/a_6a6c6b4f7d03.mp3","You are sick.":"audio/adv/a_76de963f1e41.mp3","He is happy.":"audio/adv/a_3c0d84017aa7.mp3","He is sad.":"audio/adv/a_f6dc18458732.mp3","He is hungry.":"audio/adv/a_a623704685ee.mp3","He is sleepy.":"audio/adv/a_2c1f43776814.mp3","He is hot.":"audio/adv/a_35b36f973f22.mp3","He is cold.":"audio/adv/a_73788d970df6.mp3","He is angry.":"audio/adv/a_c28793426a13.mp3","He is sick.":"audio/adv/a_a18940de3c33.mp3","She is happy.":"audio/adv/a_39196cd583b7.mp3","She is sad.":"audio/adv/a_85d1b9a6ee68.mp3","She is hungry.":"audio/adv/a_57747d138474.mp3","She is sleepy.":"audio/adv/a_0113bc32ce02.mp3","She is hot.":"audio/adv/a_8a78ec572358.mp3","She is cold.":"audio/adv/a_3c11b2b10448.mp3","She is angry.":"audio/adv/a_b9ff75381932.mp3","She is sick.":"audio/adv/a_2674c05d99f3.mp3","It is a dog.":"audio/adv/a_4803ad338863.mp3","They are dogs.":"audio/adv/a_0bbe01b727cb.mp3","It is a cat.":"audio/adv/a_94361c485925.mp3","They are cats.":"audio/adv/a_da3fe27c4ab4.mp3","It is a bird.":"audio/adv/a_33f853ee07f6.mp3","They are birds.":"audio/adv/a_27047a859f5c.mp3","It is a rabbit.":"audio/adv/a_feaf01cac562.mp3","They are rabbits.":"audio/adv/a_ba57d591eefe.mp3","It is a frog.":"audio/adv/a_70c432be5e61.mp3","They are frogs.":"audio/adv/a_9d112913c03b.mp3","It is a duck.":"audio/adv/a_78d8b8a581ab.mp3","They are ducks.":"audio/adv/a_92e5605370f6.mp3","We are happy.":"audio/adv/a_3642390e7b23.mp3","We are sad.":"audio/adv/a_b04765f9e33e.mp3","We are hungry.":"audio/adv/a_a46fa74ab81c.mp3","We are sleepy.":"audio/adv/a_32a1c2ba6cb8.mp3","We are hot.":"audio/adv/a_56691cd16786.mp3","We are cold.":"audio/adv/a_532254122d9e.mp3","We are angry.":"audio/adv/a_2707f70ba826.mp3","We are sick.":"audio/adv/a_2535806879e9.mp3","They are happy.":"audio/adv/a_51ee05b71de3.mp3","They are sad.":"audio/adv/a_a39f59e1dfb2.mp3","They are hungry.":"audio/adv/a_3884bb1e6a39.mp3","They are sleepy.":"audio/adv/a_085b969b028c.mp3","They are hot.":"audio/adv/a_d8283390293a.mp3","They are cold.":"audio/adv/a_dfd31ab8e713.mp3","They are angry.":"audio/adv/a_da392c126574.mp3","They are sick.":"audio/adv/a_b1c59711c454.mp3","I run.":"audio/adv/a_0de8919f4889.mp3","I swim.":"audio/adv/a_f93e4a1ee9c9.mp3","I sing.":"audio/adv/a_f2cea30ba86b.mp3","I dance.":"audio/adv/a_ae97c949ac28.mp3","I read.":"audio/adv/a_b519f67bba90.mp3","I cook.":"audio/adv/a_583884d50afd.mp3","I draw.":"audio/adv/a_c93a036931ea.mp3","I walk.":"audio/adv/a_2287d5387075.mp3","You run.":"audio/adv/a_27b4bd15eac2.mp3","You swim.":"audio/adv/a_05d0fd37de48.mp3","You sing.":"audio/adv/a_cbbd9894e938.mp3","You dance.":"audio/adv/a_5f38b3b1fb4a.mp3","You read.":"audio/adv/a_03c807e97ccb.mp3","You cook.":"audio/adv/a_02dac1679343.mp3","You draw.":"audio/adv/a_16cc8f2fb92e.mp3","You walk.":"audio/adv/a_1b75bad13dcb.mp3","He runs.":"audio/adv/a_66ac6ea453a5.mp3","He swims.":"audio/adv/a_842fc0a3374a.mp3","He sings.":"audio/adv/a_1e903c5f288b.mp3","He dances.":"audio/adv/a_0bce6fa305aa.mp3","He reads.":"audio/adv/a_472b813f7ab7.mp3","He cooks.":"audio/adv/a_98e918ecbeb2.mp3","He draws.":"audio/adv/a_0380dcf2fa9d.mp3","He walks.":"audio/adv/a_3a0f7b37800b.mp3","She runs.":"audio/adv/a_1b0f71d0bc3f.mp3","She swims.":"audio/adv/a_e96bdfd5c35a.mp3","She sings.":"audio/adv/a_5c09cdda2c84.mp3","She dances.":"audio/adv/a_7ea42ca0bf69.mp3","She reads.":"audio/adv/a_921b601830f9.mp3","She cooks.":"audio/adv/a_6e2982084131.mp3","She draws.":"audio/adv/a_ebef0dc995e7.mp3","She walks.":"audio/adv/a_a501b2a6bdde.mp3","He watches TV.":"audio/adv/a_0a414d2d7f87.mp3","He goes to school.":"audio/adv/a_94128ff0e0cb.mp3","He washes the dishes.":"audio/adv/a_1e3fe9661aee.mp3","He catches the ball.":"audio/adv/a_d36a6cbea77b.mp3","He does homework.":"audio/adv/a_e2d2f1424bab.mp3","He flies a kite.":"audio/adv/a_cc64e88297e6.mp3","He studies English.":"audio/adv/a_2863d3b88b32.mp3","He cries.":"audio/adv/a_ff48304cc292.mp3","She watches TV.":"audio/adv/a_6418587e75a6.mp3","She goes to school.":"audio/adv/a_23790b6c786e.mp3","She washes the dishes.":"audio/adv/a_587a24a2c338.mp3","She catches the ball.":"audio/adv/a_e9991dd1e8e1.mp3","She does homework.":"audio/adv/a_ca4ebc911356.mp3","She flies a kite.":"audio/adv/a_b91de462a5b6.mp3","She studies English.":"audio/adv/a_192d74a96b9b.mp3","She cries.":"audio/adv/a_0202835244a1.mp3","We run.":"audio/adv/a_af144a16259d.mp3","We swim.":"audio/adv/a_a0344d60b708.mp3","We sing.":"audio/adv/a_891aaa17ae7a.mp3","We dance.":"audio/adv/a_bb6d6ee21a43.mp3","We read.":"audio/adv/a_7813cc9a085c.mp3","We cook.":"audio/adv/a_a5ad99f4a683.mp3","We draw.":"audio/adv/a_d593cf84a250.mp3","We walk.":"audio/adv/a_0a1d335447b7.mp3","They run.":"audio/adv/a_46bb87314d2a.mp3","They swim.":"audio/adv/a_80a6706dda7c.mp3","They sing.":"audio/adv/a_5b0aa117ba86.mp3","They dance.":"audio/adv/a_a47e51953a1e.mp3","They read.":"audio/adv/a_60e0baed2999.mp3","They cook.":"audio/adv/a_3db275560d6d.mp3","They draw.":"audio/adv/a_a3e247b2b4c3.mp3","They walk.":"audio/adv/a_15f33b0ec402.mp3","I watch TV.":"audio/adv/a_cbfd344be4d7.mp3","I go to school.":"audio/adv/a_71312fc6f0f7.mp3","I wash the dishes.":"audio/adv/a_c5a8f117d14f.mp3","I catch the ball.":"audio/adv/a_29e6ab50af45.mp3","I do homework.":"audio/adv/a_e7036095f972.mp3","I fly a kite.":"audio/adv/a_3fff38278316.mp3","I study English.":"audio/adv/a_5cd3a04f91e1.mp3","I cry.":"audio/adv/a_aa68c21a2402.mp3","You watch TV.":"audio/adv/a_66d7d50d0afd.mp3","You go to school.":"audio/adv/a_d7c5169c6310.mp3","You wash the dishes.":"audio/adv/a_b6efca0c7e85.mp3","You catch the ball.":"audio/adv/a_d9bd8f370fea.mp3","You do homework.":"audio/adv/a_14508b66e232.mp3","You fly a kite.":"audio/adv/a_d2a9e17907ed.mp3","You study English.":"audio/adv/a_194a9f12423e.mp3","You cry.":"audio/adv/a_708808d9cb27.mp3","We watch TV.":"audio/adv/a_08c49953f6bd.mp3","We go to school.":"audio/adv/a_0f1e4f7e1e0e.mp3","We wash the dishes.":"audio/adv/a_2fa939517716.mp3","We catch the ball.":"audio/adv/a_5459337f3b5b.mp3","We do homework.":"audio/adv/a_e2f0de2fec78.mp3","We fly a kite.":"audio/adv/a_c721c7784f70.mp3","We study English.":"audio/adv/a_d214f6405e6b.mp3","We cry.":"audio/adv/a_009e2deae59e.mp3","They watch TV.":"audio/adv/a_a8a3efb8ab22.mp3","They go to school.":"audio/adv/a_1c22f9f1625b.mp3","They wash the dishes.":"audio/adv/a_65827262f7e9.mp3","They catch the ball.":"audio/adv/a_3aa5a8ea591e.mp3","They do homework.":"audio/adv/a_82f81be01bd0.mp3","They fly a kite.":"audio/adv/a_c89b79a4dc7e.mp3","They study English.":"audio/adv/a_9dc02bd27b26.mp3","They cry.":"audio/adv/a_6c2b86a95df9.mp3","The cat is in the box.":"audio/adv/a_56f90dc10a2d.mp3","The dog is in the box.":"audio/adv/a_f99400b3470d.mp3","The rabbit is in the box.":"audio/adv/a_b34f8d388e79.mp3","The duck is in the box.":"audio/adv/a_6c162dff2d06.mp3","The cat is on the box.":"audio/adv/a_843453f9ac6e.mp3","The dog is on the box.":"audio/adv/a_e656a2d120ca.mp3","The rabbit is on the box.":"audio/adv/a_6f4e145a0946.mp3","The duck is on the box.":"audio/adv/a_c73c0213735b.mp3","The cat is on the table.":"audio/adv/a_ad2e171603bb.mp3","The dog is on the table.":"audio/adv/a_3179cbc26901.mp3","The rabbit is on the table.":"audio/adv/a_806e19848da0.mp3","The duck is on the table.":"audio/adv/a_b459254eb154.mp3","The cat is next to the box.":"audio/adv/a_4557a87415ed.mp3","The dog is next to the box.":"audio/adv/a_81c6fa4459d0.mp3","The rabbit is next to the box.":"audio/adv/a_d13ea44c4ec0.mp3","The duck is next to the box.":"audio/adv/a_d27f5776605b.mp3","The cat is under the table.":"audio/adv/a_095bcdbf65e1.mp3","The dog is under the table.":"audio/adv/a_4ebb8972fa37.mp3","The rabbit is under the table.":"audio/adv/a_0e3f5f103bb8.mp3","The duck is under the table.":"audio/adv/a_7918d8138da1.mp3","The cat is next to the table.":"audio/adv/a_adc57ac8c9b2.mp3","The dog is next to the table.":"audio/adv/a_6c46898b8418.mp3","The rabbit is next to the table.":"audio/adv/a_ce2a67e09b20.mp3","The duck is next to the table.":"audio/adv/a_16c809892a00.mp3","The cat is next to the tree.":"audio/adv/a_da1457cc1333.mp3","The dog is next to the tree.":"audio/adv/a_4760a7c2214f.mp3","The rabbit is next to the tree.":"audio/adv/a_de048633044f.mp3","The duck is next to the tree.":"audio/adv/a_a4b3cffce171.mp3","The cat is behind the tree.":"audio/adv/a_04d1b005504f.mp3","The dog is behind the tree.":"audio/adv/a_afcb3f749af7.mp3","The rabbit is behind the tree.":"audio/adv/a_247a0b06c836.mp3","The duck is behind the tree.":"audio/adv/a_8d2dce37e90c.mp3","The cat is in front of the tree.":"audio/adv/a_9c098fc2f768.mp3","The dog is in front of the tree.":"audio/adv/a_dd655ca34aea.mp3","The rabbit is in front of the tree.":"audio/adv/a_6f24a7da08f3.mp3","The duck is in front of the tree.":"audio/adv/a_2c2db7a627f2.mp3","There is a cat in the box.":"audio/adv/a_0577a43228cb.mp3","There are two cats in the box.":"audio/adv/a_e359ddca3dca.mp3","There is a dog in the box.":"audio/adv/a_e5f40269a171.mp3","There are two dogs in the box.":"audio/adv/a_19240d5b9d48.mp3","There is a rabbit in the box.":"audio/adv/a_e65e1fea007c.mp3","There are two rabbits in the box.":"audio/adv/a_6291ca15d962.mp3","There is a duck in the box.":"audio/adv/a_ea85934b03db.mp3","There are two ducks in the box.":"audio/adv/a_6f650abee6ed.mp3","There is a cat on the box.":"audio/adv/a_1528f84d4a28.mp3","There are two cats on the box.":"audio/adv/a_6bc328268c58.mp3","There is a dog on the box.":"audio/adv/a_39979171edcb.mp3","There are two dogs on the box.":"audio/adv/a_1aa6ebbc67b4.mp3","There is a rabbit on the box.":"audio/adv/a_d14388effbe3.mp3","There are two rabbits on the box.":"audio/adv/a_515e53fc989e.mp3","There is a duck on the box.":"audio/adv/a_46a35d1bac69.mp3","There are two ducks on the box.":"audio/adv/a_abd9d131cd43.mp3","There is a cat next to the box.":"audio/adv/a_465ad36b62b1.mp3","There are two cats next to the box.":"audio/adv/a_bd021850cee5.mp3","There is a dog next to the box.":"audio/adv/a_94ba03ea0a5f.mp3","There are two dogs next to the box.":"audio/adv/a_2c24e21dfd36.mp3","There is a rabbit next to the box.":"audio/adv/a_0ad4c4ecbc90.mp3","There are two rabbits next to the box.":"audio/adv/a_062c5765b3fa.mp3","There is a duck next to the box.":"audio/adv/a_a652f439cbae.mp3","There are two ducks next to the box.":"audio/adv/a_36da443d53d8.mp3","There is a cat on the table.":"audio/adv/a_810611a69308.mp3","There are two cats on the table.":"audio/adv/a_230c0cf7803a.mp3","There is a dog on the table.":"audio/adv/a_9e60cb86ec33.mp3","There are two dogs on the table.":"audio/adv/a_d92458e0f409.mp3","There is a rabbit on the table.":"audio/adv/a_4499c61ccdbc.mp3","There are two rabbits on the table.":"audio/adv/a_2fbd64aec466.mp3","There is a duck on the table.":"audio/adv/a_e3a71769cd6d.mp3","There are two ducks on the table.":"audio/adv/a_fed0e7011718.mp3","There is a cat under the table.":"audio/adv/a_b6606e779291.mp3","There are two cats under the table.":"audio/adv/a_b8dec70b511c.mp3","There is a dog under the table.":"audio/adv/a_c9e023c7f5ea.mp3","There are two dogs under the table.":"audio/adv/a_638d38cb2d9a.mp3","There is a rabbit under the table.":"audio/adv/a_cfc5b28d70af.mp3","There are two rabbits under the table.":"audio/adv/a_815684fd8e32.mp3","There is a duck under the table.":"audio/adv/a_9e795a9a35a2.mp3","There are two ducks under the table.":"audio/adv/a_e366b14309fd.mp3","There is a cat next to the table.":"audio/adv/a_5cdec5d15944.mp3","There are two cats next to the table.":"audio/adv/a_a7938fb858f5.mp3","There is a dog next to the table.":"audio/adv/a_ad2dd4daf631.mp3","There are two dogs next to the table.":"audio/adv/a_28b34ecceef3.mp3","There is a rabbit next to the table.":"audio/adv/a_4a4a5df5cf2f.mp3","There are two rabbits next to the table.":"audio/adv/a_7a2f10b97a09.mp3","There is a duck next to the table.":"audio/adv/a_aa46d319744d.mp3","There are two ducks next to the table.":"audio/adv/a_4bb431a6cc1d.mp3","I am singing.":"audio/adv/a_f800b18037ef.mp3","I am reading.":"audio/adv/a_8ae6c8bba5e8.mp3","I am cooking.":"audio/adv/a_1d09d4a9715c.mp3","I am drawing.":"audio/adv/a_a8985918a5a2.mp3","I am playing soccer.":"audio/adv/a_27e8aa41aba1.mp3","I am eating lunch.":"audio/adv/a_c528e42abbd3.mp3","You are singing.":"audio/adv/a_b8997f007ef7.mp3","You are reading.":"audio/adv/a_c4dc27c57534.mp3","You are cooking.":"audio/adv/a_29a550b11b82.mp3","You are drawing.":"audio/adv/a_3e6b24f8bdc9.mp3","You are playing soccer.":"audio/adv/a_86a4de9be106.mp3","You are eating lunch.":"audio/adv/a_087a12dd2045.mp3","He is singing.":"audio/adv/a_ea8cfbf537f3.mp3","He is reading.":"audio/adv/a_a4577faac184.mp3","He is cooking.":"audio/adv/a_ac702d87c2ca.mp3","He is drawing.":"audio/adv/a_1a5103c6c4ab.mp3","He is playing soccer.":"audio/adv/a_2bacce01a783.mp3","He is eating lunch.":"audio/adv/a_9ac48d86f5bc.mp3","She is singing.":"audio/adv/a_7eb648eb6dab.mp3","She is reading.":"audio/adv/a_81f725242cb2.mp3","She is cooking.":"audio/adv/a_f1b2a0312776.mp3","She is drawing.":"audio/adv/a_fb1224299f3e.mp3","She is playing soccer.":"audio/adv/a_f9ebc8522f8d.mp3","She is eating lunch.":"audio/adv/a_c90ba5d3cc77.mp3","He is running.":"audio/adv/a_d281d5ee4fff.mp3","He is swimming.":"audio/adv/a_d2b82ee42a5a.mp3","He is shopping.":"audio/adv/a_90a1cbdd709e.mp3","He is clapping.":"audio/adv/a_635529d8799d.mp3","He is dancing.":"audio/adv/a_29a3a47b570a.mp3","He is riding a bike.":"audio/adv/a_5a43b253dde3.mp3","He is writing.":"audio/adv/a_0b1f0d1acdee.mp3","He is making a cake.":"audio/adv/a_35d8dfc7dba6.mp3","She is running.":"audio/adv/a_a0b5d3d09856.mp3","She is swimming.":"audio/adv/a_de1ca8dbebd4.mp3","She is shopping.":"audio/adv/a_98d1d19231ca.mp3","She is clapping.":"audio/adv/a_c86229504c57.mp3","She is dancing.":"audio/adv/a_60f312d2a47f.mp3","She is riding a bike.":"audio/adv/a_01ec8b36aa1a.mp3","She is writing.":"audio/adv/a_53fb84441f9c.mp3","She is making a cake.":"audio/adv/a_27d21b3b09c0.mp3","They are running.":"audio/adv/a_a3edb3eecd5a.mp3","They are swimming.":"audio/adv/a_3cff1e4d5b00.mp3","They are shopping.":"audio/adv/a_0c64c7b71562.mp3","They are clapping.":"audio/adv/a_df2df9d0467b.mp3","They are dancing.":"audio/adv/a_e29c5d6238db.mp3","They are riding a bike.":"audio/adv/a_3858009efc73.mp3","They are writing.":"audio/adv/a_2f54c404178b.mp3","They are making a cake.":"audio/adv/a_1aafbde98e9f.mp3","He is singing now.":"audio/adv/a_2e784cda5be0.mp3","He sings every day.":"audio/adv/a_f9fc99d89147.mp3","He is reading now.":"audio/adv/a_13b291fb17c4.mp3","He reads every day.":"audio/adv/a_9cbe74c68738.mp3","He is cooking now.":"audio/adv/a_e63ebe82783a.mp3","He cooks every day.":"audio/adv/a_f82eb43c203e.mp3","He is drawing now.":"audio/adv/a_286a69bf2423.mp3","He draws every day.":"audio/adv/a_7b50135df6e8.mp3","He is playing soccer now.":"audio/adv/a_2c60e2e5e26f.mp3","He plays soccer every day.":"audio/adv/a_4b45ab26ce54.mp3","He is eating lunch now.":"audio/adv/a_67420096072d.mp3","He eats lunch every day.":"audio/adv/a_f583d4be7279.mp3","He is running now.":"audio/adv/a_752a14a74905.mp3","He runs every day.":"audio/adv/a_077305c8b0de.mp3","He is swimming now.":"audio/adv/a_7b27e37988e9.mp3","He swims every day.":"audio/adv/a_5847a4bcc54c.mp3","He is shopping now.":"audio/adv/a_3d70678a2a2f.mp3","He shops every day.":"audio/adv/a_b45e5d4ca42b.mp3","He is clapping now.":"audio/adv/a_eb63dea3edc9.mp3","He claps every day.":"audio/adv/a_425efdf9fd26.mp3","He is dancing now.":"audio/adv/a_09277521bf45.mp3","He dances every day.":"audio/adv/a_f402ba59f1b0.mp3","He is riding a bike now.":"audio/adv/a_ce01502f7072.mp3","He rides a bike every day.":"audio/adv/a_36ecfbcde56f.mp3","He is writing now.":"audio/adv/a_426902155e1f.mp3","He writes every day.":"audio/adv/a_7c8e77fdd676.mp3","He is making a cake now.":"audio/adv/a_0cad649d657b.mp3","He makes a cake every day.":"audio/adv/a_a6712595260e.mp3","She is singing now.":"audio/adv/a_13b5b450f8fe.mp3","She sings every day.":"audio/adv/a_56a7f2c76b9d.mp3","She is reading now.":"audio/adv/a_3516f8e560bf.mp3","She reads every day.":"audio/adv/a_0fb8c278d2e9.mp3","She is cooking now.":"audio/adv/a_0a06252b4dd1.mp3","She cooks every day.":"audio/adv/a_baeb03208b66.mp3","She is drawing now.":"audio/adv/a_5c95e7bf60a7.mp3","She draws every day.":"audio/adv/a_7a60cfda7ae3.mp3","She is playing soccer now.":"audio/adv/a_f5dff7b91832.mp3","She plays soccer every day.":"audio/adv/a_20d4d507d437.mp3","She is eating lunch now.":"audio/adv/a_8e8b6c269315.mp3","She eats lunch every day.":"audio/adv/a_7fc70f99e1c6.mp3","She is running now.":"audio/adv/a_37a3193ac8f7.mp3","She runs every day.":"audio/adv/a_9f2d9578bcbe.mp3","She is swimming now.":"audio/adv/a_e83194302482.mp3","She swims every day.":"audio/adv/a_6b509970f9e0.mp3","She is shopping now.":"audio/adv/a_3b6d59ae1720.mp3","She shops every day.":"audio/adv/a_a639477b68de.mp3","She is clapping now.":"audio/adv/a_5b43265c68e9.mp3","She claps every day.":"audio/adv/a_8f1dec73da7e.mp3","She is dancing now.":"audio/adv/a_88a71151ef63.mp3","She dances every day.":"audio/adv/a_b5106d3b691f.mp3","She is riding a bike now.":"audio/adv/a_ce4eb4af65de.mp3","She rides a bike every day.":"audio/adv/a_0b9b9887d456.mp3","She is writing now.":"audio/adv/a_4316664a4544.mp3","She writes every day.":"audio/adv/a_3061fc62fe77.mp3","She is making a cake now.":"audio/adv/a_f5a07cc6b165.mp3","She makes a cake every day.":"audio/adv/a_c69651cd1010.mp3","We are singing now.":"audio/adv/a_9d82ffa0506a.mp3","We sing every day.":"audio/adv/a_cc5505572b84.mp3","We are reading now.":"audio/adv/a_80cdd023f9b3.mp3","We read every day.":"audio/adv/a_43016e009fba.mp3","We are cooking now.":"audio/adv/a_10ba8ddf6de4.mp3","We cook every day.":"audio/adv/a_ffbd43ec0a9f.mp3","We are drawing now.":"audio/adv/a_37fe268e060c.mp3","We draw every day.":"audio/adv/a_7f258dd5cebf.mp3","We are playing soccer now.":"audio/adv/a_bda0b02d8136.mp3","We play soccer every day.":"audio/adv/a_37705beeaed6.mp3","We are eating lunch now.":"audio/adv/a_492ec3b4bec0.mp3","We eat lunch every day.":"audio/adv/a_435af2dd6c18.mp3","We are running now.":"audio/adv/a_dc7fb0dd09c1.mp3","We run every day.":"audio/adv/a_f8e96c84839f.mp3","We are swimming now.":"audio/adv/a_346a3c0486ef.mp3","We swim every day.":"audio/adv/a_b037cdad4555.mp3","We are shopping now.":"audio/adv/a_fc723adce0c9.mp3","We shop every day.":"audio/adv/a_6367da50a4b2.mp3","We are clapping now.":"audio/adv/a_348b8f9788c6.mp3","We clap every day.":"audio/adv/a_d7877e14e532.mp3","We are dancing now.":"audio/adv/a_51fad0f5df45.mp3","We dance every day.":"audio/adv/a_10bfa69ad8ab.mp3","We are riding a bike now.":"audio/adv/a_2245fb42e80f.mp3","We ride a bike every day.":"audio/adv/a_f6d5b1343712.mp3","We are writing now.":"audio/adv/a_c0d445ce71db.mp3","We write every day.":"audio/adv/a_d6777faccc5f.mp3","We are making a cake now.":"audio/adv/a_268db6ec4468.mp3","We make a cake every day.":"audio/adv/a_592468f40ca8.mp3","They are singing now.":"audio/adv/a_309eef01c6f9.mp3","They sing every day.":"audio/adv/a_84e895a5144f.mp3","They are reading now.":"audio/adv/a_19177a9e4486.mp3","They read every day.":"audio/adv/a_50f374941bea.mp3","They are cooking now.":"audio/adv/a_824b631c86ea.mp3","They cook every day.":"audio/adv/a_ca4ae309ee26.mp3","They are drawing now.":"audio/adv/a_2d9ebfaa4308.mp3","They draw every day.":"audio/adv/a_00312260ef66.mp3","They are playing soccer now.":"audio/adv/a_b55c2a6dee0b.mp3","They play soccer every day.":"audio/adv/a_842417b97b98.mp3","They are eating lunch now.":"audio/adv/a_5f80143b7556.mp3","They eat lunch every day.":"audio/adv/a_aa603c65ac13.mp3","They are running now.":"audio/adv/a_cd369cdb4b34.mp3","They run every day.":"audio/adv/a_87b62a9b59f6.mp3","They are swimming now.":"audio/adv/a_4cdd7fcf900b.mp3","They swim every day.":"audio/adv/a_ebc82c6f7aa6.mp3","They are shopping now.":"audio/adv/a_d9440fdd4197.mp3","They shop every day.":"audio/adv/a_5a51f8e69e62.mp3","They are clapping now.":"audio/adv/a_50055dd10cbf.mp3","They clap every day.":"audio/adv/a_cd230a86ef71.mp3","They are dancing now.":"audio/adv/a_187845b73a8a.mp3","They dance every day.":"audio/adv/a_eadb6c651030.mp3","They are riding a bike now.":"audio/adv/a_bef636d0d7c5.mp3","They ride a bike every day.":"audio/adv/a_71a1681de6d8.mp3","They are writing now.":"audio/adv/a_e826e1672912.mp3","They write every day.":"audio/adv/a_b0c96033f9cd.mp3","They are making a cake now.":"audio/adv/a_acb54e198f80.mp3","They make a cake every day.":"audio/adv/a_f170008558c8.mp3","I am singing now.":"audio/adv/a_96537317fa60.mp3","I sing every day.":"audio/adv/a_2094902ab0dc.mp3","I am reading now.":"audio/adv/a_32b3473ff6d9.mp3","I read every day.":"audio/adv/a_a842b1249589.mp3","I am cooking now.":"audio/adv/a_c9dd4ab016ff.mp3","I cook every day.":"audio/adv/a_3e3fb6fdde2f.mp3","I am drawing now.":"audio/adv/a_549f198e2d20.mp3","I draw every day.":"audio/adv/a_2c68c76e55e1.mp3","I am playing soccer now.":"audio/adv/a_9bbc94179a0e.mp3","I play soccer every day.":"audio/adv/a_04d6ec75c028.mp3","I am eating lunch now.":"audio/adv/a_ea6d613b4ffe.mp3","I eat lunch every day.":"audio/adv/a_7dd63e4bd40a.mp3","I am running now.":"audio/adv/a_4be47f244ad1.mp3","I run every day.":"audio/adv/a_a5fb4e05b0a1.mp3","I am swimming now.":"audio/adv/a_cb211119abfa.mp3","I swim every day.":"audio/adv/a_27d855d0b0f7.mp3","I am shopping now.":"audio/adv/a_04e37b88058d.mp3","I shop every day.":"audio/adv/a_7276916b9b64.mp3","I am clapping now.":"audio/adv/a_eb0948b7a5ff.mp3","I clap every day.":"audio/adv/a_cd58f3c623b6.mp3","I am dancing now.":"audio/adv/a_2a7ab9a30332.mp3","I dance every day.":"audio/adv/a_75af61d118cb.mp3","I am riding a bike now.":"audio/adv/a_b55ed429ed3a.mp3","I ride a bike every day.":"audio/adv/a_04886ea983ed.mp3","I am writing now.":"audio/adv/a_c7f9c0e55d56.mp3","I write every day.":"audio/adv/a_9a28a4e3c7af.mp3","I am making a cake now.":"audio/adv/a_4884507d5bb2.mp3","I make a cake every day.":"audio/adv/a_7471096641b9.mp3","You are singing now.":"audio/adv/a_3f8e45ba7480.mp3","You sing every day.":"audio/adv/a_dab59d33b330.mp3","You are reading now.":"audio/adv/a_71f02b1fea3a.mp3","You read every day.":"audio/adv/a_c502eb776b92.mp3","You are cooking now.":"audio/adv/a_9ce196624655.mp3","You cook every day.":"audio/adv/a_42f0001b8bd0.mp3","You are drawing now.":"audio/adv/a_228cd7eb3c5c.mp3","You draw every day.":"audio/adv/a_5e5f1b676cdd.mp3","You are playing soccer now.":"audio/adv/a_05bdf6658ac8.mp3","You play soccer every day.":"audio/adv/a_4e4be31d7c83.mp3","You are eating lunch now.":"audio/adv/a_79e79a9db0ce.mp3","You eat lunch every day.":"audio/adv/a_0fdd27d43dae.mp3","You are running now.":"audio/adv/a_0d31080cf6ca.mp3","You run every day.":"audio/adv/a_63527c4885b6.mp3","You are swimming now.":"audio/adv/a_356631e3fd55.mp3","You swim every day.":"audio/adv/a_35e7a6ae1af6.mp3","You are shopping now.":"audio/adv/a_ca8f40e3d64f.mp3","You shop every day.":"audio/adv/a_34f1604e6888.mp3","You are clapping now.":"audio/adv/a_c54be1ca6642.mp3","You clap every day.":"audio/adv/a_9e7fef117ffb.mp3","You are dancing now.":"audio/adv/a_784e69b3a5a7.mp3","You dance every day.":"audio/adv/a_ebf0b7a8d3c9.mp3","You are riding a bike now.":"audio/adv/a_cef9d0255a5f.mp3","You ride a bike every day.":"audio/adv/a_402cb1a03962.mp3","You are writing now.":"audio/adv/a_37b83c0a8ddf.mp3","You write every day.":"audio/adv/a_25300e5a7822.mp3","You are making a cake now.":"audio/adv/a_aae9d452df5c.mp3","You make a cake every day.":"audio/adv/a_c2eb4df96063.mp3"};/*ADV_AUDIO_END*/
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
function advItems(st){ const k = advWorldOf(st).kind; return k==="verb" ? vbItems(st) : k==="place" ? plItems(st) : k==="prog" ? pgItems(st) : beItems(st); }
/* the "who" distractor: same feeling / animal / action, someone else */
function advWho(t){
  if(t.kind==="animal") return beAnimal(!t.many, BE_ANIMAL.find(a=>a[0]===t.key));
  const other = shuffle(["I","you","he","she","we","they"].filter(k=>k!==t.subj))[0];
  if(t.kind==="prog") return pgMake(other, t.v, t.mode);
  return t.kind==="verb" ? vbMake(other, t.v) : beFeel(other, BE_FEEL.find(f=>f[0]===t.key));
}
function vbMark(base, form){ let i=0; while(i<base.length && base[i]===form[i]) i++; return form.slice(0,i)+(i<form.length?`<u>${form.slice(i)}</u>`:""); }
/* every sentence Worlds 2–3 can say — tools/gen_adv_audio.mjs renders these */
function advAllSentences(){
  const out = new Set();
  ADV_WORLDS.filter(w=>w.kind!=="abc").forEach(w=>w.stages.forEach(st=>advItems(st).forEach(it=>out.add(it.w))));
  return [...out];
}
/* a recognizer result counts if it has every word of the target (contractions expanded, "a" optional) */
function advExpand(s){
  return (" "+s+" ").replace(/ i'm /g," i am ").replace(/ (you|we|they)'re /g," $1 are ").replace(/ (he|she|it)'s /g," $1 is ").trim();
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
  const verb = advWorldOf(st).kind==="verb", place = advWorldOf(st).kind==="place", prog = advWorldOf(st).kind==="prog";
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
  const pic = x => x.e+"|"+x.lab+"|"+(x.tag||"")+"|"+(x.scene?JSON.stringify(x.scene):"");
  const listen = (verb||place||prog ? core.slice(0, st.boss?4:3) : core).map(t=>{
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
  const be = shuffle(core).slice(0, verb||place||prog ? (st.boss?4:3) : n).map(t=>({t, opts: verb||prog ? shuffle(t.opts) : place ? t.opts : ["am","is","are"]}));
  /* half 📸 now, half 📅 every day */
  const freeze = prog ? shuffle(shuffle(core).slice(0,4).map((t,i)=>{ const f = pgMake(t.subj, t.v, i%2?"pn":"se"); return {t:f, opts:shuffle(f.fopts.slice())}; })) : [];
  const placeQ = place ? shuffle(core).slice(0,4).map(t=>({t, zones:shuffle(PL_OBJ[t.obj].preps.slice())})) : [];
  /* half of the cat's sentences are wrong */
  const judge = verb ? shuffle(shuffle(core).slice(0,4).map((t,i)=>({t, bad: i%2===0, text: i%2===0 ? vbWrong(t) : t.w}))) : [];
  const build = shuffle(core).slice(0, place||prog?2:3).map(t=>{
    let order; do{ order = shuffle(t.words.map((_,i)=>i)); }while(order.every((v,i)=>v===i));
    return {t, order};
  });
  const speakS = shuffle(core).slice(0,3);
  const learn = prog
    ? (st.learn==="spell" ? ["add","double","drop"].map(r=>({ex: pgMake(st.subj[0], VB_ING.find(v=>v[6]===r), "p")}))
      : st.learn==="tense" ? ["pn","se"].map(m=>({ex: pgMake(core[0].subj, core[0].v, m)}))
      : st.subj.map(sk=>({sk, ex: core.find(x=>x.subj===sk) || pool.find(x=>x.subj===sk)})))
    : place
    ? (st.there===true ? [1,2].map(k=>({ex: pool.find(x=>x.n===k)})) : st.preps.map(p=>({ex: pool.find(x=>x.prep===p && !x.n) || pool.find(x=>x.prep===p)})))
    : (st.boss ? ["I","she","they"] : st.subj).map(sk=>({sk, ex: core.find(x=>x.subj===sk) || pool.find(x=>x.subj===sk)}));
  ADV = {st, rooms: verb ? ADV_ROOMS_VERB : place ? ADV_ROOMS_PLACE : prog ? ADV_ROOMS_PROG : ADV_ROOMS_BE, room:0, step:0, first:{ok:0,n:0}, tried:false, wrong:{}, locked:false,
    learn, listen, be, judge, place:placeQ, freeze, build, bd:{step:-1, placed:[], err:false}, speak:speakS, sp:{tries:0, state:"idle", heard:""}};
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
    learn:advLearnHTML, be:advBeHTML, build:advBuildHTML, judge:advJudgeHTML, place:advPlaceHTML, freeze:advFreezeHTML}[R.k]();
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
}
function advNextRoom(){ if(!ADV) return; ADV.room++; ADV.step=0; ADV.tried=false; ADV.wrong={}; ADV.locked=false; advRender(); advAutoAudio(); }
function advStepDone(total){
  ADV.locked = true; advRender();   // show the ✓ state before moving on
  advQuit._t = setTimeout(()=>{ if(!ADV) return; ADV.locked=false; ADV.tried=false; ADV.wrong={};
    if(ADV.step+1 >= total) advNextRoom(); else { ADV.step++; advRender(); advAutoAudio(); } }, 950);
}
function advFirst(ok){ if(!ADV.tried){ ADV.tried=true; ADV.first.n++; if(ok) ADV.first.ok++; } }
function advDots(total){ return `<div class="adv-dots">${Array.from({length:total},(_,i)=>`<i class="${i<ADV.step?"on":i===ADV.step?"cur":""}"></i>`).join("")}</div>`; }
function advPicInner(o){ if(o.scene) return plScene(o.scene); return `<span class="adv-pic-e${Array.from(o.e).length>1?" duo":""}${o.tag==="now"?" pg-moving":""}">${o.e}</span>${o.lab?`<small class="adv-pic-lab">${o.lab}</small>`:""}${o.tag?advTag(o.tag):""}`; }
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
    <div class="adv-say-card"><span class="adv-say-e">${t.scene?plScene(t.scene):t.e}</span><span class="adv-say-w${t.w.includes(" ")?" long":""}">${t.w}</span><span class="adv-say-zh">${t.zh}</span></div>
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
  const r = ADV.be[ADV.step], t = r.t, ans = t.ans || t.be, bi = t.bi || 1, bl = t.bl || 1, verb = t.kind==="verb", place = t.kind==="place", prog = t.kind==="prog";
  const pre = t.words.slice(0,bi).join(" "), rest = t.words.slice(bi+bl).join(" ");
  const cls = verb ? (vbThird(t.subj)?"is":"are") : place ? (ans==="is"||ans==="are" ? ans : "pl") : prog ? (t.mode==="se"?"are":"is") : t.be;
  const blank = ADV.locked ? `<b class="adv-blank fill be-${cls}">${verb?vbMark(t.v[0], ans):prog&&t.mode==="p"?vbMark(t.v[0], ans):ans}</b>` : `<span class="adv-blank">？</span>`;
  const progHint = !prog ? "" : t.mode==="p"
    ? `<div class="adv-hint">${t.v[6]==="add"?"正在做：am / is / are 後面要用「動詞ing」":t.v[6]==="double"?`短短的 ${t.v[0]}：重複最後一個字母再加 ing`:`${t.v[0]} 字尾是 e：去掉 e 再加 ing`}</div>`
    : `<div class="adv-hint">看時間：${t.mode==="pn"?"now → 現在正在做":"every day → 每天都做"}<br><span class="adv-hint-rule"><span>now → am / is / are + ing</span><span>every day → 原形 / 加 s</span></span></div>`;
  return `${advDots(ADV.be.length)}
    <div class="adv-be-pic">${advPicInner(t)}</div>
    <div class="adv-sent">${pre} ${blank}${rest?" "+rest:""}.</div>
    <div class="adv-letters">${r.opts.map((b,k)=>`<button class="adv-letter adv-be-opt be-${b} ${ADV.wrong[k]?"no":""} ${ADV.locked&&b===ans?"yes":""}" ${ADV.wrong[k]||ADV.locked?"disabled":""} onclick="advBePick(${k})">${b}</button>`).join("")}</div>
    ${ADV.locked?`<div class="adv-yay">✓ ${t.w}　${t.zh}</div>`:Object.keys(ADV.wrong).length&&prog?progHint:Object.keys(ADV.wrong).length&&place?`<div class="adv-hint">${t.n?"數一數：一隻用 is，兩隻以上用 are":`看圖：${t.a[3]}在${PL_OBJ[t.obj].zh}的哪裡？`}</div>`:Object.keys(ADV.wrong).length?`<div class="adv-hint">想一想：主角是「${t.lab||(t.many?"很多隻":"一隻")}」<br><span class="adv-hint-rule">${verb
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
  const line = t.words.map((w,i)=>`<span class="adv-slot ${i<placed.length?"on":""}">${i<placed.length?w:""}</span>`).join("") + (done?`<span class="adv-dot">.</span>`:"");
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
