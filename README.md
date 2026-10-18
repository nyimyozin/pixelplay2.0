# PixelPlay 2.0

**24 games in one tiny, friendly browser arcade.** A modern, liquid-glass overhaul of [PixelPlay](https://github.com/nyimyozin/pixelplay), keeping the original repository untouched.

**[Play online](https://nyimyozin.github.io/pixelplay2.0/)**

## Game collection

| Category | Games |
| --- | --- |
| Arcade | Snake, Block Drop, Pong, Breakout, Sky Hop |
| Puzzle | Memory Match, 2048, Minesweeper, Sudoku, 15 Puzzle, Lights Out, Number Hunt |
| Strategy | Tic-Tac-Toe (CPU), Connect Four (CPU), Rock Paper Scissors |
| Words | Hangman, Word Scramble, Typing Sprint |
| Quiz | Trivia Quiz, Math Sprint, Color Clash |
| Reflex | Simon Says, Reaction Time, Whack-a-Mole |

## Features

- All 24 games are playable without accounts, downloads, servers, or game libraries.
- Search the catalogue and filter by game category.
- Responsive controls for touchscreen, mouse, and keyboard. Action games use lightweight HTML canvas.
- Light/dark themes, responsive frosted-glass design, and reduced-motion preferences.
- Improved original Hangman and Memory Match, each with three difficulty levels.
- Automatic results saved in local storage; nothing sent to a server.
- Static hosting works on GitHub Pages, and deep links use URL fragments.

## Run

Clone the repository and open `index.html` in a modern browser. For development, a local HTTP server is recommended:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Test

With Node.js 18 or newer:

```sh
node --check app.js
node --check arcade/core.js
node --check arcade/hub.js
node --check arcade/puzzles.js
node --check arcade/quick.js
node --check arcade/action.js
node --test tests/*.test.cjs
```

The GitHub Actions validation workflow automatically runs syntax checks and unit tests on every push.

## Architecture

- `index.html` + `styles.css`: static layout and shared design
- `engine.js` + `app.js`: original Hangman and Memory Match
- `arcade/core.js`: catalogue metadata, puzzles, deterministic rule helpers
- `arcade/hub.js`: discovery catalogue, routing, lifecycle, local statistics
- `arcade/puzzles.js`: puzzles and strategy games
- `arcade/quick.js`: word, quiz, and reflex games
- `arcade/action.js`: canvas arcade games
- `arcade/styles.css`: game tiles, boards, touch controls and responsive styles

The original [PixelPlay](https://github.com/nyimyozin/pixelplay) remains unchanged. PixelPlay 2.0 is a separate redesign.
