import { Character } from "../interfaces";

/** The four side values of a card (top, right, bottom, left) live in attacks[1]. */
export const getCardValues = (character: Character): number[] =>
  character.attacks[1] as number[];
