import React from "react";
import s from "./Hands.module.css";
import { Character } from "../../interfaces";
import Card from "../Card";

interface HandsProps {
  characters: Character[];
}

const Hands: React.FC<HandsProps> = ({ characters }) => {
  return (
    <div className={s.root}>
      {characters.map((item) => (
        <Card key={item.id} image={item.thumbnail.path} className={s.card} />
      ))}
    </div>
  );
};

export default Hands;
