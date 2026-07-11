# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Triple Triad (the FF8 card game) built with Create React App + TypeScript, using Marvel characters as cards. Deployed on Netlify at <https://triple-triad.netlify.app/>. Game rules are described in README.md.

Deployment is git-connected: pushing to `main` triggers a Netlify build (settings in `netlify.toml`: `CI=false` because CRA turns ESLint warnings into errors under CI, Node 22, publish `build/`). `public/_redirects` provides the SPA fallback.

## Commands

- `npm start` — dev server
- `npm run build` — production build
- `npm test` — Jest in watch mode via react-scripts; run a single file with `npm test -- engine` or a single test with `npm test -- -t "test name"`. CI form: `CI=true npm test -- --watchAll=false`. Tests live in [src/engine/engine.test.ts](src/engine/engine.test.ts)
- No standalone lint script; ESLint (`react-app` config) runs through react-scripts during start/build

## Architecture

**The whole game runs in the browser — there is no backend.** Everything lives in [src/engine/](src/engine/):

- [solver.ts](src/engine/solver.ts) — minimax AI (`solve`, depth auto-capped at 4–5) and the capture rule (`putCard`: a placed card flips an adjacent enemy card when its facing value strictly beats the neighbor's opposing value)
- [player.ts](src/engine/player.ts) — orchestration: hand/board normalisation, move application, AI-hand generation (strength-matched to the player's deck, never sharing its cards)
- [localApi.ts](src/engine/localApi.ts) — facade with the three entry points the store uses: `dealPlayerHand()`, `dealEnemyHand(playerHand)`, `playGame({hands, board, move})` (positions are 0-based)
- [characters.json](src/engine/characters.json) — 628-character catalog, a trimmed snapshot of the Marvel API (dead since late 2025); regenerate-from-source lives in git history, but the source repo `../triple-triade-api` is no longer needed at runtime

The engine is a TypeScript port of the old backend (sibling repo `../triple-triade-api`, formerly deployed on Render); it calls cards "pokes" — a heritage of its Pokémon origins. Keep engine behavior aligned with its tests when touching it.

**Single Zustand store** ([src/store/gameStore.ts](src/store/gameStore.ts)) holds all game state and the game actions (`initGame`, `playTurn`, `closeModal`). Two parallel board representations, both 9-element arrays where numbers = empty cells:

- `serverBoard` — raw engine format (`EngineCard` objects), passed back verbatim to the next `playGame` call
- `board` — UI format, engine cells flattened to `{...poke, holder}` (a `Character` with `holder`)

`holder` is `"p1"` (player, blue) or `"p2"` (enemy, red) and drives card coloring via the matching CSS-module class in [src/components/Card/index.tsx](src/components/Card/index.tsx).

**Turn flow** (`playTurn`): player selects (click) or drags a card from `Hand` → an empty `Board` cell → optimistic placement (`holder: "p1"`, card removed from hand) → `playGame()` → the result's `oldBoard` is applied (player's captures) → 500ms pause → the result's `board` is applied (AI's move) and scores update. `isLoading` stays true through the whole sequence, which is what blocks double moves. When the result's `move === null` the game is over: `winner` is set (`"blue"` / `"red"` / `"draw"`) and the end-of-game modal opens (rendered globally in [src/App.tsx](src/App.tsx)).

**Scoring rule**: every card you own is a point — board cells with your `holder` plus cards still in hand. The game therefore starts at 5–5, and `initGame`/"Reset game"/"Try again" all restart by resetting the store (no page reload).

**Card side values**: components read them via `getCardValues()` ([src/utils/getCardValues.ts](src/utils/getCardValues.ts)), which returns `character.attacks[1]` — not the `values` object on the `Character` interface ([src/interfaces/index.ts](src/interfaces/index.ts)).

**Mobile**: viewports narrower than 667px get [ModalMobile](src/components/UI/ModalMobile/index.tsx) (a "rotate your device" screen) instead of the game, via the `useMediaQuery` hook.

## Gotchas

- Card images are hotlinked from Marvel's CDN (`i.annihil.us`, `portrait_uncanny` variants) — the only remaining external dependency. The catalog is a frozen snapshot: the Marvel API it came from no longer exists, so broken images can only be fixed by editing [characters.json](src/engine/characters.json).
