import React from "react";
import { useNavigate } from "react-router-dom";
import hydra from "./images/Hydra_logo.webp";
import capAmerica from "./images/capAmerica.png";
import s from "./NotFound.module.css";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className={s.root}>
      <section className={s.description}>
        <h1>404 PAGE NOT FOUND </h1>
        <h3>HYDRA is currently attacking this page</h3>
        <p>Check that you typed the address correctly</p>
      </section>
      <section className={s.images}>
        {" "}
        <img src={hydra} alt="hydra clan logo" className={s.hydra} />
        <img
          src={capAmerica}
          alt="capitain America crying"
          className={s.capAmerica}
        />
      </section>
      <section className={s.buttons}>
        <button className="btn" onClick={() => navigate("/game")}>
          <span className="btn_span"></span>play game
        </button>
        <button className="btn" onClick={() => navigate("/")}>
          <span className="btn_span"></span>home page
        </button>
      </section>
    </main>
  );
};

export default NotFound;
