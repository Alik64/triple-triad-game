export interface Character {
  id: number;
  name: string;
  thumbnail: Thumbnail;
  attacks: Array<number[] | number>;
  /** Legacy Marvel API fields — absent from the trimmed local catalog. */
  description?: string;
  resourceURI?: string;
  wiki?: string;
  urlCharacters?: string;
  values?: Values;
  holder?: string;
}

export interface Thumbnail {
  path: string;
}

export interface Values {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
