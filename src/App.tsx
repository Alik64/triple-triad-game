import { Route, Routes } from "react-router-dom";
import Modal from "./components/UI/Modal";

import Game from "./pages/Game";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Rules from "./pages/Rules";
import { useGameStore } from "./store/gameStore";

function App() {
  const isModalOpen = useGameStore((state) => state.isModalOpen);
  const winner = useGameStore((state) => state.winner);

  return (
    <>
      {isModalOpen && <Modal winner={winner} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
