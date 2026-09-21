# -*- coding: utf-8 -*-
import json

def curl(t):
    t = t.replace("'", "’")
    out=[]; opening=True
    for ch in t:
        if ch=='"':
            out.append("“" if opening else "”"); opening=not opening
        else: out.append(ch)
    return "".join(out)

SRC = "The Æsop for Children, illustrated by Milo Winter (1919, public domain) · Library of Congress · read.gov"
NOTE = "Public-domain text from The Æsop for Children (Milo Winter, 1919), courtesy of the Library of Congress (read.gov). Bilingual layout and Chinese translation added for classroom use."
TAG = "Aesop’s Fables · 伊索寓言"

F = []
def fab(id, emoji, title, zh, blurb, blurbZh, moralEn, moralZh, gloss, scenes):
    F.append({"id":id,"category":"fable","emoji":emoji,"title":title,"zh":zh,"tag":TAG,"source":SRC,
        "blurb":curl(blurb),"blurbZh":blurbZh,"moral":{"en":moralEn,"zh":moralZh},"gloss":gloss,
        "scenes":[{"en":curl(en),"zh":z2} for en,z2 in scenes],"note":NOTE})

fab("aesop-frogs-ox","🐸","The Frogs & the Ox","青蛙與牛",
 "An old Frog puffs herself up, trying to be as big as an Ox.",
 "一隻老青蛙不服氣，硬要把自己鼓成一頭牛那麼大……",
 "Do not attempt the impossible.","不要去嘗試不可能的事（別逞強）。",
 [["reedy","蘆葦叢生的"],["crushed","壓扁、踩扁"],["monster","怪物"],["puffing","鼓起（身體）"],["burst","爆裂、爆開"]],
 [("An Ox came down to a reedy pool to drink. As he splashed heavily into the water, he crushed a young Frog into the mud.",
   "一頭牛走到長滿蘆葦的水池邊喝水。牠笨重地踏進水裡，把一隻小青蛙踩進了泥巴裡。"),
  ("The old Frog soon missed the little one and asked his brothers and sisters what had become of him. \"A great big monster,\" said one of them, \"stepped on little brother with one of his huge feet!\"",
   "老青蛙很快發現小青蛙不見了，便問其他兄弟姊妹牠出了什麼事。「一個好大好大的怪物，」其中一隻說，「用牠的大腳把小弟弟踩扁了！」"),
  ("\"Big, was he!\" said the old Frog, puffing herself up. \"Was he as big as this?\" \"Oh, much bigger!\" they cried. The Frog puffed up still more. \"He could not have been bigger than this,\" she said. But the little Frogs all declared that the monster was much, much bigger and the old Frog kept puffing herself out more and more until, all at once, she burst.",
   "「很大嗎！」老青蛙一邊把自己鼓大，一邊說，「有這麼大嗎？」「喔，比那大多了！」牠們喊道。老青蛙又把自己鼓得更大。「牠不可能比這還大吧，」牠說。可是小青蛙們都說那怪物大得多、多得多，老青蛙就一直鼓、一直鼓，最後一下子，牠爆開了。")])

fab("aesop-belling-cat","🔔","Belling the Cat","為貓掛鈴鐺",
 "The mice have a clever plan to escape the Cat — but who will carry it out?",
 "老鼠們想出對付貓的好辦法，但誰去執行呢？",
 "It is one thing to say that something should be done, but quite a different matter to do it.",
 "說一件事該做是一回事，真正去做到卻是另一回事。",
 [["enemy","敵人"],["claws","爪子"],["dens","巢穴"],["bell","鈴鐺"],["rejoicing","歡欣鼓舞"]],
 [("The Mice once called a meeting to decide on a plan to free themselves of their enemy, the Cat. At least they wished to find some way of knowing when she was coming, so they might have time to run away. Indeed, something had to be done, for they lived in such constant fear of her claws that they hardly dared stir from their dens by night or day.",
   "有一次，老鼠們開會，想商量出一個辦法來擺脫牠們的敵人——貓。至少牠們希望能有辦法知道貓什麼時候來，好有時間逃走。實在得想個辦法才行，因為牠們終日活在貓爪的恐懼中，無論白天黑夜都幾乎不敢踏出洞穴。"),
  ("Many plans were discussed, but none of them was thought good enough. At last a very young Mouse got up and said: \"I have a plan that seems very simple, but I know it will be successful. All we have to do is to hang a bell about the Cat's neck. When we hear the bell ringing we will know immediately that our enemy is coming.\"",
   "大家討論了許多辦法，卻沒有一個夠好。最後，一隻很年輕的老鼠站起來說：「我有一個看起來很簡單、但我相信一定行得通的辦法。我們只要在貓的脖子上掛一個鈴鐺就好。一聽到鈴聲，我們就馬上知道敵人來了。」"),
  ("All the Mice were much surprised that they had not thought of such a plan before. But in the midst of the rejoicing over their good fortune, an old Mouse arose and said: \"I will say that the plan of the young Mouse is very good. But let me ask one question: Who will bell the Cat?\"",
   "所有老鼠都很驚訝，怎麼從前沒想到這麼好的辦法。正當大家為這好主意歡欣鼓舞時，一隻老老鼠站了起來說：「我承認這隻小老鼠的辦法很好。但讓我問一個問題：誰去把鈴鐺掛到貓的脖子上呢？」")])

fab("aesop-fox-grapes","🍇","The Fox & the Grapes","狐狸與葡萄",
 "A Fox can't reach the grapes, so he decides they must be sour.",
 "搆不到葡萄的狐狸，決定說那葡萄是酸的。",
 "There are many who pretend to despise and belittle that which is beyond their reach.",
 "有許多人會假裝看不起自己得不到的東西。",
 [["ripe","成熟的"],["vine","藤蔓"],["watered","流口水"],["in vain","徒勞地"],["scornfully","輕蔑地"],["despise","鄙視"]],
 [("A Fox one day spied a beautiful bunch of ripe grapes hanging from a vine trained along the branches of a tree. The grapes seemed ready to burst with juice, and the Fox's mouth watered as he gazed longingly at them. The bunch hung from a high branch, and the Fox had to jump for it. The first time he jumped he missed it by a long way. So he walked off a short distance and took a running leap at it, only to fall short once more. Again and again he tried, but in vain.",
   "有一天，狐狸看見一串又大又熟的葡萄，掛在攀著樹枝生長的藤上。葡萄飽滿得彷彿要爆出汁來，狐狸盯著看，口水都流了出來。那串葡萄掛在高高的枝頭，狐狸得跳起來才搆得到。第一次跳，牠差得遠了。於是牠退開一小段距離，助跑一躍，卻還是搆不著。牠試了一次又一次，全是白費力氣。"),
  ("Now he sat down and looked at the grapes in disgust. \"What a fool I am,\" he said. \"Here I am wearing myself out to get a bunch of sour grapes that are not worth gaping for.\" And off he walked very, very scornfully.",
   "這時牠坐了下來，厭惡地看著那串葡萄。「我真是個傻瓜，」牠說，「在這裡把自己累得半死，只為了一串酸葡萄，根本不值得我張著嘴巴盯著看。」說完，牠非常、非常不屑地走開了。")])

fab("aesop-lion-mouse","🦁","The Lion & the Mouse","獅子與老鼠",
 "A tiny Mouse the Lion spared returns to save his life.",
 "被饒過的小老鼠，後來救了大獅子一命。",
 "A kindness is never wasted.","善意永遠不會白費。",
 [["timid","膽小的"],["roused","被驚醒"],["spare","饒恕"],["repay","報答"],["prey","獵物"],["gnawed","啃咬"]],
 [("A Lion lay asleep in the forest, his great head resting on his paws. A timid little Mouse came upon him unexpectedly, and in her fright and haste to get away, ran across the Lion's nose. Roused from his nap, the Lion laid his huge paw angrily on the tiny creature to kill her.",
   "一頭獅子在森林裡睡著了，大大的頭枕在腳掌上。一隻膽小的小老鼠不小心闖了過來，驚慌之下急著逃走，竟從獅子的鼻子上跑了過去。獅子被吵醒，生氣地把巨掌壓在這小東西身上，要弄死牠。"),
  ("\"Spare me!\" begged the poor Mouse. \"Please let me go and some day I will surely repay you.\" The Lion was much amused to think that a Mouse could ever help him. But he was generous and finally let the Mouse go.",
   "「饒了我吧！」可憐的小老鼠哀求道，「請放我走，總有一天我一定會報答你。」獅子覺得很好笑——一隻小老鼠怎麼可能幫得上牠？不過牠很大方，最後還是放走了小老鼠。"),
  ("Some days later, while stalking his prey in the forest, the Lion was caught in the toils of a hunter's net. Unable to free himself, he filled the forest with his angry roaring. The Mouse knew the voice and quickly found the Lion struggling in the net. Running to one of the great ropes that bound him, she gnawed it until it parted, and soon the Lion was free. \"You laughed when I said I would repay you,\" said the Mouse. \"Now you see that even a Mouse can help a Lion.\"",
   "幾天後，獅子在森林裡追捕獵物時，落入了獵人的網子裡。牠掙脫不開，憤怒的吼聲響徹整座森林。小老鼠聽出了牠的聲音，很快找到在網中掙扎的獅子。牠跑到綁住獅子的一條粗繩旁，一直啃、一直咬，直到繩子斷開，獅子很快就自由了。「當初我說要報答你時，你還笑我，」小老鼠說，「現在你看，連一隻小老鼠也幫得上獅子。」")])

fab("aesop-crow-pitcher","🪶","The Crow & the Pitcher","烏鴉與水罐",
 "A thirsty Crow raises the water with pebbles, one by one.",
 "口渴的烏鴉，用小石子讓水位升高。",
 "In a pinch a good use of our wits may help us out.",
 "危急時，善用智慧就能幫我們脫困。",
 [["thirsty","口渴的"],["pitcher","水罐"],["narrow","狹窄的"],["pebbles","小石子"],["wits","智慧、腦筋"]],
 [("In a spell of dry weather, when the Birds could find very little to drink, a thirsty Crow found a pitcher with a little water in it. But the pitcher was high and had a narrow neck, and no matter how he tried, the Crow could not reach the water. The poor thing felt as if he must die of thirst.",
   "在一段乾旱的日子裡，鳥兒們幾乎找不到水喝。一隻口渴的烏鴉發現了一個水罐，裡面還有一點水。可是水罐又高、瓶口又窄，不管牠怎麼試，就是搆不到水。可憐的烏鴉覺得自己快要渴死了。"),
  ("Then an idea came to him. Picking up some small pebbles, he dropped them into the pitcher one by one. With each pebble the water rose a little higher until at last it was near enough so he could drink.",
   "這時牠想到一個辦法。牠啣起一些小石子，一顆一顆地投進水罐裡。每投一顆，水就升高一點，直到最後水面夠高，牠終於喝到了水。")])

fab("aesop-hare-tortoise","🐢","The Hare & the Tortoise","龜兔賽跑",
 "Slow and steady, the Tortoise beats the boastful Hare.",
 "慢吞吞的烏龜，竟然贏了驕傲的兔子。",
 "The race is not always to the swift.","跑得快不一定就會贏。",
 [["mocking","嘲笑的"],["race","賽跑"],["nap","小睡"],["steadily","穩定地"],["overtake","超越、追上"],["swift","迅速的"]],
 [("A Hare was making fun of the Tortoise one day for being so slow. \"Do you ever get anywhere?\" he asked with a mocking laugh. \"Yes,\" replied the Tortoise, \"and I get there sooner than you think. I'll run you a race and prove it.\"",
   "有一天，兔子取笑烏龜爬得太慢。「你到底到得了任何地方嗎？」牠嘲笑著問。「到得了，」烏龜回答，「而且比你想的還快。我跟你賽跑，證明給你看。」"),
  ("The Hare was much amused at the idea of running a race with the Tortoise, but for the fun of the thing he agreed. So the Fox, who had consented to act as judge, marked the distance and started the runners off. The Hare was soon far out of sight, and to make the Tortoise feel very deeply how ridiculous it was for him to try a race with a Hare, he lay down beside the course to take a nap until the Tortoise should catch up.",
   "兔子覺得跟烏龜賽跑這主意實在好笑，但為了好玩，牠還是答應了。於是由願意當裁判的狐狸量好距離，讓兩位選手起跑。兔子很快就跑得不見蹤影。為了讓烏龜深深體會到跟兔子比賽有多可笑，牠索性躺在跑道旁小睡一下，等烏龜追上來。"),
  ("The Tortoise meanwhile kept going slowly but steadily, and, after a time, passed the place where the Hare was sleeping. But the Hare slept on very peacefully; and when at last he did wake up, the Tortoise was near the goal. The Hare now ran his swiftest, but he could not overtake the Tortoise in time.",
   "這段時間，烏龜依然緩慢卻穩定地前進，過了一會兒，經過了兔子睡覺的地方。兔子卻睡得又香又甜；等牠終於醒來，烏龜已經快到終點了。兔子這才拼命地跑，用上最快的速度，卻已經來不及追上烏龜了。")])

fab("aesop-fox-crow","🧀","The Fox & the Crow","狐狸與烏鴉",
 "Flattery makes the Crow open her beak — and drop the cheese.",
 "愛聽好話的烏鴉，一開口就把起司弄丟了。",
 "The flatterer lives at the expense of those who will listen to him.",
 "諂媚者靠著愛聽好話的人過活。",
 [["beak","鳥喙"],["sly","狡猾的"],["admiringly","讚賞地"],["flattering","奉承的"],["suspicion","懷疑"],["flatterer","諂媚者"]],
 [("One bright morning as the Fox was following his sharp nose through the wood in search of a bite to eat, he saw a Crow on the limb of a tree overhead. This was by no means the first Crow the Fox had ever seen. What caught his attention this time and made him stop for a second look, was that the lucky Crow held a bit of cheese in her beak. \"No need to search any farther,\" thought sly Master Fox. \"Here is a dainty bite for my breakfast.\"",
   "一個晴朗的早晨，狐狸循著靈敏的鼻子在林子裡找東西吃，看見頭頂樹枝上停著一隻烏鴉。這絕不是狐狸第一次看到烏鴉。這回吸引牠、讓牠停下多看一眼的，是這隻幸運的烏鴉嘴裡叼著一小塊起司。「不用再找了，」狡猾的狐狸先生心想，「這正是我早餐的美味一口。」"),
  ("Up he trotted to the foot of the tree in which the Crow was sitting, and looking up admiringly, he cried, \"Good-morning, beautiful creature!\" The Crow, her head cocked on one side, watched the Fox suspiciously. But she kept her beak tightly closed on the cheese and did not return his greeting. \"What a charming creature she is!\" said the Fox. \"How her feathers shine! What a beautiful form and what splendid wings! Such a wonderful Bird should have a very lovely voice, since everything else about her is so perfect. Could she sing just one song, I know I should hail her Queen of Birds.\"",
   "牠一路小跑到烏鴉停著的那棵樹下，抬頭讚賞地喊道：「早安啊，美麗的鳥兒！」烏鴉把頭歪向一邊，滿腹狐疑地盯著狐狸，卻仍緊緊閉著嘴叼住起司，沒有回應牠的問候。「牠真是隻迷人的鳥兒！」狐狸說，「瞧牠的羽毛多亮！多美的身形、多華麗的翅膀！這麼出色的鳥，聲音一定也很動聽，因為牠其他地方都這麼完美。只要牠能唱一首歌，我一定要尊牠為鳥中之后。」"),
  ("Listening to these flattering words, the Crow forgot all her suspicion, and also her breakfast. She wanted very much to be called Queen of Birds. So she opened her beak wide to utter her loudest caw, and down fell the cheese straight into the Fox's open mouth. \"Thank you,\" said Master Fox sweetly, as he walked off. \"Though it is cracked, you have a voice sure enough. But where are your wits?\"",
   "聽著這些奉承話，烏鴉忘了所有的疑心，也忘了自己的早餐。牠好想被稱作「鳥中之后」。於是牠張大嘴，發出最響亮的一聲呱——起司便直直落進了狐狸張開的嘴裡。「謝啦，」狐狸先生甜甜地說，一邊走開，「你的嗓音雖然沙啞，倒也算是有聲音。可是你的腦子呢？」")])

fab("aesop-bundle-sticks","🪵","The Bundle of Sticks","一捆木棍",
 "One stick snaps easily; a bundle holds firm.",
 "一根根折得斷，綁成一捆卻折不斷。",
 "In unity is strength.","團結就是力量。",
 [["quarreling","爭吵"],["discord","不和"],["bundle","一捆"],["untied","解開"],["unity","團結"]],
 [("A certain Father had a family of Sons, who were forever quarreling among themselves. No words he could say did the least good, so he cast about in his mind for some very striking example that should make them see that discord would lead them to misfortune. One day when the quarreling had been much more violent than usual and each of the Sons was moping in a surly manner, he asked one of them to bring him a bundle of sticks. Then handing the bundle to each of his Sons in turn he told them to try to break it. But although each one tried his best, none was able to do so.",
   "有位父親有好幾個兒子，兄弟間總是吵個不停。他怎麼勸都沒有用，於是他在心裡盤算，想找一個很鮮明的例子，好讓兒子們明白：不和睦只會招來災禍。有一天，兄弟們吵得比平常更兇，個個繃著臉生悶氣。父親要其中一個去拿來一捆木棍，然後把整捆木棍依次交給每個兒子，要他們試著折斷它。可是儘管每個人都使出全力，誰也折不斷。"),
  ("The Father then untied the bundle and gave the sticks to his Sons to break one by one. This they did very easily. \"My Sons,\" said the Father, \"do you not see how certain it is that if you agree with each other and help each other, it will be impossible for your enemies to injure you? But if you are divided among yourselves, you will be no stronger than a single stick in that bundle.\"",
   "接著父親解開那捆木棍，把木棍一根一根地分給兒子們去折。這下他們輕輕鬆鬆就折斷了。「我的兒子們，」父親說，「你們難道看不出來嗎？只要你們彼此和睦、互相幫助，敵人就絕不可能傷害你們；可是如果你們自己分裂，你們就跟那捆裡的一根木棍一樣不堪一折。」")])

fab("aesop-shepherd-wolf","🐑","The Shepherd Boy & the Wolf","放羊的孩子（狼來了）",
 "A boy cries \"Wolf!\" for fun — until the day it is true.",
 "老喊「狼來了」的孩子，真的遇到狼時……",
 "Liars are not believed even when they speak the truth.",
 "說謊的人，就算說了真話也沒人相信。",
 [["shepherd","牧羊人"],["pasture","牧場"],["flock","羊群"],["trick","惡作劇、把戲"],["terror","驚恐"],["liars","說謊的人"]],
 [("A Shepherd Boy tended his master's Sheep near a dark forest not far from the village. Soon he found life in the pasture very dull. All he could do to amuse himself was to talk to his dog or play on his shepherd's pipe. One day as he sat watching the Sheep and the quiet forest, and thinking what he would do should he see a Wolf, he thought of a plan to amuse himself.",
   "一個牧童在離村子不遠、靠近一片幽暗森林的地方替主人放羊。沒多久，他就覺得牧場的日子很無聊。他能用來解悶的，只有跟狗說說話，或吹吹牧笛。有一天，他坐著看羊群和寂靜的森林，想著萬一看到狼該怎麼辦，忽然想到一個自娛的點子。"),
  ("His Master had told him to call for help should a Wolf attack the flock, and the Villagers would drive it away. So now, though he had not seen anything that even looked like a Wolf, he ran toward the village shouting at the top of his voice, \"Wolf! Wolf!\" As he expected, the Villagers who heard the cry dropped their work and ran in great excitement to the pasture. But when they got there they found the Boy doubled up with laughter at the trick he had played on them.",
   "主人曾交代他，萬一有狼來攻擊羊群，就大聲呼救，村民們會來把狼趕走。於是，儘管他連個像狼的影子都沒看到，他還是朝著村子拚命大喊：「狼來了！狼來了！」正如他所料，聽到喊聲的村民放下手邊的工作，緊張地衝到牧場來。可是趕到時，卻看見那孩子正笑得直不起腰，得意自己捉弄了他們。"),
  ("A few days later the Shepherd Boy again shouted, \"Wolf! Wolf!\" Again the Villagers ran to help him, only to be laughed at again. Then one evening as the sun was setting behind the forest and the shadows were creeping out over the pasture, a Wolf really did spring from the underbrush and fall upon the Sheep. In terror the Boy ran toward the village shouting \"Wolf! Wolf!\" But though the Villagers heard the cry, they did not run to help him as they had before. \"He cannot fool us again,\" they said. The Wolf killed a great many of the Boy's sheep and then slipped away into the forest.",
   "過了幾天，牧童又大喊：「狼來了！狼來了！」村民又跑來救他，結果又被他嘲笑一頓。後來有一天傍晚，太陽正落到森林後面，影子悄悄爬滿牧場，一隻狼真的從灌木叢中竄了出來，撲向羊群。孩子驚恐萬分，朝村子邊跑邊喊：「狼來了！狼來了！」可是村民雖然聽見了喊聲，卻不再像從前那樣跑來幫他。「他別想再騙我們了，」他們說。那隻狼咬死了孩子好多隻羊，然後溜進森林裡不見了。")])

fab("aesop-goose-golden-egg","🪿","The Goose & the Golden Egg","生金蛋的鵝",
 "A farmer kills the Goose to get all the golden eggs at once.",
 "想一次拿到所有金蛋的農夫，最後什麼都沒了。",
 "Those who have plenty want more and so lose all they have.",
 "貪得無厭的人想要更多，結果連原有的都失去。",
 [["possessed","擁有"],["glittering","閃亮的"],["impatient","不耐煩的"],["precious","珍貴的"]],
 [("There was once a Countryman who possessed the most wonderful Goose you can imagine, for every day when he visited the nest, the Goose had laid a beautiful, glittering, golden egg. The Countryman took the eggs to market and soon began to get rich. But it was not long before he grew impatient with the Goose because she gave him only a single golden egg a day. He was not getting rich fast enough.",
   "從前有個鄉下人，養了一隻你能想像到最神奇的鵝——因為每天他到窩邊去看時，那隻鵝都生下一顆又美又亮的金蛋。鄉下人把金蛋拿到市場去賣，很快就開始富了起來。可是沒過多久，他就對這隻鵝不耐煩了，因為牠一天只生一顆金蛋。他覺得自己發財發得不夠快。"),
  ("Then one day, after he had finished counting his money, the idea came to him that he could get all the golden eggs at once by killing the Goose and cutting it open. But when the deed was done, not a single golden egg did he find, and his precious Goose was dead.",
   "於是有一天，他數完錢後，忽然起了一個念頭：只要把鵝殺了、剖開來，就能一次拿到所有的金蛋。可是等他真的動了手，卻連一顆金蛋也沒找到，而他那隻珍貴的鵝，也死了。")])

fab("aesop-milkmaid-pail","🥛","The Milkmaid & Her Pail","擠奶女孩與奶桶",
 "A milkmaid dreams so big that she spills the milk.",
 "頭頂奶桶做著白日夢的女孩，一甩頭全灑光了。",
 "Do not count your chickens before they are hatched.",
 "蛋還沒孵出來，別先數小雞（別高興得太早）。",
 [["pail","桶子"],["churn","攪製奶油"],["hatching","孵化"],["scornfully","不屑地"],["vanished","消失"]],
 [("A Milkmaid had been out to milk the cows and was returning from the field with the shining milk pail balanced nicely on her head. As she walked along, her pretty head was busy with plans for the days to come. \"This good, rich milk,\" she mused, \"will give me plenty of cream to churn. The butter I make I will take to market, and with the money I get for it I will buy a lot of eggs for hatching. How nice it will be when they are all hatched and the yard is full of fine young chicks. Then when May day comes I will sell them, and with the money I'll buy a lovely new dress to wear to the fair. All the young men will look at me. They will come and try to make love to me,—but I shall very quickly send them about their business!\"",
   "一個擠奶女孩擠完牛奶，正從田裡走回家，頭上穩穩頂著閃亮的奶桶。一路走著，她漂亮的腦袋裡忙著盤算往後的日子。「這麼香濃的牛奶，」她想，「能讓我攪出好多奶油。做好的奶油拿到市場去賣，用賣得的錢我要買一大堆蛋來孵。等蛋都孵出來、院子裡滿是活潑的小雞，那該多好。到了五月節，我就把牠們賣掉，用那些錢買一件漂亮的新洋裝去趕集。所有的年輕人都會盯著我看，他們會過來向我獻殷勤——我可要立刻把他們統統打發走！」"),
  ("As she thought of how she would settle that matter, she tossed her head scornfully, and down fell the pail of milk to the ground. And all the milk flowed out, and with it vanished butter and eggs and chicks and new dress and all the milkmaid's pride.",
   "正當她想著要怎麼打發那些人時，她不屑地把頭一甩——奶桶就從頭上摔到了地上。牛奶全流光了，隨之消失的，還有奶油、蛋、小雞、新洋裝，以及擠奶女孩所有的驕傲。")])

fab("aesop-wind-sun","🌤️","The North Wind & the Sun","北風與太陽",
 "The Wind and the Sun compete to remove a traveler's cloak.",
 "北風與太陽比賽，看誰能讓旅人脫下斗篷。",
 "Gentleness and kind persuasion win where force and bluster fail.",
 "溫柔與善意的勸說，能勝過蠻力與虛張聲勢。",
 [["quarrel","爭執"],["bluster","狂吹；虛張聲勢"],["cloak","斗篷"],["blast","強風"],["gust","陣風"],["persuasion","說服"]],
 [("The North Wind and the Sun had a quarrel about which of them was the stronger. While they were disputing with much heat and bluster, a Traveler passed along the road wrapped in a cloak. \"Let us agree,\" said the Sun, \"that he is the stronger who can strip that Traveler of his cloak.\" \"Very well,\" growled the North Wind, and at once sent a cold, howling blast against the Traveler.",
   "北風和太陽起了爭執，爭論牠們兩個誰比較強。正當牠們吵得面紅耳赤、氣勢洶洶時，一個裹著斗篷的旅人沿著路走了過來。「我們就這樣說定吧，」太陽說，「誰能讓那個旅人脫下斗篷，誰就比較強。」「好啊，」北風怒吼一聲，立刻朝旅人颳出一陣又冷又嚎的狂風。"),
  ("With the first gust of wind the ends of the cloak whipped about the Traveler's body. But he immediately wrapped it closely around him, and the harder the Wind blew, the tighter he held it to him. The North Wind tore angrily at the cloak, but all his efforts were in vain.",
   "第一陣狂風吹來，斗篷的下擺在旅人身上啪啪翻飛。可是他立刻把斗篷緊緊裹住身體，風颳得愈猛，他就把斗篷抓得愈緊。北風氣呼呼地猛扯那件斗篷，卻是白費力氣。"),
  ("Then the Sun began to shine. At first his beams were gentle, and in the pleasant warmth after the bitter cold of the North Wind, the Traveler unfastened his cloak and let it hang loosely from his shoulders. The Sun's rays grew warmer and warmer. The man took off his cap and mopped his brow. At last he became so heated that he pulled off his cloak, and, to escape the blazing sunshine, threw himself down in the welcome shade of a tree by the roadside.",
   "接著，太陽開始發光。起初陽光很柔和，在北風的刺骨寒冷之後，這股舒服的暖意讓旅人解開了斗篷，任它鬆鬆地披在肩上。太陽的光愈來愈暖。旅人脫下帽子，擦了擦額頭的汗。最後他熱得受不了，索性把斗篷脫了下來，為了躲開炙熱的陽光，一頭倒進路旁樹下那片教人歡喜的樹蔭裡。")])

# ---- practice quiz (原創閱讀理解題) + discussion (課後討論) ----
# quiz item: (question_en, question_zh, [options...], answer_index, why_zh)
QUIZ = {
 "aesop-frogs-ox":[
   ("Why did the old Frog burst?","老青蛙為什麼爆開了？",["She puffed herself up too big","She ate too much","She fell into the pond"],0,"她硬要把自己脹得像牛一樣大，最後撐破了。"),
   ("What does this fable teach us?","這則寓言教我們什麼？",["Don't try to be something you are not","Frogs cannot swim","Oxen are gentle"],0,"別逞強，不要嘗試不可能的事。"),
   ("The word \"burst\" means…","burst 是什麼意思？",["to break open suddenly","to jump high","to fall asleep"],0,"burst = 爆裂、突然破開。"),
 ],
 "aesop-belling-cat":[
   ("What was the young Mouse's plan?","小老鼠的計畫是什麼？",["Hang a bell on the cat","Move to a new house","Fight the cat"],0,"在貓脖子上掛鈴鐺，聽到鈴聲就知道貓來了。"),
   ("Why did the plan fail?","計畫為什麼行不通？",["No mouse dared to bell the cat","The bell was too small","The cat ran away"],0,"沒有一隻老鼠敢去把鈴鐺掛上貓的脖子。"),
   ("The moral is that…","寓意是……",["saying is easy, doing is hard","cats love bells","meetings are useless"],0,"說起來容易，做起來難。"),
 ],
 "aesop-fox-grapes":[
   ("Why couldn't the Fox get the grapes?","狐狸為什麼拿不到葡萄？",["They hung too high","They were rotten","A dog chased him"],0,"葡萄掛得太高，狐狸跳了好幾次都搆不到。"),
   ("What did the Fox say as he left?","狐狸離開時說什麼？",["The grapes are sour anyway","I will come back tomorrow","I am not hungry"],0,"他說那葡萄反正是酸的——其實是搆不到才這樣講。"),
   ("\"in vain\" means…","in vain 是什麼意思？",["without success","very fast","with a friend"],0,"in vain = 徒勞、白費力氣。"),
 ],
 "aesop-lion-mouse":[
   ("How did the Mouse save the Lion?","老鼠怎麼救了獅子？",["She gnawed the net open","She roared for help","She brought food"],0,"她咬斷了綁住獅子的繩子。"),
   ("What is the lesson?","寓意是什麼？",["A kindness is never wasted","Lions are strong","Mice are fast"],0,"善意永遠不會白費——連小老鼠也能報恩。"),
   ("\"spare me\" means…","spare me 是什麼意思？",["please don't kill me","give me food","follow me"],0,"spare = 饒恕；spare me = 饒了我吧。"),
 ],
 "aesop-crow-pitcher":[
   ("How did the Crow reach the water?","烏鴉怎麼喝到水的？",["Dropped pebbles to raise the water","Tipped the pitcher over","Called other birds"],0,"一顆顆丟小石子進去，讓水位升高。"),
   ("What does the fable praise?","這則寓言稱讚什麼？",["Using our wits","Being big","Being loud"],0,"善用智慧、動腦筋想辦法。"),
   ("\"thirsty\" means…","thirsty 是什麼意思？",["needing to drink","very tired","afraid"],0,"thirsty = 口渴的。"),
 ],
 "aesop-hare-tortoise":[
   ("Why did the Hare lose the race?","兔子為什麼輸了？",["He stopped to take a nap","He ran the wrong way","He got hurt"],0,"他太得意，中途躺下睡覺，醒來已來不及。"),
   ("What is the moral?","寓意是什麼？",["Slow and steady wins the race","Always run fast","Never race a friend"],0,"跑得快不一定贏；穩定持續才會成功。"),
   ("\"steadily\" means…","steadily 是什麼意思？",["in a slow, constant way","suddenly","angrily"],0,"steadily = 穩定地、持續不斷地。"),
 ],
 "aesop-fox-crow":[
   ("How did the Fox get the cheese?","狐狸怎麼拿到起司的？",["He flattered the Crow until she sang","He climbed the tree","He asked politely"],0,"他一直說好聽的話，烏鴉一開口唱歌，起司就掉了。"),
   ("What is the lesson?","寓意是什麼？",["Don't trust flatterers","Crows can't sing","Cheese is tasty"],0,"別輕信諂媚、愛聽好話的人會被利用。"),
   ("A \"flatterer\" is someone who…","flatterer 是指……",["gives false praise to use you","tells the truth","sings well"],0,"flatterer = 諂媚者，用假讚美來占你便宜。"),
 ],
 "aesop-bundle-sticks":[
   ("What could the sons NOT do?","兒子們做不到什麼？",["Break the whole bundle","Break one stick","Tie the sticks"],0,"綁成一捆的木棍怎麼折都折不斷。"),
   ("What is the moral?","寓意是什麼？",["In unity there is strength","Sticks are weak","Fathers are strict"],0,"團結就是力量；一根根就容易被折斷。"),
   ("\"quarreling\" means…","quarreling 是什麼意思？",["arguing","playing","sleeping"],0,"quarrel = 爭吵。"),
 ],
 "aesop-shepherd-wolf":[
   ("Why didn't the villagers come the last time?","最後一次村民為什麼不來了？",["He had lied before","They were asleep","It was raining"],0,"他之前一直騙人喊假的『狼來了』，這次沒人相信。"),
   ("What is the lesson?","寓意是什麼？",["Liars aren't believed, even when true","Wolves are scary","Sheep are slow"],0,"說謊的人，就算說真話也沒人相信。"),
   ("A \"flock\" is a group of…","flock 是指一群……",["sheep","wolves","villagers"],0,"flock = 羊群。"),
 ],
 "aesop-goose-golden-egg":[
   ("Why did the man kill the Goose?","農夫為什麼把鵝殺了？",["To get all the eggs at once","It was sick","To eat it"],0,"他貪心，想一次拿到所有金蛋。"),
   ("What did he find inside?","他在裡面找到什麼？",["No golden eggs at all","Many eggs","A little goose"],0,"一顆金蛋也沒有——貪心讓他什麼都失去了。"),
   ("What is the moral?","寓意是什麼？",["Greed loses everything","Geese are magic","Save your money"],0,"貪得無厭，最後連原有的也失去。"),
 ],
 "aesop-milkmaid-pail":[
   ("Why did the milk spill?","牛奶為什麼灑了？",["She tossed her head while daydreaming","A cow bumped her","She tripped on a stone"],0,"她想著白日夢、得意地一甩頭，桶子就掉了。"),
   ("What is the moral?","寓意是什麼？",["Don't count your chickens before they hatch","Milk is precious","Walk slowly"],0,"蛋還沒孵就別數小雞——別高興得太早。"),
   ("To \"churn\" milk is to make…","churn 牛奶是為了做出……",["butter","cheese","bread"],0,"churn = 攪製（奶油）。"),
 ],
 "aesop-wind-sun":[
   ("Who got the traveler's cloak off?","誰讓旅人脫下斗篷？",["The Sun, with gentle warmth","The Wind, by blowing hard","Nobody"],0,"太陽用溫暖的陽光，讓旅人自己脫下斗篷。"),
   ("What is the moral?","寓意是什麼？",["Gentleness beats force","Wind is strongest","Always wear a cloak"],0,"溫柔與善意勝過蠻力與虛張聲勢。"),
   ("\"persuasion\" means…","persuasion 是什麼意思？",["gently convincing someone","shouting loudly","running away"],0,"persuasion = 說服、勸說。"),
 ],
}
DISCUSS = {
 "aesop-frogs-ox":[("Have you ever tried to do something too big for you? What happened?","你有沒有勉強做過超出自己能力的事？結果怎樣？"),("Why is it okay to just be yourself?","為什麼做自己就好、不必跟別人比？")],
 "aesop-belling-cat":[("Have you had a good idea that was hard to carry out? ","你有沒有想過很棒、卻很難執行的點子？"),("Why is doing harder than talking?","為什麼『做到』比『說說』難得多？")],
 "aesop-fox-grapes":[("When you can't get something, do you ever say you didn't want it?","得不到某樣東西時，你會不會說『反正我也不想要』？"),("What is a better way to handle disappointment?","遇到失望時，有沒有更好的處理方式？")],
 "aesop-lion-mouse":[("Has someone small or young ever helped you?","有沒有比你小或比你弱的人幫過你？"),("Why should we be kind even to those who seem weak?","為什麼對看起來弱小的人也要友善？")],
 "aesop-crow-pitcher":[("Tell about a time you solved a problem with a clever idea.","說說你用聰明辦法解決問題的一次經驗。"),("Why is thinking sometimes better than giving up?","為什麼動動腦，常比放棄更好？")],
 "aesop-hare-tortoise":[("Are you more like the Hare or the Tortoise? Why?","你比較像兔子還是烏龜？為什麼？"),("How does steady effort help you learn English?","持續穩定的努力，怎麼幫助你學英文？")],
 "aesop-fox-crow":[("How do you feel when someone praises you a lot?","有人一直稱讚你時，你有什麼感覺？"),("How can we tell real praise from flattery?","我們怎麼分辨真心稱讚和諂媚？")],
 "aesop-bundle-sticks":[("When has working together made something easier?","什麼時候『合作』讓事情變簡單了？"),("Why do families and teams grow stronger united?","為什麼家人或團隊團結起來會更強？")],
 "aesop-shepherd-wolf":[("What happens to trust when someone lies often?","一個人常說謊，別人的信任會怎樣？"),("Why is it hard to win trust back?","為什麼信任一旦失去，很難再贏回來？")],
 "aesop-goose-golden-egg":[("Have you ever wanted something so fast that you lost it?","你有沒有太想快點得到某樣東西，反而失去它？"),("Why is patience better than greed?","為什麼耐心比貪心好？")],
 "aesop-milkmaid-pail":[("Do you ever make big plans before something is sure?","事情還沒成真，你會不會就先想好一大堆計畫？"),("Why is it wise not to celebrate too early?","為什麼『別高興得太早』是聰明的？")],
 "aesop-wind-sun":[("When has kindness worked better than force for you?","什麼時候『溫柔』比『強硬』更有用？"),("How can gentle words change someone's mind?","溫和的話語，怎麼讓別人改變想法？")],
}
for _f in F:
    if _f["id"] in QUIZ:
        _f["quiz"] = [{"q":curl(q),"zh":z,"opts":[curl(o) for o in opts],"a":a,"why":why} for (q,z,opts,a,why) in QUIZ[_f["id"]]]
    if _f["id"] in DISCUSS:
        _f["discuss"] = [{"en":curl(e),"zh":z} for (e,z) in DISCUSS[_f["id"]]]

with open("/tmp/claude-501/-Users-zhuangyuzhen-github/1f0ad930-6ac6-40bc-80a5-9120fd37a3f7/scratchpad/fables_block.js","w",encoding="utf-8") as f:
    f.write("const FABLES = ")
    f.write(json.dumps(F, ensure_ascii=False, indent=1))
    f.write(";\nSTORIES.push.apply(STORIES, FABLES);\n")
print("fables:", len(F), "scenes:", sum(len(x["scenes"]) for x in F))
