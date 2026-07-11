import { useGameStore } from "./gameStore";
import { Character } from "../interfaces";

const store = () => useGameStore.getState();

const cardCells = () =>
  store().board.filter((cell) => typeof cell === "object") as Character[];

describe("gameStore", () => {
  beforeEach(() => {
    store().initGame();
  });

  it("initGame deals two fresh 5-card hands and an empty board", () => {
    const s = store();

    expect(s.playerCards).toHaveLength(5);
    expect(s.enemyCards).toHaveLength(5);

    const playerIds = new Set(s.playerCards.map((c) => c.id));
    s.enemyCards.forEach((c) => expect(playerIds.has(c.id)).toBe(false));

    expect(s.board.every((cell) => typeof cell === "number")).toBe(true);
    expect(s.playerScore).toBe(5);
    expect(s.enemyScore).toBe(5);
    expect(s.winner).toBe("");
    expect(s.isModalOpen).toBe(false);
    expect(s.isLoading).toBe(false);
  });

  it("playTurn places the card optimistically, then the AI answers", async () => {
    const card = store().playerCards[0];
    const turn = store().playTurn(card.id, 4);

    // synchronous optimistic part: card on board, out of hand, input locked
    let s = store();
    expect(s.isLoading).toBe(true);
    expect(s.playerCards).toHaveLength(4);
    expect((s.board[4] as Character).id).toBe(card.id);
    expect((s.board[4] as Character).holder).toBe("p1");

    await turn;

    s = store();
    expect(s.isLoading).toBe(false);
    expect(s.enemyCards).toHaveLength(4); // the AI played one card
    expect(cardCells()).toHaveLength(2);
    // every owned card is a point: total stays 10 all game long
    expect(s.playerScore + s.enemyScore).toBe(10);
  });

  it("ignores a second move while the first is still playing", async () => {
    const [a, b] = store().playerCards;

    const first = store().playTurn(a.id, 0);
    const second = store().playTurn(b.id, 8); // isLoading is true: dropped

    await Promise.all([first, second]);

    // only `a` left the hand (4 remaining), only one AI answer
    expect(store().playerCards).toHaveLength(4);
    expect(store().enemyCards).toHaveLength(4);
  });

  it("ignores a move onto an occupied cell", async () => {
    const [a] = store().playerCards;
    await store().playTurn(a.id, 0);

    // cell 0 hosts the player's card now (captured or not, it's occupied)
    await store().playTurn(store().playerCards[0].id, 0);

    expect(store().playerCards).toHaveLength(4);
  });

  it(
    "plays a full game to a verdict",
    async () => {
      while (!store().winner) {
        const s = store();
        const card = s.playerCards[0];
        const cell = s.board.findIndex((c) => typeof c === "number");
        await s.playTurn(card.id, cell);
      }

      const s = store();
      expect(["blue", "red", "draw"]).toContain(s.winner);
      expect(s.isModalOpen).toBe(true);
      expect(s.board.every((cell) => typeof cell === "object")).toBe(true);
      expect(s.playerCards).toHaveLength(0); // player used all 5 cards
      expect(s.enemyCards).toHaveLength(1); // the AI played 4 of 5
      expect(s.playerScore + s.enemyScore).toBe(10);
    },
    10000
  );

  it("a restart while a turn is pending drops that turn's late updates", async () => {
    const card = store().playerCards[0];
    const pending = store().playTurn(card.id, 0);

    store().initGame(); // player hits Reset right after moving

    await pending;

    const s = store();
    expect(s.playerCards).toHaveLength(5);
    expect(s.board.every((cell) => typeof cell === "number")).toBe(true);
    expect(s.isLoading).toBe(false);
  });
});
