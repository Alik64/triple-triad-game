import { create } from "zustand";
import { Character } from "../interfaces";
import { dealPlayerHand, dealEnemyHand, playGame } from "../engine/localApi";
import { EngineBoard, EngineCell, Owner, isCard } from "../engine/solver";

type Winner = "" | "blue" | "red" | "draw";

/** Board cell as the UI consumes it: the card flattened with its holder. */
export type BoardCell = Character | number;

interface GameState {
  board: BoardCell[];
  /** Raw engine format, passed back verbatim on the next turn. */
  serverBoard: EngineBoard;
  playerCards: Character[];
  enemyCards: Character[];
  playerScore: number;
  enemyScore: number;
  winner: Winner;
  isLoading: boolean;
  isModalOpen: boolean;
  error: string;
  /** Bumped on every restart so a pending turn from a dead game gets dropped. */
  gameId: number;
  initGame: () => void;
  playTurn: (cardId: string | number, cellIndex: number) => Promise<void>;
  closeModal: () => void;
}

const EMPTY_BOARD: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];

const initialState = {
  board: [...EMPTY_BOARD] as BoardCell[],
  serverBoard: [...EMPTY_BOARD] as EngineBoard,
  playerCards: [] as Character[],
  enemyCards: [] as Character[],
  playerScore: 0,
  enemyScore: 0,
  winner: "" as Winner,
  isLoading: false,
  isModalOpen: false,
  error: "",
};

const toBoardCell = (cell: EngineCell): BoardCell =>
  isCard(cell) ? { ...cell.poke, holder: cell.holder } : cell;

const countHolder = (board: EngineBoard, holder: Owner): number =>
  board.filter((cell) => isCard(cell) && cell.holder === holder).length;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const useGameStore = create<GameState>()((set, get) => ({
  ...initialState,
  gameId: 0,

  closeModal: () => set({ isModalOpen: false }),

  initGame: () => {
    // the engine is local and synchronous: hands are dealt instantly
    const playerCards = dealPlayerHand();
    const enemyCards = dealEnemyHand(playerCards);

    // every card you own (in hand or on the board) is worth one point
    set({
      ...initialState,
      gameId: get().gameId + 1,
      playerCards,
      enemyCards,
      playerScore: playerCards.length,
      enemyScore: enemyCards.length,
    });
  },

  playTurn: async (cardId, cellIndex) => {
    const { board, serverBoard, playerCards, enemyCards, isLoading, gameId } =
      get();
    const playerCard = playerCards.find((card) => card.id === cardId);

    if (isLoading || !playerCard || typeof board[cellIndex] === "object") {
      return;
    }

    // optimistic placement; captures follow with the engine result
    set({
      isLoading: true,
      board: board.map((cell, index) =>
        index === cellIndex ? { ...playerCard, holder: "p1" } : cell
      ),
      playerCards: playerCards.filter((card) => card.id !== cardId),
    });

    try {
      const turn = playGame({
        hands: { p1: playerCards, p2: enemyCards },
        board: serverBoard,
        move: { id: playerCard.id, position: cellIndex },
      });

      // the player's move with its captures applied
      set({ board: turn.oldBoard.map(toBoardCell), serverBoard: turn.board });

      if (turn.move === null) {
        // board is full: remaining cards in hand still count as points
        const playerScore =
          countHolder(turn.board, "p1") + turn.hands.p1.pokes.length;
        const enemyScore =
          countHolder(turn.board, "p2") + turn.hands.p2.pokes.length;

        set({
          board: turn.board.map(toBoardCell),
          playerScore,
          enemyScore,
          winner:
            playerScore > enemyScore
              ? "blue"
              : playerScore < enemyScore
              ? "red"
              : "draw",
          isModalOpen: true,
          isLoading: false,
        });
        return;
      }

      // let the player's captures show before the enemy answers
      await delay(500);
      if (get().gameId !== gameId) return; // the game was restarted meanwhile

      const enemyId = turn.move.poke.id;
      const remainingEnemyCards = enemyCards.filter(
        (card) => card.id !== enemyId
      );

      set({
        board: turn.board.map(toBoardCell),
        enemyCards: remainingEnemyCards,
        playerScore: countHolder(turn.board, "p1") + get().playerCards.length,
        enemyScore: countHolder(turn.board, "p2") + remainingEnemyCards.length,
        isLoading: false,
      });
    } catch {
      set({
        error: "Something went wrong in the game engine. Reset the game.",
        isLoading: false,
      });
    }
  },
}));
