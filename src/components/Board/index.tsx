import React from "react";
import cn from "classnames";
import { Character } from "../../interfaces";
import Card from "../Card";
import { getCardValues } from "../../utils/getCardValues";
import s from "./Board.module.css";

interface BoardProps {
  board: (Character | number)[];
  onClick?: (index: number) => void;
  /** True while the player has a card selected: empty cells become drop targets. */
  highlight?: boolean;
}
const Board: React.FC<BoardProps> = ({ board, onClick, highlight = false }) => {
  const handleClick = (index: number) => {
    onClick && onClick(index);
  };
  return (
    <div className={cn(s.board, { [s.highlight]: highlight })}>
      {board.map((item, index: number) => {
        if (typeof item === "object") {
          return (
            <Card
              holder={item?.holder}
              // the holder is part of the key so a capture remounts the
              // card and replays the flip-in animation
              key={`${index}-${item.holder}`}
              className={s.cellCard}
              id={item.id}
              image={item.thumbnail.path}
              values={getCardValues(item)}
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
