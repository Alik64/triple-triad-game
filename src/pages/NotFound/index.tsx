import React from "react";
import { useNavigate } from "react-router-dom";
import hydra from "./images/Hydra_logo.webp";
import capAmerica from "./images/capAmerica.png";
import s from "./NotFound.module.css";
import Footer from "../../components/Footer";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className={s.root}>
      <section className={s.description}>
        <h1 className={s.title}>404 Page not found</h1>
        <h3 className={s.subtitle}>HYDRA is currently attacking this page</h3>
        <p className={s.hint}>Check that you typed the address correctly</p>
      </section>
      <section className={s.images}>
        <img src={hydra} alt="hydra clan logo" className={s.hydra} />
        <img
          src={capAmerica}
          alt="capitain America crying"
          className={s.capAmerica}
        />
      </section>
      <section className={s.buttons}>
        <button className="btn btnPrimary" onClick={() => navigate("/game")}>
          Play game
        </button>
        <button className="btn" onClick={() => navigate("/")}>
          Home page
        </button>
      </section>
      <Footer />
    </main>
  );
};

export default NotFound;
