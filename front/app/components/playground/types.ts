export interface PlaygroundCard {
  id: string;
  name: string;
  type: string;
  class: string;
  rune_cost: number;
  force: number | null;
  endurance: number | null;
  illustration: string;
}
