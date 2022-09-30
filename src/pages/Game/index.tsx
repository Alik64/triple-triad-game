import React, { useEffect, useState } from "react";
import cn from "classnames";

import Hand from "../../components/Hand";

import s from "./Game.module.css";
import Board from "../../components/Board";
import Modal from "../../components/Modal";
import Preloader from "../../components/Preloader";
import { Character } from "../../interfaces";
import { useDispatch, useSelector } from "react-redux";
import {
  getEnemyCardsThunk,
  getPlayerCardsThunk,
  toggleModal,
} from "../../redux/characterSlice";
import { AppDispatch } from "../../redux/store";

type JSONResponse = {
  data: Array<Character>;
  errors?: Array<{ message: string }>;
};

const Game: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const player = useSelector((state: any) => state.characters.playerCards);
  const enemy = useSelector((state: any) => state.characters.enemyCards);
  const isLoading = useSelector((state: any) => state.characters.isLoading);

  const [board, setBoard] = useState<(Character | number)[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [serverboard, setServerBoard] = useState<any[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);

  const [background, setBackground] = useState<boolean>(true);

  // const [enemy, setEnemy] = useState<Array<Character>>([]);
  // const [player, setPlayer] = useState<Array<Character>>([]);
  // const [isLoading, setLoading] = useState<boolean>(false);
  const [choiseCard, setChoiseCard] = useState<number | string | null>(null);
  const [enemyScore, setEnemyScore] = useState<number>(0);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [winner, setWinner] = useState<string>("");

  console.log("render");

  useEffect(() => {
    dispatch(getPlayerCardsThunk());
    dispatch(getEnemyCardsThunk(player));
  }, []);

  const handleHandsClick = (id: string | number) => {
    setChoiseCard(id);
  };

  // const handleCellClick = async (index: number) => {
  //   let params = {
  //     hands: {
  //       p1: player,
  //       p2: enemy,
  //     },
  //     currentPlayer: "p1",
  //     board: serverboard,
  //     move: {},
  //   };

  //   const playerCard = player.find((item) => item.id === choiseCard);

  //   if (playerCard) {
  //     params.move = {
  //       id: playerCard.id,
  //       hits: playerCard.attacks[1],
  //       position: index + 1,
  //     };
  //   } else {
  //     return;
  //   }

  //   setBoard((prevState) => {
  //     if (playerCard) {
  //       const copyState: (Character | number)[] = [...prevState];
  //       copyState[index] = playerCard;
  //       return copyState;
  //     }
  //     return prevState;
  //   });

  //   setPlayer((prevState) =>
  //     prevState.filter((item) => item.id !== choiseCard)
  //   );
  //   setChoiseCard(null);

  //   const responseGame = await fetch(
  //     "https://ttgapi.herokuapp.com/api/v1/marvel/game",
  //     { method: "POST", body: JSON.stringify(params) }
  //   );

  //   const nextStep = await responseGame.json();
  //   setServerBoard(nextStep.board);
  //   setBoard(
  //     nextStep.oldBoard.map((item: any) =>
  //       typeof item === "object" ? { ...item.poke, holder: item.holder } : item
  //     )
  //   );

  //   if (nextStep.move !== null) {
  //     setEnemy((prevState) =>
  //       prevState.filter((item) => item.id !== nextStep.move.poke.id)
  //     );

  //     setTimeout(() => {
  //       setBoard(
  //         nextStep.board.map((item: any) =>
  //           typeof item === "object"
  //             ? { ...item.poke, holder: item.holder }
  //             : item
  //         )
  //       );
  //       setPlayerScore(
  //         nextStep.board.reduce((acc: number, item: any) => {
  //           if (item.holder === "p1") {
  //             acc++;
  //           }
  //           return acc;
  //         }, 0)
  //       );
  //       setEnemyScore(
  //         nextStep.board.reduce((acc: number, item: any) => {
  //           if (item.holder === "p2") {
  //             acc++;
  //           }
  //           return acc;
  //         }, 0)
  //       );
  //     }, 500);
  //   } else {
  //     console.log(nextStep);
  //     console.log("player pokes", nextStep.hands.p1.pokes.length);
  //     console.log("enemy pokes", nextStep.hands.p2.pokes.length);
  //     const nbP1 = nextStep.board.reduce((acc: number, item: any) => {
  //       if (item.holder === "p1") {
  //         acc++;
  //       }
  //       return acc;
  //     }, 0);
  //     const nbP2 = nextStep.board.reduce((acc: number, item: any) => {
  //       if (item.holder === "p2") {
  //         acc++;
  //       }
  //       return acc;
  //     }, 0);
  //     setPlayerScore(nbP1 + nextStep.hands.p1.pokes.length);
  //     setEnemyScore(nbP2 + nextStep.hands.p2.pokes.length);
  //     endgame();
  //   }
  // };

  function endgame() {
    console.log("player", playerScore + player.length);
    console.log("enemy", enemyScore + enemy.length);

    if (playerScore + player.length > enemyScore + enemy.length) {
      setWinner("blue");
    } else if (playerScore + player.length < enemyScore + enemy.length) {
      setWinner("red");
    } else if (playerScore + player.length == enemyScore + enemy.length) {
      setWinner("draw");
    }
  }
  if (isLoading) {
    return <Preloader />;
  }

  return (
    <div className={cn(s.root, { [s.board2]: background })}>
      <Hand side="left" characters={enemy} disabled score={enemyScore} />
      <Board
        board={board}
        //  onClick={handleCellClick}
      />
      <Hand
        onClick={handleHandsClick}
        side="right"
        characters={player}
        score={playerScore}
      />
      <section className={s.buttonContainer}>
        <button
          onClick={() => setBackground((prev: boolean) => !prev)}
          className={cn("btn", s.bgBtn)}
        >
          <span className="btn_span"></span>Change background
        </button>
        <button
          onClick={() => window.location.reload()}
          className={cn("btn", s.resetBtn)}
        >
          <span className={s.resetBtn_span}></span>Reset game
        </button>
        <button onClick={() => dispatch(toggleModal())}>XXX</button>
      </section>
    </div>
  );
};

export default Game;
