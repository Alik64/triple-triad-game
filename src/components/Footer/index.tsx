import React from "react";
import cn from "classnames";
import s from "./Footer.module.css";

/**
 * Marvel API attribution + non-affiliation disclaimer. The Marvel API terms
 * require the attribution notice on every screen that shows their data.
 */
const Footer: React.FC<{ className?: string }> = ({ className }) => (
  <footer className={cn(s.root, className)}>
    <p>
      Data provided by{" "}
      <a href="https://www.marvel.com" target="_blank" rel="noreferrer">
        Marvel
      </a>
      . © MARVEL
    </p>
    <p>
      Fan project, non-commercial — not affiliated with Marvel or Square Enix.
      Made by{" "}
      <a
        href="https://www.linkedin.com/in/albert-64/"
        target="_blank"
        rel="noreferrer"
      >
        Albert
      </a>
      .
    </p>
  </footer>
);

export default Footer;
