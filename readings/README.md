# 閱讀文章來源檔（2026-10-27 起）

每日閱讀、每週重點閱讀的**完整內容都在這個資料夾**，依月份分檔：`readings/<YYYY-MM>.json`（以文章的 `day`，沒有的話用 `date` 判斷月份）。

`index.html` 只保留不含內文的目錄（`READINGS`，每篇約 150 字元），學生打開文章時才下載該月份的檔案，所以網站不會隨著每天新增文章越變越大。

## 新增或修改一篇文章

1. 打開對應月份的 `readings/<YYYY-MM>.json`（沒有就新建一個，內容是 `[ … ]` 陣列），加入一篇。欄位跟以前完全一樣：
   `id / cat / topic / zh / src / date / day / week / tag / icon / levels.{a,b,c}{title,cefr,text[],gloss[],q[]} / discuss[] / proper[]`
   - 每日閱讀：給 `day`（例 `"2026-11-03"`）。
   - 每週重點：給最新的 `week` 標籤（例 `"11/2–11/8"`），就會自動成為「本週重點」。
2. 執行 `python3 tools/build_readings.py`：先把每篇的正確答案位置**平均分散到 A–D**（自動調整選項順序，重跑結果不變；`--check` 會擋下沒分散的），再檢查資料（三個程度、題目答案索引、id 不重複、月份放對檔），並更新 `index.html` 的目錄。
3. 執行 `python3 tools/sync_assets.py`，把 `sw.js` 的 `CACHE` 名稱加一版。
4. 只提交自己改的檔案（`readings/…json`、`index.html`、`offline-content.js`、`sw.js`），不要用 `git add -A`。
5. 要真人語音：`./update.sh`（Kokoro 產生 MP3，只會提交音檔與 RD_AUDIO 清單）。

`tests/content-loading.test.cjs` 會檢查 `index.html` 的目錄和這裡的檔案是否一致；忘了第 2 步測試就會失敗。

## 出題提醒

- 正確答案不用自己排 A/B/C/D，建置時會自動平均分散。
- 每題至少放一個「陷阱選項」：文章裡真的有、但不是主旨的細節；照抄原文字詞但意思錯的；太絕對（always / only / all）的；因果顛倒的。避免一看就知道錯的搞笑選項。
- 每個選項都要從文章取材，讓學生得回去讀才能排除：數字換成文中另一個數字（年齡、比分、年份）、張冠李戴（文中另一個人／地點）、半對半錯、真的但不是本題問的、太誇大（cures all / always）。不要放文章完全沒提的選項。
- **選項長度要差不多**：正確答案不能總是最長的那個（學生會「挑最長的」猜對）。建置時會檢查：正確答案比所有誘答都長超過 3 個字就會報錯，把一個誘答寫長一點（同樣從文章取材）即可。
- 每個程度 6 題：主旨、細節、細節、字義、推論（C 為字義／推論／語氣／篇章）＋最後 1 題 **素養題**（`t` 用 `素養 Application` 或 `素養 Evaluation`）：把文章用在生活情境（「你家想養狗，哪個選擇最符合文意？」），或判斷一則標題、說法、證據是否站得住（「有標題說……根據文章這準確嗎？」）。

## 學習單的翻譯題（2026-11 起）

- **A1–A2 引導式翻譯**：`levels.a.gt = [{"en": 原文句子, "zh": 中文翻譯, "b": [要挖空的字…]}]`，4 句，挑含本篇單字的短句；`b` 放 1–2 個關鍵字（單字表的字優先），學習單會顯示首字母＋字母數。沒有 `gt` 的文章，A1–A2 學習單會改回「討論與寫作」。
- **B1–B2 整句翻譯**：`levels.b.tr = [{"en": 原文句子, "zh": 中文翻譯}]`，3 句（9–24 字、分散在不同段落）；提示字會自動從單字表抓。
- **B1–B2 文意選填**：不需要資料，自動用同篇 A1–A2 文章挖掉 A1–A2 單字表的字，字庫再補 B／C 單字當誘答。
- `en` 必須和文章裡的句子一字不差。

## 全文翻譯（2026-11 起）

- `levels.<a|b|c>.tz = ["第一段中文", "第二段中文", …]`：跟 `text` **一段對一段**（段數要一樣，建置會檢查）。聽力更正遊戲全部改完後會顯示中英對照全文。沒有 `tz` 的文章會顯示「翻譯準備中」。

## 片語・慣用語（2026-11 起）

- `levels.<a|b|c>.ph = [{"p": 片語原形, "k": 類型, "zh": 中文意思, "m": 本文寫法(選填), "ex": 新例句, "exzh": 例句翻譯}]`
- 數量：A1–A2 3–4 個、B1–B2 4–6 個、C1–C2 5–8 個（建置會檢查）。
- 挑「學生寫作、說話用得到」的片語：片語動詞、介系詞片語、轉折語、常用搭配詞、慣用語；不要挑冷僻的。
- `m`：文章裡的實際寫法和原形不同時才填（如 p=`take part in`、m=`took part in`），建置會確認找得到；文章頁會用 m 在內文畫虛線、自動抓出原句。
- `exzh` 預設隱藏，學生點「看翻譯」才出現——先讓學生自己理解例句。

## 文章結構（2026-11-25 起）

文章頁標題下有「🧭 顯示文章結構」按鈕，按下後會把主旨句、主題句、支持論述、結論句用顏色標出來，並顯示中文主旨。**每篇新文章的三個程度都要附上**：

- `levels.<a|b|c>.st = {"m": 主旨句, "mz": 中文主旨, "t": [各段主題句…], "c": 結論句}`
- `m`、`t`、`c` 都要**逐字照抄**原文的一整句（建置會檢查找不找得到）。沒有明寫主旨句或結論句就填 `""`，頁面會提示「要自己歸納」或「用事實收尾」。
- `mz`：一句話的中文主旨（必填），寫成學生能拿來回答主旨題的樣子。
- `t`：通常是第 2 段到倒數第 2 段的段首句；段首只是問句、引子或例子時，改挑真正說出該段重點的那句。主旨句已經是那段重點時，不必重複列進 `t`。
- 支持論述**不用標**：第一段和最後一段以外、沒被標到的句子都會自動顯示成支持論述；首尾段若列了主題句，也會這樣處理。
- 判斷原則：主旨句回答「整篇最想說什麼」，主題句回答「這一段在講什麼」，結論句收尾並呼應主旨。新聞稿的主旨常在第一段（導言），理論文章常在第一段末或最後一段。
- 沒有 `st` 的文章不會出現按鈕，建置時也會列出提醒。

## 對齊會考／學測（2026-11-20 起）

**A1–A2 ＝ 會考難度；B1–B2 ＝ 學測難度。** C1–C2 維持進階延伸。

### 新文章的選題與篇幅
- **長度**：A 級 **180–250 字**（會考長篇閱讀）、B 級 **300–380 字**（學測閱讀測驗）、C 級 380–480 字。
- **文體要多樣**：
  - 會考常見的**實用文本**：公告、廣告、海報、電子郵件、行程表、菜單、簡短圖表說明。每週至少 1 篇 A 級用這類格式寫，例如「博物館活動公告」「交換學生的 email」。
  - 學測常見的**說明文**：科普、環境、健康、科技與社會議題；也要有**論說文**（正反意見、作者立場），這樣才能出作者態度和段落目的的題目。
- **主題**：貼近台灣中學生生活與時事（校園、家庭、台灣在地議題、國際新聞、節慶文化）。避免太冷門、需要大量背景知識才讀得懂的題材。

### 出題藍圖（每級 6 題）
| 題號 | A 級（會考） | B 級（學測） |
|---|---|---|
| 1 | 主旨／最佳標題 What is the reading mainly about? | 主旨／最佳標題 Which is the best title for the passage? |
| 2 | 綜合判斷 According to the reading, which is TRUE? | 細節 Which of the following is true according to the passage? |
| 3 | 指涉 What does "it/they" in paragraph N refer to? **或** 順序 Which is the right order? | 段落目的 What is the purpose of paragraph N? **或** 作者態度 **或** 指涉 |
| 4 | 字義 What does the word "___" mean here? | 字義 The word "___" in paragraph N is closest in meaning to ___. |
| 5 | 推論 What can we learn from the reading? | 推論 What can be inferred from the passage? |
| 6 | 素養（生活應用） | 素養（評估說法或證據） |

- 題型標籤 `t` 用：`主旨` `細節` `指涉` `順序` `字義` `推論` `語氣` `篇章` `素養`（加英文），💡 技巧提示會自動對應。
- 「which is TRUE」的四個選項要分別對應文章不同段落，錯的選項用：換掉數字或人名、說得太絕對、把因果顛倒。
- B 級選項要**換句話說**（paraphrase），不要直接照抄原句；A 級可以較貼近原文用字。
- 順序題：列出 (a)(b)(c) 三件事，選項是不同的排列順序。

## 🧠 理論與效應 Ideas & Theories（2026-11-21 起）

- `cat: "ideas"`、`tag: "Ideas 理論"`。分類頁 `#/reading/topic/ideas`。
- **排程**：每週固定一篇放進每日閱讀——**每週三**（給 `day`）。不綁日期的常駐文章只給 `date`（不放 `day`／`week`），放在 `date` 月份的檔案。
- **範圍**：心理效應、思考陷阱／邏輯、學習與動機、科學與社會。
- **已寫（勿重複）**：barnum-effect、placebo-effect、confirmation-bias、sunk-cost-fallacy、forgetting-curve、maslow-hierarchy、butterfly-effect、tragedy-of-the-commons、halo-effect、pygmalion-effect、survivorship-bias、anchoring-effect、growth-mindset、flow、pareto-principle、goodharts-law、spotlight-effect、mere-exposure-effect、availability-heuristic、occams-razor、marshmallow-test、zeigarnik-effect、asch-conformity、matthew-effect、ikea-effect、cognitive-dissonance、gamblers-fallacy、framing-effect、parkinsons-law、ten-thousand-hours、broken-windows、streisand-effect。新增後請把 id 補進這一行。
- **候選題目**：旁觀者效應、達克效應、墨菲定律、霍桑效應（含爭議）、損失規避、基本歸因謬誤、後見之明偏誤、虛假共識效應、稟賦效應、誘餌效應、峰終定律、間隔重複／測驗效應、自我實現預言、社會惰化、鳥籠效應、刻板印象威脅（含爭議）、心理抗拒。
- **寫法**：
  - A：用生活例子講清楚概念，再加一個經典實驗。
  - B：加入研究細節和限制。
  - C：加入批評、修正與爭議。
  - 寫出研究者與年份，不確定的數字不要寫；有爭議的理論要把爭議寫進去。
  - 素養題讓學生把理論套到生活，或判斷某個說法是否站得住。
- **語音**：常駐的 ideas 文章用 `node tools/gen_audio.mjs --cat=ideas` 只錄這個分類（不會動到其他文章）。
- **圖示**：`RD_ART` 已有 crystal、pill、magnifier、ticket、curve、pyramid、butterfly、field、halo、plane、anchor、sprout、pie、target、spotlight、note、razor、marshmallow、checklist、lines、snowball、box、grapes、coin、glass、hourglass、stairs、window、camera，可重用或新增。
