# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Triple Triad (the FF8 card game) built with Create React App + TypeScript, using Marvel characters as cards. Deployed on Netlify at <https://triple-triad.netlify.app/>. Game rules are described in README.md.

Deployment is git-connected: pushing to `main` triggers a Netlify build (settings in `netlify.toml`: `CI=false` because CRA turns ESLint warnings into errors under CI, Node 22, publish `build/`). `public/_redirects` provides the SPA fallback.

## Commands

- `npm start` — dev server
- `npm run build` — production build
- `npm test` — Jest in watch mode via react-scripts; run a single file with `npm test -- Card` or a single test with `npm test -- -t "test name"` (no test files currently exist)
- No standalone lint script; ESLint (`react-app` config) runs through react-scripts during start/build

## Architecture

**Game logic lives on an external backend, not in this repo.** The frontend only renders state and sends moves. The backend source is the sibling repo `../triple-triade-api` (Hapi server, `src/server.js`, runs on port 3004; built with `npm run build:dev` then started with `npm start`/`npm run dev`). The deployed copy runs at `https://ttg-api.onrender.com/api/v1/marvel`; override the base URL with the `REACT_APP_API_URL` env var to hit a local backend. Three endpoints:

- GET `/create` — the player's 5-card hand
- POST `/game/start` — the enemy hand, generated from the player's hand so the two never share cards
- POST `/game` — the full game state + player's move; the server computes captures, plays the enemy (AI) move, and returns the updated board

**Single Zustand store** ([src/store/gameStore.ts](src/store/gameStore.ts)) holds all game state and the API calls (`initGame`, `playTurn`, `closeModal`). Two parallel board representations, both 9-element arrays where numbers = empty cells:

- `serverBoard` — raw server format (`{poke, holder}` objects), sent back verbatim in the next `/game` request
- `board` — UI format, server items flattened to `{...poke, holder}` (a `Character` with `holder`)

The server calls cards "pokes". `holder` is `"p1"` (player, blue) or `"p2"` (enemy, red) and drives card coloring via the matching CSS-module class in [src/components/Card/index.tsx](src/components/Card/index.tsx).

**Turn flow** (`playTurn`): player selects a card in `Hand` → clicks an empty `Board` cell → optimistic placement (`holder: "p1"`, card removed from hand) → POST `/game` (position is `index + 1`, 1-based) → the response's `oldBoard` is applied (player's captures) → 500ms pause → the response's `board` is applied (AI's move) and scores update. `isLoading` stays true through the whole sequence, which is what blocks double moves. When the response's `move === null` the game is over: `winner` is set (`"blue"` / `"red"` / `"draw"`) and the end-of-game modal opens (rendered globally in [src/App.tsx](src/App.tsx)).

**Scoring rule**: every card you own is a point — board cells with your `holder` plus cards still in hand. The game therefore starts at 5–5, and `initGame`/"Reset game"/"Try again" all restart by resetting the store (no page reload).

**Card side values**: components read them via `getCardValues()` ([src/utils/getCardValues.ts](src/utils/getCardValues.ts)), which returns `character.attacks[1]` — not the `values` object on the `Character` interface ([src/interfaces/index.ts](src/interfaces/index.ts)).

**Mobile**: viewports narrower than 667px get [ModalMobile](src/components/UI/ModalMobile/index.tsx) (a "rotate your device" screen) instead of the game, via the `useMediaQuery` hook.

## Gotchas

- The backend on Render free tier may cold-start; the first card fetch can be slow (the `Preloader` in `Hand` covers this).
