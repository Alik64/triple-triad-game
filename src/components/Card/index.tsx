import React from "react";
import cn from "classnames";
import { useDraggable } from "@dnd-kit/core";
import s from "./Card.module.css";

interface CardProps {
  id: string | number;
  image: string;
  values: number[];
  className?: string;
  onClick?: (id: string | number) => void;
  holder?: string;
  /** Player-hand cards can be dragged onto the board. */
  draggable?: boolean;
}
const Card: React.FC<CardProps> = ({
  id,
  className,
  image,
  onClick,
  values,
  holder,
  draggable = false,
}) => {
  // inert when disabled (board cards, enemy hand, the drag-overlay clone)
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id,
    disabled: !draggable,
  });

  const handleClick: React.MouseEventHandler<HTMLDivElement> = () => {
    onClick && onClick(id);
  };
  return (
    <div
      ref={draggable ? setNodeRef : undefined}
      className={cn(s.root, className, s[holder as "p1" | "p2"], {
        // guard on `draggable`: the overlay clone shares the active id and
        // would otherwise dim itself too
        [s.dragging]: draggable && isDragging,
      })}
      onClick={handleClick}
      // without touch-action:none the browser scrolls instead of dragging on touch
      style={draggable ? { touchAction: "none" } : undefined}
      {...(draggable ? { ...listeners, ...attributes } : {})}
    >
      <div
        className={s.image}
        style={{
          backgroundImage: `url(${image})`,
        }}
      />
      {/* side values, FF8-style cross: top / right / bottom / left */}
      <div className={s.values}>
        {values.map((item, index) => (
          <span key={index}>{item}</span>
        ))}
      </div>
    </div>
  );
};

export default Card;
