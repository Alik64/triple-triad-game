import { Character } from "../interfaces";
import TripleTriadSolver, {
  EngineBoard,
  EngineCard,
  Owner,
  isCard,
} from "./solver";
import {
  dealPlayerHand,
  dealEnemyHand,
  playGame,
  TurnResult,
} from "./localApi";

const solver = new TripleTriadSolver();

const emptyBoard = (): EngineBoard => [0, 0, 0, 0, 0, 0, 0, 0, 0];

const mkCard = (
  owner: Owner,
  hits: number[],
  position?: number
): EngineCard => ({
  id: `${owner}-${hits.join("")}-${position}`,
  hits,
  owner,
  holder: owner,
  rate: solver.pokeRate(hits),
  poke: {} as Character,
  position,
});

describe("dealing hands", () => {
  it("deals 5 distinct cards to the player", () => {
    const hand = dealPlayerHand();
    expect(hand).toHaveLength(5);
    expect(new Set(hand.map((c) => c.id)).size).toBe(5);
    hand.forEach((c) => {
      expect(c.thumbnail.path).toMatch(/^https:\/\//);
      expect(Array.isArray(c.attacks[1])).toBe(true);
      expect(c.attacks[1]).toHaveLength(4);
    });
  });

  it("deals the enemy 5 distinct cards, none shared with the player", () => {
    for (let i = 0; i < 20; i++) {
      const player = dealPlayerHand();
      const enemy = dealEnemyHand(player);
      expect(enemy).toHaveLength(5);
      expect(new Set(enemy.map((c) => c.id)).size).toBe(5);
      const playerIds = new Set(player.map((c) => c.id));
      enemy.forEach((c) => expect(playerIds.has(c.id)).toBe(false));
    }
  });
});

describe("capture rule (putCard)", () => {
  it("flips a weaker adjacent enemy card", () => {
    const board = emptyBoard();
    board[1] = mkCard("p2", [1, 1, 1, 1], 1);

    const { board: after, beaten } = solver.putCard(
      board,
      mkCard("p1", [9, 9, 9, 9], 4)
    );

    expect(beaten).toEqual([1]);
    expect((after[1] as EngineCard).holder).toBe("p1");
    expect((after[1] as EngineCard).owner).toBe("p2"); // ownership never moves
    expect((board[1] as EngineCard).holder).toBe("p2"); // input not mutated
  });

  it("does not flip on equal values (must be strictly greater)", () => {
    const board = emptyBoard();
    board[1] = mkCard("p2", [5, 5, 5, 5], 1);

    const { beaten } = solver.putCard(board, mkCard("p1", [5, 5, 5, 5], 4));
    expect(beaten).toEqual([]);
  });

  it("only the facing sides are compared", () => {
    const board = emptyBoard();
    board[1] = mkCard("p2", [9, 9, 1, 9], 1); // weak bottom only
    board[5] = mkCard("p2", [9, 9, 9, 9], 5); // strong everywhere

    // placed at center: top side 9 beats the top neighbour's bottom 1,
    // right side 1 loses to the right neighbour's left 9
    const { beaten } = solver.putCard(board, mkCard("p1", [9, 1, 1, 1], 4));
    expect(beaten).toEqual([1]);
  });

  it("never flips a card already held by the mover", () => {
    const board = emptyBoard();
    board[1] = mkCard("p1", [1, 1, 1, 1], 1);

    const { beaten } = solver.putCard(board, mkCard("p1", [9, 9, 9, 9], 4));
    expect(beaten).toEqual([]);
  });
});

describe("full games through the local API", () => {
  const playFullGame = () => {
    let p1 = dealPlayerHand();
    let p2 = dealEnemyHand(p1);
    let board = emptyBoard();
    let result: TurnResult | null = null;
    let turns = 0;

    // the (dumb) test player always drops its first card on the first empty cell
    while (turns < 6) {
      const card = p1[0];
      const position = board.findIndex((cell) => !isCard(cell));
      result = playGame({
        hands: { p1, p2 },
        board,
        move: { id: card.id, position },
      });

      turns++;
      board = result.board;
      p1 = p1.filter((c) => c.id !== card.id);
      p2 = result.hands.p2.pokes.map((entry) => entry.poke);

      if (result.move === null) break;

      // mid-game: player + AI each placed one card this round
      expect(board.filter(isCard).length).toBe(turns * 2);
      expect(result.oldBoard.filter(isCard).length).toBe(turns * 2 - 1);
    }

    return { result: result as TurnResult, board, p1, p2, turns };
  };

  it("always ends on turn 5 with a full board and 10 total points", () => {
    for (let i = 0; i < 10; i++) {
      const { result, board, p1, p2, turns } = playFullGame();

      expect(turns).toBe(5);
      expect(result.move).toBeNull();
      expect(board.filter(isCard).length).toBe(9);
      expect(p1).toHaveLength(0); // player used all 5 cards
      expect(p2).toHaveLength(1); // AI played 4 of 5

      const p1Points =
        board.filter((c) => isCard(c) && c.holder === "p1").length +
        result.hands.p1.pokes.length;
      const p2Points =
        board.filter((c) => isCard(c) && c.holder === "p2").length +
        result.hands.p2.pokes.length;
      expect(p1Points + p2Points).toBe(10);
    }
  });

  it("board cells keep the shape the store consumes ({poke, holder})", () => {
    const { board } = playFullGame();
    board.filter(isCard).forEach((cell) => {
      const card = cell as EngineCard;
      expect(card.poke.thumbnail.path).toMatch(/^https:\/\//);
      expect(["p1", "p2"]).toContain(card.holder);
      expect(card.hits).toHaveLength(4);
    });
  });
});
