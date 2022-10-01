import React, { useEffect, useState } from "react";

import Hand from "../../components/Hand";
import Board from "../../components/Board";
import Modal from "../../components/Modal";
import Preloader from "../../components/Preloader";

import { Character } from "../../interfaces";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  getEnemyCardsThunk,
  getPlayerCardsThunk,
  launchGameThunk,
  setBoard,
  setPlayerCards,
  toggleModal,
} from "../../redux/characterSlice";

import cn from "classnames";
import s from "./Game.module.css";

const Game: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const player = useSelector(
    (state: RootState) => state.characters.playerCards
  );

  const enemy = useSelector((state: RootState) => state.characters.enemyCards);
  const winner = useSelector((state: RootState) => state.characters.winner);
  const isLoading = useSelector(
    (state: RootState) => state.characters.isLoading
  );

  const board = useSelector((state: RootState) => state.characters.board);
  const serverBoard = useSelector(
    (state: RootState) => state.characters.serverBoard
  );
  const playerScore = useSelector(
    (state: RootState) => state.characters.playerScore
  );
  const enemyScore = useSelector(
    (state: RootState) => state.characters.enemyScore
  );
  const isModalOpen = useSelector(
    (state: RootState) => state.characters.isModalOpen
  );

  const [background, setBackground] = useState<boolean>(true);
  const [chosenCardId, setChosenCardId] = useState<number | string | null>(
    null
  );

  useEffect(() => {
    dispatch(getPlayerCardsThunk());
    dispatch(getEnemyCardsThunk(player));
  }, []);

  const handleHandsClick = (id: string | number) => {
    setChosenCardId(id);
  };

  const handleCellClick = async (index: number) => {
    let params = {
      hands: {
        p1: player,
        p2: enemy,
      },
      currentPlayer: "p1",
      board: serverBoard,
      move: {},
    };

    const playerCard = player.find((item) => item.id === chosenCardId);

    if (playerCard) {
      params.move = {
        id: playerCard.id,
        hits: playerCard.attacks[1],
        position: index + 1,
      };
    } else {
      return;
    }

    dispatch(setBoard({ index, playerCard }));
    dispatch(setPlayerCards(chosenCardId));
    setChosenCardId(null);
    dispatch(launchGameThunk(params));
  };

  return (
    <div className={cn(s.root, { [s.board2]: background })}>
      <Hand side="left" characters={enemy} disabled score={enemyScore} />
      {isModalOpen && <Modal winner={winner} />}
      <Board board={board} onClick={handleCellClick} />
      <Hand
        disabled={isLoading}
        onClick={handleHandsClick}
        side="right"
        characters={player}
        score={playerScore}
      />
      <section className={s.buttonContainer}>
        <button
          onClick={() => setBackground((prev: boolean) => !prev)}
          className={cn("btn", s.bgBtn)}
        >
          <span className="btn_span"></span>Change background
        </button>
        <button
          onClick={() => window.location.reload()}
          className={cn("btn", s.resetBtn)}
        >
          <span className={s.resetBtn_span}></span>Reset game
        </button>
      </section>
    </div>
  );
};

export default Game;
