import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import s from "./App.module.css";
import Game from "./pages/Game";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
    </Routes>
  );
}

export default App;
