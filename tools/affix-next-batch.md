# 字根字首 下一批（待 Canva 生圖配額重置後補）

狀態：**pending**。圖像需在「互動 session（有 Canva MCP）」生成——雲端排程 routine 無法使用 Canva，不能自動生圖。配額重置後，在一般對話說「繼續字根字首」，依本檔執行即可。

目前題庫（背字首字根字尾 `prefix-study.html`）：字首 46 ・字根 12 ・字尾 30 ＝ 88。
本批完成後：字首 52 ・字根 20 ・字尾 30 ＝ 102。

## 生圖基底提示詞（每張都套用）
```
Minimalist pictogram icon in the exact style of airport wayfinding symbols (AIGA/ISO public signage). A SINGLE solid black silhouette centered on a pure white background. Bold, simple, flat, high-contrast, no gradients, no shading, no text, no letters, no numbers, no border, no frame. Lots of white space. Subject: {SUBJECT}.
```
工具：`mcp__9f7bc6c1-…__generate-image`，`aspectRatio: SQUARE_1_1`，再 `get-generate-image-job` 取圖（存於 tool-results/*.jpg）。

## 更多字首（6）→ art/prefix-cards/{slug}.png
| slug | p | zh | 例字(ex) | SUBJECT(生圖) |
|---|---|---|---|---|
| circum | circum- | 環繞、周圍 | `<b>circ</b>le`圓圈 / `<b>circ</b>us`馬戲團 / `<b>circum</b>stance`情況 | a person walking around the outside edge of a large ring, a curved arrow going around it |
| mega | mega- | 大、百萬 | `<b>mega</b>phone`擴音器 / `<b>mega</b>byte`百萬位元組 / `<b>mega</b>city`超大城市 | a person holding a huge oversized megaphone |
| para | para- | 旁邊、防護、輔助 | `<b>para</b>llel`平行的 / `<b>para</b>graph`段落 / `<b>para</b>chute`降落傘 | a person descending under a large parachute |
| equi | equi- | 相等 | `<b>equ</b>al`相等的 / `<b>equ</b>ator`赤道 / `<b>equi</b>librium`平衡 | a balanced two-pan weighing scale, perfectly level |
| bene | bene- | 好、善 | `<b>bene</b>fit`益處 / `<b>bene</b>factor`恩人 / `<b>bene</b>volent`仁慈的 | a hand offering/holding out a heart shape, kindness |
| hyper | hyper- | 過度、超 | `<b>hyper</b>active`過動的 / `<b>hyper</b>link`超連結 / `<b>hyper</b>market`大賣場 | an over-energetic person jumping very high with motion and exclamation lines |

## 字根（8）→ art/root-cards/{slug}.png
root 卡資料結構：`{id:slug, p:字根形, key:助記字(可省), zh:意思, ex:[[word,gloss]×3]}`
| slug | p | zh | 例字(ex) | SUBJECT(生圖) |
|---|---|---|---|---|
| spect | spect / spec | 看 | `in<b>spect</b>`檢查 / `<b>spect</b>ator`觀眾 / `re<b>spect</b>`尊敬 | a person holding a large magnifying glass up to one eye, inspecting closely |
| port | port | 攜帶、搬運 | `im<b>port</b>`進口 / `trans<b>port</b>`運輸 / `<b>port</b>able`可攜的 | a person carrying a large heavy box on their back, transporting it |
| dict | dict / dic | 說 | `<b>dict</b>ate`口述 / `pre<b>dict</b>`預測 / `<b>dic</b>tionary`字典 | a person speaking, with curved sound waves coming out of their open mouth |
| scrib | scrib / script | 寫 | `de<b>scribe</b>`描述 / `<b>script</b>`劇本 / `sub<b>scribe</b>`訂閱 | a large hand holding a pen, writing a wavy line on a sheet of paper |
| struct | struct | 建造 | `con<b>struct</b>`建造 / `<b>struct</b>ure`結構 / `in<b>struct</b>`指導 | a person stacking rectangular building blocks to construct a small tower |
| aud | aud | 聽 | `<b>aud</b>io`音訊 / `<b>aud</b>ience`觀眾 / `<b>aud</b>ible`聽得見的 | a person cupping one hand behind a large ear to listen, small sound waves arriving |
| vis | vis / vid | 看 | `<b>vis</b>ion`視力 / `<b>vis</b>ible`看得見的 / `<b>vid</b>eo`影片 | a single large eye with short rays around it (seeing) |
| mit | mit / miss | 送、發出 | `sub<b>mit</b>`提交 / `<b>miss</b>ion`任務 / `trans<b>mit</b>`傳送 | a person launching a paper plane forward (sending something off) |

## 整合步驟（配額可用時）
1. 逐一生圖（基底提示詞＋SUBJECT），取回 jpg。
2. PIL 處理：轉灰階→near-white(<18)去邊→補白成正方形→resize 360×360→存對應 art 資料夾。
   （參考 scratchpad/proc_gen.py 的流程。）
3. 編輯 `prefix-study.html`：
   - 字首：把 6 筆 append 到 `PREFIX_CARDS`（p/zh/ex），對應 slug 依序 append 到 `PFC_IMG`（兩陣列順序必須一致）。
   - 字根：把 8 筆 append 到 `ROOT_CARDS`（id=slug, p, key?, zh, ex）。
4. `node --check` 內嵌 script；本機 `python3 -m http.server 8732` 測；確認計數與圖 200。
5. 只 `git add prefix-study.html art/prefix-cards/* art/root-cards/*`；commit（結尾 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`）；push；輪詢 Pages build。

## 替代方案
使用者若在 `~/.openai.env` 放 OpenAI API key（09-draw 技能，gpt-image-2），可改用本機生圖、不受 Canva 配額限制，一次做完整批。
