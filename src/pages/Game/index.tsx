import React, { useCallback, useEffect, useState, useTransition } from "react";

import Hand from "../../components/Hand";
import Board from "../../components/Board";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  setBoard,
  setPlayerCards,
  boardSelector,
  playerCardSelector,
  playerScoreSelector,
  enemyCardsSelector,
  enemyScoreSelector,
  serverBoardSelector,
  isLoadingSelector,
  getPlayerCardsThunk,
  getEnemyCardsThunk,
  launchGameThunk,
  gameSelector,
  setGameBoard,
} from "../../redux/characterSlice";

import cn from "classnames";
import s from "./Game.module.css";
import useMediaQuery from "../../utils/hooks/useMediaQuery";
import ModalMobile from "../../components/UI/ModalMobile";

const Game: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const player = useSelector(playerCardSelector);
  const enemy = useSelector(enemyCardsSelector);

  const isLoading = useSelector(isLoadingSelector);

  const board = useSelector(boardSelector);
  const serverBoard = useSelector(serverBoardSelector);

  const playerScore = useSelector(playerScoreSelector);
  const enemyScore = useSelector(enemyScoreSelector);

  const [background, setBackground] = useState<boolean>(true);
  const [chosenCardId, setChosenCardId] = useState<number | string | null>(
    null
  );
  const matches = useMediaQuery("(min-width: 667px)");

  useEffect(() => {
    dispatch(getPlayerCardsThunk());
    dispatch(getEnemyCardsThunk(player));
  }, [dispatch]);

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

    dispatch(setPlayerCards(chosenCardId));
    dispatch(setBoard({ index, playerCard }));
    setChosenCardId(null);

    const launchGamePromise = new Promise((res, rej) => {
      res(dispatch(launchGameThunk(params)));
    });

    launchGamePromise.then(() => {
      if (player.length > 1) {
        setTimeout(() => {
          dispatch(setGameBoard());
        }, 500);
      }
    });
  };

  if (!matches && window.innerHeight > 500) {
    return <ModalMobile />;
  }
  return (
    <div className={cn(s.root, { [s.board2]: !background })}>
      <Hand
        side="left"
        characters={enemy}
        disabled
        score={enemyScore}
        shining
      />

      <Board board={board} onClick={handleCellClick} />

      <Hand
        shining={isLoading}
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
      <h5 className={s.author}>
        Made with ⚛️ by{" "}
        <a href="https://www.linkedin.com/in/albert-64/">Albert</a>
      </h5>
    </div>
  );
};

export default Game;
