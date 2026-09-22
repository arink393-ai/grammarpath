/* Daily quests: source-inspired curriculum, authored exercises.
   Each day has THREE real question banks that differ by type AND sentence complexity:
     easy      → 選擇題 pick  · 簡單句（單一子句）
     core      → 填空題 fill  · 複合句（and / but / so / or 連接兩個子句）
     challenge → 打字填寫 type · 複合複雜句（含從屬子句與關係子句），完整打出答案
   Finishing earns XP, honor badges (榮譽貓咪島徽章) and climbing titles (稱號).
   Add future weeks to DAILY_WEEKS. */
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
]},
{id:'2026-09-28', title:'島上的時光旅行', days:[
 {date:'2026-09-28',title:'昨天的貓島',topic:'過去簡單式',level:'A2',icon:'🕰️',cat:'orange',scene:'回顧昨天島上發生的事。規則動詞加 -ed；不規則動詞要背（go→went, eat→ate, see→saw）。',rule:'過去簡單式：規則動詞 + -ed；不規則動詞用特殊形。否定/疑問借助 did。',example:'Yesterday, Hana played all day and then slept.',banks:{
  easy:[
   ['pick','Yesterday, Hana ___ with the yarn ball.',['play','plays','played'],'played','過去式，規則動詞加 -ed。'],
   ['pick','Last night, O ___ his fish.',['eat','ate','eaten'],'ate','eat 的過去式是 ate。'],
   ['pick','The cats ___ to the garden this morning.',['go','went','gone'],'went','go 的過去式是 went。'],
   ['pick','Hu ___ a butterfly yesterday.',['see','saw','seen'],'saw','see 的過去式是 saw。']],
  core:[
   ['fill','Hana played all morning, and then she ___ on the sofa.（sleep）','slept','sleep 的過去式是 slept。'],
   ['fill','O was hungry, so he ___ his whole bowl.（eat）','ate','eat 的過去式是 ate。'],
   ['fill','The kittens saw a bird, but they ___ not catch it.（did）','did','否定過去式用 did not。'],
   ['fill','We opened the door, and the cats ___ outside.（run）','ran','run 的過去式是 ran。']],
  challenge:[
   ['type','When the rain stopped, Hana ___ into the garden, where she chased a fallen leaf.（go）','went','go 的過去式 went。'],
   ['type','Because O felt sleepy, he ___ under the warm blanket while the others played.（hide）','hid','hide 的過去式 hid。'],
   ['type','Although the kitten was small, it ___ the tall shelf that no one could reach.（climb）','climbed','規則動詞：climb → climbed。'],
   ['type','After the staff fed them, the cats ___ their paws, which they always do.（wash）','washed','規則動詞：wash → washed。']]}},
 {date:'2026-09-29',title:'那一刻正在做什麼',topic:'過去進行式',level:'A2',icon:'⏳',cat:'gray',scene:'描述昨天某個時刻「正在」進行的動作：was（單數）/ were（複數）+ V-ing。',rule:'過去進行式：was / were + V-ing，表示過去某時正在進行。',example:'At noon, the cats were sleeping in the sun.',banks:{
  easy:[
   ['pick','At 3 p.m., Hana ___ sleeping.',['was','were','is'],'was','Hana 單數，過去進行用 was。'],
   ['pick','The kittens ___ playing in the garden.',['was','were','are'],'were','複數主詞用 were。'],
   ['pick','O ___ eating when I came in.',['was','were','is'],'was','O 單數，用 was。'],
   ['pick','We ___ watching the cats.',['was','were','is'],'were','we 用 were。']],
  core:[
   ['fill','Hana was napping, and O ___ chasing his tail.（過去進行 be 動詞）','was','O 單數，用 was chasing。'],
   ['fill','The kittens were playing, but Hu ___ sleeping.（過去進行 be 動詞）','was','Hu 單數，用 was。'],
   ['fill','I was reading, and the cats ___ sitting on my lap.（過去進行 be 動詞）','were','the cats 複數，用 were。'],
   ['fill','It was raining, so the cats ___ staying inside.（過去進行 be 動詞）','were','the cats 複數，用 were。']],
  challenge:[
   ['type','While Hana was ___ in the sun, the other cats were exploring the garden, which was full of leaves.（sleep → V-ing）','sleeping','過去進行：was + sleeping。'],
   ['type','When the staff arrived, the kittens were ___ near the door, because they wanted food.（wait → V-ing）','waiting','were + waiting。'],
   ['type','O was ___ his fish quietly while Hu was watching him, which made him nervous.（eat → V-ing）','eating','was + eating。'],
   ['type','Although it was raining, the cats were ___ out of the window, where they saw the birds.（look → V-ing）','looking','were + looking。']]}},
 {date:'2026-09-30',title:'到現在為止',topic:'現在完成式',level:'B1',icon:'✅',cat:'calico',scene:'談動作到現在為止的經驗或影響：have / has + 過去分詞。',rule:'現在完成式：主詞 + have / has + 過去分詞（p.p.）。第三人稱單數用 has。',example:'Hana has eaten already.',banks:{
  easy:[
   ['pick','Hana ___ eaten her food.',['have','has','had'],'has','Hana 第三人稱單數，用 has。'],
   ['pick','The cats ___ found a new toy.',['have','has','is'],'have','the cats 複數，用 have。'],
   ['pick','O ___ never seen snow.',['have','has','was'],'has','O 單數，用 has。'],
   ['pick','I ___ fed the kittens.',['have','has','is'],'have','I 用 have。']],
  core:[
   ['fill','Hana has eaten, and now she ___ fallen asleep.（have/has）','has','Hana 用 has fallen。'],
   ['fill','The kittens have grown, and they ___ learned to jump.（have/has）','have','they 用 have。'],
   ['fill','O has finished his fish, but he ___ not moved yet.（have/has）','has','O 用 has not moved。'],
   ['fill','We have cleaned the room, so the cats ___ come back inside.（have/has）','have','we 用 have。']],
  challenge:[
   ['type','Because Hana has ___ her toy, she is happy now, although she looked everywhere this morning.（find → p.p.）','found','find 的過去分詞 found。'],
   ['type','Since the kittens have ___ so much today, they are tired, which is why they are sleeping.（play → p.p.）','played','規則動詞 played。'],
   ['type','O has ___ his whole bowl, and he wants more, even though he ate an hour ago.（eat → p.p.）','eaten','eat 的過去分詞 eaten。'],
   ['type','The staff have ___ the room, so it looks spotless, which the cats enjoy.（clean → p.p.）','cleaned','規則動詞 cleaned。']]}},
 {date:'2026-10-01',title:'誰比較厲害',topic:'比較級與最高級',level:'A2–B1',icon:'🏆',cat:'cow',scene:'比較島上的貓咪。短形容詞 + -er / the -est；長形容詞用 more / the most。good→better→best。',rule:'比較級：-er / more…；最高級：the -est / the most…。good→better→best。',example:'Hu is smaller than O. Hana is the tallest.',banks:{
  easy:[
   ['pick','Hu is ___ than O.',['small','smaller','smallest'],'smaller','比較兩者用比較級 smaller。'],
   ['pick','Hana is the ___ cat on the island.',['tall','taller','tallest'],'tallest','三者以上用最高級 tallest。'],
   ['pick','This toy is ___ than that one.',['good','better','best'],'better','good 的比較級是 better。'],
   ['pick','O runs ___ than Hu.',['fast','faster','fastest'],'faster','比較級 faster。']],
  core:[
   ['fill','O is fast, but Hana is ___ than him.（fast → 比較級）','faster','fast → faster。'],
   ['fill','This bed is soft, and it is the ___ one in the house.（soft → 最高級）','softest','soft → the softest。'],
   ['fill','Hu is small, yet it is ___ than the new kitten.（big → 比較級）','bigger','big 重複 g 加 -er → bigger。'],
   ['fill','That was a good meal, but this is the ___ meal ever.（good → 最高級）','best','good → the best。']],
  challenge:[
   ['type','Although O looks strong, Hana is ___ than he is, which surprises everyone.（strong → 比較級）','stronger','strong → stronger。'],
   ['type','Because the grey cat trains daily, it has become the ___ hunter on the island.（good → 最高級）','best','good → the best。'],
   ['type','While the sofa is comfortable, the sunny windowsill is ___ , so the cats prefer it.（comfortable → 比較級）','more comfortable','長形容詞用 more comfortable。'],
   ['type','Even though many cats are cute, the little calico is the ___ of them all, which melts our hearts.（cute → 最高級）','cutest','cute → the cutest。']]}},
 {date:'2026-10-02',title:'數數看有多少',topic:'量詞 some/any/much/many',level:'A2',icon:'🧮',cat:'cream',scene:'可數名詞用 many / a few；不可數用 much / a little。肯定句常用 some，疑問/否定常用 any。',rule:'可數：many / a few；不可數：much / a little。肯定 some；疑問/否定 any。',example:'There is some milk. There are a few toys.',banks:{
  easy:[
   ['pick','There are ___ toys on the floor.',['much','many','a little'],'many','toys 可數，用 many。'],
   ['pick','There isn’t ___ milk left.',['some','any','many'],'any','否定句用 any。'],
   ['pick','Hana drank ___ water.',['many','a few','some'],'some','肯定句用 some。'],
   ['pick','How ___ fish did O eat?',['much','many','a little'],'many','fish（幾條）可數，用 many。']],
  core:[
   ['fill','There are many cats, but there is only ___ food left.（不可數：一點點）','a little','food 不可數，用 a little。'],
   ['fill','We have some toys, and there are ___ treats in the box too.（可數：幾個）','a few','treats 可數，用 a few。'],
   ['fill','There isn’t ___ time, so let’s feed them now.（不可數，否定）','much','time 不可數、否定句，用 much。'],
   ['fill','How ___ kittens are there in the garden?（可數）','many','kittens 可數，用 many。']],
  challenge:[
   ['type','Although there are ___ cats on the island, there isn’t much noise, because they sleep all day.（可數：許多）','many','cats 可數，用 many。'],
   ['type','Since we only have ___ milk left, we should buy more before the kittens wake up.（不可數：一點點）','a little','milk 不可數，用 a little。'],
   ['type','There were ___ toys under the sofa, which the cats had hidden over many weeks.（可數：幾個）','a few','toys 可數，用 a few。'],
   ['type','The vet said there wasn’t ___ we could do, so we simply kept the cat warm and calm.（不可數：很多）','much','不可數、否定，用 much。']]}},
 {date:'2026-10-03',title:'把句子接起來',topic:'關係代名詞',level:'B1',icon:'🔗',cat:'black',scene:'用 who（人）、which（物）、that（皆可）把兩句連起來，補充說明前面的名詞。',rule:'who 指人；which 指物；that 人物皆可。用來補充說明前面的名詞。',example:'The cat that sleeps here is Hana.',banks:{
  easy:[
   ['pick','The girl ___ feeds the cats is kind.',['who','which','where'],'who','指人用 who。'],
   ['pick','The toy ___ O loves is red.',['who','which','when'],'which','指物用 which。'],
   ['pick','That is the vet ___ helped Hu.',['which','who','what'],'who','指人用 who。'],
   ['pick','The box ___ the kitten sleeps in is small.',['who','that','why'],'that','指物可用 that。']],
  core:[
   ['fill','Hana is the cat ___ has a fluffy tail, and she loves the sun.（指動物）','that|which','指動物用 that 或 which。'],
   ['fill','The man ___ works here feeds the cats, and they trust him.（指人）','who','指人用 who。'],
   ['fill','This is the toy ___ O broke, but he still plays with it.（指物）','that|which','指物用 that 或 which。'],
   ['fill','The kitten ___ we found is happy now, and it purrs all day.（指動物）','that|which','指動物用 that 或 which。']],
  challenge:[
   ['type','The vet ___ examined Hu was very gentle, so the kitten stayed calm, which surprised us.（指人）','who','指人用 who。'],
   ['type','Because the sofa ___ the cats love is old, we will replace it, although they may dislike the new one.（指物）','that|which','指物用 that 或 which。'],
   ['type','Hana, ___ is the oldest cat, teaches the kittens how to hunt, which keeps them safe.（指她/動物）','who|that|which','補充說明 Hana，可用 who / which / that。'],
   ['type','The children ___ visit the island love the cats, and they always bring treats.（指人）','who','指人用 who。']]}},
 {date:'2026-10-04',title:'如果明天…',topic:'第一條件句',level:'B1',icon:'🌦️',cat:'orange',scene:'談真實、可能發生的未來：If + 現在簡單式, 主詞 + will + 原形動詞。',rule:'第一條件句：If + 現在式，主句用 will + 原形。談未來可能發生的事。',example:'If it rains, the cats will stay inside.',banks:{
  easy:[
   ['pick','If it rains, the cats ___ stay inside.',['will','would','are'],'will','主句用 will + 原形。'],
   ['pick','If you feed Hana, she ___ love you.',['will','would','was'],'will','主句用 will。'],
   ['pick','If O ___ hungry, he will cry.',['is','will','was'],'is','if 子句用現在式 is。'],
   ['pick','The kitten will purr if you ___ it.',['pet','will pet','petted'],'pet','if 子句用現在式 pet。']],
  core:[
   ['fill','If you open the door, the cats ___ run out, so be careful.（will + 原形）','will','主句用 will run。'],
   ['fill','Hana will be happy if you ___ with her.（現在式：play）','play','if 子句用現在式 play。'],
   ['fill','If it ___ sunny tomorrow, we will take the cats outside.（現在式 be）','is','if 子句用現在式 is。'],
   ['fill','The kittens will sleep if the room ___ quiet.（現在式 be）','is','if 子句用現在式 is。']],
  challenge:[
   ['type','If the vet ___ that Hu is sick, we will keep it inside, although it hates staying home.（現在式：say）','says','if 子句主詞 the vet，用 says。'],
   ['type','The cats will be calm if you ___ gently, because loud noises scare them.（現在式：speak）','speak','if 子句用現在式 speak。'],
   ['type','If it ___ tonight, the kittens will stay in the warm room, which they actually enjoy.（現在式：rain）','rains','if 子句主詞 it，用 rains。'],
   ['type','Hana will trust you more if you ___ her every day, so keep visiting her.（現在式：feed）','feed','if 子句用現在式 feed。']]}}
]},
{id:'2026-10-05', title:'貓島進階挑戰', days:[
 {date:'2026-10-05',title:'貓咪能不能',topic:'情態動詞',level:'A2–B1',icon:'🦸',cat:'gray',scene:'can 能力/可以；could 過去能力/委婉；should 建議；must 必須。後面都接原形動詞。',rule:'情態動詞後接原形。can 能力/許可；could 過去能力；should 建議；must 必須。',example:'You should feed the cat. Cats can jump high.',banks:{
  easy:[
   ['pick','Cats ___ jump very high.',['can','should','must'],'can','表示能力用 can。'],
   ['pick','You ___ wash your hands before feeding.',['can','should','could'],'should','給建議用 should。'],
   ['pick','A kitten ___ not eat chocolate.',['must','can','should'],'must','「一定不可」用 must not。'],
   ['pick','When I was young, I ___ run fast.',['can','could','should'],'could','過去能力用 could。']],
  core:[
   ['fill','Cats can see in the dark, but they ___ not see colors well.（能力：不能）','can','能力用 can（not）。'],
   ['fill','You should be gentle, and you ___ never pull a cat’s tail.（建議/一定不）','should|must','用 should 或 must（never）。'],
   ['fill','It is cold outside, so the kittens ___ stay indoors.（應該/必須）','should|must','用 should 或 must。'],
   ['fill','When O was a kitten, he ___ not jump high, but now he can.（過去能力：不能）','could','過去能力用 could（not）。']],
  challenge:[
   ['type','Because chocolate is dangerous, cats ___ never eat it, although some try to steal food.（一定不）','must','強烈禁止用 must（never）。'],
   ['type','If your cat seems sick, you ___ call the vet, because early care keeps it safe.（建議）','should','給建議用 should。'],
   ['type','When Hana was young, she ___ barely climb, but now she reaches the highest shelf.（過去能力）','could','過去能力用 could。'],
   ['type','The kittens ___ not open the heavy box by themselves, so the staff help them, which they appreciate.（能力：不能）','can|could','能力用 can（或 could）。']]}},
 {date:'2026-10-06',title:'假如我是一隻貓',topic:'第二條件句',level:'B1',icon:'🌙',cat:'calico',scene:'談與現在事實相反的假設：If + 過去式, 主詞 + would + 原形。be 動詞常用 were。',rule:'第二條件句：If + 過去式，主句用 would + 原形。談不真實/假想的情況。',example:'If I were a cat, I would sleep all day.',banks:{
  easy:[
   ['pick','If I ___ a cat, I would sleep all day.',['am','was','were'],'were','假設語氣 be 動詞用 were。'],
   ['pick','If Hana had wings, she ___ fly.',['will','would','can'],'would','主句用 would + 原形。'],
   ['pick','If O ___ taller, he would reach the shelf.',['is','were','will'],'were','if 子句用過去式 were。'],
   ['pick','I would adopt ten cats if I ___ rich.',['am','were','will'],'were','假設語氣用 were。']],
  core:[
   ['fill','If the cats could talk, they ___ tell us funny stories.（would + 原形）','would','主句用 would tell。'],
   ['fill','Hana would be happier if she ___ more toys.（have → 過去式）','had','if 子句用過去式 had。'],
   ['fill','If I ___ you, I would feed the kittens first.（be → 假設）','were','假設語氣用 were。'],
   ['fill','The kitten would come inside if it ___ cold.（be → 假設）','were','假設語氣用 were。']],
  challenge:[
   ['type','If Hu ___ bigger, it would jump onto the shelf, but for now the staff lift it up.（be → 假設）','were','假設語氣用 were。'],
   ['type','Hana would explore the whole island if she ___ not afraid of the sea, which she has never touched.（be → 假設）','were','假設語氣用 were。'],
   ['type','If we ___ more space, we would adopt more cats, although caring for them takes time.（have → 過去式）','had','if 子句用過去式 had。'],
   ['type','The cats would sleep outside if the nights ___ warmer, because they love the open sky.（be → 假設）','were','複數 nights，假設用 were。']]}},
 {date:'2026-10-07',title:'多久以前 vs 到現在',topic:'現在完成 vs 過去簡單',level:'B1',icon:'📆',cat:'cow',scene:'過去簡單談「明確過去時間」（yesterday, two days ago）；現在完成談「持續到現在/經驗」（for, since, already, yet）。',rule:'過去簡單 + 明確過去時間；現在完成 + for / since / already / yet / ever。',example:'Hana arrived two years ago. She has lived here since then.',banks:{
  easy:[
   ['pick','Hana ___ here two years ago.',['arrived','has arrived','arrives'],'arrived','有 ago，用過去簡單。'],
   ['pick','O ___ his fish already.',['ate','has eaten','eats'],'has eaten','有 already，用現在完成。'],
   ['pick','The cats ___ to the vet yesterday.',['went','have gone','go'],'went','有 yesterday，用過去簡單。'],
   ['pick','We ___ lived here since 2024.',['have','did','were'],'have','有 since，用現在完成 have lived。']],
  core:[
   ['fill','Hana came to the island last year, and she ___ lived here ever since.（have/has）','has','ever since → 現在完成 has lived。'],
   ['fill','O ate an hour ___ , so he is not hungry now.（明確過去：以前）','ago','an hour ago，用過去簡單。'],
   ['fill','The kittens have played all day, but they ___ not slept yet.（have/has）','have','yet → 現在完成 have not slept。'],
   ['fill','We adopted Hu in spring, and it ___ grown a lot since then.（have/has）','has','since then → 現在完成 has grown。']],
  challenge:[
   ['type','Hana ___ on the island for three years, and she still loves it, although many things have changed.（live → 現在完成）','has lived','for three years → has lived。'],
   ['type','Because O ___ his whole bowl an hour ago, he is not hungry, even though he begs for more.（eat → 過去簡單）','ate','an hour ago → 過去簡單 ate。'],
   ['type','The kittens have ___ every toy already, so we bought new ones, which they adore.（break → 現在完成）','broken','already → have broken。'],
   ['type','We ___ Hu two years ago, and it has become the friendliest cat, which everyone loves.（adopt → 過去簡單）','adopted','two years ago → 過去簡單 adopted。']]}},
 {date:'2026-10-08',title:'那天被照顧的貓',topic:'過去被動語態',level:'B1',icon:'🛟',cat:'black',scene:'描述過去某動作，以「接受動作的對象」為主角：was（單數）/ were（複數）+ 過去分詞。',rule:'過去被動：主詞 + was / were + 過去分詞（p.p.）。',example:'The cats were fed at noon.',banks:{
  easy:[
   ['pick','The cats ___ fed at noon.',['was','were','are'],'were','the cats 複數，用 were。'],
   ['pick','The room ___ cleaned yesterday.',['was','were','is'],'was','the room 單數，用 was。'],
   ['pick','The toys ___ put away last night.',['was','were','is'],'were','the toys 複數，用 were。'],
   ['pick','Hu ___ found near the harbor.',['was','were','are'],'was','Hu 單數，用 was。']],
  core:[
   ['fill','The cats were fed in the morning, and the bowls ___ washed afterward.（過去被動 be）','were','the bowls 複數，用 were washed。'],
   ['fill','The room was cleaned yesterday, and new beds ___ added.（過去被動 be）','were','new beds 複數，用 were added。'],
   ['fill','Hu was found last winter, and it ___ taken to the vet right away.（過去被動 be）','was','it 單數，用 was taken。'],
   ['fill','The garden was cleaned, so the toys ___ collected too.（過去被動 be）','were','the toys 複數，用 were collected。']],
  challenge:[
   ['type','When Hu ___ near the harbor, it was cold and hungry, so the staff cared for it.（find → 過去被動）','was found','單數：was + found。'],
   ['type','Because the cats ___ by everyone, they were given the best food, which came from the market.（love → 過去被動）','were loved','複數：were + loved。'],
   ['type','Although the room looked messy, it ___ every evening, so it always felt fresh.（clean → 過去被動）','was cleaned','單數：was + cleaned。'],
   ['type','The old toys ___ last week, and the cats enjoyed the new ones, which were softer.（replace → 過去被動）','were replaced','複數：were + replaced。']]}},
 {date:'2026-10-09',title:'貓咪這樣說',topic:'間接引述',level:'B1–B2',icon:'💬',cat:'cream',scene:'把某人說的話轉述出來。動詞時態往後退一步，代名詞也跟著改。',rule:'轉述：say / tell + (that) 子句。時態退一步：is→was、will→would、can→could、V→V-ed。',example:'“I am tired,” Hana said. → Hana said she was tired.',banks:{
  easy:[
   ['pick','“I am hungry,” O said. → O said he ___ hungry.',['is','was','be'],'was','is 退一步變 was。'],
   ['pick','“I will come,” she said. → She said she ___ come.',['will','would','can'],'would','will 退一步變 would。'],
   ['pick','“I can jump,” Hu said. → Hu said it ___ jump.',['can','could','will'],'could','can 退一步變 could。'],
   ['pick','“I like fish,” O said. → O said he ___ fish.',['like','liked','likes'],'liked','like 退一步變 liked。']],
  core:[
   ['fill','Hana said she ___ tired, and then she fell asleep.（is → 退一步）','was','is → was。'],
   ['fill','O told us he ___ eat later, but he ate right away.（will → 退一步）','would','will → would。'],
   ['fill','The vet said the kitten ___ healthy, and everyone smiled.（is → 退一步）','was','is → was。'],
   ['fill','They said they ___ visit again, and they kept their promise.（will → 退一步）','would','will → would。']],
  challenge:[
   ['type','Hana said that she ___ hungry, so we fed her, although she had eaten an hour earlier.（is → 退一步）','was','is → was。'],
   ['type','The vet told us that Hu ___ recover soon, which made everyone relieved.（will → 退一步）','would','will → would。'],
   ['type','O said that he ___ open the door himself, but he actually needed help, which he hid.（can → 退一步）','could','can → could。'],
   ['type','The children said that they ___ the cats very much, so they visited every weekend.（like → 退一步）','liked','like → liked。']]}},
 {date:'2026-10-10',title:'以前的貓島',topic:'used to',level:'B1',icon:'📻',cat:'orange',scene:'used to + 原形：以前經常/曾經如此，現在已經改變。否定/疑問用 did + use to。',rule:'used to + 原形動詞，表示過去的習慣或狀態，現在不再。否定：didn’t use to。',example:'Hana used to be shy, but now she is friendly.',banks:{
  easy:[
   ['pick','Hana used to ___ shy.',['be','is','was'],'be','used to 後接原形 be。'],
   ['pick','O used to ___ under the bed.',['hides','hid','hide'],'hide','used to 後接原形 hide。'],
   ['pick','The kittens used to ___ smaller.',['are','be','were'],'be','used to 後接原形 be。'],
   ['pick','I used to ___ one cat.',['have','had','has'],'have','used to 後接原形 have。']],
  core:[
   ['fill','Hana used to be shy, but now she ___ very friendly.（現在式 be）','is','現在的狀態用 is。'],
   ['fill','O used to ___ afraid of water, but now he plays in it.（原形 be）','be','used to 後接原形 be。'],
   ['fill','The island used to have few cats, and now it ___ many.（現在式 have）','has','the island 單數，用 has。'],
   ['fill','We didn’t use to ___ a garden, but now the cats love it.（原形 have）','have','did 後用原形 use to have。']],
  challenge:[
   ['type','Hana used to ___ under the sofa whenever guests came, but now she greets everyone, which amazes us.（原形：hide）','hide','used to + 原形 hide。'],
   ['type','Because the island used to ___ quiet, the older cats still prefer calm corners, although kittens are noisy now.（原形 be）','be','used to + 原形 be。'],
   ['type','O used to ___ only dry food, but since the staff changed his diet, he has become healthier.（原形：eat）','eat','used to + 原形 eat。'],
   ['type','We used to ___ just one kitten, yet now we care for seven, which keeps us very busy.（原形：have）','have','used to + 原形 have。']]}},
 {date:'2026-10-11',title:'對吧，喵？',topic:'附加問句',level:'B1',icon:'❓',cat:'gray',scene:'句尾加一個小問句來確認。前面肯定→後面否定；前面否定→後面肯定，助動詞要一致。',rule:'肯定句 + 否定附加問句（is → isn’t）；否定句 + 肯定附加問句。助動詞/時態一致。',example:'Hana is cute, isn’t she? You like cats, don’t you?',banks:{
  easy:[
   ['pick','Hana is cute, ___ she?',['isn’t','is','doesn’t'],'isn’t','前肯定 → 後否定 isn’t。'],
   ['pick','You like cats, ___ you?',['do','don’t','aren’t'],'don’t','一般動詞肯定 → 後 don’t。'],
   ['pick','O can jump, ___ he?',['can','can’t','doesn’t'],'can’t','can 肯定 → 後 can’t。'],
   ['pick','The kittens are sleeping, ___ they?',['are','aren’t','don’t'],'aren’t','前肯定 → 後 aren’t。']],
  core:[
   ['fill','Hana is friendly, ___ she?（is → 附加問句）','isn’t','前肯定 → 後 isn’t。'],
   ['fill','You fed the cats, ___ you?（過去一般動詞 → 附加問句）','didn’t','過去肯定 → 後 didn’t。'],
   ['fill','O can’t swim, ___ he?（否定 → 肯定）','can','前否定 can’t → 後 can。'],
   ['fill','The kittens don’t bite, ___ they?（否定 → 肯定）','do','前否定 don’t → 後 do。']],
  challenge:[
   ['type','Hana has eaten already, ___ she? Because she looks so sleepy now.（完成式 has → 附加問句）','hasn’t','前肯定 has → 後 hasn’t。'],
   ['type','You will visit the cats tomorrow, ___ you, since they miss you so much?（will → 附加問句）','won’t','前肯定 will → 後 won’t。'],
   ['type','The kittens weren’t afraid of the vet, ___ they, even though it was their first visit?（否定 were → 肯定）','were','前否定 weren’t → 後 were。'],
   ['type','O didn’t break the vase, ___ he, although it fell right next to him?（否定 did → 肯定）','did','前否定 didn’t → 後 did。']]}}
]},
{id:'2026-10-12', title:'貓島語感大師', days:[
 {date:'2026-10-12',title:'那時就完成了',topic:'未來完成式',level:'B1–B2',icon:'⏰',cat:'orange',scene:'到未來某個時間點「之前」就已經完成的動作：will have + 過去分詞。常搭配 by + 未來時間。',rule:'未來完成式：主詞 + will have + 過去分詞（p.p.）。常搭配 by tonight / by next week。',example:'By tonight, the cats will have eaten dinner.',banks:{
  easy:[
   ['pick','By tonight, the cats ___ have eaten.',['will','would','are'],'will','未來完成用 will have。'],
   ['pick','By next week, Hu will ___ grown bigger.',['has','have','had'],'have','will 後接 have + p.p.。'],
   ['pick','By noon, Hana will have ___ .',['sleep','slept','sleeping'],'slept','have 後接過去分詞 slept。'],
   ['pick','By Friday, we ___ have cleaned the house.',['will','would','are'],'will','未來完成用 will have。']],
  core:[
   ['fill','By six o’clock, the staff will ___ fed the cats, and the bowls will be empty.（will + ?）','have','will have fed。'],
   ['fill','Hana will have napped by noon, so she ___ be awake in the afternoon.（will）','will','主句用 will be。'],
   ['fill','By next month, the kitten will have ___ how to jump.（learn → p.p.）','learned','learn 的過去分詞 learned。'],
   ['fill','We will have finished by dinner, and then we ___ play with the cats.（will）','will','用 will play。']],
  challenge:[
   ['type','By the time you arrive, the cats ___ already eaten, because the staff feed them early.（will have + eat p.p.）','will have eaten','will have + eaten。'],
   ['type','By next spring, Hu ___ into a strong cat, although it is still tiny now.（will have + grow p.p.）','will have grown','will have + grown。'],
   ['type','By Sunday, Hana ___ the whole garden, which she explores a little each day.（will have + explore p.p.）','will have explored','will have + explored。'],
   ['type','By the end of the week, the staff ___ every room, so the shelter will look spotless.（will have + clean p.p.）','will have cleaned','will have + cleaned。']]}},
 {date:'2026-10-13',title:'一直做到現在',topic:'現在完成進行式',level:'B1–B2',icon:'🔁',cat:'gray',scene:'從過去持續到現在、可能還在進行的動作：have/has been + V-ing。強調「持續多久」。',rule:'現在完成進行式：主詞 + have/has been + V-ing。常搭配 for / since，強調動作持續。',example:'Hana has been sleeping for two hours.',banks:{
  easy:[
   ['pick','Hana ___ been sleeping for two hours.',['has','have','had'],'has','Hana 單數，用 has been。'],
   ['pick','The kittens have ___ playing all day.',['be','been','being'],'been','have been + V-ing。'],
   ['pick','O has been ___ his fish slowly.',['eat','eaten','eating'],'eating','been 後接 V-ing。'],
   ['pick','We ___ been waiting for the vet.',['has','have','had'],'have','we 用 have been。']],
  core:[
   ['fill','Hana has been napping for hours, and she ___ still not woken up.（have/has）','has','Hana 用 has。'],
   ['fill','The kittens have been playing since noon, so they ___ getting tired now.（be：are）','are','the kittens 複數，用 are。'],
   ['fill','O has been ___ at the door, because he wants to go out.（wait → V-ing）','waiting','been + waiting。'],
   ['fill','It has been ___ all morning, so the cats have stayed inside.（rain → V-ing）','raining','been + raining。']],
  challenge:[
   ['type','Hana ___ in the sun for hours, which is why her fur feels so warm now.（have/has been + sleep V-ing）','has been sleeping','has been + sleeping。'],
   ['type','Because the kittens ___ all afternoon, they are exhausted, although they refuse to nap.（have/has been + play V-ing）','have been playing','have been + playing。'],
   ['type','O ___ at the window since breakfast, since he is waiting for the birds to appear.（have/has been + look V-ing）','has been looking|has been staring','has been + looking/staring。'],
   ['type','We ___ for the new kitten for weeks, and it finally arrives tomorrow, which excites everyone.（have/has been + wait V-ing）','have been waiting','have been + waiting。']]}},
 {date:'2026-10-14',title:'過去的過去',topic:'過去完成式',level:'B1–B2',icon:'⏮️',cat:'black',scene:'「過去的過去」——在另一個過去動作之前就已完成：had + 過去分詞。',rule:'過去完成式：主詞 + had + 過去分詞（p.p.），表示比另一個過去動作更早發生。',example:'When we arrived, the cats had already eaten.',banks:{
  easy:[
   ['pick','When we arrived, the cats ___ already eaten.',['have','has','had'],'had','過去完成用 had + p.p.。'],
   ['pick','Hana had ___ before we woke up.',['leave','left','leaving'],'left','had 後接過去分詞 left。'],
   ['pick','By the time O came, Hu ___ hidden the toy.',['has','have','had'],'had','過去完成用 had。'],
   ['pick','The kittens ___ fallen asleep before the storm.',['has','had','have'],'had','過去完成用 had。']],
  core:[
   ['fill','By the time the vet arrived, Hu ___ already fallen asleep, so it stayed calm.（had）','had','had already fallen。'],
   ['fill','Hana had eaten before we came, so she ___ not hungry.（be：was）','was','過去式 was。'],
   ['fill','The staff had ___ the room before the guests arrived.（clean → p.p.）','cleaned','had + cleaned。'],
   ['fill','O had hidden the toy, and no one ___ find it.（過去式：could）','could','過去能力 could。']],
  challenge:[
   ['type','By the time we got home, Hana ___ the whole garden, which had left her exhausted.（had + explore p.p.）','had explored','had + explored。'],
   ['type','The kittens were calm because they ___ their dinner before the loud storm began.（had + eat p.p.）','had eaten','had + eaten。'],
   ['type','O could not find his toy, since Hu ___ it under the bed earlier that day.（had + hide p.p.）','had hidden','had + hidden。'],
   ['type','When the new family arrived, the staff ___ the shelter, so everything looked perfect.（had + clean p.p.）','had cleaned','had + cleaned。']]}},
 {date:'2026-10-15',title:'當初如果…',topic:'第三條件句',level:'B2',icon:'🕰️',cat:'calico',scene:'對過去的假設（與過去事實相反）：If + 過去完成式, 主詞 + would have + 過去分詞。',rule:'第三條件句：If + had + p.p.，主句 would have + p.p.。談「當初如果…就會…」（已無法改變）。',example:'If we had left food, the cat would have eaten.',banks:{
  easy:[
   ['pick','If we had left food, the cat ___ have eaten.',['will','would','had'],'would','主句用 would have + p.p.。'],
   ['pick','If Hana ___ seen the bird, she would have chased it.',['has','had','have'],'had','if 子句用 had + p.p.。'],
   ['pick','O would have won if he ___ run faster.',['has','had','would'],'had','if 子句用 had run。'],
   ['pick','If it had rained, the cats would ___ stayed inside.',['has','have','had'],'have','would have + p.p.。']],
  core:[
   ['fill','If we had known Hu was sick, we ___ have called the vet sooner.（would）','would','主句 would have called。'],
   ['fill','Hana would have caught the bird if she ___ been faster.（had）','had','if 子句用 had been。'],
   ['fill','If the door had been open, the cats ___ have run outside.（would）','would','主句 would have run。'],
   ['fill','O would have eaten more if the bowl ___ been full.（had）','had','if 子句用 had been。']],
  challenge:[
   ['type','If the staff ___ Hu that winter, the kitten would not have survived, because it was so cold.（had + find p.p.）','had found','if 子句用 had + found。'],
   ['type','Hana would have caught the bird if she ___ it earlier, although she is usually very quick.（had + see p.p.）','had seen','if 子句用 had + seen。'],
   ['type','If we ___ the gate open, the kittens would have escaped, which frightens us to imagine.（had + leave p.p.）','had left','if 子句用 had + left。'],
   ['type','The cats would have been frightened if the storm ___ during the night, but it passed quietly.（had + come p.p.）','had come|had arrived','if 子句用 had + come/arrived。']]}},
 {date:'2026-10-16',title:'貓咪動作大集合',topic:'片語動詞',level:'B1',icon:'🧩',cat:'cream',scene:'動詞 + 介副詞 = 片語動詞，意思常和字面不同：look after 照顧、turn on 打開、give up 放棄、run out of 用完。',rule:'片語動詞 = 動詞 + 介系詞/副詞，整體意思一起記。look after 照顧、turn on 打開、give up 放棄。',example:'Please look after the cats. Don’t give up!',banks:{
  easy:[
   ['pick','Please look ___ the cats while I’m away.',['after','for','up'],'after','look after = 照顧。'],
   ['pick','Can you turn ___ the light?',['on','in','of'],'on','turn on = 打開。'],
   ['pick','Don’t give ___ ! You can do it.',['up','in','on'],'up','give up = 放棄。'],
   ['pick','She picked ___ the kitten gently.',['up','on','off'],'up','pick up = 抱起/撿起。']],
  core:[
   ['fill','I have to leave, so please look ___ Hana until I return.（照顧）','after','look after = 照顧。'],
   ['fill','It’s dark, so turn ___ the light, and the cats will feel safe.（打開）','on','turn on = 打開。'],
   ['fill','The training is hard, but the kitten never gives ___ .（放棄）','up','give up = 放棄。'],
   ['fill','We ran ___ of cat food, so we went to the shop.（run out ___ = 用完）','out','run out of = 用完。']],
  challenge:[
   ['type','Although I was busy, I promised to look ___ the kittens, because their owner had gone away.（照顧）','after','look after = 照顧。'],
   ['type','When the room got dark, the staff turned ___ the lamp, so the cats would not feel scared.（打開）','on','turn on = 打開。'],
   ['type','Even though the trick was difficult, Hu never gave ___ , which made everyone proud.（放棄）','up','give up = 放棄。'],
   ['type','Because we had run ___ of treats, we drove to the store, where the cats’ favorite brand was on sale.（用完）','out','run out of = 用完。']]}},
 {date:'2026-10-17',title:'a、an 還是 the',topic:'冠詞',level:'B1',icon:'🔤',cat:'cow',scene:'第一次提到、單數可數用 a/an（母音「音」開頭用 an）；特指或再次提到用 the。',rule:'a/an：第一次提到的單數可數（母音音用 an）。the：特指或再次提到。honest 的 h 不發音，用 an。',example:'I saw a cat. The cat was black.',banks:{
  easy:[
   ['pick','I saw ___ cat in the garden.',['a','an','the'],'a','第一次提到、子音 c，用 a。'],
   ['pick','She adopted ___ orange kitten.',['a','an','the'],'an','orange 母音音開頭，用 an。'],
   ['pick','The cat sat on ___ roof. It was our roof.',['a','an','the'],'the','特指我們家的屋頂，用 the。'],
   ['pick','Hana is ___ friendly cat.',['a','an','the'],'a','第一次提到、子音 f，用 a。']],
  core:[
   ['fill','I saw a kitten this morning, and ___ kitten was very playful.（再次提到）','the','再次提到用 the。'],
   ['fill','She wants to adopt ___ old cat, because older cats are calmer.（母音音 old）','an','old 母音音，用 an。'],
   ['fill','O is ___ brave cat, but he is afraid of water.（第一次提到，子音 brave）','a','子音 b，用 a。'],
   ['fill','The vet checked ___ sick kitten, and the kitten got better.（特指那隻）','the','特指，用 the。']],
  challenge:[
   ['type','When Hana found ___ mouse in the kitchen, she chased it until it escaped, which annoyed her.（第一次提到，子音 mouse）','a','子音 m，用 a。'],
   ['type','The staff adopted ___ injured kitten last winter, and it has become the friendliest cat here.（母音音 injured）','an','injured 母音音，用 an。'],
   ['type','Because O is ___ honest cat, he never steals food, although he loves fish more than anything.（honest 的 h 不發音）','an','honest 以母音音開頭，用 an。'],
   ['type','We took the sick cat to ___ vet who had saved it before, so we trusted her completely.（特指那位獸醫）','the','特指那位曾救過牠的獸醫，用 the。']]}},
 {date:'2026-10-18',title:'把想法接起來',topic:'連接詞',level:'B1–B2',icon:'🪡',cat:'gray',scene:'連接兩個想法：because（因為）、so（所以）、although（雖然）、despite + 名詞/動名詞（儘管）。',rule:'because + 句子（原因）；so（結果）；although + 句子（讓步）；despite + 名詞/動名詞。',example:'Although it rained, the cats played. It was cold, so they stayed inside.',banks:{
  easy:[
   ['pick','___ it rained, the cats stayed inside.',['Because','So','Although'],'Because','表示原因用 Because。'],
   ['pick','Hana was tired, ___ she slept.',['because','so','although'],'so','表示結果用 so。'],
   ['pick','___ he was small, Hu jumped high.',['Because','So','Although'],'Although','讓步（雖然）用 Although。'],
   ['pick','It was cold, ___ the cats wore tiny sweaters.',['because','so','although'],'so','表示結果用 so。']],
  core:[
   ['fill','The kittens were hungry, ___ the staff fed them early.（結果：所以）','so','表示結果用 so。'],
   ['fill','___ Hana is old, she still plays like a kitten.（讓步：雖然）','Although','讓步用 Although。'],
   ['fill','O stayed inside ___ it was raining hard.（原因：因為）','because','表示原因用 because。'],
   ['fill','The cat kept meowing, ___ we opened the door.（結果：所以）','so','表示結果用 so。']],
  challenge:[
   ['type','___ the storm was loud, the kittens slept peacefully, which surprised everyone in the shelter.（讓步：雖然）','Although','讓步用 Although。'],
   ['type','The cats trusted the new vet ___ she was gentle and patient, so they stayed calm during the check-up.（原因：因為）','because','表示原因用 because。'],
   ['type','Hana wanted to go outside, ___ the staff kept her in, since the roads were busy and dangerous.（結果：所以）','so','表示結果用 so。'],
   ['type','___ being tiny, Hu climbed the tallest shelf, which no other cat had ever reached.（儘管 + 動名詞）','Despite','despite + 名詞/動名詞（being tiny）。']]}}
]}];
let DQ = null, DQ_WEEK_VIEW = null;
/* Difficulty picks a whole different bank (type + sentence complexity), not a tweak. */
const DQ_TIER_LABEL = {easy:'🌱 簡單 Easy', core:'🐾 一般 Core', challenge:'🔥 挑戰 Challenge'};
const DQ_TIER_NOTE = {
 easy:'選擇題 · 簡單句 —— 三選一，先把句型看熟。',
 core:'填空題 · 複合句 —— 用 and / but / so 連接兩個子句，自己填入正確的字。',
 challenge:'打字填寫 · 複合複雜句 —— 句子含從屬子句與關係子句，完整打出答案。'};
const DQ_TYPE_LABEL = {pick:'選擇題', fill:'填空題', type:'打字填寫', sort:'分類', build:'句子拼拼樂'};
/* Honor titles (稱號) — climb by total days completed. */
const DQ_TITLES = [
 {min:0,zh:'貓島見習生',en:'Rookie'},
 {min:1,zh:'貓咪學徒',en:'Apprentice'},
 {min:4,zh:'文法冒險家',en:'Grammar Explorer'},
 {min:8,zh:'句型旅人',en:'Sentence Voyager'},
 {min:14,zh:'貓島達人',en:'Island Adept'},
 {min:21,zh:'貓島大師',en:'Island Master'}];
/* Honor badges (榮譽貓咪島徽章). */
const DQ_BADGES = [
 {id:'first',icon:'🐾',zh:'第一枚貓掌',en:'First Paw',cond:'完成第一天任務',test:s=>s.daysDone>=1},
 {id:'three',icon:'🎀',zh:'三日貓友',en:'Three-Day Friend',cond:'累積完成 3 天',test:s=>s.daysDone>=3},
 {id:'week',icon:'📅',zh:'週冠軍',en:'Week Champion',cond:'完成一整週 7 天',test:s=>s.weeksDone>=1},
 {id:'challenger',icon:'🔥',zh:'挑戰者',en:'Challenger',cond:'以挑戰難度完成 3 天',test:s=>s.challengeDone>=3},
 {id:'chalWeek',icon:'💎',zh:'挑戰大師',en:'Challenge Master',cond:'以挑戰難度完成一整週',test:s=>s.challengeWeeks>=1},
 {id:'streak7',icon:'🌙',zh:'七日連續',en:'7-Day Streak',cond:'連續打卡 7 天',test:s=>s.streak>=7},
 {id:'xp300',icon:'⭐',zh:'貓島之星',en:'Island Star',cond:'累積 300 XP',test:s=>s.xp>=300},
 {id:'allWeeks',icon:'🏝️',zh:'貓島探險家',en:'Island Explorer',cond:'完成目前所有週任務',test:s=>s.totalWeeks>0&&s.weeksDone>=s.totalWeeks}];
function dailyTierAuto(){ const xp=(store.data&&store.data.xp)||0; return xp>=250?'challenge':xp>=80?'core':'easy'; }
function dailyTier(){ const m=(store.data&&store.data.dailyDiff)||'auto'; return m==='auto'?dailyTierAuto():m; }
function dailySetDiff(m){ store.data.dailyDiff=m; store.save(); renderDaily(); }
function dailyBank(d){ const t=dailyTier(); return (d.banks&&d.banks[t])||(d.banks&&d.banks.easy)||[]; }
function dailyToday(now = new Date()) {
 const p = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 return ['year','month','day'].map(k=>p.find(x=>x.type===k).value).join('-');
}
function dailyWeek(){ const t=dailyToday(); return DAILY_WEEKS.filter(w=>w.id<=t).at(-1)||DAILY_WEEKS[0]; }
function dqShownWeek(){ return DAILY_WEEKS.find(w=>w.id===DQ_WEEK_VIEW) || dailyWeek(); }
function dqSetWeek(id){ DQ_WEEK_VIEW=id; renderDaily(); window.scrollTo(0,0); }
function dailyRecords(){ return store.data.dailyQuests || {}; }
function dailyStarted(rec){ return rec && rec.progress && Object.values(rec.progress).some(a=>a&&a.some(Boolean)); }
function dailyFeatured(){ const w=dailyWeek(),t=dailyToday(); return w.days.find(d=>d.date===t)||w.days.find(d=>!dailyRecords()[d.date]?.done)||w.days[0]; }
function dailyHomeCard(){ const d=dailyFeatured();return `<section class="dq-home card"><div><div class="eyebrow">DAILY CAT QUEST · 每天 5–10 分鐘</div><h2>每日任務 · ${d.title}</h2><p>${d.topic} · ${d.level}　陪貓咪玩一關，學會一個句型。</p></div><a class="btn btn-primary" href="#/daily">查看每日任務 →</a></section>`; }
/* ---- rewards: stats, titles, badges ---- */
function dqChalDone(d){ const r=dailyRecords()[d.date]; const p=r&&r.progress&&r.progress.challenge; const b=d.banks&&d.banks.challenge; return !!(p&&b&&p.length===b.length&&p.every(Boolean)); }
function dqStats(){
 const recs=dailyRecords(), allDays=DAILY_WEEKS.flatMap(w=>w.days);
 const done=d=>!!(recs[d.date]&&recs[d.date].done);
 return {
  daysDone: allDays.filter(done).length,
  challengeDone: allDays.filter(dqChalDone).length,
  weeksDone: DAILY_WEEKS.filter(w=>w.days.every(done)).length,
  challengeWeeks: DAILY_WEEKS.filter(w=>w.days.every(dqChalDone)).length,
  xp: store.data.xp||0,
  streak: (typeof store.streakCount==='function')?store.streakCount():0,
  totalWeeks: DAILY_WEEKS.length,
  totalDays: allDays.length};
}
function dqTitle(s){ let t=DQ_TITLES[0]; for(const x of DQ_TITLES) if(s.daysDone>=x.min) t=x; return t; }
function dqSyncBadges(){
 const s=dqStats(); store.data.dailyBadges=store.data.dailyBadges||{}; const newly=[];
 for(const b of DQ_BADGES) if(b.test(s)&&!store.data.dailyBadges[b.id]){ store.data.dailyBadges[b.id]=new Date().toISOString(); newly.push(b); }
 if(newly.length) store.save();
 return newly;
}
function dqHonorsCard(){
 dqSyncBadges();
 const s=dqStats(), title=dqTitle(s), earned=store.data.dailyBadges||{}, next=DQ_TITLES.find(x=>x.min>s.daysDone);
 const badges=DQ_BADGES.map(b=>{const on=!!earned[b.id];return `<div class="dq-badge ${on?'on':''}"><span class="dq-badge-ic">${b.icon}</span><b>${b.zh}</b><span class="dq-badge-en">${b.en}</span><span class="dq-badge-cond">${on?'✓ 已獲得':esc(b.cond)}</span></div>`;}).join('');
 return `<section class="dq-honors card"><div class="dq-honors-top"><div><div class="eyebrow">HONORS · 榮譽殿堂</div><div class="dq-title-now">${title.zh} <span>${title.en}</span></div>${next?`<div class="dq-title-next">再完成 ${next.min-s.daysDone} 天任務 → 晉升「${next.zh}」</div>`:`<div class="dq-title-next">已達最高稱號，貓島以你為榮！🏆</div>`}</div><div class="dq-honors-stats"><div><b>${s.daysDone}</b><span>完成天數</span></div><div><b>${s.xp}</b><span>XP</span></div><div><b>${Object.keys(earned).length}/${DQ_BADGES.length}</b><span>徽章</span></div></div></div><div class="dq-badges">${badges}</div></section>`;
}
function renderDaily(){
 DQ=null;const w=dqShownWeek(),records=dailyRecords(),done=w.days.filter(d=>records[d.date]?.done).length,t=dailyToday(),cur=dailyWeek();
 const diffMode=(store.data.dailyDiff)||'auto',tier=dailyTier(),xp=store.data.xp||0;
 const weekNav=DAILY_WEEKS.length>1?`<div class="dq-weeknav">${DAILY_WEEKS.map((x,i)=>`<button class="dq-week-chip ${x.id===w.id?'on':''}" onclick="dqSetWeek('${x.id}')">第 ${i+1} 週 · ${esc(x.title)}${x.id===cur.id?' 🐾本週':x.id>cur.id?' 🔒可預習':''}</button>`).join('')}</div>`:'';
 const diffCard=`<section class="dq-diff card"><div class="dq-diff-head"><b>難易度 Difficulty</b><span>三種難度是完全不同的題型與句子，不只是換皮</span></div><div class="dq-diff-btns">${[['auto','⚙️ 自動 Auto'],['easy','🌱 簡單'],['core','🐾 一般'],['challenge','🔥 挑戰']].map(([k,l])=>`<button class="dq-diff-btn ${diffMode===k?'on':''}" onclick="dailySetDiff('${k}')">${l}</button>`).join('')}</div><p class="dq-diff-now">目前難度：<b>${DQ_TIER_LABEL[tier]}</b>${diffMode==='auto'?`（依你目前 ${xp} XP 自動判斷）`:''}<br><span class="dq-diff-desc">${DQ_TIER_NOTE[tier]}</span></p></section>`;
 app.innerHTML=`<div class="view dq"><a href="#/home">← 回到首頁</a><section class="dq-hero"><div><div class="eyebrow">DAILY CAT QUESTS</div><h1 class="display">每天一小步，<br>陪貓咪探索英語島。</h1><p>每週七個文法任務，三種難度自由挑。完成任務可獲得 XP、稱號與榮譽貓咪島徽章。</p><p class="dq-meta">${w.days[0].date.replaceAll('-', ' / ')} — ${w.days.at(-1).date.slice(5).replace('-', ' / ')} · 台灣時間每日中午建議練習</p><a class="btn btn-primary" href="#/daily/${dailyFeatured().date}">開始今日任務：${dailyFeatured().title} →</a></div><div class="dq-mascot">${catSVG(150,'calico')}<span>今天也一起進步，喵！</span></div></section>${dqHonorsCard()}<section class="dq-progress card"><div><b>本週探險足跡 · ${esc(w.title)}</b><span>${done} / 7 天完成</span></div><progress max="7" value="${done}" aria-label="本週任務完成進度"></progress><p>每關全部訂正後收集一枚貓掌，首次完成 +20 XP、挑戰難度再 +10、完成整週再 +50。</p></section>${diffCard}<div class="dq-heading"><h2>任務地圖</h2><span>可切換週次，提前預習或隨時複習</span></div>${weekNav}<div class="dq-grid">${w.days.map((d,i)=>`<a class="card dq-day ${d.date===t?'dq-today':''}" href="#/daily/${d.date}"><div class="dq-day-top"><span>DAY 0${i+1} · ${Number(d.date.slice(5,7))}/${Number(d.date.slice(8))} 週${'一二三四五六日'[i]}</span><b>${records[d.date]?.done?'🐾 已完成':d.date===t?'今日任務':d.date>t?'可預習':'可補做'}</b></div><span class="dq-icon" aria-hidden="true">${d.icon}</span><h3>${d.title}</h3><p>${d.topic}</p><div class="dq-day-bottom"><span>${d.level} · ${dailyBank(d).length} 題</span><span>${records[d.date]?.done?'再次練習':dailyStarted(records[d.date])?'繼續任務':'開始探索'} →</span></div></a>`).join('')}</div><p class="dq-source">改編自英語貓咪島週企劃；互動題目與難度分級為原創編寫。目前收錄 ${DAILY_WEEKS.length} 週，之後可持續新增。</p></div>`;
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
 const parts=[]; let gained=0;
 if(first){ gained+=20; parts.push('首次完成 +20 XP'); }
 const chalFirst=DQ.tier==='challenge' && !record.chalBonus;
 if(DQ.tier==='challenge'){ record.chalBonus=true; if(chalFirst){ gained+=10; parts.push('挑戰難度 +10 XP'); } }
 store.data.dailyWeekBonus=store.data.dailyWeekBonus||{};
 const wk=DAILY_WEEKS.find(w=>w.days.some(x=>x.date===d.date));
 if(wk && wk.days.every(x=>store.data.dailyQuests[x.date]?.done) && !store.data.dailyWeekBonus[wk.id]){ store.data.dailyWeekBonus[wk.id]=true; gained+=50; parts.push('完成整週 +50 XP'); }
 if(gained>0) store.data.xp=(store.data.xp||0)+gained;
 store.save();store.touchStreak();
 const newly=dqSyncBadges();
 paintHeader();
 const s=dqStats(),title=dqTitle(s);
 const next=DAILY_WEEKS.flatMap(w=>w.days).find(x=>x.date>d.date);
 const xpLine=parts.length?parts.join('　·　'):'複習完成 · 這關的獎勵已領取';
 const badgeHTML=newly.length?`<div class="dq-newbadges"><div class="eyebrow">🎉 解鎖新徽章</div>${newly.map(b=>`<span class="dq-nb">${b.icon} ${b.zh}</span>`).join('')}</div>`:'';
 app.innerHTML=`<div class="view dq dq-result card">${catSVG(140,d.cat)}<div class="eyebrow">DAILY QUEST COMPLETE</div><h1 class="display">收集到一枚貓掌！🐾</h1><p>你以${DQ_TIER_LABEL[DQ.tier]}完成了「${d.title}」的 ${DQ.questions.length} 題挑戰與訂正。</p><strong>${xpLine}</strong>${badgeHTML}<p class="dq-result-title">目前稱號：<b>${title.zh}</b> ${title.en}</p><div class="dq-result-actions"><a class="btn btn-primary" href="#/daily">回到任務地圖</a>${next?`<a class="btn btn-ghost" href="#/daily/${next.date}">下一天：${next.title} →</a>`:''}<button class="btn btn-ghost" onclick="startDaily('${d.date}')">再練一次</button></div></div>`;
}
