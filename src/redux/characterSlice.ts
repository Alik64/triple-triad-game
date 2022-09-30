import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Character } from "../interfaces";

interface initialStateType {
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

const characterSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {},
  extraReducers: {},
});

export default characterSlice.reducer;
