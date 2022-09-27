import React, { useState } from "react";
import cn from "classnames";
import { Character } from "../../interfaces";

import s from "./Hands.module.css";
import Card from "../Card";

interface HandsProps {
  side: "left" | "right";
  characters: Character[];
  onClick?: (id: string | number) => void;
  disabled?: boolean;
  score: number;
}

const Hands: React.FC<HandsProps> = ({
  characters,
  side,
  onClick,
  disabled = false,
  score,
}) => {
  const [activeId, setActiveId] = useState<string | number | null>();
  const handleClick = (id: string | number) => {
    if (!disabled) {
      setActiveId(id);
      onClick && onClick(id);
    }
  };
  return (
    <div className={s.root}>
      {characters.map((item) => (
        <Card
          key={item.id}
          id={item.id}
          values={item.attacks[1] as number[]}
          image={item.thumbnail.path}
          className={cn(s.card, s[side], { [s.active]: item.id === activeId })}
          onClick={handleClick}
        />
      ))}
      <div className={cn(s.score, s[side])}>
        <span>Score:</span>
        <div>{score}</div>
      </div>
    </div>
  );
};

export default Hands;
