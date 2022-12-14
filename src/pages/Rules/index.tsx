import React from "react";

import { useNavigate } from "react-router-dom";

import s from "./Rules.module.css";

const Rules = () => {
  const navigate = useNavigate();
  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <h1>About game</h1>
        <p>
          Triple Triad is played on a blank 3-by-3 square game board. Squall
          plays against one opponent at a time in turn-based gameplay. Both
          players have five cards in their hand at the start of the game. The
          absolute simplest explanation of the game is that it plays like the
          card game, WAR. A number on one player's card will be played against a
          number on the other player's card. The high number wins the turn.
        </p>
        <br />
        <p>
          Each player is assigned a color at the start of the game, either red
          or blue. One player's cards will have a red background. The other
          player's cards will be blue. This is done to indicate both initial
          ownership of the card, and points as the game continues to progress.
          Each card of the player's color on the grid is a point. As cards are
          played and adjacent sides compared, they may change colors to show
          which player has won the turn and is currently winning the game.
        </p>
        <br />
        <p>
          When a card changes to the player's color, this is called capturing a
          card. If it is not their turn, the player cannot capture any cards. A
          card may change colors multiple times during play. Multiple cards may
          change color during a turn. Once the grid is filled with cards, the
          game is determined to be a win/loss or a draw. At this point, the
          player that has the most cards of their color on the grid wins the
          game.
        </p>
        <br />
        <p>
          Each card in this mini-game features four numbers that form a cross in
          the top left corner. The numbers range from one through 10. Each
          number in the cross corresponds to a side of the card. Creatures and
          characters are used as card art. Cards may also have an elemental
          icon, which is specific to the Elemental rule set, and is not in play
          unless there are also elemental icons on the grid.
        </p>
        <br />
        <p>
          A card may be played anywhere on the Triple Triad grid, including
          spaces where there is no adjacent card. However, due to the limited
          number of available spaces on the grid, cards must eventually be
          played against one another.
        </p>
        <br />
        <p>
          When one player's card is placed adjacent to the other player's
          card(s) on the grid, the touching sides are compared, and the high
          number of each touching side wins that turn. Depending on where on the
          grid a card is placed, a card may be played against multiple cards at
          the same time. For instance, if a card is placed in the center space
          on the grid, each side of the player's card will be compared with the
          adjacent side of each other card to the top, bottom, left and right,
          as long as those other cards belong to the opponent.
        </p>
        <br />
        <p>
          If the grid is filled with cards, and both players possess an equal
          number of cards of their color, a Draw will occur.
        </p>
        <button onClick={() => navigate("/game")} className="btn">
          <span className="btn_span"></span>Let's play
        </button>
      </div>
    </div>
  );
};

export default Rules;
