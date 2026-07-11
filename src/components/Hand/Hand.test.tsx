import { render, screen, fireEvent } from "@testing-library/react";
import Hand from ".";
import { Character } from "../../interfaces";

const mkChar = (id: number): Character => ({
  id,
  name: `char-${id}`,
  thumbnail: { path: "https://img.test/x.jpg" },
  attacks: [10, [1, 2, 3, 4]],
});

const chars = [1, 2, 3, 4, 5].map(mkChar);

it("renders the 5 cards and toggles selection on click", () => {
  const onClick = jest.fn();
  const { rerender } = render(
    <Hand
      side="right"
      characters={chars}
      score={5}
      activeId={null}
      onClick={onClick}
    />
  );

  expect(screen.getByText("You")).toBeInTheDocument();
  expect(screen.getAllByText("1")).toHaveLength(5); // one top value per card

  fireEvent.click(screen.getAllByText("1")[0]);
  expect(onClick).toHaveBeenLastCalledWith(1);

  // clicking the already-selected card deselects it
  rerender(
    <Hand
      side="right"
      characters={chars}
      score={5}
      activeId={1}
      onClick={onClick}
    />
  );
  fireEvent.click(screen.getAllByText("1")[0]);
  expect(onClick).toHaveBeenLastCalledWith(null);
});

it("ignores clicks when disabled and labels the enemy side", () => {
  const onClick = jest.fn();
  render(
    <Hand side="left" characters={chars} score={5} disabled onClick={onClick} />
  );

  expect(screen.getByText("Enemy")).toBeInTheDocument();
  fireEvent.click(screen.getAllByText("1")[0]);
  expect(onClick).not.toHaveBeenCalled();
});
