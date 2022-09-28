import React from "react";
import cn from "classnames";
import s from "./Modal.module.css";

interface ModalProps {
  winner: string;
}

const Modal: React.FC<ModalProps> = ({ winner }) => {
  return (
    <div className={s.root}>
      <div className={s.cover}>
        <div className={s.content}>
          <img alt="star" className={cn(s.star, s[winner])} />
          {winner !== "draw" ? <h2>Winner</h2> : <h2>...</h2>}
          <h3>{winner}</h3>
          <button onClick={() => window.location.reload()} className="btn">
            <span className={s.resetBtn_span}></span>Try again
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
