import charactersJson from "./characters.json";
import { Character } from "../interfaces";
import TripleTriadPlayer, { pickRandom } from "./player";
import { EngineBoard, EngineCard, Owner, isCard } from "./solver";

// In-browser replacement for the three endpoints of ../triple-triade-api
// (see that repo's src/server.js). Same request/response shapes, except
// `position` is 0-based here (the HTTP API was 1-based).

/**
 * Snapshot of the Marvel API catalog (2022) trimmed to the fields the app
 * uses; the API is gone but the images still hotlink to Marvel's CDN.
 */
const catalog = charactersJson as Character[];

export interface GameMove {
  /** Character id of the card the player plays. */
  id: string | number;
  /** Board cell, 0-based. */
  position: number;
}

export interface GamePayload {
  hands: { p1: Character[]; p2: Character[] };
  board: EngineBoard;
  move: GameMove;
}

export interface TurnResult {
  /** Board after the AI answered. */
  board: EngineBoard;
  /** Board right after the player's move (captures applied, AI not yet played). */
  oldBoard: EngineBoard;
  /** The AI's move, or null when the board is full: game over. */
  move: EngineCard | null;
  hands: Record<Owner, { pokes: { poke: Character }[] }>;
}

/** GET /create — the player's 5-card hand. */
export const dealPlayerHand = (): Character[] => pickRandom(catalog, 5);

/** POST /game/start — enemy hand strength-matched to the player's. */
export const dealEnemyHand = (playerHand: Character[]): Character[] =>
  new TripleTriadPlayer().generateAiHand(playerHand, catalog);

/** POST /game — applies the player's move, then the AI answers. */
export const playGame = ({ hands, board, move }: GamePayload): TurnResult => {
  const game = new TripleTriadPlayer();

  const p1 = game.pokesToHandCfg(hands.p1);
  const p2 = game.pokesToHandCfg(hands.p2);

  // the payload references the card by its character id; hits come from the hand
  const handCard = p1.find((item) => item.poke.id === move.id);

  const boardIsEmpty = board.every((cell) => !isCard(cell));

  const playerTurn = game.play({
    ai: false,
    currentPlayer: "p1",
    hands: { p1, p2 },
    move: handCard ? { ...handCard, position: move.position } : null,
    board: boardIsEmpty ? null : board,
  });

  const aiTurn = game.play({
    ai: true,
    currentPlayer: "p2",
    hands: playerTurn.hands,
    board: playerTurn.board,
  });

  return { ...aiTurn, oldBoard: playerTurn.board };
};
