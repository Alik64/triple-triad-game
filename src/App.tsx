import React from "react";
import s from "./App.module.css";

function App() {
  const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  return (
    <div className={s.root}>
      <div className={s.hands}></div>
      <div className={s.board}>
        {board.map((item, index) => (
          <div key={index} className={s.cell}></div>
        ))}
      </div>
      <div className={s.hands}></div>
    </div>
  );
}

export default App;
