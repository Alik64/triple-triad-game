import "@testing-library/jest-dom";

// jsdom has no matchMedia; the app uses it to gate desktop vs mobile UI.
// matches: true = desktop, so pages render the real game in tests.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});
