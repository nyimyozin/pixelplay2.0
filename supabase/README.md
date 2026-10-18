# Connect the global leaderboards

The game code is ready; shared rankings stay in a clear "not connected" state until you complete these steps.

1. Create a project at https://supabase.com/dashboard. Choose the region and plan you want.
2. In its SQL Editor, run `supabase/leaderboards.sql` once. It creates private result tables and two public API functions. Run it on a new database; this initial migration intentionally fails rather than replacing existing tables.
3. In Authentication settings, enable **Anonymous Sign-Ins**. Visitors can read rankings without signing in. Submitting creates a guest account without asking for an email or password.
4. Copy the project URL and **publishable key** (or legacy `anon` key) into `leaderboard-config.js`. Those two settings are public. Never use a secret key or `service_role` key in website files.
5. Commit the config file and wait for GitHub Pages to deploy.
6. Open the site in two browser profiles. Finish a game, click **Submit & view leaderboard**, enter a name and submit. In the other profile, open **Leaderboards**, select the same game and difficulty, and click **Refresh**. The result should appear in both.

## Existing installations

Projects created with the original leaderboard schema should apply `supabase/qol-update.sql` once before deploying the updated games. Fresh projects should run only `supabase/leaderboards.sql`, which already includes all current modes. The connected PixelPlay project has already received this update. Old records are preserved in their original `standard` boards.

## Ranking rules

Each player has one personal best per game and difficulty. Higher scores win for point-based games. Lower moves, mistakes, reaction time or completion time win for the other games. Equal scores use faster round completion, followed by the earliest record. Boards show the top 20 players. Hangman and Memory have separate Easy, Medium and Hard boards.

Only wins qualify for Hangman, Memory, Minesweeper, Tic-Tac-Toe, Connect Four, Sudoku, 15 Puzzle, Lights Out, Reaction Time and Number Hunt. Other games accept completed rounds, including losses, so a new high score can count even when the game ends in a crash. Simon ranks fully completed levels. Typing ranks WPM from completed sentences.

For games with a Play screen, times start when Play is pressed. Pause time is excluded from these runs; hiding the tab or losing focus automatically pauses them. Other round times start when the board is created. Reaction Time ranks the time from the green light, and Memory uses its active-play clock (excluding pauses, with millisecond precision). Changing games or restarting does not submit an unfinished round. Submitting is always optional.

## Data and security

- Names, best scores and completion times are public. User IDs are not returned by the leaderboard API.
- Guest identities persist in the browser through Supabase Auth. Clearing browsing data or switching devices creates another player; names are not unique and are not verified identities.
- Tables live in a private schema, use RLS and have no client table grants. Only authenticated users can invoke the submission function. It takes the player ID from the verified session, checks game/mode/score limits and enforces a two-second per-player cooldown. The read function exposes only the top 20 public results.
- These are casual, client-reported scores. A player can modify browser code and forge plausible results. This is not cheat-proof and should not be used for prizes. Trusted gameplay validation/replay verification would need a further backend implementation.
- For a public launch, configure Supabase Auth abuse protection and monitor usage. CAPTCHA requires a matching client challenge/token integration; do not enable it without adding that integration. The per-player cooldown does not stop someone creating more guest identities.
- To remove an abusive result, delete it from `pixelplay_private.results` using the SQL Editor. Deleting an Auth user cascades to that user's results and cooldown.

## Verification

Run `node --test tests/*.test.cjs` and syntax checks as in the main README. The automated suite mocks Supabase to test UI reads, result submissions, error recovery and unconfigured behavior. A live database and two-browser smoke test are still required after connection.

Supabase reference: https://supabase.com/docs/guides/auth/auth-anonymous and https://supabase.com/docs/guides/database/functions

