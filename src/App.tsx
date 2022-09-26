import React, { useEffect, useState } from "react";
import cn from "classnames";
import Card from "./components/Card";
import Hands from "./components/Hands";
import { Character } from "./interfaces";
import board1 from "./assets/board-mat.jpg";
import board2 from "./assets/board-mat2.jpg";

import s from "./App.module.css";

type JSONResponse = {
  data: Array<Character>;
  errors?: Array<{ message: string }>;
};

function App() {
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
    // console.log("params", params);

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
    setPlayerScore(
      nextStep.board.reduce((acc: number, item: any) => {
        if (item.holder === "p1") {
          acc++;
        }
        return acc;
      }, 0)
    );
    // console.log(nextStep);

    if (nextStep.move !== null) {
      setTimeout(() => {
        setEnemy((prevState) =>
          prevState.filter((item) => item.id !== nextStep.move.poke.id)
        );
        setEnemyScore(
          nextStep.board.reduce((acc: number, item: any) => {
            if (item.holder === "p2") {
              acc++;
            }
            return acc;
          }, 0)
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
      }, 1000);
    } else {
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

      calculateResult(nbP1, nbP2);
    }
  };

  function calculateResult(player1: any, player2: any) {
    setPlayerScore(player1);
    setEnemyScore(player2 + enemy.length);

    console.log("P1", player, "P2", enemy);
  }

  return (
    <div className={cn(s.root, { [s.board2]: background })}>
      <Hands side="left" characters={enemy} disabled />
      <div className={s.enemyScore}>
        <span>Score:</span>
        <div>{enemyScore}</div>
      </div>
      <div className={s.board}>
        {board.map((item, index) => {
          // console.log("item", item);
          if (typeof item === "object") {
            return (
              <Card
                holder={item?.holder}
                key={index}
                className={s.cellCard}
                id={item.id}
                image={item.thumbnail.path}
                values={item.attacks[1] as number[]}
              />
            );
          }
          return (
            <div
              onClick={() => handleCellClick(index)}
              key={index}
              className={s.cell}
            />
          );
        })}
      </div>

      <Hands onClick={handleHandsClick} side="right" characters={player} />
      <div className={s.playerScore}>
        <span>Score:</span>
        <div>{playerScore}</div>
      </div>
      <button
        onClick={() => setBackground((prev: boolean) => !prev)}
        className={s.backgroundBtn}
      >
        <span className={s.backgroundBtn_span}></span>Change background
      </button>
      <button
        onClick={() => window.location.reload()}
        className={cn(s.backgroundBtn, s.resetBtn)}
      >
        <span className={s.resetBtn_span}></span>Reset game
      </button>
    </div>
  );
}

export default App;
