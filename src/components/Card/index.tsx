import React from "react";
import cn from "classnames";
import s from "./Card.module.css";

interface CardProps {
  className?: string;
}
const Card: React.FC<CardProps> = ({ className }) => {
  return <div className={cn(s.root, className)}></div>;
};

export default Card;
