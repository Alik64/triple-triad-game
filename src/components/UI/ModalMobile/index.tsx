import React from "react";
import s from "./ModalMobile.module.css";

const ModalMobile: React.FC = () => {
  return (
    <div className={s.root}>
      <section className={s.modal}>
        <div className={s.flex}>
          <h3>Warning</h3>
          <p>
            To play this game, please turn your device to 'landscape mode'
            <br />
            or
            <br />
            adjust your screen browser size to 667px min.
          </p>
        </div>
      </section>
      <div className={s.overlay}></div>
    </div>
  );
};

export default ModalMobile;
