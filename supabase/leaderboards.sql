-- Run once in the Supabase SQL Editor. No client may write tables directly.
begin;
create schema if not exists pixelplay_private;
revoke all on schema pixelplay_private from public, anon, authenticated;
create table pixelplay_private.rules (
 game_id text primary key, ascending boolean not null, max_score numeric not null
);
insert into pixelplay_private.rules values
('hangman',true,86400),
('memory',true,100000),
('snake',false,15),
('tetris',false,1000000),
('2048',false,10000000),
('minesweeper',true,86400),
('tictactoe',true,86400),
('connect4',true,86400),
('pong',false,5),
('breakout',false,36),
('flappy',false,8),
('sudoku',true,100000),
('sliding',true,100000),
('lights',true,100000),
('scramble',false,5),
('typing',false,1000),
('trivia',false,10),
('math',false,10),
('colors',false,12),
('simon',false,5),
('reaction',true,10000),
('whack',false,12),
('rps',false,5),
('guess',true,7);
create table pixelplay_private.results (
 player_id uuid not null references auth.users(id) on delete cascade,
 game_id text not null references pixelplay_private.rules(game_id),
 mode text not null,
 player_name text not null check(char_length(player_name) between 2 and 24),
 score numeric not null check(score>=0),
 duration_ms integer not null check(duration_ms between 1 and 86400000),
 achieved_at timestamptz not null default clock_timestamp(),
 primary key(player_id,game_id,mode),
 check ((game_id in ('hangman','memory') and mode in ('easy','medium','hard'))
    or (game_id not in ('hangman','memory') and mode='standard'))
);
create index results_board on pixelplay_private.results(game_id,mode,score,duration_ms,achieved_at);
create table pixelplay_private.cooldowns (
 player_id uuid primary key references auth.users(id) on delete cascade,
 submitted_at timestamptz not null
);
alter table pixelplay_private.rules enable row level security;
alter table pixelplay_private.results enable row level security;
alter table pixelplay_private.cooldowns enable row level security;
revoke all on all tables in schema pixelplay_private from public, anon, authenticated;

create or replace function public.pixelplay_submit(
 p_game text,p_mode text,p_name text,p_score numeric,p_duration integer
) returns void language plpgsql security definer set search_path='' as $$
declare
 uid uuid := auth.uid();
 rule pixelplay_private.rules%rowtype;
 accepted uuid;
begin
 if uid is null then raise exception 'Sign in before submitting'; end if;
 select * into rule from pixelplay_private.rules where game_id=p_game;
 if not found then raise exception 'Unknown game'; end if;
 if p_mode is null or not (
  (p_game in ('hangman','memory') and p_mode in ('easy','medium','hard'))
  or (p_game not in ('hangman','memory') and p_mode='standard')
 ) then raise exception 'Invalid difficulty'; end if;
 if p_name is null or char_length(btrim(p_name)) not between 2 and 24
    or p_name ~ '[[:cntrl:]]' then raise exception 'Use a name with 2–24 characters'; end if;
 if p_score is null or p_score::text in ('NaN','Infinity','-Infinity')
    or p_score<0 or p_score>rule.max_score
    or p_duration is null or p_duration not between 1 and 86400000
 then raise exception 'Invalid result'; end if;
 if p_game not in ('hangman','minesweeper','tictactoe','connect4') and trunc(p_score)<>p_score
 then raise exception 'Score must be a whole number'; end if;
 if p_game in ('memory','sliding','lights','guess','reaction') and p_score<1
 then raise exception 'Score must be positive'; end if;
 -- Atomic per-player cooldown; concurrent requests cannot bypass the gate.
 insert into pixelplay_private.cooldowns as c values(uid,clock_timestamp())
 on conflict(player_id) do update set submitted_at=excluded.submitted_at
 where c.submitted_at < clock_timestamp()-interval '2 seconds'
 returning player_id into accepted;
 if accepted is null then raise exception 'Please wait two seconds before submitting again'; end if;
 insert into pixelplay_private.results as r
 (player_id,game_id,mode,player_name,score,duration_ms)
 values(uid,p_game,p_mode,btrim(p_name),p_score,p_duration)
 on conflict(player_id,game_id,mode) do update set
  player_name=excluded.player_name,score=excluded.score,
  duration_ms=excluded.duration_ms,achieved_at=clock_timestamp()
 where (rule.ascending and excluded.score<r.score)
    or (not rule.ascending and excluded.score>r.score)
    or (excluded.score=r.score and excluded.duration_ms<r.duration_ms);
end $$;
revoke all on function public.pixelplay_submit(text,text,text,numeric,integer) from public, anon, authenticated;
grant execute on function public.pixelplay_submit(text,text,text,numeric,integer) to authenticated;

create or replace function public.pixelplay_top(p_game text,p_mode text)
returns table(player_name text,score numeric,duration_ms integer,achieved_at timestamptz)
language sql stable security definer set search_path='' as $$
 select r.player_name,r.score,r.duration_ms,r.achieved_at
 from pixelplay_private.results r join pixelplay_private.rules g using(game_id)
 where r.game_id=p_game and r.mode=p_mode
 order by case when g.ascending then r.score else -r.score end,
 r.duration_ms,r.achieved_at,r.player_id limit 20;
$$;
revoke all on function public.pixelplay_top(text,text) from public, anon, authenticated;
grant execute on function public.pixelplay_top(text,text) to anon, authenticated;
commit;

