export type House = "Gryffindor" | "Hufflepuff" | "Ravenclaw" | "Slytherin";

export interface Answer {
  title: string;
  scores: Partial<Record<House, number>>;
}

export interface Question {
  title: string;
  answers: Answer[];
}
