import React from "react";
import s from "./ModalMobile.module.css";

const ModalMobile: React.FC = () => {
  return (
    <div className={s.root}>
      <section className={s.modal}>
        <svg className={s.phone} viewBox="0 0 24 24" aria-hidden="true">
          <rect
            x="7"
            y="2.5"
            width="10"
            height="19"
            rx="2.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="12" cy="18.4" r="0.9" fill="currentColor" />
        </svg>
        <h3 className={s.title}>Rotate your device</h3>
        <p className={s.text}>
          Triple Triad needs a landscape screen. Turn your device sideways, or
          widen the browser window to at least 667px.
        </p>
      </section>
    </div>
  );
};

export default ModalMobile;
