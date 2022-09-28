import React from "react";
import loading from "./images/loading.gif";
import s from "./Preloader.module.css";

const Preloader = () => {
  return (
    <div className={s.root}>
      <img src={loading} alt="trapped shere" />
    </div>
  );
};

export default Preloader;
