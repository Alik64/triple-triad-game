import { Character } from "../interfaces";
import TripleTriadSolver, {
  EngineBoard,
  EngineCard,
  HandCfg,
  Owner,
  isCard,
} from "./solver";

// TypeScript port of ../triple-triade-api/src/solver/TripleTriadPlayer.js.
// Differences from the original, both in generateAiHand: the enemy hand
// excludes the player's cards (the old filter could deal duplicates), and
// the rating window widens instead of looping forever when candidates < 5.

export const randomInt = (from: number, to: number): number =>
  ((Math.random() * (to - from)) | 0) + from;

/** `count` distinct random items from `pool`. */
export const pickRandom = <T>(pool: T[], count: number): T[] => {
  const taken = new Set<number>();
  while (taken.size < count && taken.size < pool.length) {
    taken.add(Math.floor(Math.random() * pool.length));
  }
  return Array.from(taken, (i) => pool[i]);
};

/** A hand card as the API layer builds it, before engine normalisation. */
export interface RawHandCard {
  id: string | number;
  hits: number[];
  poke: Character;
}

export type Hand = HandCfg | RawHandCard[];

export interface MoveInput extends RawHandCard {
  position: number;
  owner?: Owner;
  holder?: Owner;
  rate?: number;
}

export interface PlayParams {
  ai: boolean;
  currentPlayer: Owner;
  hands: Record<Owner, Hand>;
  move?: MoveInput | null;
  board: EngineBoard | null;
}

export interface PlayResult {
  move: EngineCard | null;
  board: EngineBoard;
  hands: Record<Owner, HandCfg>;
}

const solver = new TripleTriadSolver();

const EMPTY_BOARD: EngineBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];

class TripleTriadPlayer {
  private globalHandIdSuffix = 1;

  /** Applies one move (the player's, or the AI's when `ai` is true). */
  play({ ai, currentPlayer, hands, move, board }: PlayParams): PlayResult {
    const normHands = this.normaliseHands(hands);
    const normBoard = board ? this.normaliseBoard(board) : [...EMPTY_BOARD];

    const result = ai
      ? this.aiMove({ currentPlayer, hands: normHands, board: normBoard })
      : this.playerMove({ currentPlayer, move: move ?? null, board: normBoard });

    let outHands = normHands;
    if (result.move) {
      const playedId = result.move.id;
      outHands = {
        ...normHands,
        [currentPlayer]: {
          ...normHands[currentPlayer],
          pokes: normHands[currentPlayer].pokes.filter(
            (p) => p.id !== playedId
          ),
        },
      };
    }

    return { move: result.move, board: result.board, hands: outHands };
  }

  private aiMove({
    currentPlayer,
    hands,
    board,
  }: {
    currentPlayer: Owner;
    hands: Record<Owner, HandCfg>;
    board: EngineBoard;
  }) {
    const { game } = solver.solve(board, hands, currentPlayer);

    return this.playerMove({
      currentPlayer,
      move: game.length ? game[0] : null,
      board,
    });
  }

  private playerMove({
    currentPlayer,
    move,
    board,
  }: {
    currentPlayer: Owner;
    move: MoveInput | EngineCard | null;
    board: EngineBoard;
  }): { move: EngineCard | null; board: EngineBoard } {
    if (
      !move ||
      move.position === undefined ||
      isCard(board[move.position])
    ) {
      return { move: null, board };
    }

    const owner = move.owner ?? currentPlayer;
    const card: EngineCard = {
      ...move,
      owner,
      holder: owner,
      rate: move.rate ?? solver.pokeRate(move.hits),
    };

    const { board: newBoard } = solver.putCard(board, card);
    return { move: card, board: newBoard };
  }

  private normaliseHands(hands: Record<Owner, Hand>): Record<Owner, HandCfg> {
    return {
      p1: this.normaliseHand(hands.p1, "p1"),
      p2: this.normaliseHand(hands.p2, "p2"),
    };
  }

  private normaliseHand(hand: Hand, owner: Owner): HandCfg {
    const pokes = Array.isArray(hand)
      ? hand.map(({ id, hits, poke }) => ({
          id,
          hits,
          owner,
          holder: owner,
          rate: solver.pokeRate(hits),
          poke,
        }))
      : hand.pokes;
    return { owner, pokes };
  }

  private normaliseBoard(board: EngineBoard): EngineBoard {
    return board.map((cell, idx) => {
      if (!isCard(cell)) return cell;
      return {
        ...cell,
        holder: cell.holder ?? cell.owner,
        position: cell.position ?? idx,
        rate: cell.rate ?? solver.pokeRate(cell.hits),
      };
    });
  }

  /** Average rating of a deck (`attacks[0]` per card). */
  deckRate(deck: Character[]): number {
    const rates = deck
      .map((p) => p.attacks[0] as number)
      .sort((a, b) => a - b)
      .slice(-9);
    return (rates.reduce((sum, rate) => sum + rate, 0) / rates.length) | 0;
  }

  /** 5 cards strength-matched to the opponent's deck, never sharing its cards. */
  generateAiHand(opponentDeck: Character[], allPokes: Character[]): Character[] {
    const rate = this.deckRate(opponentDeck);
    const opponentIds = new Set(opponentDeck.map((p) => p.id));
    const available = allPokes.filter((p) => !opponentIds.has(p.id));

    for (let range = 20; range <= 1000; range += 10) {
      const candidates = available.filter(
        (p) =>
          (p.attacks[0] as number) >= rate - range &&
          (p.attacks[0] as number) <= rate + range
      );
      if (candidates.length >= 5) return pickRandom(candidates, 5);
    }

    return pickRandom(available, 5);
  }

  /** Wraps raw characters as hand cards with per-game unique ids. */
  pokesToHandCfg(pokes: Character[]): RawHandCard[] {
    const suffix = ++this.globalHandIdSuffix * 10;
    const idHead = `${Date.now()}${randomInt(1000, 10000)}${randomInt(
      suffix,
      suffix * 10
    )}`;
    return pokes.map((p, idx) => ({
      id: `${idHead}_${idx}`,
      hits: p.attacks[1] as number[],
      poke: p,
    }));
  }
}

export default TripleTriadPlayer;
