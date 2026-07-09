# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Triple Triad (the FF8 card game) built with Create React App + TypeScript, using Marvel characters as cards. Deployed on Netlify at <https://triple-triad.netlify.app/>. Game rules are described in README.md.

Deployment is **manual**: `npm run build`, then upload the `build/` folder to Netlify by hand (no git-connected CI, no netlify.toml). `public/_redirects` provides the SPA fallback and is copied into each build. Connecting Netlify to GitHub would currently fail because `src/assets/` is git-ignored (see Gotchas).

## Commands

- `npm start` — dev server
- `npm run build` — production build
- `npm test` — Jest in watch mode via react-scripts; run a single file with `npm test -- Card` or a single test with `npm test -- -t "test name"` (no test files currently exist)
- No standalone lint script; ESLint (`react-app` config) runs through react-scripts during start/build

## Architecture

**Game logic lives on an external backend, not in this repo.** The frontend only renders state and sends moves. The backend source is the sibling repo `../triple-triade-api` (Hapi server, `src/server.js`, runs on port 3004; built with `npm run build:dev` then started with `npm start`/`npm run dev`). All API calls are in [src/redux/characterSlice.ts](src/redux/characterSlice.ts) with hardcoded URLs to `https://ttg-api.onrender.com/api/v1/marvel/*` (the deployed copy of that API); each has a commented-out `http://0.0.0.0:3004` line for running against the local backend. Three thunks:

- `getPlayerCardsThunk` — GET `/create`, fetches the player's 5-card hand
- `getEnemyCardsThunk` — POST `/game/start`, fetches the enemy hand
- `launchGameThunk` — POST `/game` with the full game state + player's move; the server computes captures, plays the enemy (AI) move, and returns the updated board

**Single Redux slice** (`characters`) holds all game state. Two parallel board representations, both 9-element arrays where `0` = empty cell:

- `serverBoard` — raw server format (`{poke, holder}` objects), sent back verbatim in the next `launchGameThunk` request
- `board` — UI format, server items flattened to `{...poke, holder}` (a `Character` with `holder`)

The server calls cards "pokes". `holder` is `"p1"` (player, blue) or `"p2"` (enemy, red) and drives card coloring via the matching CSS-module class in [src/components/Card/index.tsx](src/components/Card/index.tsx).

**Turn flow** ([src/pages/Game/index.tsx](src/pages/Game/index.tsx)): player selects a card in `Hand` → clicks an empty `Board` cell → local optimistic updates (`setBoard`, `setPlayerCards`) → `launchGameThunk` posts the move (position is `index + 1`, 1-based) → the reducer applies the response, then `setGameBoard` is dispatched after a 500ms delay so capture recoloring reads as an animation step. When the response's `move === null` the game is over: the reducer computes scores from `holder` counts plus remaining hand sizes, sets `winner` (`"blue"` / `"red"` / `"draw"`), and opens the end-of-game modal (rendered globally in [src/App.tsx](src/App.tsx)).

**Card side values**: components read `character.attacks[1]` (an array of the four side numbers), not the `values` object on the `Character` interface ([src/interfaces/index.ts](src/interfaces/index.ts)).

**Mobile**: viewports narrower than 667px get [ModalMobile](src/components/UI/ModalMobile/index.tsx) (a "rotate your device" screen) instead of the game, via the `useMediaQuery` hook.

## Gotchas

- `src/assets/` is git-ignored (see `.gitignore`) but its images are referenced by tracked CSS ([src/index.css](src/index.css), [src/pages/Game/Game.module.css](src/pages/Game/Game.module.css)) and the Home page — a fresh clone will not build without restoring those images locally.
- "Reset game" and the modal's "Try again" work by `window.location.reload()`; there is no in-Redux reset action.
- The backend on Render free tier may cold-start; the first card fetch can be slow (the `Preloader` in `Hand` covers this).
