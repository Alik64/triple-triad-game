import React from "react";
import cn from "classnames";
import s from "./Modal.module.css";
import { useGameStore } from "../../../store/gameStore";

interface ModalProps {
  winner: string;
}

const COPY: Record<string, { title: string; subtitle: string }> = {
  blue: { title: "Victory", subtitle: "You captured the board. GG!" },
  red: { title: "Defeat", subtitle: "The enemy takes this round." },
  draw: { title: "Draw", subtitle: "Nobody claims the board." },
};

const Modal: React.FC<ModalProps> = ({ winner }) => {
  const closeModal = useGameStore((state) => state.closeModal);
  const initGame = useGameStore((state) => state.initGame);
  const copy = COPY[winner] ?? COPY.draw;

  return (
    <div className={s.overlay} onClick={closeModal}>
      <div
        className={cn(s.modal, s[winner])}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label="End of game"
      >
        <button className={s.close} onClick={closeModal} aria-label="Close">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className={s.starWrap}>
          <span className={s.halo} aria-hidden="true" />
          <svg className={s.star} viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2l2.95 6.26 6.85.87-5.03 4.73 1.3 6.77L12 17.27l-6.07 3.36 1.3-6.77L2.2 9.13l6.85-.87z"
              fill="currentColor"
            />
          </svg>
        </div>

        <h2 className={s.title}>{copy.title}</h2>
        <p className={s.subtitle}>{copy.subtitle}</p>

        <button onClick={initGame} className={cn("btn", "btnPrimary", s.again)}>
          Play again
        </button>
      </div>
    </div>
  );
};

export default Modal;
