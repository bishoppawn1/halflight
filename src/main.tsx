import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Game from "../app/game";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Halflight could not find its page root.");
}

createRoot(root).render(
  <StrictMode>
    <Game />
  </StrictMode>,
);
