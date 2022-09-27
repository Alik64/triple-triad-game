import React from "react";
import { Character } from "../../interfaces";
import Card from "../Card";
import s from "./Board.module.css";

interface BoardProps {
  board: (Character | number)[];
  onClick?: (index: number) => void;
}
const Board: React.FC<BoardProps> = ({ board, onClick }) => {
  const handleClick = (index: number) => {
    onClick && onClick(index);
  };
  return (
    <div className={s.board}>
      {board.map((item, index: number) => {
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
            onClick={() => handleClick(index)}
            key={index}
            className={s.cell}
          />
        );
      })}
    </div>
  );
};

export default Board;
