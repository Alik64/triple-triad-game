import React from "react";
import { useNavigate } from "react-router-dom";
import logoGame from "../../assets/logoGame.png";
import combat from "./images/combat.png";
import cn from "classnames";
import s from "./Home.module.css";

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className={s.root}>
      <img src={combat} className={s.combat} alt="Cap America vs iron man" />
      <section className={s.titleContainer}>
        <img
          className={s.logoGame}
          src={logoGame}
          alt="TripleTriad game logo"
        />
        <h1 className={s.title}>Triple triad game</h1>
      </section>
      <section className={s.btnsContainer} id="kaka">
        <button
          onClick={() => navigate("/game")}
          className={cn("btn", s.lfgBtn)}
        >
          <span className="btn_span"></span>Let's go
        </button>
        <button onClick={() => navigate("/game")} className="btn">
          <span className="btn_span"></span>See rules
        </button>
      </section>
    </div>
  );
};

export default Home;
