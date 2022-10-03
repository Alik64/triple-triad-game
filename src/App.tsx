import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import Modal from "./components/Modal";

import Game from "./pages/Game";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Rules from "./pages/Rules";
import { isModalOpenSelector, winnerSelector } from "./redux/characterSlice";

function App() {
  const isModalOpen = useSelector(isModalOpenSelector);
  const winner = useSelector(winnerSelector);

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
