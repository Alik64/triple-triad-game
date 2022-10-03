import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Character } from "../interfaces";
import { RootState } from "./store";

export interface InitialStateType {
  board: (Character | number)[];
  serverBoard: (Character | number)[];
  playerCards: Character[];
  enemyCards: Character[];
  playerScore: number;
  enemyScore: number;
  winner: string;
  isLoading: boolean;
  isModalOpen: boolean;
  error: string;
}
type JSONResponse = {
  data: Array<Character>;
  errors?: Array<{ message: string }>;
};

const initialState: InitialStateType = {
  board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  serverBoard: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  playerCards: [],
  enemyCards: [],
  playerScore: 0,
  enemyScore: 0,
  winner: "",
  isLoading: false,
  isModalOpen: false,
  error: "",
};
export const getPlayerCardsThunk = createAsyncThunk(
  "characters/getPlayerCards",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "https://ttgapi.herokuapp.com/api/v1/marvel/create"
        // "http://0.0.0.0:3004/api/v1/marvel/create"
      );
      const playerCards: JSONResponse = await response.json();
      return playerCards.data;
    } catch (error) {
      return rejectWithValue({ message: "The error" });
    }
  }
);
export const getEnemyCardsThunk: any = createAsyncThunk(
  "characters/getEnemyCards",
  async (player, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "https://ttgapi.herokuapp.com/api/v1/marvel/game/start",
        // "http://0.0.0.0:3004/api/v1/marvel/game/start",

        {
          method: "POST",
          body: JSON.stringify({
            characters: player,
          }),
        }
      );
      const enemyCards: JSONResponse = await response.json();
      return enemyCards.data;
    } catch (error) {
      return rejectWithValue({ message: "The error" });
    }
  }
);

export const launchGameThunk = createAsyncThunk(
  "characters/launchGame",
  async (params: {}, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "https://ttgapi.herokuapp.com/api/v1/marvel/game",
        // "http://0.0.0.0:3004/api/v1/marvel/game",
        {
          method: "POST",
          body: JSON.stringify(params),
        }
      );
      const nextStep = await response.json();
      return nextStep;
    } catch (error) {
      return rejectWithValue({ message: "The error" });
    }
  }
);

const characterSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {
    toggleModal: (state: InitialStateType) => {
      state.isModalOpen = !state.isModalOpen;
    },
    setBoard: (state: InitialStateType, action: any) => {
      state.board[action.payload.index] = action.payload.playerCard;
    },
    setPlayerCards: (state: InitialStateType, action: any) => {
      state.playerCards = state.playerCards.filter(
        (item) => item.id !== action.payload
      );
    },
  },
  extraReducers: {
    //getPlayerCards
    [getPlayerCardsThunk.pending.type]: (state: InitialStateType) => {
      state.isLoading = true;
    },
    [getPlayerCardsThunk.fulfilled.type]: (
      state: InitialStateType,
      action: PayloadAction<Character[]>
    ) => {
      state.playerCards = action.payload;
      state.isLoading = false;
    },
    [getPlayerCardsThunk.rejected.type]: (
      state: InitialStateType,
      action: PayloadAction<string>
    ) => {
      console.log(action);
      state.error = action.payload;
      state.isLoading = false;
    },
    //getEnemyCards
    [getEnemyCardsThunk.pending.type]: (state: InitialStateType) => {
      state.isLoading = true;
    },
    [getEnemyCardsThunk.fulfilled.type]: (
      state: InitialStateType,
      action: PayloadAction<Character[]>
    ) => {
      state.enemyCards = action.payload;
      state.isLoading = false;
    },
    [getEnemyCardsThunk.rejected.type]: (
      state: InitialStateType,
      action: PayloadAction<string>
    ) => {
      console.log(action);
      state.error = action.payload;
      state.isLoading = false;
    },
    //LaunchGame
    [launchGameThunk.pending.type]: (state: InitialStateType) => {
      state.isLoading = true;
    },
    [launchGameThunk.fulfilled.type]: (
      state: InitialStateType,
      action: any
    ) => {
      state.isLoading = false;
      state.serverBoard = action.payload.board;
      state.board = action.payload.oldBoard.map((item: any) =>
        typeof item === "object" ? { ...item.poke, holder: item.holder } : item
      );
      if (action.payload.move !== null) {
        state.enemyCards = state.enemyCards.filter(
          (item) => item.id !== action.payload.move.poke.id
        );

        state.board = action.payload.board.map((item: any) =>
          typeof item === "object"
            ? { ...item.poke, holder: item.holder }
            : item
        );

        state.playerScore = action.payload.board.reduce(
          (acc: number, item: any) => {
            if (item.holder === "p1") {
              acc++;
            }
            return acc;
          },
          0
        );

        state.enemyScore = action.payload.board.reduce(
          (acc: number, item: any) => {
            if (item.holder === "p2") {
              acc++;
            }
            return acc;
          },
          0
        );
      } else {
        const nbP1 = action.payload.board.reduce((acc: number, item: any) => {
          if (item.holder === "p1") {
            acc++;
          }
          return acc;
        }, 0);
        const nbP2 = action.payload.board.reduce((acc: number, item: any) => {
          if (item.holder === "p2") {
            acc++;
          }
          return acc;
        }, 0);
        state.playerScore = nbP1 + action.payload.hands.p1.pokes.length;
        state.enemyScore = nbP2 + action.payload.hands.p2.pokes.length;

        if (state.playerScore > state.enemyScore) {
          state.winner = "blue";
        } else if (state.playerScore < state.enemyScore) {
          state.winner = "red";
        } else if (state.playerScore === state.enemyScore) {
          state.winner = "draw";
        }
        state.isModalOpen = true;
      }
    },
    [launchGameThunk.rejected.type]: (state: InitialStateType, action: any) => {
      console.log(action);
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { toggleModal, setBoard, setPlayerCards } = characterSlice.actions;
export const playerCardSelector = (state: RootState) =>
  state.characters.playerCards;
export const enemyCardsSelector = (state: RootState) =>
  state.characters.enemyCards;
export const winnerSelector = (state: RootState) => state.characters.winner;
export const isLoadingSelector = (state: RootState) =>
  state.characters.isLoading;
export const boardSelector = (state: RootState) => state.characters.board;
export const serverBoardSelector = (state: RootState) =>
  state.characters.serverBoard;
export const playerScoreSelector = (state: RootState) =>
  state.characters.playerScore;
export const enemyScoreSelector = (state: RootState) =>
  state.characters.enemyScore;
export const isModalOpenSelector = (state: RootState) =>
  state.characters.isModalOpen;

export default characterSlice.reducer;
