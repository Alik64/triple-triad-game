import { render, screen, fireEvent } from "@testing-library/react";
import Board from ".";
import { Character } from "../../interfaces";

const placedCard: Character = {
  id: 9,
  name: "placed",
  thumbnail: { path: "https://img.test/x.jpg" },
  attacks: [10, [1, 2, 3, 4]],
  holder: "p2",
};

it("renders empty cells as drop targets and placed cards with their values", () => {
  const board: (Character | number)[] = [0, 0, 0, 0, placedCard, 0, 0, 0, 0];
  const onClick = jest.fn();

  render(<Board board={board} onClick={onClick} highlight />);

  expect(screen.getAllByTestId(/^cell-/)).toHaveLength(8);
  expect(screen.getByText("1")).toBeInTheDocument(); // the card's top value

  fireEvent.click(screen.getByTestId("cell-0"));
  expect(onClick).toHaveBeenCalledWith(0);
});
