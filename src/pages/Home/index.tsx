import React from "react";
import { useNavigate } from "react-router-dom";
import logoGame from "../../assets/logoGame.png";
import combat from "./images/combat.png";
import cn from "classnames";
import s from "./Home.module.css";
import useMediaQuery from "../../utils/hooks/useMediaQuery";
import ModalMobile from "../../components/UI/ModalMobile";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const matches = useMediaQuery("(min-width: 667px)");

  if (!matches && window.innerHeight > 500) {
    return <ModalMobile />;
  }
  return (
    <div className={s.root}>
      <img src={combat} className={s.combat} alt="Cap America vs iron man" />
      <section className={s.titleContainer}>
        <img
          className={s.logoGame}
          src={logoGame}
          alt="TripleTriad game logo"
        />
        <h1 className={s.title}>Triple Triad Game</h1>
      </section>
      <section className={s.btnsContainer}>
        <button
          onClick={() => navigate("/rules")}
          className={cn("btn", s.lfgBtn)}
        >
          <span className="btn_span"></span>See rules
        </button>
        <button onClick={() => navigate("/game")} className="btn">
          <span className="btn_span"></span>Let's go
        </button>
      </section>
    </div>
  );
};

export default Home;
