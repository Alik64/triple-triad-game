import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import Hand from "../../components/Hand";
import Board from "../../components/Board";
import Card from "../../components/Card";

import { useGameStore } from "../../store/gameStore";
import { Character } from "../../interfaces";
import { getCardValues } from "../../utils/getCardValues";

import cn from "classnames";
import s from "./Game.module.css";
import useMediaQuery from "../../utils/hooks/useMediaQuery";
import ModalMobile from "../../components/UI/ModalMobile";
import Footer from "../../components/Footer";

const Game: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state) => state.playerCards);
  const enemy = useGameStore((state) => state.enemyCards);
  const board = useGameStore((state) => state.board);
  const playerScore = useGameStore((state) => state.playerScore);
  const enemyScore = useGameStore((state) => state.enemyScore);
  const isLoading = useGameStore((state) => state.isLoading);
  const isInitializing = useGameStore((state) => state.isInitializing);
  const error = useGameStore((state) => state.error);
  const initGame = useGameStore((state) => state.initGame);
  const playTurn = useGameStore((state) => state.playTurn);

  const [chosenCardId, setChosenCardId] = useState<number | string | null>(
    null
  );
  /** Card currently under the pointer, rendered in the drag overlay. */
  const [draggedCard, setDraggedCard] = useState<Character | null>(null);
  const matches = useMediaQuery("(min-width: 667px)");

  // the activation distance lets plain clicks through, so the
  // select-then-click-a-cell flow keeps working alongside drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    initGame();
  }, [initGame]);

  // drop a stale selection whenever the hand changes (card played, new game)
  useEffect(() => {
    setChosenCardId(null);
  }, [player]);

  const handleCellClick = (index: number) => {
    if (chosenCardId === null) return;
    playTurn(chosenCardId, index);
    setChosenCardId(null);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setDraggedCard(player.find((card) => card.id === active.id) ?? null);
    setChosenCardId(active.id);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDraggedCard(null);
    const index = over?.data.current?.index;
    if (typeof index !== "number") return; // dropped outside: keep the selection
    playTurn(active.id, index);
    setChosenCardId(null);
  };

  const isBusy = isLoading || isInitializing;
  const status = isInitializing
    ? "Dealing the cards"
    : isLoading
    ? "Enemy is thinking"
    : chosenCardId !== null
    ? "Choose a cell on the board"
    : "Pick or drag a card from your hand";

  if (!matches && window.innerHeight > 500) {
    return <ModalMobile />;
  }
  return (
    <div className={s.page}>
      <div
        className={cn(s.status, {
          [s.statusEnemy]: isLoading,
          [s.statusBusy]: isBusy,
        })}
        role="status"
      >
        {isBusy && <span className={s.spinner} aria-hidden="true" />}
        <span className={s.statusText}>{status}</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggedCard(null)}
      >
        <div className={s.arena}>
          <Hand
            side="left"
            characters={enemy}
            disabled
            score={enemyScore}
            loading={isInitializing}
            glowing={isLoading}
          />

          <Board
            board={board}
            onClick={handleCellClick}
            highlight={chosenCardId !== null && !isLoading}
          />

          <Hand
            side="right"
            characters={player}
            score={playerScore}
            loading={isInitializing}
            glowing={!isBusy}
            disabled={isLoading}
            activeId={chosenCardId}
            onClick={setChosenCardId}
            draggable
          />
        </div>

        {/* the dragged card's clone; the original stays dimmed in the hand */}
        <DragOverlay dropAnimation={null}>
          {draggedCard && (
            <Card
              id={draggedCard.id}
              image={draggedCard.thumbnail.path}
              values={getCardValues(draggedCard)}
              className={s.dragOverlayCard}
            />
          )}
        </DragOverlay>
      </DndContext>

      {error && <p className={s.error}>{error}</p>}

      <section className={s.buttonContainer}>
        <button onClick={() => navigate("/")} className="btn">
          Home
        </button>
        <button onClick={() => navigate("/rules")} className="btn">
          See rules
        </button>
        <button onClick={initGame} className={cn("btn", s.resetBtn)}>
          Reset game
        </button>
      </section>
      <Footer />
    </div>
  );
};

export default Game;
