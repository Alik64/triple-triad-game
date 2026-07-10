import React from "react";
import s from "./Preloader.module.css";

/** Skeleton stack shown in a hand while the deck is being dealt. */
const Preloader = () => {
  return (
    <div className={s.root} role="status" aria-label="Dealing cards">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={s.card}
          style={{ animationDelay: `${index * 0.12}s` }}
        />
      ))}
    </div>
  );
};

export default Preloader;
