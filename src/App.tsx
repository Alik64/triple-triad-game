import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import s from "./App.module.css";
import Game from "./pages/Game";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
