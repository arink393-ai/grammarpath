# 閱讀文章來源檔（2026-10-27 起）

每日閱讀、每週重點閱讀的**完整內容都在這個資料夾**，依月份分檔：`readings/<YYYY-MM>.json`（以文章的 `day`，沒有的話用 `date` 判斷月份）。

`index.html` 只保留不含內文的目錄（`READINGS`，每篇約 150 字元），學生打開文章時才下載該月份的檔案，所以網站不會隨著每天新增文章越變越大。

## 新增或修改一篇文章

1. 打開對應月份的 `readings/<YYYY-MM>.json`（沒有就新建一個，內容是 `[ … ]` 陣列），加入一篇。欄位跟以前完全一樣：
   `id / cat / topic / zh / src / date / day / week / tag / icon / levels.{a,b,c}{title,cefr,text[],gloss[],q[]} / discuss[] / proper[]`
   - 每日閱讀：給 `day`（例 `"2026-11-03"`）。
   - 每週重點：給最新的 `week` 標籤（例 `"11/2–11/8"`），就會自動成為「本週重點」。
2. 執行 `python3 tools/build_readings.py`：檢查資料（三個程度、題目答案索引、id 不重複、月份放對檔），並更新 `index.html` 的目錄。
3. 執行 `python3 tools/sync_assets.py`，把 `sw.js` 的 `CACHE` 名稱加一版。
4. 只提交自己改的檔案（`readings/…json`、`index.html`、`offline-content.js`、`sw.js`），不要用 `git add -A`。
5. 要真人語音：`./update.sh`（Kokoro 產生 MP3，只會提交音檔與 RD_AUDIO 清單）。

`tests/content-loading.test.cjs` 會檢查 `index.html` 的目錄和這裡的檔案是否一致；忘了第 2 步測試就會失敗。
