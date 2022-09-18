export interface Marvel {
  characters: Character[];
}

export interface Character {
  id: number;
  name: string;
  description: string;
  thumbnail: Thumbnail;
  resourceURI: string;
  wiki: string;
  urlCharacters: string;
  attacks: Array<number[] | number>;
  values: Values;
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
