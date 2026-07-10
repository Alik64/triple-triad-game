import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Hand from "../../components/Hand";
import Board from "../../components/Board";

import { useGameStore } from "../../store/gameStore";

import cn from "classnames";
import s from "./Game.module.css";
import useMediaQuery from "../../utils/hooks/useMediaQuery";
import ModalMobile from "../../components/UI/ModalMobile";
import Footer from "../../components/Footer";

const Game: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state) => state.playerCards);
  const enemy = useGameStore((state) => state.enemyCards);
  const board = useGameStore((state) => state.board);
  const playerScore = useGameStore((state) => state.playerScore);
  const enemyScore = useGameStore((state) => state.enemyScore);
  const isLoading = useGameStore((state) => state.isLoading);
  const isInitializing = useGameStore((state) => state.isInitializing);
  const error = useGameStore((state) => state.error);
  const initGame = useGameStore((state) => state.initGame);
  const playTurn = useGameStore((state) => state.playTurn);

  const [chosenCardId, setChosenCardId] = useState<number | string | null>(
    null
  );
  const matches = useMediaQuery("(min-width: 667px)");

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCellClick = (index: number) => {
    if (chosenCardId === null) return;
    playTurn(chosenCardId, index);
    setChosenCardId(null);
  };

  const isBusy = isLoading || isInitializing;
  const status = isInitializing
    ? "Dealing the cards"
    : isLoading
    ? "Enemy is thinking"
    : chosenCardId !== null
    ? "Choose a cell on the board"
    : "Pick a card from your hand";

  if (!matches && window.innerHeight > 500) {
    return <ModalMobile />;
  }
  return (
    <div className={s.page}>
      <div
        className={cn(s.status, {
          [s.statusEnemy]: isLoading,
          [s.statusBusy]: isBusy,
        })}
        role="status"
      >
        {isBusy && <span className={s.spinner} aria-hidden="true" />}
        <span className={s.statusText}>{status}</span>
      </div>

      <div className={s.arena}>
        <Hand
          side="left"
          characters={enemy}
          disabled
          score={enemyScore}
          loading={isInitializing}
          glowing={isLoading}
        />

        <Board
          board={board}
          onClick={handleCellClick}
          highlight={chosenCardId !== null && !isLoading}
        />

        <Hand
          side="right"
          characters={player}
          score={playerScore}
          loading={isInitializing}
          glowing={!isBusy}
          disabled={isLoading}
          onClick={setChosenCardId}
        />
      </div>

      {error && <p className={s.error}>{error}</p>}

      <section className={s.buttonContainer}>
        <button onClick={() => navigate("/")} className="btn">
          Home
        </button>
        <button onClick={() => navigate("/rules")} className="btn">
          See rules
        </button>
        <button onClick={initGame} className={cn("btn", s.resetBtn)}>
          Reset game
        </button>
      </section>
      <Footer />
    </div>
  );
};

export default Game;
