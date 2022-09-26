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
  const [enemy, setEnemy] = useState<Array<Character>>([]);
  const [player, setPlayer] = useState<Array<Character>>([]);
  const [choiseCard, setChoiseCard] = useState<number | string | null>(null);
  const [background, setBackground] = useState<boolean>(true);

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
      board,
      move: {},
    };

    const playerCard = player.find((item) => item.id === choiseCard);

    if (playerCard) {
      params.move = {
        id: playerCard.id,
        hits: playerCard.attacks[1],
        position: index + 1,
      };
    }
    console.log("params", params);

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

    console.log(nextStep);
    setBoard(
      nextStep.board.map((item: any) =>
        typeof item === "object" ? item.poke : item
      )
    );
  };

  return (
    <div className={cn(s.root, { [s.board2]: background })}>
      <Hands side="left" characters={enemy} />

      <div className={s.board}>
        {board.map((item, index) => {
          if (typeof item === "object") {
            return (
              <Card
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
      <button
        onClick={() => setBackground((prev: boolean) => !prev)}
        className={s.backgroundBtn}
      >
        <span className={s.backgroundBtn_span}></span>Change background
      </button>
    </div>
  );
}

export default App;
