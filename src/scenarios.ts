import { EMPTY, WALL, WEIGHT, maze, randomGrid } from "./pathfinding.js";

export const LAB_ROWS = 13, LAB_COLS = 25;
export const DEFAULT_START = 6 * LAB_COLS + 2, DEFAULT_GOAL = 6 * LAB_COLS + 22;
export const SCENARIOS = ["showcase", "weighted", "open", "maze", "random"] as const;
export type Scenario = typeof SCENARIOS[number] | "custom";

export function scenarioGrid(scenario: Exclude<Scenario, "custom">, start = DEFAULT_START, goal = DEFAULT_GOAL) {
  if (scenario === "open") return Array(LAB_ROWS * LAB_COLS).fill(EMPTY);
  if (scenario === "maze") return maze(LAB_ROWS, LAB_COLS, start, goal);
  if (scenario === "random") return randomGrid(LAB_ROWS, LAB_COLS, start, goal, true);
  const grid = Array(LAB_ROWS * LAB_COLS).fill(EMPTY);
  if (scenario === "weighted") {
    for (let row = 1; row < LAB_ROWS - 1; row++) for (let col = 9; col < 16; col++) if (row !== 3 && row !== 9) grid[row * LAB_COLS + col] = WEIGHT;
    for (const cell of [3 * LAB_COLS + 5, 4 * LAB_COLS + 5, 8 * LAB_COLS + 19, 9 * LAB_COLS + 19]) grid[cell] = WALL;
    return grid;
  }
  const walls = [
    ...[1, 2, 3, 5, 6, 7, 9, 10, 11].map(row => row * LAB_COLS + 6),
    ...[2, 3, 4, 5, 7, 8, 9, 10, 11].map(row => row * LAB_COLS + 12),
    ...[1, 2, 4, 5, 6, 8, 9, 10, 11].map(row => row * LAB_COLS + 18),
    3 * LAB_COLS + 7, 3 * LAB_COLS + 8, 9 * LAB_COLS + 16, 9 * LAB_COLS + 17,
  ];
  const weights = [5 * LAB_COLS + 8, 5 * LAB_COLS + 9, 5 * LAB_COLS + 10, 6 * LAB_COLS + 9, 6 * LAB_COLS + 10, 7 * LAB_COLS + 14, 7 * LAB_COLS + 15, 7 * LAB_COLS + 16];
  for (const cell of walls) grid[cell] = WALL;
  for (const cell of weights) grid[cell] = WEIGHT;
  return grid;
}
