import React, { useEffect, useState } from "react";
import s from "./App.module.css";

import Card from "./components/Card";
import Hands from "./components/Hands";
import { Character } from "./interfaces";

type JSONResponse = {
  data: Array<Character>;
  errors?: Array<{ message: string }>;
};

function App() {
  const [board, setBoard] = useState<number[] | Character[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [enemy, setEnemy] = useState<Array<Character>>([]);
  const [player, setPlayer] = useState<Array<Character>>([]);
  const [choiseCard, setChoiseCard] = useState<number | string | null>(null);

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

  const handleCellClick = (index: number) => {
    setBoard((prevState) => {
      // @ts-ignore
      const copyState: number[] | Character[] = [...prevState];
      copyState[index] = player.find((item) => item.id === choiseCard) || 0;
      return copyState;
    });
    setPlayer((prevState) =>
      prevState.filter((item) => item.id !== choiseCard)
    );
    setChoiseCard(null);
  };

  return (
    <div className={s.root}>
      <Hands side="left" characters={enemy} />

      <div className={s.board}>
        {board.map((item, index) => {
          if (typeof item === "object") {
            return (
              <Card
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
    </div>
  );
}

export default App;
