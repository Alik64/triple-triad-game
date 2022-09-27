import React, { useEffect, useState } from "react";
import cn from "classnames";

import Hand from "../../components/Hand";
import { Character } from "../../interfaces";

import s from "./Game.module.css";
import Board from "../../components/Board";
import Modal from "../../components/Modal";

type JSONResponse = {
  data: Array<Character>;
  errors?: Array<{ message: string }>;
};

const Game: React.FC = () => {
  const [board, setBoard] = useState<(Character | number)[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [serverboard, setServerBoard] = useState<any[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [enemy, setEnemy] = useState<Array<Character>>([]);
  const [player, setPlayer] = useState<Array<Character>>([]);
  const [choiseCard, setChoiseCard] = useState<number | string | null>(null);
  const [background, setBackground] = useState<boolean>(true);
  const [enemyScore, setEnemyScore] = useState<number>(0);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [modal, setModal] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);

  console.log("render");

  useEffect(() => {
    const getPlayerCards = async () => {
      const response = await fetch(
        "http://localhost:3004/api/v1/marvel/create"
      );
      const characters: JSONResponse = await response.json();

      const responseEnemy = await fetch(
        "http://localhost:3004/api/v1/marvel/game/start",
        {
          method: "POST",
          body: JSON.stringify({
            characters: characters.data,
          }),
        }
      );
      const enemy: JSONResponse = await responseEnemy.json();
      setEnemy(enemy.data);
      setPlayer(characters.data);
    };
    getPlayerCards();
  }, []);

  const handleHandsClick = (id: string | number) => {
    setChoiseCard(id);
  };

  const handleCellClick = async (index: number) => {
    let params = {
      hands: {
        p1: player,
        p2: enemy,
      },
      currentPlayer: "p1",
      board: serverboard,
      move: {},
    };

    const playerCard = player.find((item) => item.id === choiseCard);

    if (playerCard) {
      params.move = {
        id: playerCard.id,
        hits: playerCard.attacks[1],
        position: index + 1,
      };
    } else {
      return;
    }

    setBoard((prevState) => {
      if (playerCard) {
        const copyState: (Character | number)[] = [...prevState];
        copyState[index] = playerCard;
        return copyState;
      }
      return prevState;
    });

    setPlayer((prevState) =>
      prevState.filter((item) => item.id !== choiseCard)
    );
    setChoiseCard(null);

    const responseGame = await fetch(
      "http://localhost:3004/api/v1/marvel/game",
      { method: "POST", body: JSON.stringify(params) }
    );
    const nextStep = await responseGame.json();
    setServerBoard(nextStep.board);
    setBoard(
      nextStep.oldBoard.map((item: any) =>
        typeof item === "object" ? { ...item.poke, holder: item.holder } : item
      )
    );

    // console.log(nextStep);

    if (nextStep.move !== null) {
      setTimeout(() => {
        setEnemy((prevState) =>
          prevState.filter((item) => item.id !== nextStep.move.poke.id)
        );
      }, 500);

      setTimeout(() => {
        setBoard(
          nextStep.board.map((item: any) =>
            typeof item === "object"
              ? { ...item.poke, holder: item.holder }
              : item
          )
        );
        setPlayerScore(
          nextStep.board.reduce((acc: number, item: any) => {
            if (item.holder === "p1") {
              acc++;
            }
            return acc;
          }, 0)
        );
        setEnemyScore(
          nextStep.board.reduce((acc: number, item: any) => {
            if (item.holder === "p2") {
              acc++;
            }
            return acc;
          }, 0)
        );
      }, 1000);
    } else {
      console.log(nextStep);
      console.log("player pokes", nextStep.hands.p1.pokes.length);
      console.log("enemy pokes", nextStep.hands.p2.pokes.length);
      const nbP1 = nextStep.board.reduce((acc: number, item: any) => {
        if (item.holder === "p1") {
          acc++;
        }
        return acc;
      }, 0);
      const nbP2 = nextStep.board.reduce((acc: number, item: any) => {
        if (item.holder === "p2") {
          acc++;
        }
        return acc;
      }, 0);
      setPlayerScore(nbP1 + nextStep.hands.p1.pokes.length);
      setEnemyScore(nbP2 + nextStep.hands.p2.pokes.length);
      endgame();
    }
  };

  function endgame() {
    console.log("player", playerScore + player.length);
    console.log("enemy", enemyScore + enemy.length);

    if (playerScore + player.length > enemyScore + enemy.length) {
      setModal(true);
      setWinner("BLUE TEAM");
    } else if (playerScore + player.length < enemyScore + enemy.length) {
      setModal(true);
      setWinner("RED TEAM");
    } else if (playerScore + player.length == enemyScore + enemy.length) {
      setModal(true);
      setWinner("DRAW");
    }
  }

  return (
    <div className={cn(s.root, { [s.board2]: background })}>
      {modal && <Modal winner={winner} />}
      <Hand side="left" characters={enemy} disabled score={enemyScore} />
      <Board board={board} onClick={handleCellClick} />
      <Hand
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
