import React, { useState } from "react";
import { Character } from "../../interfaces";
import cn from "classnames";

import s from "./Hand.module.css";
import Card from "../Card";
import Preloader from "../Preloader";
import { getCardValues } from "../../utils/getCardValues";

interface HandProps {
  side: "left" | "right";
  characters: Character[];
  score: number;
  onClick?: (id: string | number) => void;
  disabled?: boolean;
  glowing?: boolean;
  loading?: boolean;
}

const Hand: React.FC<HandProps> = ({
  characters,
  side,
  onClick,
  disabled = false,
  score,
  glowing = false,
  loading = false,
}) => {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const handleClick = (id: string | number) => {
    if (disabled) return;
    setActiveId(id);
    onClick && onClick(id);
  };

  return (
    <div className={s.root}>
      <div className={cn(s.hand_content, { [s.shining]: glowing })}>
        {loading ? (
          <Preloader />
        ) : (
          characters.map((character) => (
            <Card
              key={character.id}
              id={character.id}
              values={getCardValues(character)}
              image={character.thumbnail.path}
              className={cn(s.card, s[side], {
                [s.active]: character.id === activeId,
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
