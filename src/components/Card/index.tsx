import React from "react";
import cn from "classnames";
import s from "./Card.module.css";

interface CardProps {
  id: string | number;
  image: string;
  values: number[];
  className?: string;
  onClick: (id: string | number) => void;
}
const Card: React.FC<CardProps> = ({
  id,
  className,
  image,
  onClick,
  values,
}) => {
  const handleClick = () => {
    onClick && onClick(id);
  };
  return (
    <div
      className={cn(s.root, className)}
      style={{
        backgroundImage: `url(${image})`,
      }}
      onClick={handleClick}
    >
      <div className={s.values}>
        {values.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    </div>
  );
};

export default Card;
