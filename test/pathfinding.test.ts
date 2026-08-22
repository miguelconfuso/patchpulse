import assert from "node:assert/strict";
import test from "node:test";
import { EMPTY, WALL, WEIGHT, maze, search, type Algorithm } from "../src/pathfinding.ts";
import { DEFAULT_GOAL, DEFAULT_START, LAB_COLS, LAB_ROWS, SCENARIOS, scenarioGrid } from "../src/scenarios.ts";

const rows = 5, cols = 7, start = 14, goal = 20;
const open = Array(rows * cols).fill(EMPTY);

test("BFS encontra o menor número de passos", () => {
  const result = search({ algorithm: "bfs", grid: open, rows, cols, start, goal });
  assert.equal(result.found, true);
  assert.equal(result.path.length - 1, 6);
  assert.equal(result.cost, 6);
});

test("Dijkstra evita pesos mesmo quando o desvio usa mais passos", () => {
  const grid = [...open];
  for (const index of [16, 17, 18]) grid[index] = WEIGHT;
  const bfs = search({ algorithm: "bfs", grid, rows, cols, start, goal });
  const dijkstra = search({ algorithm: "dijkstra", grid, rows, cols, start, goal });
  assert.ok(dijkstra.path.length > bfs.path.length);
  assert.ok(dijkstra.cost < bfs.cost);
});

test("A* preserva o custo ótimo e expande no máximo os nós de Dijkstra", () => {
  const grid = [...open];
  for (const index of [9, 10, 11, 23, 24]) grid[index] = WALL;
  const dijkstra = search({ algorithm: "dijkstra", grid, rows, cols, start, goal });
  const astar = search({ algorithm: "astar", grid, rows, cols, start, goal, heuristic: "manhattan" });
  assert.equal(astar.cost, dijkstra.cost);
  assert.ok(astar.visited.length <= dijkstra.visited.length);
});

test("A* mantém custo ótimo com todas as heurísticas e diagonais", () => {
  const grid = [...open];
  for (const index of [9, 16, 23]) grid[index] = WALL;
  for (const index of [11, 18]) grid[index] = WEIGHT;
  const dijkstra = search({ algorithm: "dijkstra", grid, rows, cols, start, goal, diagonal: true });
  for (const heuristic of ["manhattan", "euclidean", "chebyshev"] as const) {
    const astar = search({ algorithm: "astar", grid, rows, cols, start, goal, diagonal: true, heuristic });
    assert.ok(Math.abs(astar.cost - dijkstra.cost) < 1e-9);
  }
});

test("Greedy encontra rota válida com menos compromisso de otimalidade", () => {
  const grid = [...open];
  for (const index of [9, 10, 11, 16, 23]) grid[index] = WALL;
  const result = search({ algorithm: "greedy", grid, rows, cols, start, goal, heuristic: "manhattan" });
  assert.equal(result.found, true);
  assert.equal(result.path[0], start);
  assert.equal(result.path.at(-1), goal);
});

test("BFS bidirecional preserva o menor número de passos", () => {
  const grid = [...open];
  for (const index of [9, 10, 11, 23, 24]) grid[index] = WALL;
  const bfs = search({ algorithm: "bfs", grid, rows, cols, start, goal });
  const bidirectional = search({ algorithm: "bidirectional", grid, rows, cols, start, goal });
  assert.equal(bidirectional.path.length, bfs.path.length);
  assert.ok(bidirectional.visited.length <= bfs.visited.length);
});

test("movimento diagonal não atravessa o canto de duas paredes", () => {
  const grid = Array(9).fill(EMPTY);
  grid[1] = WALL; grid[3] = WALL;
  assert.equal(search({ algorithm: "astar", grid, rows: 3, cols: 3, start: 0, goal: 4, diagonal: true }).found, false);
});

test("todos os algoritmos reconhecem um destino isolado", () => {
  const grid = [...open];
  for (const index of [goal - 1, goal - cols, goal + cols]) grid[index] = WALL;
  for (const algorithm of ["bfs", "dfs", "dijkstra", "astar", "greedy", "bidirectional"] as Algorithm[]) {
    assert.equal(search({ algorithm, grid, rows, cols, start, goal }).found, false);
  }
});

test("labirinto mantém origem e destino transitáveis e conectados", () => {
  const mazeRows = 13, mazeCols = 25;
  for (const markerRow of [6, 7]) {
    const mazeStart = markerRow * mazeCols + 2, mazeGoal = markerRow * mazeCols + 22;
    const grid = maze(mazeRows, mazeCols, mazeStart, mazeGoal, () => .42);
    assert.equal(grid[mazeStart], EMPTY);
    assert.equal(grid[mazeGoal], EMPTY);
    assert.equal(search({ algorithm: "bfs", grid, rows: mazeRows, cols: mazeCols, start: mazeStart, goal: mazeGoal }).found, true);
  }
});

test("catálogo de cenários preserva dimensões e marcadores", () => {
  for (const scenario of SCENARIOS) {
    const grid = scenarioGrid(scenario);
    assert.equal(grid.length, LAB_ROWS * LAB_COLS);
    assert.equal(grid[DEFAULT_START], EMPTY);
    assert.equal(grid[DEFAULT_GOAL], EMPTY);
  }
});

test("entrada inválida falha cedo", () => {
  assert.throws(() => search({ algorithm: "bfs", grid: [EMPTY], rows: 2, cols: 2, start: 0, goal: 3 }), /invalid grid/);
  assert.throws(() => search({ algorithm: "bfs", grid: open, rows, cols, start: 0, goal: open.length }), /invalid markers/);
});
