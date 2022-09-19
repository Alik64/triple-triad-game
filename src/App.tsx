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
  const enemy = [0, 0, 0, 0, 0];
  const [player, setPlayer] = useState<Array<Character>>([]);

  useEffect(() => {
    const getPlayerCards = async () => {
      const response = await fetch(
        "http://localhost:3004/api/v1/marvel/create"
      );
      const characters: JSONResponse = await response.json();
      console.log(characters.data);
      setPlayer(characters.data);
    };
    getPlayerCards();
  }, []);

  return (
    <div className={s.root}>
      <div className={s.hands}>
        {enemy.map((item, index) => (
          <Card image={""} className={s.card} />
        ))}
      </div>
      <div className={s.board}>
        {board.map((item, index) => (
          <div key={index} className={s.cell}></div>
        ))}
      </div>
      <Hands characters={player} />
    </div>
  );
}

export default App;
