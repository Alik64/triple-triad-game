import { render, screen, fireEvent } from "@testing-library/react";
import Card from ".";

it("shows the four side values and reports clicks with its id", () => {
  const onClick = jest.fn();
  render(
    <Card
      id={42}
      image="https://img.test/x.jpg"
      values={[1, 2, 3, 4]}
      onClick={onClick}
      holder="p1"
    />
  );

  [1, 2, 3, 4].forEach((value) =>
    expect(screen.getByText(String(value))).toBeInTheDocument()
  );

  fireEvent.click(screen.getByText("1"));
  expect(onClick).toHaveBeenCalledWith(42);
});
