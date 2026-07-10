export type Difficulty = "easy" | "medium" | "hard";

export type TurnStatus = "player" | "ai";

export type PathStepOwner = "player" | "ai" | "neutral";

export type PathStep = {
  countryCode: string;
  owner: PathStepOwner;
  turn: number;
};
