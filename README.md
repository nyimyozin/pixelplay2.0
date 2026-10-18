# [PixelPlay 2.0](https://github.com/nyimyozin/pixelplay2.0)

A polished, self-contained mini-game arcade rebuilt from [the original PixelPlay](https://github.com/nyimyozin/pixelplay).

**Play Hangman and Memory Match** in a responsive, liquid-glass UI. No frameworks, CDNs, tracking, build tools, or dependencies required.

## Features

- Two fully playable games with redesigned interfaces
- Frosted liquid-glass visuals, responsive layouts, and light/dark mode
- Three difficulty levels per game
- Mouse, touch, and keyboard support (including physical-keyboard Hangman)
- Accessible controls, visible focus rings, and reduced-motion support
- Locally saved wins, streaks, and best Memory times
- Improved shuffling, timer accuracy, and game-reset logic
- Fully static: works on GitHub Pages or any web server

## Run locally

Open `index.html` in a modern browser. No installation necessary. The website uses hash-based navigation, so deep links work on GitHub Pages:

- `index.html#/hangman`
- `index.html#/memory`

## Test

With Node.js 18+:

```bash
node --test tests/engine.test.cjs
node --check engine.js
node --check app.js
```

## Project structure

- `index.html` — semantic HTML shell and metadata
- `styles.css` — responsive liquid-glass design system
- `engine.js` — pure game helpers and word decks, testable in Node
- `app.js` — routing, presentation, interactions, persistence, and games
- `favicon.svg` — custom PixelPlay app icon
- `tests/engine.test.cjs` — lightweight unit tests

## Credits

Built as a redesign of Nick's original [PixelPlay](https://github.com/nyimyozin/pixelplay) (Hangman + Memory Game). The original repository was not changed. This version retains the gameplay concepts while replacing the front-end code and graphics.
