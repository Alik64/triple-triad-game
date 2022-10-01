import React, { useEffect, useState } from "react";

import Hand from "../../components/Hand";
import Board from "../../components/Board";
import Modal from "../../components/Modal";
import Preloader from "../../components/Preloader";

import { Character } from "../../interfaces";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  getEnemyCardsThunk,
  getPlayerCardsThunk,
  launchGameThunk,
  setBoard,
  setPlayerCards,
  toggleModal,
} from "../../redux/characterSlice";

import cn from "classnames";
import s from "./Game.module.css";

const Game: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const player = useSelector(
    (state: RootState) => state.characters.playerCards
  );

  const enemy = useSelector((state: RootState) => state.characters.enemyCards);
  const isLoading = useSelector(
    (state: RootState) => state.characters.isLoading
  );

  const board = useSelector((state: RootState) => state.characters.board);
  const serverBoard = useSelector(
    (state: RootState) => state.characters.serverBoard
  );

  const [background, setBackground] = useState<boolean>(true);

  const [chosenCardId, setChosenCardId] = useState<number | string | null>(
    null
  );
  const [enemyScore, setEnemyScore] = useState<number>(0);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [winner, setWinner] = useState<string>("");

  console.log("render");

  useEffect(() => {
    dispatch(getPlayerCardsThunk());
    dispatch(getEnemyCardsThunk(player));
  }, []);

  const handleHandsClick = (id: string | number) => {
    setChosenCardId(id);
  };

  const handleCellClick = async (index: number) => {
    let params = {
      hands: {
        p1: player,
        p2: enemy,
      },
      currentPlayer: "p1",
      board: serverBoard,
      move: {},
    };

    const playerCard = player.find((item) => item.id === chosenCardId);

    if (playerCard) {
      params.move = {
        id: playerCard.id,
        hits: playerCard.attacks[1],
        position: index + 1,
      };
    } else {
      return;
    }

    dispatch(setBoard({ index, playerCard }));
    dispatch(setPlayerCards(chosenCardId));
    setChosenCardId(null);
    dispatch(launchGameThunk(params));
    // STOP HERE
    // const nextStep = await responseGame.json();

    // setServerBoard(nextStep.board);
    // setBoard(
    //   nextStep.oldBoard.map((item: any) =>
    //     typeof item === "object" ? { ...item.poke, holder: item.holder } : item
    //   )
    // );

    // if (nextStep.move !== null) {
    // setEnemy((prevState) =>
    //   prevState.filter((item) => item.id !== nextStep.move.poke.id)
    // );

    // setBoard(
    //   nextStep.board.map((item: any) =>
    //     typeof item === "object"
    //       ? { ...item.poke, holder: item.holder }
    //       : item
    //   )
    // );
    //   setPlayerScore(
    //     nextStep.board.reduce((acc: number, item: any) => {
    //       if (item.holder === "p1") {
    //         acc++;
    //       }
    //       return acc;
    //     }, 0)
    //   );
    //   setEnemyScore(
    //     nextStep.board.reduce((acc: number, item: any) => {
    //       if (item.holder === "p2") {
    //         acc++;
    //       }
    //       return acc;
    //     }, 0)
    //   );
    // } else {
    //   console.log(nextStep);
    //   console.log("player pokes", nextStep.hands.p1.pokes.length);
    //   console.log("enemy pokes", nextStep.hands.p2.pokes.length);
    //   const nbP1 = nextStep.board.reduce((acc: number, item: any) => {
    //     if (item.holder === "p1") {
    //       acc++;
    //     }
    //     return acc;
    //   }, 0);
    //   const nbP2 = nextStep.board.reduce((acc: number, item: any) => {
    //     if (item.holder === "p2") {
    //       acc++;
    //     }
    //     return acc;
    //   }, 0);
    //   setPlayerScore(nbP1 + nextStep.hands.p1.pokes.length);
    //   setEnemyScore(nbP2 + nextStep.hands.p2.pokes.length);
    //   endgame();
    // }
  };

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
      <Board board={board} onClick={handleCellClick} />
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
        <button
          onClick={() =>
            // dispatch(
            //   setBoard({
            //     index: 1,
            //     playerCard: {
            //       id: 1011078,
            //       name: "Starjammers",
            //       description: "",
            //       thumbnail: {
            //         path: "http://i.annihil.us/u/prod/marvel/i/mg/9/60/537f74ae55a3a.jpg",
            //       },
            //       resourceURI:
            //         "http://gateway.marvel.com/v1/public/characters/1011078",
            //       wiki: "http://marvel.com/universe/Starjammers?utm_campaign=apiRef&utm_source=d0522038ca5d2d32ec335cc0e418e27c",
            //       urlCharacters: "http://marvel.com/characters/Starjammers",
            //       attacks: [12, [4, 3, 2, 3]],
            //       values: { top: 4, right: 3, bottom: 2, left: 3 },
            //     },
            //   })
            // )
            // dispatch(setPlayerCards(player[0].id))
            dispatch(
              launchGameThunk({
                hands: {
                  p1: player,
                  p2: enemy,
                },
                currentPlayer: "p1",
                board: serverBoard,
                move: {
                  id: player[0].id,
                  hits: player[0].attacks[1],
                  position: 1,
                },
              })
            )
          }
        >
          xxx
        </button>
      </section>
    </div>
  );
};

export default Game;
