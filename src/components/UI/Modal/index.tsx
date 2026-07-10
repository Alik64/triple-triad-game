import React from "react";
import cn from "classnames";
import s from "./Modal.module.css";
import { useGameStore } from "../../../store/gameStore";

interface ModalProps {
  winner: string;
}

const Modal: React.FC<ModalProps> = ({ winner }) => {
  const closeModal = useGameStore((state) => state.closeModal);
  const initGame = useGameStore((state) => state.initGame);

  return (
    <div className={s.root}>
      <div className={s.cover}>
        <div className={s.content}>
          <button className={s.btn_close} onClick={closeModal}>
            ❌
          </button>
          <img alt="star" className={cn(s.star, s[winner])} />
          {winner !== "draw" ? <h2>Winner</h2> : <h2>...</h2>}
          <h3>{winner}</h3>
          <button onClick={initGame} className={cn("btn", s.modal_btn)}>
            <span className={s.resetBtn_span}></span>Try again
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
