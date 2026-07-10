import React from "react";

import { useNavigate } from "react-router-dom";

import s from "./Rules.module.css";

const Rules = () => {
  const navigate = useNavigate();
  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <h1>How to play</h1>

        <h2>The basics</h2>
        <p>
          Triple Triad is played on a 3-by-3 board. You (blue) face the enemy
          AI (red), and each side starts with a hand of five Marvel cards. You
          always play first, then turns alternate.
        </p>
        <p>
          On your turn, click a card in your hand to select it — it slides out
          of the stack — then click any empty cell to place it, even one with
          no adjacent card. The status bar above the board tells you what to do
          at every step, and the enemy answers as soon as your move is played.
        </p>

        <h2>Card values</h2>
        <p>
          Every card carries four numbers arranged in a cross in its top-left
          corner. Each number, from 1 to 10, is the strength of one side of the
          card: top, right, bottom and left.
        </p>

        <h2>Capturing</h2>
        <p>
          When you place a card next to an enemy card, the touching sides are
          compared. If your side shows the higher number, the enemy card flips
          to your color — it is captured. A well-placed card can capture
          several neighbours at once: played in the center, it challenges up to
          four cards at the same time.
        </p>
        <p>
          Only the card being placed can capture. Cards already on the board
          never flip a newly placed card, even if their touching side is higher
          — so placing a weak side against a strong enemy card is safe. A
          captured card is not lost either: it can change colors again later in
          the game.
        </p>

        <h2>Scoring</h2>
        <p>
          Every card you own is worth one point: cards of your color on the
          board, plus the cards still in your hand. Both players therefore
          start at 5–5, and the scores shift with every capture.
        </p>

        <h2>End of the game</h2>
        <p>
          The game ends when the ninth card fills the board. The player with
          the higher score wins — the last unplayed card still counts as a
          point for its owner. Equal scores mean a draw.
        </p>

        <div className={s.actions}>
          <button onClick={() => navigate("/")} className="btn">
            Home
          </button>
          <button
            onClick={() => navigate("/game")}
            className="btn btnPrimary"
          >
            Let's play
          </button>
        </div>
      </div>
    </div>
  );
};

export default Rules;
