import { Character } from "../interfaces";

// TypeScript port of ../triple-triade-api/src/solver/TripleTriadSolver.js —
// same algorithm, same depth caps, so the AI plays identically to the server.

export type Owner = "p1" | "p2";

/** A card as the engine sees it. `owner` never changes; `holder` flips on capture. */
export interface EngineCard {
  id: string | number;
  /** Side values, FF8 cross: [top, right, bottom, left]. */
  hits: number[];
  owner: Owner;
  holder: Owner;
  rate: number;
  poke: Character;
  position?: number;
}

/** Flat 3×3 board; numbers (0) are empty cells. */
export type EngineCell = EngineCard | number;
export type EngineBoard = EngineCell[];

export interface HandCfg {
  owner: Owner;
  pokes: EngineCard[];
}

export const isCard = (cell: EngineCell): cell is EngineCard =>
  typeof cell === "object";

const BOARD_SIZE = 3;
const MIN_RATE = -1000000;

export interface SolveResult {
  rate: number;
  game: EngineCard[];
}

class TripleTriadSolver {
  /** Best move sequence for `currentPlayer`; minimax, depth auto-capped at 4–5. */
  solve(
    board: EngineBoard,
    hands: Record<Owner, HandCfg>,
    currentPlayer: Owner,
    maxDepth = 5
  ): SolveResult {
    const empty = this.emptyCells(board);

    if (empty.length > 6 && maxDepth > 5) maxDepth = 5;
    if (empty.length >= 8 && maxDepth > 4) maxDepth = 4;

    const enemyId: Owner = currentPlayer === "p1" ? "p2" : "p1";

    return this.turn(
      board,
      empty,
      hands[currentPlayer].pokes,
      hands[enemyId].pokes,
      maxDepth
    );
  }

  private turn(
    board: EngineBoard,
    emptyCells: number[],
    playerHand: EngineCard[],
    enemyHand: EngineCard[],
    maxDepth = 5,
    depth = 0,
    enemyMove = false
  ): SolveResult {
    let rate = MIN_RATE;
    let game: EngineCard[] = [];

    const hand = enemyMove ? enemyHand : playerHand;

    if (depth < maxDepth) {
      for (const position of emptyCells) {
        const newEmptyCells = emptyCells.filter((pos) => pos !== position);

        for (const oldPoke of hand) {
          const newPoke = { ...oldPoke, position };
          const newHand = hand.filter((poke) => poke !== oldPoke);

          const { board: newBoard, rate: hitRate } = this.putCard(
            board,
            newPoke,
            enemyMove
          );

          let result: SolveResult = { rate: MIN_RATE, game: [] };

          if (newEmptyCells.length && depth < maxDepth - 1) {
            result = this.turn(
              newBoard,
              newEmptyCells,
              enemyMove ? playerHand : newHand,
              enemyMove ? newHand : enemyHand,
              maxDepth,
              depth + 1,
              !enemyMove
            );
          }

          const newRate = (result.game.length ? result.rate : 0) + hitRate;

          if (newRate > rate) {
            rate = newRate;
            game = [{ ...newPoke }, ...result.game];
          }
        }
      }
    }

    return { rate, game };
  }

  /**
   * Places a card and applies the capture rule: the placed card's facing
   * value must strictly beat the neighbour's opposing value to flip it.
   * Returns a new board; the input is not mutated.
   */
  putCard(prevBoard: EngineBoard, cardIn: EngineCard, enemyMove = false) {
    const board = [...prevBoard];
    const card = { ...cardIn };
    const cardPos = card.position as number;
    const i = (cardPos / BOARD_SIZE) | 0;
    const j = cardPos - i * BOARD_SIZE;

    board[cardPos] = card;

    let rate = 0;
    const beaten: number[] = [];

    // [my side index, their opposing side index] per neighbour
    const hits = [
      { isOk: i > 0, hitOwn: 0, hitEnemy: 2, pos: cardPos - BOARD_SIZE },
      { isOk: j < BOARD_SIZE - 1, hitOwn: 1, hitEnemy: 3, pos: cardPos + 1 },
      {
        isOk: i < BOARD_SIZE - 1,
        hitOwn: 2,
        hitEnemy: 0,
        pos: cardPos + BOARD_SIZE,
      },
      { isOk: j > 0, hitOwn: 3, hitEnemy: 1, pos: cardPos - 1 },
    ];

    for (const hit of hits) {
      const neighbour = hit.isOk ? board[hit.pos] : 0;
      if (
        isCard(neighbour) &&
        neighbour.holder !== card.owner &&
        neighbour.hits[hit.hitEnemy] < card.hits[hit.hitOwn]
      ) {
        rate += neighbour.rate;
        board[hit.pos] = { ...neighbour, holder: card.owner };
        beaten.push(hit.pos);
      }
    }

    // the search maximises the mover's score, so an enemy gain counts negative
    if (enemyMove) rate = -rate;

    return { board, rate, beaten };
  }

  emptyCells(board: EngineBoard): number[] {
    const empty: number[] = [];
    board.forEach((cell, idx) => {
      if (!isCard(cell)) empty.push(idx);
    });
    return empty;
  }

  pokeRate(hits: number[]): number {
    return hits[0] + hits[1] + hits[2] + hits[3] + 1000;
  }
}

export default TripleTriadSolver;
