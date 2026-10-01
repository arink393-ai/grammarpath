# 帳號與同步修正驗證（2026-10-02）

## 套用範圍

- profiles 僅開放使用者更新自己的 name；角色、email 等欄位由後端管理。
- submissions 在 RLS 外加欄位保護，學生可繳交／重交，老師可評分；舊版重交傳 graded_at:null 時仍保留老師評語與分數。
- 主站進度使用三方合併、updated_at 條件寫入、持久化待同步紀錄與寫入識別碼。讀取失敗不寫入；寫入回應遺失時可辨識已成功的寫入。衝突前快照保存在同帳號的 __sync_recovery。
- 背單字的進度、設定、草稿與待同步清單按帳號隔離；舊資料複製到原 vr:owner，沒有 owner 的資料保留為訪客。保留舊鍵供復原，不自動合併訪客資料到登入帳號。匯出不含其他帳號或老師 API key。

## 驗證

`node --test tests/*.test.cjs`：14 項通過，涵蓋讀取失敗、CAS 重試、同步時本機編輯、回應遺失、帳號切換、舊資料搬移、匯出隔離與延遲回應。

`tests/permissions.sql`：正式資料庫 migration 套用前與套用後均通過。測試用 auth.users、作業及繳交資料皆在同一交易內建立並 rollback，沒有留下測試帳號或作業。

已套用 Supabase project `ygmtpcrnoqxziiyrnmmq` migration `20261001182441_protect_student_fields`。前端檔案隨本次修正提交至 GitHub Pages；發布結果以 GitHub 的 Pages 部署紀錄為準。

## 範圍限制與後續

- 這是瀏覽器快照同步；無共同基準的舊紀錄以保守合併處理，同一文字欄位衝突保留本機並保存衝突快照。不是可稽核的點數交易帳本。
- 舊版網頁仍可能執行原有直接覆寫同步，前端發布後需重新載入，才能使用新同步機制。
- Supabase advisor 仍列出原有公開 SECURITY DEFINER 函式與未開啟外洩密碼檢查。`is_teacher` 為 RLS 使用；`teacher_emails` 無用戶 policy 是刻意禁止用戶存取。新增 trigger 位於 private schema，無新增公開函式。
  - [SECURITY DEFINER 權限檢查](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
  - [外洩密碼防護](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
