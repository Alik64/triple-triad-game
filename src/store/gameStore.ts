import { create } from "zustand";
import { Character } from "../interfaces";
import { getCardValues } from "../utils/getCardValues";

const API_URL =
  process.env.REACT_APP_API_URL || "https://ttg-api.onrender.com/api/v1/marvel";

type Holder = "p1" | "p2";
type Winner = "" | "blue" | "red" | "draw";

/** Board cell as the server returns it. Empty cells are numbers. */
type ServerCell = { poke: Character; holder: Holder } | number;
/** Board cell as the UI consumes it: the card flattened with its holder. */
export type BoardCell = Character | number;

interface TurnResponse {
  board: ServerCell[];
  oldBoard: ServerCell[];
  move: { poke: Character } | null;
  hands: {
    p1: { pokes: unknown[] };
    p2: { pokes: unknown[] };
  };
}

interface GameState {
  board: BoardCell[];
  serverBoard: ServerCell[];
  playerCards: Character[];
  enemyCards: Character[];
  playerScore: number;
  enemyScore: number;
  winner: Winner;
  isInitializing: boolean;
  isLoading: boolean;
  isModalOpen: boolean;
  error: string;
  /** Bumped on every restart so a pending turn from a dead game gets dropped. */
  gameId: number;
  initGame: () => Promise<void>;
  playTurn: (cardId: string | number, cellIndex: number) => Promise<void>;
  closeModal: () => void;
}

const EMPTY_BOARD: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];

const initialState = {
  board: [...EMPTY_BOARD] as BoardCell[],
  serverBoard: [...EMPTY_BOARD] as ServerCell[],
  playerCards: [] as Character[],
  enemyCards: [] as Character[],
  playerScore: 0,
  enemyScore: 0,
  winner: "" as Winner,
  isInitializing: false,
  isLoading: false,
  isModalOpen: false,
  error: "",
};

const toBoardCell = (cell: ServerCell): BoardCell =>
  typeof cell === "object" ? { ...cell.poke, holder: cell.holder } : cell;

const countHolder = (board: ServerCell[], holder: Holder): number =>
  board.filter((cell) => typeof cell === "object" && cell.holder === holder)
    .length;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const post = async <T>(path: string, body: object): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.json();
};

export const useGameStore = create<GameState>()((set, get) => ({
  ...initialState,
  gameId: 0,

  closeModal: () => set({ isModalOpen: false }),

  initGame: async () => {
    const gameId = get().gameId + 1;
    set({ ...initialState, gameId, isInitializing: true });
    try {
      const player: { data: Character[] } = await fetch(
        `${API_URL}/create`
      ).then((res) => res.json());

      // the enemy hand is generated from the player's, to exclude his cards
      const enemy: { data: Character[] } = await post("/game/start", {
        characters: player.data,
      });

      if (get().gameId !== gameId) return; // a newer restart won meanwhile

      // every card you own (in hand or on the board) is worth one point
      set({
        playerCards: player.data,
        enemyCards: enemy.data,
        playerScore: player.data.length,
        enemyScore: enemy.data.length,
        isInitializing: false,
      });
    } catch {
      if (get().gameId !== gameId) return;
      set({
        error: "Could not reach the game server. Try again later.",
        isInitializing: false,
      });
    }
  },

  playTurn: async (cardId, cellIndex) => {
    const { board, serverBoard, playerCards, enemyCards, isLoading, gameId } =
      get();
    const playerCard = playerCards.find((card) => card.id === cardId);

    if (isLoading || !playerCard || typeof board[cellIndex] === "object") {
      return;
    }

    // optimistic placement; captures arrive with the server response
    set({
      isLoading: true,
      board: board.map((cell, index) =>
        index === cellIndex ? { ...playerCard, holder: "p1" } : cell
      ),
      playerCards: playerCards.filter((card) => card.id !== cardId),
    });

    try {
      const turn = await post<TurnResponse>("/game", {
        hands: { p1: playerCards, p2: enemyCards },
        currentPlayer: "p1",
        board: serverBoard,
        move: {
          id: playerCard.id,
          hits: getCardValues(playerCard),
          position: cellIndex + 1, // the server expects a 1-based position
        },
      });

      if (get().gameId !== gameId) return; // the game was restarted meanwhile

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
      if (get().gameId !== gameId) return;

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
        error: "The game server did not answer. Try again.",
        isLoading: false,
      });
    }
  },
}));
