/* 每日背單字任務 Daily Vocab Quest
   每天 5 個字：先背（發音、中文、雙語例句、搭配詞），再做「句子含那個字、但答案考文法」的題目。
   單字資料來自 vocab/books.js（BUILTIN_BOOKS，與「每日單字」App 共用）。
   進度存 store.data.vocabQuests[日期]（隨帳號同步到 Supabase progress）；
   完成後把這 5 個字排進「每日單字」App 的複習（localStorage vr:p:<book>）。
   新增單元：在 VQ_UNITS 加一組 5 個字，並在 VQ_GRAMMAR 為每個字寫一題。 */

const VQ_START = '2026-09-30';   // 各路線第 1 單元的日期，之後每天換下一單元（循環）
/* 路線：學生在「背單字總覽」選一條；各路線依日期各自輪替。core 為最早上線的路線，紀錄沿用舊的日期 key。 */
const VQ_TRACKS = {
 g7:{title:'七年級', desc:'教育部基本字・較基礎的 539 字', book:'jh7'},
 g8:{title:'八年級', desc:'教育部基本字・較進階的 548 字', book:'jh8'},
 g9:{title:'九年級', desc:'教育部常用 2,000 字・基本字以外的 793 字', book:'jh9'},
 core:{title:'會考＋學測', desc:'國中會考核心字 → 學測進階字'}
};
const VQ_UNITS = [
 {book:'jh-core', title:'出國與日常', words:['abroad','borrow','careful','decide','enough']},
 {book:'jh-core', title:'有名的旅程', words:['famous','guess','habit','important','journey']},
 {book:'jh-core', title:'鄰居與訊息', words:['knowledge','lonely','message','neighbor','order']},
 {book:'jh-core', title:'練習與驚喜', words:['practice','quiet','remember','surprise','thirsty']},
 {book:'jh-core', title:'村莊的天氣', words:['umbrella','village','weather','exercise','yell']},
 {book:'jh-core', title:'準備與邀請', words:['prepare','medicine','invite','believe','different']},
 {book:'sh-gsat', title:'放棄與貢獻', words:['abandon','accurate','benefit','candidate','contribute']},
 {book:'sh-gsat', title:'方便又有效率', words:['convenient','decline','efficient','emphasize','essential']},
 {book:'sh-gsat', title:'影響與辨認', words:['frustrated','generous','hesitate','identify','influence']},
 {book:'sh-gsat', title:'潛力與協商', words:['maintain','negotiate','obvious','participate','potential']},
 {book:'sh-gsat', title:'傳統與優先', words:['priority','recognize','reluctant','sufficient','tradition']},
 {book:'sh-gsat', title:'緊急與感謝', words:['urgent','vary','withdraw','anxious','appreciate']}
];

/* 每個字一題：[句子（___ 為空格）, 選項, 答案, 解析, 整句中譯]。答案一定不是目標字本身。 */
const VQ_GRAMMAR = {
 /* 七年級 */
 classmate:['Amy and I ___ classmates.',['are','is','am'],'are','主詞 Amy and I 是兩個人（複數），be 動詞用 are。','艾咪和我是同學。'],
 subject:['What ___ your favorite subject?',['is','are','do'],'is','your favorite subject 是單數，be 動詞用 is。','你最喜歡的科目是什麼？'],
 homework:['Tom ___ his homework after dinner every day.',['does','do','doing'],'does','Tom 是第三人稱單數，現在簡單式的 do 要改成 does。','湯姆每天晚餐後寫功課。'],
 library:['There ___ many books in the library.',['are','is','am'],'are','There be 看後面的名詞：many books 是複數，用 are。','圖書館裡有很多書。'],
 early:['I get up early ___ Monday.',['on','in','at'],'on','星期幾前面的介系詞用 on。','我星期一很早起床。'],
 family:['There ___ four people in my family.',['are','is','be'],'are','four people 是複數，There are。','我家有四個人。'],
 cousin:['My cousin ___ in Tainan.',['lives','live','living'],'lives','My cousin 是第三人稱單數，動詞加 s：lives。','我的表哥住在台南。'],
 cook:['My dad cooks dinner ___ Sundays.',['on','at','in'],'on','星期幾（Sundays）前面用 on。','我爸爸星期天煮晚餐。'],
 together:['My family and I ___ dinner together every night.',['eat','eats','eating'],'eat','主詞 My family and I 是複數，動詞用原形 eat。','我和家人每天晚上一起吃晚餐。'],
 weekend:['What ___ you do on weekends?',['do','does','are'],'do','主詞是 you，一般動詞的疑問句用助動詞 do。','你週末都做什麼？'],
 usually:['She usually ___ the bus to school.',['takes','take','taking'],'takes','She 是第三人稱單數，現在簡單式動詞加 s：takes。','她通常搭公車上學。'],
 breakfast:['I have breakfast ___ seven o’clock.',['at','on','in'],'at','幾點鐘前面用 at。','我七點吃早餐。'],
 clean:['Look! The students ___ cleaning the classroom now.',['are','is','do'],'are','現在進行式 be + V-ing，主詞 The students 是複數，用 are。','你看！學生們正在打掃教室。'],
 bus:['I go to school ___ bus.',['by','on','with'],'by','搭乘交通工具（中間不加冠詞）用 by：by bus、by car。','我搭公車上學。'],
 tired:['___ you tired after P.E. class?',['Are','Do','Is'],'Are','tired 是形容詞，問句用 be 動詞；主詞 you 配 Are。','你上完體育課會累嗎？'],
 hobby:['What ___ his hobbies?',['are','is','does'],'are','hobbies 是複數，be 動詞用 are。','他的嗜好是什麼？'],
 basketball:['He can ___ basketball very well.',['play','plays','playing'],'play','助動詞 can 後面接原形動詞 play。','他籃球打得很好。'],
 sing:['Listen! Mia ___ singing in her room.',['is','are','does'],'is','現在進行式 be + V-ing；Mia 是單數，用 is。','你聽！米亞正在她房間裡唱歌。'],
 draw:['Can you draw a cat ___ me?',['for','of','at'],'for','「為某人」做某事用 for。','你可以幫我畫一隻貓嗎？'],
 favorite:['What is ___ favorite color?',['your','you','yours'],'your','名詞 favorite color 前面用所有格形容詞 your。','你最喜歡的顏色是什麼？'],
 hungry:['I’m hungry. Let’s ___ lunch.',['eat','eats','eating'],'eat','Let’s 後面接原形動詞。','我餓了，我們吃午餐吧。'],
 delicious:['The beef noodles ___ delicious.',['are','is','am'],'are','noodles 是複數名詞，be 動詞用 are。','這牛肉麵很好吃。'],
 vegetable:['How ___ vegetables do you eat every day?',['many','much','any'],'many','vegetables 是可數複數名詞，問數量用 How many。','你每天吃多少蔬菜？'],
 noodles:['I want ___ bowl of noodles.',['a','an','many'],'a','bowl 以子音開頭，用 a；a bowl of = 一碗。','我想要一碗麵。'],
 drink:['Would you like ___ to drink?',['something','some','a'],'something','「一些東西」用 something；something to drink = 可以喝的東西。','你想喝點什麼嗎？'],
 price:['What’s the price ___ this T-shirt?',['of','in','at'],'of','the price of + 物品 = 某物的價格。','這件 T 恤的價格是多少？'],
 cheap:['___ pens are cheap.',['These','This','That'],'These','pens 是複數，用 These（這些）。','這些筆很便宜。'],
 expensive:['How ___ are the shoes? They look expensive.',['much','many','old'],'much','問價錢用 How much。','這雙鞋多少錢？看起來很貴。'],
 sell:['Does the shop sell stickers? — Yes, it ___.',['does','is','do'],'does','用 Does 問，就用 does 回答；the shop 用 it 代替。','這家店有賣貼紙嗎？——有。'],
 wallet:['Is this ___ wallet, Ben?',['your','you','yours'],'your','名詞 wallet 前面用所有格形容詞 your；yours 後面不能再接名詞。','班，這是你的錢包嗎？'],
 season:['There ___ four seasons in a year.',['are','is','have'],'are','「有」某物用 There be；four seasons 是複數，用 are。','一年有四個季節。'],
 rainy:['It’s rainy today, ___ take an umbrella.',['so','but','because'],'so','前面是原因、後面是結果，用 so（所以）。','今天下雨，所以帶把傘吧。'],
 windy:['___ is very windy in Hsinchu.',['It','This','He'],'It','描述天氣時，主詞用 It。','新竹風很大。'],
 warm:['It’s warm ___ spring.',['in','on','at'],'in','季節前面用 in：in spring、in summer。','春天很溫暖。'],
 jacket:['Put ___ your jacket. It’s cold outside.',['on','in','at'],'on','put on = 穿上（衣物）。','穿上你的外套，外面很冷。'],
 animal:['Pandas ___ my favorite animals.',['are','is','am'],'are','Pandas 是複數，be 動詞用 are。','熊貓是我最喜歡的動物。'],
 zoo:['We can ___ koalas at the zoo.',['see','sees','seeing'],'see','助動詞 can 後面接原形動詞 see。','我們在動物園可以看到無尾熊。'],
 near:['Is there a park near your home? — Yes, there ___.',['is','are','has'],'is','用 Is there 問，就用 there is 回答。','你家附近有公園嗎？——有。'],
 feed:['Don’t feed the monkeys. They can ___ sick.',['get','gets','getting'],'get','助動詞 can 後面接原形動詞 get。','不要餵猴子，牠們可能會生病。'],
 cute:['Look ___ the cute puppy!',['at','to','on'],'at','look at = 看著…。','你看這隻可愛的小狗！'],
 /* 八年級 */
 trip:['We ___ a trip to Kenting last summer.',['took','take','have taken'],'took','last summer 是過去的時間，用過去式 took。','我們去年夏天去墾丁旅行。'],
 ticket:['How ___ are the tickets for the concert?',['much','many','long'],'much','問價錢用 How much。','演唱會的票多少錢？'],
 airport:['When I arrived at the airport, my parents ___ for me.',['were waiting','wait','are waiting'],'were waiting','過去某個時間點「正在」做的事，用過去進行式 was/were + V-ing。','我到機場的時候，爸媽正在等我。'],
 visit:['We ___ going to visit Tainan next week.',['are','will','have'],'are','be going to + 原形動詞表示計畫好的未來；主詞 We 用 are。','我們下週要去台南玩。'],
 plan:['We plan ___ to Japan next year.',['to go','going','go'],'to go','plan 後面接不定詞 to + 原形動詞。','我們計畫明年去日本。'],
 healthy:['Eating fruit every day ___ you healthy.',['keeps','keep','keeping'],'keeps','動名詞 Eating… 當主詞視為單數，動詞加 s：keeps。','每天吃水果讓你保持健康。'],
 fever:['She had a fever yesterday, ___ she didn’t go to school.',['so','but','because'],'so','前面是原因、後面是結果，用 so（所以）。','她昨天發燒，所以沒去上學。'],
 rest:['You look tired. You ___ take a rest.',['should','must not','don’t'],'should','給建議用 should + 原形動詞（你應該…）。','你看起來很累，應該休息一下。'],
 dentist:['How often ___ you go to the dentist?',['do','are','does'],'do','How often 問頻率；主詞 you 的一般動詞疑問句用 do。','你多久看一次牙醫？'],
 stomach:['I ate ___ much ice cream, and now my stomach hurts.',['too','so','very'],'too','too much = 太多（超過適當的量，帶有負面結果）。','我吃了太多冰淇淋，現在胃好痛。'],
 festival:['What ___ you do during the Lantern Festival last year?',['did','do','were'],'did','last year 是過去，一般動詞的過去式疑問句用 did。','去年元宵節你做了什麼？'],
 celebrate:['We celebrated Grandma’s birthday ___ a big cake.',['with','by','for'],'with','用某樣東西（一個大蛋糕）來慶祝，用 with。','我們用一個大蛋糕幫奶奶慶生。'],
 gift:['My aunt gave ___ a gift for my birthday.',['me','I','my'],'me','give sb sth：give 後面的人用受格 me。','我阿姨送我一份生日禮物。'],
 decorate:['We decorated the classroom ___ balloons.',['with','by','of'],'with','decorate A with B = 用 B 來裝飾 A。','我們用氣球佈置教室。'],
 lantern:['Look at the lanterns! They are ___ beautiful.',['so','such','much'],'so','so + 形容詞 = 好…、這麼…；such 後面要接名詞。','看那些燈籠！好漂亮。'],
 computer:['I use the computer ___ my homework.',['to do','doing','do'],'to do','不定詞 to + V 可以表示「目的」（為了做…）。','我用電腦來寫功課。'],
 internet:['You can find a lot of information ___ the Internet.',['on','in','at'],'on','「在網路上」用 on the Internet。','你可以在網路上找到很多資訊。'],
 online:['Have you ___ bought anything online?',['ever','yet','already'],'ever','現在完成式問「曾經」的經驗用 Have you ever + p.p.?','你曾經在網路上買過東西嗎？'],
 download:['Don’t download apps ___ you ask your parents.',['before','because','so'],'before','before + 子句 = 在…之前。','在問過爸媽之前，不要下載 app。'],
 smartphone:['Whose smartphone is this? — It’s ___.',['mine','my','me'],'mine','後面沒有名詞，用所有格代名詞 mine（= my smartphone）。','這是誰的手機？——是我的。'],
 environment:['Everyone should ___ the environment.',['protect','protects','protecting'],'protect','助動詞 should 後面接原形動詞。','每個人都應該保護環境。'],
 trash:['Please pick ___ the trash on the beach.',['up','on','off'],'up','pick up = 撿起來。','請把沙灘上的垃圾撿起來。'],
 recycle:['Plastic bottles can ___ recycled.',['be','is','are'],'be','被動語態 be + p.p.；助動詞 can 後面用原形 be。','塑膠瓶可以回收。'],
 save:['Turn off the lights to save energy ___ you leave the room.',['when','what','who'],'when','when 引導時間子句「當你離開房間時」。','離開房間時，要關燈節省能源。'],
 pollution:['Air pollution is ___ serious problem in many cities.',['a','an','much'],'a','serious 以子音開頭，可數單數名詞 problem 前用 a。','空氣污染在很多城市是個嚴重的問題。'],
 dream:['My dream ___ to travel around the world.',['is','are','be'],'is','主詞 My dream 是單數，be 動詞用 is。','我的夢想是環遊世界。'],
 future:['What do you want ___ in the future?',['to be','be','being'],'to be','want 後面接不定詞 to + 原形動詞。','你將來想做什麼？'],
 become:['He wants to become a teacher ___ the future.',['in','on','at'],'in','in the future = 在未來。','他將來想成為老師。'],
 engineer:['My uncle is ___ engineer.',['an','a','two'],'an','engineer 以母音音開頭，冠詞用 an。','我叔叔是工程師。'],
 nurse:['The nurse is kind. Everyone likes ___.',['her','she','hers'],'her','likes 後面接受詞，用受格 her。','那位護理師很親切，大家都喜歡她。'],
 contest:['Our class ___ first place in the singing contest last week.',['won','wins','has won'],'won','last week 是過去的時間，用過去式 won。','我們班上週在歌唱比賽得到第一名。'],
 team:['Our team is ___ than their team.',['stronger','strong','strongest'],'stronger','後面有 than，用比較級 stronger。','我們隊比他們隊強。'],
 win:['I hope our team ___ win the game tomorrow.',['will','is','did'],'will','tomorrow 是未來，用 will + 原形動詞。','我希望我們隊明天會贏得比賽。'],
 lose:['Don’t be sad ___ you lose the game.',['if','so','but'],'if','if 引導條件子句「如果你輸了」。','如果你輸了比賽，不要難過。'],
 cheer:['The fans cheered ___ their team loudly.',['for','to','at'],'for','cheer for sb = 為某人加油。','球迷大聲地為他們的隊伍加油。'],
 friendship:['Friendship is one of ___ important things in life.',['the most','more','most'],'the most','one of the + 最高級 + 複數名詞 = 最…的其中之一。','友誼是人生中最重要的事情之一。'],
 angry:['Don’t be angry ___ me. It was an accident.',['with','to','for'],'with','be angry with sb = 生某人的氣。','別生我的氣，那是意外。'],
 worried:['Mom was worried ___ me when I came home late.',['about','of','in'],'about','be worried about = 擔心…。','我很晚回家時，媽媽很擔心我。'],
 share:['Can you share your notes ___ me?',['with','to','for'],'with','share sth with sb = 和某人分享某物。','你可以跟我分享你的筆記嗎？'],
 excited:['I’m excited ___ the school trip.',['about','of','on'],'about','be excited about = 對…感到興奮。','我對校外教學感到很興奮。'],
 /* 會考＋學測 */
 abroad:['My sister ___ abroad since 2023.',['has studied','studies','studied'],'has studied','since + 時間點，表示從過去持續到現在，用現在完成式 has studied。','我姊姊從 2023 年起就在國外讀書。'],
 borrow:['Can I borrow ___ pen? Mine is broken.',['your','you','yours'],'your','名詞 pen 前面用所有格形容詞 your；yours 後面不能再接名詞。','我可以借你的筆嗎？我的壞了。'],
 careful:['Be careful ___ you cross the street.',['when','what','which'],'when','when 引導時間子句「當你過馬路時」。','過馬路時要小心。'],
 decide:['We decided ___ hiking on Sunday.',['to go','going','go'],'to go','decide 後面接不定詞 to + 原形動詞。','我們決定星期天去健行。'],
 enough:['There ___ enough chairs for everyone.',['aren’t','isn’t','doesn’t'],'aren’t','There be 句型看後面的名詞：chairs 是複數，用 aren’t。','椅子不夠每個人坐。'],
 famous:['Taiwan is famous ___ its night markets.',['for','of','at'],'for','be famous for = 以…聞名。','台灣以夜市聞名。'],
 guess:['Can you guess what ___ in the box?',['is','does','are'],'is','間接問句 what is in the box，what 當主詞，用單數 is。','你猜得到盒子裡有什麼嗎？'],
 habit:['Reading before bed ___ a good habit.',['is','are','be'],'is','動名詞 Reading… 當主詞，視為單數，用 is。','睡前閱讀是個好習慣。'],
 important:['It is important ___ enough sleep.',['to get','get','got'],'to get','It is + 形容詞 + to V，It 是虛主詞，真正的主詞是 to get enough sleep。','睡飽是很重要的。'],
 journey:['The journey to Hualien ___ four hours last weekend.',['took','takes','has taken'],'took','last weekend 是過去的時間，用過去式 took。','上週末去花蓮的旅程花了四個小時。'],
 knowledge:['Books give ___ knowledge about the world.',['us','we','our'],'us','give 後面接受詞，用受格 us（give sb sth）。','書給我們關於這個世界的知識。'],
 lonely:['He felt lonely ___ he moved to a new city.',['after','during','until'],'after','after + 子句「在他搬家之後」；during 後面只能接名詞。','他搬到新城市後感到很寂寞。'],
 message:['I ___ you a message when I get home.',['will send','sent','have sent'],'will send','時間子句 when I get home 用現在式代替未來，主要子句用 will。','我到家時會傳訊息給你。'],
 neighbor:['Our neighbor ___ a friendly dog.',['has','have','having'],'has','Our neighbor 是第三人稱單數，用 has。','我們的鄰居有一隻友善的狗。'],
 order:['Are you ready ___ order?',['to','for','of'],'to','be ready to + 原形動詞 = 準備好做某事。','您準備好點餐了嗎？'],
 practice:['I practice ___ the piano every day.',['playing','to play','play'],'playing','practice 後面接動名詞 V-ing。','我每天練習彈鋼琴。'],
 quiet:['Please be quiet ___ the library.',['in','on','at'],'in','在建築物「裡面」用 in。','在圖書館裡請保持安靜。'],
 remember:['Remember ___ your umbrella tomorrow.',['to bring','bringing','brought'],'to bring','remember to V = 記得「要去」做（還沒做）；remember V-ing = 記得「做過」。','明天記得帶雨傘。'],
 surprise:['Yesterday, to our surprise, the cat ___ the door by itself.',['opened','opens','open'],'opened','Yesterday 是過去時間，用過去式 opened。','昨天讓我們驚訝的是，貓自己把門打開了。'],
 thirsty:['I’m thirsty. Can I have ___ water?',['some','a','many'],'some','water 是不可數名詞，不能用 a 或 many；請求時用 some。','我口渴了，可以給我一些水嗎？'],
 umbrella:['Don’t forget ___ umbrella.',['an','a','many'],'an','umbrella 以母音音 /ʌ/ 開頭，冠詞用 an。','別忘了帶一把傘。'],
 village:['My grandparents ___ in a small village for fifty years.',['have lived','live','are living'],'have lived','for fifty years 表示從過去持續到現在，用現在完成式 have lived。','我的祖父母住在一個小村莊已經五十年了。'],
 weather:['___ the weather is bad, we will stay home.',['If','But','So'],'If','If 引導條件子句「如果天氣不好」。','如果天氣不好，我們就待在家。'],
 exercise:['You should exercise at least three times ___ week.',['a','the','an'],'a','「每一週」用 a week（three times a week＝一週三次）。','你應該一週至少運動三次。'],
 yell:['Don’t yell ___ your little brother.',['at','in','on'],'at','yell at sb = 對某人吼叫（帶有生氣的意思）。','不要對你弟弟大吼。'],
 prepare:['She is preparing ___ the final exam.',['for','to','of'],'for','prepare for + 名詞 = 為…做準備。','她正在為期末考做準備。'],
 medicine:['Take this medicine ___ meals.',['after','on','at'],'after','after meals = 飯後。','飯後吃這個藥。'],
 invite:['Thank you for inviting me ___ your birthday party.',['to','at','for'],'to','invite sb to + 活動 = 邀請某人參加…。','謝謝你邀請我參加你的生日派對。'],
 believe:['I believe ___ you can do it.',['that','what','which'],'that','that 引導名詞子句，當 believe 的受詞（that 可省略）。','我相信你做得到。'],
 different:['My hobbies are different ___ my sister’s.',['from','of','with'],'from','be different from = 與…不同。','我的嗜好和我姊姊的不一樣。'],
 abandon:['They had to abandon the car ___ the heavy snow.',['because of','because','although'],'because of','後面是名詞片語 the heavy snow，用 because of；because 後面要接完整子句。','因為大雪，他們不得不棄車。'],
 accurate:['This weather report is ___ accurate than the last one.',['more','most','very'],'more','後面有 than，用比較級 more + 形容詞。','這份氣象預報比上一份更準確。'],
 benefit:['Regular exercise has ___ benefits.',['many','much','a lot'],'many','benefits 是可數複數名詞，用 many；much 只接不可數，a lot 後面要加 of。','規律運動有很多好處。'],
 candidate:['There ___ three candidates for class leader this year.',['are','is','be'],'are','There be 看後面名詞：three candidates 是複數，用 are。','今年班長有三位候選人。'],
 contribute:['Everyone contributed ideas, ___ the project was a great success.',['so','but','because'],'so','前面是原因、後面是結果，用 so（所以）。','每個人都貢獻了點子，所以這個專題非常成功。'],
 convenient:['Is Friday convenient ___ you?',['for','to','with'],'for','be convenient for sb = 對某人來說方便（注意：不說 Are you convenient?）。','星期五你方便嗎？'],
 decline:['The number of students ___ declined in recent years.',['has','have','is'],'has','The number of + 複數名詞 = 「…的數量」，視為單數，用 has。','近年來學生人數下降了。'],
 efficient:['This is ___ efficient machine in the whole factory.',['the most','more','most'],'the most','in the whole factory 表示三者以上比較，用最高級 the most。','這是整間工廠最有效率的機器。'],
 emphasize:['The teacher emphasized the importance ___ reading.',['of','for','on'],'of','the importance of + 名詞/動名詞 = …的重要性。','老師強調閱讀的重要性。'],
 essential:['Water is essential ___ all living things.',['for','at','from'],'for','be essential for = 對…不可或缺。','水對所有生物都不可或缺。'],
 frustrated:['He felt frustrated ___ he failed the test again.',['when','what','where'],'when','when 引導時間子句「當他又考不及格時」。','他又考不及格時感到很挫折。'],
 generous:['It was generous ___ you to share your lunch.',['of','for','to'],'of','It is + 描述「人的個性」的形容詞 + of sb + to V（generous、kind、nice 都用 of）。','你願意分享午餐真是大方。'],
 hesitate:['Don’t hesitate ___ questions in class.',['to ask','asking','ask'],'to ask','hesitate 後面接不定詞 to + 原形動詞。','上課時有問題不要猶豫，儘管問。'],
 identify:['Can you identify the bird ___ is sitting on the roof?',['that','who','what'],'that','關係代名詞修飾「物」the bird，用 that（或 which）；who 用在人。','你能認出那隻停在屋頂上的鳥嗎？'],
 influence:['Parents have a strong influence ___ their children.',['on','in','at'],'on','have an influence on sb/sth = 對…有影響。','父母對孩子有很大的影響。'],
 maintain:['It is hard to maintain a healthy diet ___ you eat out every day.',['if','so','but'],'if','if 引導條件子句「如果你每天外食」。','如果你每天外食，就很難維持健康的飲食。'],
 negotiate:['The two sides negotiated for hours, ___ they finally reached an agreement.',['and','or','because'],'and','前後兩件事依序發生，用 and 連接（談了好幾個小時，然後終於達成協議）。','雙方協商了好幾個小時，最後終於達成協議。'],
 obvious:['___ was obvious that he was very tired.',['It','That','This'],'It','It is + 形容詞 + that 子句，It 是虛主詞，真正的主詞是 that 子句。','很明顯他非常累。'],
 participate:['All students ___ encouraged to participate in the event.',['are','is','being'],'are','被動語態 be + p.p.，主詞 All students 是複數，用 are。','鼓勵所有學生參加這個活動。'],
 potential:['She has the potential ___ a great writer.',['to become','becoming','became'],'to become','the potential to V = 有做…的潛力。','她有成為偉大作家的潛力。'],
 priority:['Safety is ___ top priority.',['our','us','we'],'our','名詞片語 top priority 前用所有格形容詞 our。','安全是我們的首要考量。'],
 recognize:['I ___ him for ten years, so I recognized him at once.',['had known','have known','know'],'had known','「認出」是過去發生的事，在那之前已經認識十年，用過去完成式 had known。','我那時已經認識他十年了，所以一眼就認出他。'],
 reluctant:['He was reluctant ___ his mistake.',['to admit','admitting','admit'],'to admit','be reluctant to V = 不願意做某事。','他不願意承認自己的錯誤。'],
 sufficient:['Is one hour sufficient ___ the test?',['for','to','of'],'for','be sufficient for + 名詞 = 足以應付…。','一小時足夠寫完這份考試嗎？'],
 tradition:['Eating mooncakes is a tradition ___ many families follow.',['that','what','who'],'that','關係代名詞 that 修飾 a tradition，並當 follow 的受詞；what 不能接在先行詞後面。','吃月餅是許多家庭遵循的傳統。'],
 urgent:['I have ___ urgent message for the manager.',['an','a','much'],'an','urgent 以母音音 /ɝ/ 開頭，冠詞用 an。','我有一則緊急訊息要給經理。'],
 vary:['Prices vary ___ store to store.',['from','between','in'],'from','vary from A to B = 從 A 到 B 各不相同。','價格因店而異。'],
 withdraw:['I need to withdraw some money ___ the ATM.',['from','of','off'],'from','withdraw money from = 從…提款。','我需要從提款機領一些錢。'],
 anxious:['She was anxious ___ her exam results.',['about','of','in'],'about','be anxious about = 對…感到焦慮。','她對考試結果感到焦慮。'],
 appreciate:['I would appreciate it if you ___ me with this.',['could help','can helped','helping'],'could help','客氣的請求：I would appreciate it if you could + 原形動詞。','如果你能幫我這個忙，我會很感激。']
};

let VQ = null;
function vqDateAdd(date, n){ const d=new Date(date+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
function vqDiff(a, b){ return Math.round((new Date(a+'T00:00:00Z') - new Date(b+'T00:00:00Z'))/86400000); }
// 目前路線：學生選過就用選的；沒選過但做過舊路線（core）的沿用 core，否則預設七年級
function vqTrack(){ const t=store.data.vqTrack; if(VQ_TRACKS[t]) return t; return Object.keys(store.data.vocabQuests||{}).some(k=>!k.includes(':'))?'core':'g7'; }
function vqSetTrack(t){ if(!VQ_TRACKS[t]) return; store.data.vqTrack=t; store.save(); renderVocabHub(); }
/* 字庫路線（有 book 的路線）：單字資料在 vocab/data/<book>.js，選到才載入；每 5 個字一個單元，文法題存在每個字的 q。 */
const VQ_DATA_V = 1;
const VQ_LOADING = {};
const vqBook = id => (typeof BUILTIN_BOOKS!=='undefined'?BUILTIN_BOOKS:[]).find(x=>x.id===id);
function vqReady(track){ const b=VQ_TRACKS[track]&&VQ_TRACKS[track].book; return !b || !!vqBook(b); }
function vqLoad(track){
 const b=VQ_TRACKS[track]&&VQ_TRACKS[track].book;
 if(!b || vqBook(b)) return Promise.resolve();
 if(!VQ_LOADING[b]) VQ_LOADING[b]=new Promise((ok,no)=>{ const el=document.createElement('script'); el.src='vocab/data/'+b+'.js?v='+VQ_DATA_V; el.onload=ok; el.onerror=()=>{ delete VQ_LOADING[b]; no(new Error('load')); }; document.head.appendChild(el); });
 return VQ_LOADING[b];
}
// 還沒載入就先顯示「載入中」，載完再呼叫 then；已載入回傳 true
function vqEnsure(track, then){
 if(vqReady(track)) return true;
 app.innerHTML='<div class="view dq vq"><p class="tc-loading">載入單字中… Loading words…</p></div>';
 vqLoad(track).then(then, ()=>{ app.innerHTML='<div class="view dq vq"><div class="card" style="padding:22px">單字載入失敗，請檢查網路後重新整理。<br><a href="#/vocab">回背單字總覽</a></div></div>'; });
 return false;
}
const VQ_UNIT_CACHE = {};
function vqUnits(track){
 const t=VQ_TRACKS[track];
 if(t && t.book){
  if(VQ_UNIT_CACHE[track]) return VQ_UNIT_CACHE[track];
  const b=vqBook(t.book); if(!b) return [];
  const u=[]; for(let i=0;i<b.words.length;i+=5) u.push({book:t.book, title:'', words:b.words.slice(i,i+5).map(x=>x.w)});
  return (VQ_UNIT_CACHE[track]=u);
 }
 return VQ_UNITS;
}
const vqQ = w => (w && w.q) || VQ_GRAMMAR[w.w];   // 字庫的題目優先，其次是手寫的 VQ_GRAMMAR
const vqKey = (date, track) => track==='core' ? date : track+':'+date;   // core 沿用舊的日期 key
function vqUnitIndex(date, track){ const n=vqUnits(track).length; return ((vqDiff(date, VQ_START) % n) + n) % n; }
function vqWord(book, w){ const b=vqBook(book); return b && b.words.find(x=>x.w===w); }
function vqDay(date, track=vqTrack()){ const i=vqUnitIndex(date,track), u=vqUnits(track)[i]; return {date, track, key:vqKey(date,track), n:i+1, ...u, items:u.words.map(w=>vqWord(u.book,w)).filter(Boolean)}; }
function vqRecords(){ return store.data.vocabQuests || {}; }
function vqStatus(date, track=vqTrack()){ const r=vqRecords()[vqKey(date,track)]; return r&&r.done?'done':r&&(r.learned||r.quiz)?'started':'new'; }

/* ---- 發音：有道真人發音，失敗改用瀏覽器語音；可排隊（先念單字再念例句） ---- */
let vqAudio=null, vqQueue=[];
function vqSay(list){
 vqQueue = Array.isArray(list)?list.slice():[list];
 if(vqAudio){ vqAudio.onended=null; vqAudio.pause(); }
 if(window.speechSynthesis) speechSynthesis.cancel();
 vqNext();
}
function vqNext(){
 const text=vqQueue.shift(); if(!text) return;
 const fallback=()=>{ if(!window.speechSynthesis){ vqNext(); return; } const u=new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=.95; if(typeof tts!=='undefined'&&tts.voice) u.voice=tts.voice; u.onend=vqNext; speechSynthesis.speak(u); };
 vqAudio=new Audio('https://dict.youdao.com/dictvoice?type=2&audio='+encodeURIComponent(text));
 vqAudio.onended=vqNext; vqAudio.onerror=fallback; vqAudio.play().catch(fallback);
}
const vqMark=(sentence,w)=>{ const root=w.length>4?w.replace(/(e|y|le)$/,''):w; return esc(sentence).replace(new RegExp('\\b('+root+'[a-z]*)','i'),'<mark>$1</mark>'); };

/* ---- 每日任務頁上的卡片 ---- */
function vqDailyCard(){
 const tr=vqTrack();
 if(!vqReady(tr)){
  vqLoad(tr).then(()=>{ const el=document.querySelector('.vq-card'); if(el) el.outerHTML=vqDailyCard(); }).catch(()=>{});
  return `<section class="vq-card card"><div class="vq-card-main"><div class="eyebrow">DAILY WORDS · 每日背單字 · ${esc(VQ_TRACKS[tr].title)}</div><h2>今日單字載入中…</h2></div><div class="vq-card-go"><a class="btn btn-primary" href="#/vocab/${dailyToday()}">開始背單字 →</a></div></section>`;
 }
 const t=dailyToday(), d=vqDay(t), st=vqStatus(t);
 return `<section class="vq-card card"><div class="vq-card-main"><div class="eyebrow">DAILY WORDS · 每日背單字 · ${esc(VQ_TRACKS[d.track].title)}</div><h2>Unit ${d.n}${d.title?'：'+esc(d.title):''}</h2><p>先背 5 個單字，再用這些字做文法挑戰。</p><div class="vq-chips">${d.items.map(w=>`<span>${esc(w.w)}</span>`).join('')}</div></div><div class="vq-card-go">${st==='done'?'<span class="vq-done">✓ 今天完成了</span>':''}<a class="btn btn-primary" href="#/vocab/${t}">${st==='done'?'再練一次':st==='started'?'繼續任務 →':'開始背單字 →'}</a><a class="vq-applink" href="#/vocab">背單字總覽</a></div></section>`;
}

/* ---- #/vocab 背單字總覽 ---- */
function renderVocabHub(){
 VQ=null;
 if(!vqEnsure(vqTrack(), renderVocabHub)) return;
 const t=dailyToday(), d=vqDay(t), recs=vqRecords();
 const days=[]; for(let i=-6;i<=1;i++){ const x=vqDateAdd(t,i); if(x>=VQ_START) days.push(vqDay(x)); }   // 開始日之前沒有任務
 const doneN=Object.values(recs).filter(r=>r&&r.done).length;
 app.innerHTML=`<div class="view dq vq">
  <div class="crumb"><a href="#/home">Home</a> › 背單字 Vocabulary</div>
  <section class="dq-hero"><div><div class="eyebrow">DAILY WORDS</div><h1 class="display">每天 5 個字，<br>背完馬上用出來。</h1><p>先認識單字（發音、中文、例句、搭配詞），再做含有這些字的文法題。完成後，這些字會自動排進「每日單字」的複習。</p><p class="dq-meta">已完成 ${doneN} 天 · ${esc(VQ_TRACKS[d.track].title)} · 今天是 Unit ${d.n}</p><a class="btn btn-primary" href="#/vocab/${t}">今日任務：Unit ${d.n}${d.title?' '+esc(d.title):''} →</a></div><div class="dq-mascot">${catSVG(150,'orange')}<span>一天五個字，喵！</span></div></section>
  <section class="vq-tracks"><b>選擇路線</b>${Object.entries(VQ_TRACKS).map(([k,x])=>`<button class="vq-track ${k===d.track?'on':''}" onclick="vqSetTrack('${k}')"><span>${esc(x.title)}</span><small>${esc(x.desc)}</small></button>`).join('')}</section>
  <section class="vq-days">${days.map(x=>{const st=vqStatus(x.date),isT=x.date===t,fut=x.date>t;return `<a class="vq-day card ${st} ${isT?'today':''}" href="#/vocab/${x.date}"><span class="vq-day-date">${isT?'今天':fut?'明天・預習':x.date.slice(5).replace('-','/')}</span><b>Unit ${x.n}</b><span class="vq-day-t">${esc(x.title)}</span><span class="vq-day-w">${x.items.map(w=>esc(w.w)).join(' · ')}</span><span class="vq-day-st">${st==='done'?'✓ 完成':st==='started'?'進行中':isT?'今日任務':fut?'可預習':'可補做'}</span></a>`;}).join('')}</section>
  <section class="vq-app card"><div><b>📱 每日單字 App</b><p>間隔複習、三種小測驗、生詞本、真人發音影片，還有國中會考、學測單字書。</p></div><a class="btn btn-navy" href="vocab/">開啟每日單字 →</a></section>
 </div>`;
}

/* ---- #/vocab/<date> 任務 ---- */
function startVocabQuest(date){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){ renderVocabHub(); return; }
 if(!vqEnsure(vqTrack(), ()=>startVocabQuest(date))) return;
 const d=vqDay(date), rec=vqRecords()[d.key]||{};
 const quiz=(rec.quiz&&!rec.done)?rec.quiz.slice():[];
 VQ={d, step:'learn', i:0, quiz, tries:0, owner:currentUser()?.email};
 if(rec.learned>=d.items.length && !rec.done){ VQ.step='quiz'; VQ.i=quiz.findIndex(x=>!x); if(VQ.i<0) VQ.i=quiz.length; }
 vqRender();
}
function vqSave(patch){
 store.data.vocabQuests=store.data.vocabQuests||{};
 store.data.vocabQuests[VQ.d.key]={...(store.data.vocabQuests[VQ.d.key]||{}), ...patch};
 store.save();
}
function vqRender(){
 if(!VQ) return;
 const {d}=VQ;
 const head=`<a href="#/vocab">← 背單字總覽</a><div class="dq-heading"><span>${d.date} · ${esc(VQ_TRACKS[d.track].title)} · Unit ${d.n}</span><span>${VQ.step==='learn'?`背單字 ${VQ.i+1} / ${d.items.length}`:`文法挑戰 ${Math.min(VQ.i+1,d.items.length)} / ${d.items.length}`}</span></div><h1 class="display">📚 Unit ${d.n}${d.title?'：'+esc(d.title):''}</h1><div class="vq-steps"><span class="${VQ.step==='learn'?'on':'ok'}">① 背單字</span><span class="${VQ.step==='quiz'?'on':''}">② 文法挑戰</span></div>`;
 if(VQ.step==='learn'){
  const w=d.items[VQ.i];
  app.innerHTML=`<div class="view dq dq-play vq">${head}<progress max="${d.items.length*2}" value="${VQ.i}"></progress>
   <section class="card vq-word">
    <div class="vq-w-top"><div><div class="vq-w">${esc(w.w)}</div><div class="vq-ph">${esc(w.ph||'')}</div></div><button class="vq-speak" onclick="vqSay('${esc(w.w)}')" aria-label="發音">🔊</button></div>
    <div class="vq-mean"><i>${esc(w.pos||'')}</i> ${esc(w.zh)}</div>
    ${w.ex?`<div class="vq-ex" onclick="vqSay(this.dataset.t)" data-t="${esc(w.ex)}" title="點一下聽例句" lang="en">${vqMark(w.ex,w.w)} <span>🔊</span></div><div class="vq-exzh">${esc(w.exZh||'')}</div>`:''}
    ${w.col&&w.col.length?`<div class="vq-cols"><div class="vq-colh">常見搭配 Collocations</div>${w.col.map(([en,zh])=>`<button class="vq-col" onclick="vqSay(this.dataset.t)" data-t="${esc(en.replace(/\bsb\b/g,'somebody').replace(/\bsth\b/g,'something').replace(/\bV-ing\b/g,'doing').replace(/\bV\b/g,'do').replace(/…/g,''))}"><b>${esc(en)}</b><span>${esc(zh)}</span></button>`).join('')}</div>`:''}
   </section>
   <div class="vq-nav">${VQ.i>0?`<button class="btn btn-ghost" onclick="vqGo(-1)">← 上一個</button>`:'<span></span>'}<button class="btn btn-primary" onclick="vqGo(1)">${VQ.i<d.items.length-1?'記住了，下一個 →':'背完了，開始文法挑戰 →'}</button></div>
  </div>`;
  vqSay(w.ex?[w.w,w.ex]:[w.w]);   // 先念單字，再念一遍例句
  return;
 }
 if(VQ.i>=d.items.length){ vqFinish(); return; }
 const w=d.items[VQ.i], q=vqQ(w);
 if(!q){ VQ.quiz[VQ.i]='first'; VQ.i++; vqRender(); return; }
 VQ.tries=0;
 const sent=vqMark(q[0],w.w).replace('___','<span class="vq-blank">＿＿＿</span>');
 app.innerHTML=`<div class="view dq dq-play vq">${head}<progress max="${d.items.length*2}" value="${d.items.length+VQ.i}"></progress>
  <section class="card dq-question"><div class="eyebrow">文法挑戰 · 句子裡有 <b>${esc(w.w)}</b>（${esc(w.zh)}），但空格考的是文法</div>
   <h2 lang="en" class="vq-q">${sent}</h2>
   <div class="dq-options">${shuffle(q[1]).map(a=>`<button class="dq-option" type="button" onclick="vqPick(this)" data-a="${esc(a)}">${esc(a)}</button>`).join('')}</div>
   <p id="vq-fb" class="dq-feedback" tabindex="-1" aria-live="polite"></p>
   <button class="btn btn-primary" id="vq-next" hidden onclick="vqGo(1)">${VQ.i<d.items.length-1?'下一題 →':'完成任務 →'}</button>
  </section></div>`;
}
function vqGo(step){
 if(!VQ) return;
 const n=VQ.d.items.length;
 if(VQ.step==='learn'){
  VQ.i+=step;
  if(VQ.i<0) VQ.i=0;
  const learned=Math.max((vqRecords()[VQ.d.key]||{}).learned||0, Math.min(VQ.i,n));
  if(VQ.i>=n){ vqSave({learned:n}); VQ.step='quiz'; VQ.i=VQ.quiz.findIndex(x=>!x); if(VQ.i<0) VQ.i=VQ.quiz.length>=n?n:VQ.quiz.length; }
  else vqSave({learned});
 } else VQ.i++;
 vqRender(); window.scrollTo(0,0);
}
function vqPick(btn){
 if(!VQ||currentUser()?.email!==VQ.owner) return;
 const w=VQ.d.items[VQ.i], q=vqQ(w), fb=document.getElementById('vq-fb');
 if(document.getElementById('vq-next').hidden===false) return;
 const ok=norm(btn.dataset.a)===norm(q[2]);
 if(!ok){
  VQ.tries++; btn.classList.add('vq-wrong'); btn.disabled=true;
  fb.className='dq-feedback dq-retry'; fb.textContent=VQ.tries>=2?'再試一次喵！只剩一個選項囉。':'再試一次喵！看看空格前後的字：是時態、介系詞、冠詞，還是動詞的形式？'; fb.focus(); return;
 }
 btn.classList.add('vq-right');
 document.querySelectorAll('.dq-options button').forEach(b=>b.disabled=true);
 const full=q[0].replace('___',q[2]);
 fb.className='dq-feedback dq-correct';
 fb.innerHTML=`✓ 答對了！${esc(q[3])}<span class="vq-full" lang="en">${vqMark(full,w.w)}</span><span class="vq-fullzh">${esc(q[4])}</span>`;
 VQ.quiz[VQ.i]=VQ.tries?'retry':'first';
 vqSave({quiz:VQ.quiz.slice()});
 vqSay(full);
 const nx=document.getElementById('vq-next'); nx.hidden=false; nx.focus();
}
/* 把背過的字排進「每日單字」App 的複習（同網域 localStorage，App 開啟時會同步到雲端） */
function vqToApp(d){
 try{
  const uid=currentUser()?.id, owner=JSON.parse(localStorage.getItem('vr:owner')||'null');
  if(uid && owner && owner!==uid){
   const ks=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(/^vr:(p|star|bs):|^vr:(stats|books)$/.test(k)) ks.push(k); }
   ks.forEach(k=>localStorage.removeItem(k));
  }
  if(uid) localStorage.setItem('vr:owner', JSON.stringify(uid));
  const now=new Date(), day=Math.floor((now.getTime()-now.getTimezoneOffset()*60000)/86400000);
  const key='vr:p:'+d.book, p=JSON.parse(localStorage.getItem(key)||'{}');
  const bsKey='vr:bs:'+d.book, bs=JSON.parse(localStorage.getItem(bsKey)||'{}');
  let added=0;
  d.items.forEach((w,i)=>{
   if(p[w.w]) return;
   const first=VQ.quiz[i]==='first';
   p[w.w]={s:first?2:1, due:day+(first?2:1), l:first?0:1, d0:day, u:Date.now()};
   added++;
  });
  if(added){ bs[day]=bs[day]||{n:0,r:0}; bs[day].n+=added; localStorage.setItem(bsKey, JSON.stringify(bs)); }
  localStorage.setItem(key, JSON.stringify(p));
  return added;
 }catch(e){ return 0; }
}
function vqFinish(){
 if(!VQ||currentUser()?.email!==VQ.owner) return;
 const d=VQ.d, rec=vqRecords()[d.key]||{}, first=!rec.done, n=d.items.length;
 const firstTry=VQ.quiz.filter(x=>x==='first').length;
 let gained=0; const parts=[];
 if(first){ gained+=15; parts.push('完成每日背單字 +15 XP'); if(firstTry===n){ gained+=5; parts.push('全部一次答對 +5 XP'); } }
 vqSave({done:true, completedAt:rec.completedAt||new Date().toISOString(), firstTry, words:d.items.map(w=>w.w), quiz:VQ.quiz.slice()});
 if(gained){ store.data.xp=(store.data.xp||0)+gained; store.save(); }
 store.touchStreak(); paintHeader();
 const added=vqToApp(d);
 const wrongWords=d.items.filter((w,i)=>VQ.quiz[i]==='retry');
 app.innerHTML=`<div class="view dq dq-result card vq">${catSVG(130,'orange')}<div class="eyebrow">DAILY WORDS COMPLETE</div><h1 class="display">5 個字到手！📚</h1>
  <p>文法挑戰一次答對 <b>${firstTry} / ${n}</b> 題。</p><strong>${parts.length?parts.join('　·　'):'複習完成 · 今天的獎勵已領取'}</strong>
  <div class="vq-sum">${d.items.map((w,i)=>`<button class="vq-sumw ${VQ.quiz[i]==='retry'?'miss':''}" onclick="vqSay('${esc(w.w)}')"><b>${esc(w.w)}</b><span>${esc(w.zh)}</span></button>`).join('')}</div>
  ${wrongWords.length?`<p class="vq-note">標紅色的字文法題答錯過，已安排明天優先複習。</p>`:''}
  ${added?`<p class="vq-note">✓ 已把 ${added} 個新字加進「每日單字」的複習排程。</p>`:''}
  <div class="dq-result-actions"><a class="btn btn-primary" href="vocab/?book=${d.book}">到每日單字複習 →</a><a class="btn btn-ghost" href="#/daily">回每日任務</a><button class="btn btn-ghost" onclick="startVocabQuest('${d.date}')">再練一次</button></div></div>`;
 VQ=null;
}
