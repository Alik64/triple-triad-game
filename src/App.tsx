import React from "react";
import s from "./App.module.css";
import Card from "./components/Card";

function App() {
  const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const enemy = [0, 0, 0, 0, 0];
  const player = [0, 0, 0, 0, 0];
  return (
    <div className={s.root}>
      <div className={s.hands}>
        {enemy.map((item, index) => (
          <Card className={s.card} />
        ))}
      </div>
      <div className={s.board}>
        {board.map((item, index) => (
          <div key={index} className={s.cell}></div>
        ))}
      </div>
      <div className={s.hands}>
        {player.map((item, index) => (
          <Card className={s.card} />
        ))}
      </div>
    </div>
  );
}

export default App;
