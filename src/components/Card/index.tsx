import React from "react";
import cn from "classnames";
import s from "./Card.module.css";

interface CardProps {
  image: string;
  className?: string;
}
const Card: React.FC<CardProps> = ({ className, image }) => {
  return (
    <div
      className={cn(s.root, className)}
      style={{
        backgroundImage: `url(${image})`,
      }}
    ></div>
  );
};

export default Card;
