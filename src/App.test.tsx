import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

it("renders the home page", () => {
  renderAt("/");
  expect(
    screen.getByRole("heading", { name: /triple triad/i })
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /let's go/i })).toBeInTheDocument();
});

it("deals a game on /game and accepts a first move", () => {
  renderAt("/game");

  // the local engine deals instantly on mount
  expect(screen.getByText(/pick or drag a card/i)).toBeInTheDocument();
  expect(screen.getByText("You")).toBeInTheDocument();
  expect(screen.getByText("Enemy")).toBeInTheDocument();

  // only the player's 5 hand cards are draggable
  const cards = screen
    .getAllByRole("button")
    .filter((el) => el.getAttribute("aria-roledescription") === "draggable");
  expect(cards).toHaveLength(5);

  fireEvent.click(cards[0]);
  expect(screen.getByText(/choose a cell/i)).toBeInTheDocument();

  fireEvent.click(screen.getByTestId("cell-4"));
  // optimistic placement: the enemy is now "thinking" through the 500ms pause
  expect(screen.getByText(/enemy is thinking/i)).toBeInTheDocument();
  expect(screen.queryByTestId("cell-4")).not.toBeInTheDocument();
});

it("renders the rules page and the 404 fallback without crashing", () => {
  const rules = renderAt("/rules");
  rules.unmount();
  renderAt("/definitely-not-a-route");
});
