# Gameplay review

All 24 games were reviewed for start timing, controls, progression, scoring and replay behavior.

| Game | Updated behavior / review outcome |
| --- | --- |
| Snake | Explicit Play; pause/resume; seven speed levels at 0, 10, 25, 50, 100, 200 and 300 apples. A run continues until a crash or all 400 cells are filled (397 apples plus the starting length of three). Two legal turns can be buffered; food never spawns on the snake. |
| Block Drop | Marathon continues past six lines until the stack fills; every ten lines raises the level. Ghost piece previews the landing position. Play, pause and End run controls. |
| Pong | Play before the first serve; first-to-five match remains a natural endpoint. Hold controls support touch; a new serve waits for Resume. |
| Breakout | Endless waves; each cleared wave grants a life, capped at five. Wave and life transitions wait for Resume. Touch cancellation releases held controls. |
| Sky Hop | Endless flight with gradually narrower gaps and increasing pace. Explicit Play, pause and End run. |
| 2048 | Continue after reaching 2048. Highest tile is displayed. End run saves the current score; otherwise play ends when no moves remain. Arrow-pad controls and touch swipes. |
| Minesweeper | First-click safety retained. Tapping a revealed number clears its other neighbors when adjacent flag counts match. Flag mode supports mobile. |
| Tic-Tac-Toe | Casual CPU occasionally makes a non-optimal move, so a win is possible. Turn-based input and match endpoint retained. |
| Connect Four | Reviewed turn order, CPU delay and full-column rejection; the existing turn-based flow remains appropriate. |
| Sudoku | Generated puzzles have exactly one solution. Touch digits have larger targets; Backspace/Delete erase without triggering browser navigation. |
| 15 Puzzle | Keyboard arrows move the empty square; tile buttons have accessible labels. Existing legal-move scrambling and move-based scoring retained. |
| Lights Out | Reviewed solvable generation, move counting and win detection; the existing untimed flow remains appropriate. |
| Word Scramble | Skip reveals the skipped word, and cannot advance beyond a finished round. Five-word rounds remain appropriate. |
| Typing Sprint | Explicit Play and full 30-second sprint. Correct characters in the final unfinished sentence count; accuracy tracks attempted characters across sentences. Paste/drop are disabled for this typing challenge. |
| Trivia Quiz | Reviewed choice locking and answer feedback. Ten-question rounds and score/time ranking remain appropriate. |
| Math Sprint | Explicit Play; the clock runs for all 45 seconds, with no ten-answer cap. Correct answers and mistakes are shown. |
| Color Clash | Reviewed answer locking and visual feedback. The existing twelve-question untimed round remains appropriate. |
| Simon Says | Explicit Play; sequence grows beyond level five. Replaying a sequence changes the run to practice and disables score submission. End run saves completed levels. |
| Reaction Time | Existing tap-to-start retained. Hiding the page during a trial cancels it rather than returning a misleading result. |
| Whack-a-Mole | Explicit Play; full 30 seconds rather than ending after twelve hits. Pace increases, misses are shown, and each flower allows one attempt to prevent button-mashing. |
| Rock Paper Scissors | Reviewed outcome calculations and round count. Five-round match remains appropriate. |
| Number Hunt | Input bounds follow the remaining possible range. Seven-guess endpoint and fewer-guesses ranking retained. |
| Hangman | Existing manual start-on-guess flow retained. New words reset stale feedback. The 180-word bank remains local. |
| Memory Match | Existing first-flip start retained. Active time now preserves sub-second precision across pauses. Restart restores cards if the previous round was paused. |

## Shared lifecycle

Snake, Block Drop, Pong, Breakout, Sky Hop, Simon, Whack-a-Mole, Typing and Math display instructions and wait for Play. Their Pause/Resume controls freeze gameplay, delayed callbacks and the active-play clock. Switching tabs or losing window focus pauses these games and requires explicit Resume. Restart returns to the ready screen.

Turn-based games do not get an unnecessary Play step. Their existing natural first action remains the start of interaction. Shared keyboard handlers ignore inputs and navigation controls. Completed or abandoned rounds cancel their handlers and scheduled callbacks.

## Leaderboard compatibility

Updated Snake and Block Drop runs use Marathon boards; Sky Hop, Simon and 2048 use Endless boards; Breakout uses Waves; the timed challenges use Sprint; Tic-Tac-Toe uses Casual. Previous `standard` scores are preserved and remain viewable under **Classic (previous rules)**. Other games keep their existing boards. The game-specific modes and score limits are enforced by the database submission function.

Results are still client-reported casual scores, not server-verified competitive records.
