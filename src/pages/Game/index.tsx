import React, { useEffect, useState } from "react";

import Hand from "../../components/Hand";
import Board from "../../components/Board";

import { useGameStore } from "../../store/gameStore";

import cn from "classnames";
import s from "./Game.module.css";
import useMediaQuery from "../../utils/hooks/useMediaQuery";
import ModalMobile from "../../components/UI/ModalMobile";

const Game: React.FC = () => {
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

  const [background, setBackground] = useState<boolean>(true);
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

  if (!matches && window.innerHeight > 500) {
    return <ModalMobile />;
  }
  return (
    <div className={s.page}>
      <div className={cn(s.root, { [s.board2]: !background })}>
        <Hand
          side="left"
          characters={enemy}
          disabled
          score={enemyScore}
          loading={isInitializing}
        />

        <Board board={board} onClick={handleCellClick} />

        <Hand
          side="right"
          characters={player}
          score={playerScore}
          loading={isInitializing}
          glowing={!isLoading}
          disabled={isLoading}
          onClick={setChosenCardId}
        />
      </div>

      {error && <p className={s.error}>{error}</p>}

      <section className={s.buttonContainer}>
        <button
          onClick={() => setBackground((prev: boolean) => !prev)}
          className={cn("btn", s.bgBtn)}
        >
          <span className="btn_span"></span>Change background
        </button>
        <button onClick={initGame} className={cn("btn", s.resetBtn)}>
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
