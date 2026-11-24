-- Run this SQL in your Supabase SQL Editor to enable live cross-device multiplayer
-- Includes database-level anti-monetary constraint enforcement!

create table if not exists public.profiles (
  uid text primary key,
  username text unique not null,
  dares_kept integer not null default 0,
  avatar_color text not null default 'bg-emerald-600',
  created_at bigint not null
);

create table if not exists public.friendships (
  id text primary key,
  requester_id text not null references public.profiles(uid) on delete cascade,
  requester_username text not null,
  recipient_id text not null references public.profiles(uid) on delete cascade,
  recipient_username text not null,
  status text not null check (status in ('pending', 'accepted')),
  created_at bigint not null
);

create table if not exists public.dares (
  id text primary key,
  game_id text not null,
  game_title text not null,
  league text not null,
  challenger_id text not null references public.profiles(uid) on delete cascade,
  challenger_username text not null,
  opponent_id text not null references public.profiles(uid) on delete cascade,
  opponent_username text not null,
  condition_label text not null,
  challenger_side text not null,
  opponent_side text not null,
  dare_text text not null,
  status text not null check (status in ('pending', 'active', 'proof_submitted', 'completed', 'declined')),
  loser_id text,
  loser_username text,
  winner_id text,
  winner_username text,
  proof_text text,
  proof_image_url text,
  badge_awarded boolean default false,
  created_at bigint not null,
  updated_at bigint not null,

  -- Database-level Anti-Monetary Guardrail
  constraint no_currency_symbols check (dare_text !~ '[$€£¥₿₹₩]'),
  constraint no_financial_keywords check (
    dare_text !~* '\m(dollar|dollars|buck|bucks|cash|venmo|paypal|etransfer|e-transfer|zelle|cashapp|crypto|btc|bitcoin|eth|bet|bets|betting|wager|gamble|pay|paying|payment|paid|money|cent|cents|transfer|wire|bank|stake|odds|payout)\M'
  )
);

-- Enable open demo access (RLS disabled for passwordless demo handles)
alter table public.profiles disable row level security;
alter table public.friendships disable row level security;
alter table public.dares disable row level security;

-- Enable Realtime replication
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.friendships;
alter publication supabase_realtime add table public.dares;
