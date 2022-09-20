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
  const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const [enemy, setEnemy] = useState<Array<Character>>([]);
  const [player, setPlayer] = useState<Array<Character>>([]);

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

  return (
    <div className={s.root}>
      <Hands side="left" characters={enemy} />

      <div className={s.board}>
        {board.map((item, index) => (
          <div key={index} className={s.cell}></div>
        ))}
      </div>
      <Hands side="right" characters={player} />
    </div>
  );
}

export default App;
