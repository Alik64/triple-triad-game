import { AsyncThunk, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Character } from "../interfaces";

export interface initialStateType {
  board: (Character | number)[];
  serverBoard: (Character | number)[];
  playerCards: Character[];
  enemyCards: Character[];
  playerScore: number;
  enemyScore: number;
  chosenCard: number | string | null;
  winner: string;
  isLoading: boolean;
  isModalOpen: boolean;
  error: string;
}
type JSONResponse = {
  data: Array<Character>;
  errors?: Array<{ message: string }>;
};

const initialState: initialStateType = {
  board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  serverBoard: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  playerCards: [],
  enemyCards: [],
  playerScore: 0,
  enemyScore: 0,
  chosenCard: null,
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

const characterSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {
    toggleModal: (state: initialStateType) => {
      state.isModalOpen = !state.isModalOpen;
    },
  },
  extraReducers: {
    //getPlayerCards
    [getPlayerCardsThunk.pending.type]: (state: initialStateType) => {
      state.isLoading = true;
    },
    [getPlayerCardsThunk.fulfilled.type]: (
      state: initialStateType,
      action: any
    ) => {
      state.playerCards = action.payload;
      state.isLoading = false;
      console.log(action);
    },
    [getPlayerCardsThunk.rejected.type]: (
      state: initialStateType,
      action: any
    ) => {
      console.log(action);
      state.error = action.payload;
      state.isLoading = false;
    },
    //getEnemyCards
    [getEnemyCardsThunk.pending.type]: (state: initialStateType) => {
      state.isLoading = true;
    },
    [getEnemyCardsThunk.fulfilled.type]: (
      state: initialStateType,
      action: any
    ) => {
      state.enemyCards = action.payload;
      state.isLoading = false;
      console.log(action);
    },
    [getEnemyCardsThunk.rejected.type]: (
      state: initialStateType,
      action: any
    ) => {
      console.log(action);
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});
export const { toggleModal } = characterSlice.actions;
export default characterSlice.reducer;
