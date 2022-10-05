import React, { useState } from "react";
import { Character } from "../../interfaces";
import cn from "classnames";

import s from "./Hand.module.css";
import Card from "../Card";
import { useSelector } from "react-redux";
import {
  isLoadingSelector,
  enemyCardsSelector,
} from "../../redux/characterSlice";
import Preloader from "../Preloader";

interface HandsProps {
  side: "left" | "right";
  characters: Character[];
  onClick?: (id: string | number) => void;
  disabled?: boolean;
  shining?: boolean;
  score: number;
}

const Hand: React.FC<HandsProps> = ({
  characters,
  side,
  onClick,
  disabled = false,
  score,
  shining,
}) => {
  const [activeId, setActiveId] = useState<string | number | null>();
  const handleClick = (id: string | number) => {
    if (!disabled) {
      setActiveId(id);
      onClick && onClick(id);
    }
  };
  const enemyCards = useSelector(enemyCardsSelector);

  return (
    <div className={s.root}>
      <div className={cn(s.hand_content, { [s.shining]: !shining })}>
        {enemyCards.length === 0 ? (
          <Preloader />
        ) : (
          characters?.map((item) => (
            <Card
              key={item.id}
              id={item.id}
              values={item.attacks[1] as number[]}
              image={item.thumbnail.path}
              className={cn(s.card, s[side], {
                [s.active]: item.id === activeId,
              })}
              onClick={handleClick}
            />
          ))
        )}
      </div>
      <div className={cn(s.score, s[side])}>
        <span>Score:</span>
        <div>{score}</div>
      </div>
    </div>
  );
};

export default Hand;
