import React from "react";
import cn from "classnames";
import { useDroppable } from "@dnd-kit/core";
import { Character } from "../../interfaces";
import Card from "../Card";
import { getCardValues } from "../../utils/getCardValues";
import s from "./Board.module.css";

interface CellProps {
  index: number;
  onClick: (index: number) => void;
}

/** An empty board cell: clickable and a drop target for dragged cards. */
const Cell: React.FC<CellProps> = ({ index, onClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${index}`,
    data: { index },
  });
  return (
    <div
      ref={setNodeRef}
      onClick={() => onClick(index)}
      data-testid={`cell-${index}`}
      className={cn(s.cell, { [s.cellOver]: isOver })}
    />
  );
};

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
        return <Cell key={index} index={index} onClick={handleClick} />;
      })}
    </div>
  );
};

export default Board;
