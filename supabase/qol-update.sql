-- Preserve existing scores; new game rules have independent leaderboards.
alter table pixelplay_private.rules add column if not exists allowed_modes text[] not null default array['standard'];
update pixelplay_private.rules set allowed_modes=array['easy','medium','hard'] where game_id in ('hangman','memory');
update pixelplay_private.rules set max_score=10000000,allowed_modes=array['standard','endless'] where game_id='2048';
update pixelplay_private.rules set max_score=397,allowed_modes=array['standard','marathon'] where game_id='snake';
update pixelplay_private.rules set max_score=1000000000,allowed_modes=array['standard','marathon'] where game_id='tetris';
update pixelplay_private.rules set max_score=1000000,allowed_modes=array['standard','waves'] where game_id='breakout';
update pixelplay_private.rules set max_score=1000000,allowed_modes=array['standard','endless'] where game_id='flappy';
update pixelplay_private.rules set max_score=1000,allowed_modes=array['standard','endless'] where game_id='simon';
update pixelplay_private.rules set max_score=500,allowed_modes=array['standard','sprint'] where game_id='whack';
update pixelplay_private.rules set max_score=10000,allowed_modes=array['standard','sprint'] where game_id='math';
update pixelplay_private.rules set max_score=1000,allowed_modes=array['standard','sprint'] where game_id='typing';
update pixelplay_private.rules set max_score=86400,allowed_modes=array['standard','casual'] where game_id='tictactoe';
alter table pixelplay_private.results drop constraint results_check;
alter table pixelplay_private.results add constraint results_mode_check check ((game_id in ('hangman','memory') and mode in ('easy','medium','hard')) or (game_id not in ('hangman','memory') and mode='standard') or (game_id='2048' and mode='endless') or (game_id='snake' and mode='marathon') or (game_id='tetris' and mode='marathon') or (game_id='breakout' and mode='waves') or (game_id='flappy' and mode='endless') or (game_id='simon' and mode='endless') or (game_id='whack' and mode='sprint') or (game_id='math' and mode='sprint') or (game_id='typing' and mode='sprint') or (game_id='tictactoe' and mode='casual'));
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
 if p_mode is null or not (p_mode=any(rule.allowed_modes)) then raise exception 'Invalid game mode or difficulty'; end if;
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


