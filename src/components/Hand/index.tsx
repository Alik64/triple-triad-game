import React from "react";
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
  /** Controlled selection: id of the currently selected card, if any. */
  activeId?: string | number | null;
  onClick?: (id: string | number | null) => void;
  disabled?: boolean;
  glowing?: boolean;
  loading?: boolean;
  /** Allow dragging the cards onto the board. */
  draggable?: boolean;
}

const Hand: React.FC<HandProps> = ({
  characters,
  side,
  activeId = null,
  onClick,
  disabled = false,
  score,
  glowing = false,
  loading = false,
  draggable = false,
}) => {
  const handleClick = (id: string | number) => {
    if (disabled) return;
    // clicking the selected card again deselects it
    onClick && onClick(id === activeId ? null : id);
  };

  return (
    <div className={s.root}>
      <div
        className={cn(s.hand_content, s[side], {
          [s.shining]: glowing,
          [s.disabled]: disabled,
        })}
      >
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
              draggable={draggable && !disabled}
            />
          ))
        )}
      </div>
      <div className={cn(s.score, s[side])}>
        <span className={s.scoreLabel}>
          {side === "right" ? "You" : "Enemy"}
        </span>
        {/* the key replays the pop animation on every score change */}
        <span key={score} className={s.scoreValue}>
          {score}
        </span>
      </div>
    </div>
  );
};

export default Hand;
