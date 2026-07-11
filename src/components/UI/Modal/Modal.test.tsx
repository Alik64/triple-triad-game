import { render, screen, fireEvent } from "@testing-library/react";
import Modal from ".";
import { useGameStore } from "../../../store/gameStore";

it("shows the verdict and restarts the game on Play again", () => {
  render(<Modal winner="blue" />);

  expect(screen.getByText("Victory")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /play again/i }));
  expect(useGameStore.getState().playerCards).toHaveLength(5);
  expect(useGameStore.getState().winner).toBe("");
});

it("closes on the close button", () => {
  useGameStore.setState({ isModalOpen: true });
  render(<Modal winner="red" />);

  expect(screen.getByText("Defeat")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /close/i }));
  expect(useGameStore.getState().isModalOpen).toBe(false);
});
