-- ============================================================
--  每日單字 (vocab/) — 背單字進度同步到老師後台
--  Supabase → SQL Editor → New query → 貼上整段 → Run（可重複執行）
-- ============================================================

-- 每位學生 × 每本單字書 一列
create table if not exists public.vocab_progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  book_id     text not null,
  book_title  text,
  total       int  default 0,              -- 這本書總字數
  words       jsonb default '{}'::jsonb,   -- 每個字的記憶紀錄 {word:{s,due,l,d0,u}}
  stars       jsonb default '[]'::jsonb,   -- 生詞本
  days        jsonb default '{}'::jsonb,   -- 每日完成數 {dayNumber:{n,r}}
  book_data   jsonb,                       -- 老師自訂單字書的內容（換裝置時還原用）
  last_active timestamptz default now(),
  updated_at  timestamptz default now(),
  primary key (user_id, book_id)
);

alter table public.vocab_progress enable row level security;

drop policy if exists p_vocab_read   on public.vocab_progress;
drop policy if exists p_vocab_insert on public.vocab_progress;
drop policy if exists p_vocab_update on public.vocab_progress;
drop policy if exists p_vocab_delete on public.vocab_progress;
create policy p_vocab_read   on public.vocab_progress for select using (auth.uid() = user_id or public.is_teacher());
create policy p_vocab_insert on public.vocab_progress for insert with check (auth.uid() = user_id);
create policy p_vocab_update on public.vocab_progress for update using (auth.uid() = user_id);
create policy p_vocab_delete on public.vocab_progress for delete using (auth.uid() = user_id);
