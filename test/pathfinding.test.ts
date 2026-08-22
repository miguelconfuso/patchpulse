import assert from "node:assert/strict";
import test from "node:test";
import { EMPTY, WALL, WEIGHT, maze, randomGrid, search, type Algorithm } from "../src/pathfinding.ts";
import { DEFAULT_GOAL, DEFAULT_START, LAB_COLS, LAB_ROWS, SCENARIOS, scenarioGrid } from "../src/scenarios.ts";

const rows = 5, cols = 7, start = 14, goal = 20;
const open = Array(rows * cols).fill(EMPTY);

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 2 ** 32;
  };
}

test("BFS finds the fewest steps", () => {
  const result = search({ algorithm: "bfs", grid: open, rows, cols, start, goal });
  assert.equal(result.found, true);
  assert.equal(result.path.length - 1, 6);
  assert.equal(result.cost, 6);
});

test("Dijkstra avoids weights even when the detour takes more steps", () => {
  const grid = [...open];
  for (const index of [16, 17, 18]) grid[index] = WEIGHT;
  const bfs = search({ algorithm: "bfs", grid, rows, cols, start, goal });
  const dijkstra = search({ algorithm: "dijkstra", grid, rows, cols, start, goal });
  assert.ok(dijkstra.path.length > bfs.path.length);
  assert.ok(dijkstra.cost < bfs.cost);
});

test("A* preserves the optimal cost and expands no more nodes than Dijkstra", () => {
  const grid = [...open];
  for (const index of [9, 10, 11, 23, 24]) grid[index] = WALL;
  const dijkstra = search({ algorithm: "dijkstra", grid, rows, cols, start, goal });
  const astar = search({ algorithm: "astar", grid, rows, cols, start, goal, heuristic: "manhattan" });
  assert.equal(astar.cost, dijkstra.cost);
  assert.ok(astar.visited.length <= dijkstra.visited.length);
});

test("A* remains optimal with every heuristic and diagonal movement", () => {
  const grid = [...open];
  for (const index of [9, 16, 23]) grid[index] = WALL;
  for (const index of [11, 18]) grid[index] = WEIGHT;
  const dijkstra = search({ algorithm: "dijkstra", grid, rows, cols, start, goal, diagonal: true });
  for (const heuristic of ["manhattan", "euclidean", "chebyshev"] as const) {
    const astar = search({ algorithm: "astar", grid, rows, cols, start, goal, diagonal: true, heuristic });
    assert.ok(Math.abs(astar.cost - dijkstra.cost) < 1e-9);
  }
});

test("Greedy finds a valid route without promising optimality", () => {
  const grid = [...open];
  for (const index of [9, 10, 11, 16, 23]) grid[index] = WALL;
  const result = search({ algorithm: "greedy", grid, rows, cols, start, goal, heuristic: "manhattan" });
  assert.equal(result.found, true);
  assert.equal(result.path[0], start);
  assert.equal(result.path.at(-1), goal);
});

test("Bidirectional BFS preserves the fewest number of steps", () => {
  const grid = [...open];
  for (const index of [9, 10, 11, 23, 24]) grid[index] = WALL;
  const bfs = search({ algorithm: "bfs", grid, rows, cols, start, goal });
  const bidirectional = search({ algorithm: "bidirectional", grid, rows, cols, start, goal });
  assert.equal(bidirectional.path.length, bfs.path.length);
  assert.ok(bidirectional.visited.length <= bfs.visited.length);
});

test("diagonal movement cannot cut through blocked corners", () => {
  const grid = Array(9).fill(EMPTY);
  grid[1] = WALL; grid[3] = WALL;
  assert.equal(search({ algorithm: "astar", grid, rows: 3, cols: 3, start: 0, goal: 4, diagonal: true }).found, false);
});

test("every algorithm recognises an isolated goal", () => {
  const grid = [...open];
  for (const index of [goal - 1, goal - cols, goal + cols]) grid[index] = WALL;
  for (const algorithm of ["bfs", "dfs", "dijkstra", "astar", "greedy", "bidirectional"] as Algorithm[]) {
    assert.equal(search({ algorithm, grid, rows, cols, start, goal }).found, false);
  }
});

test("generated mazes keep start and goal traversable and connected", () => {
  const mazeRows = 13, mazeCols = 25;
  for (const markerRow of [6, 7]) {
    const mazeStart = markerRow * mazeCols + 2, mazeGoal = markerRow * mazeCols + 22;
    const grid = maze(mazeRows, mazeCols, mazeStart, mazeGoal, () => .42);
    assert.equal(grid[mazeStart], EMPTY);
    assert.equal(grid[mazeGoal], EMPTY);
    assert.equal(search({ algorithm: "bfs", grid, rows: mazeRows, cols: mazeCols, start: mazeStart, goal: mazeGoal }).found, true);
  }
});

test("the scenario catalogue preserves dimensions and markers", () => {
  for (const scenario of SCENARIOS) {
    const grid = scenarioGrid(scenario);
    assert.equal(grid.length, LAB_ROWS * LAB_COLS);
    assert.equal(grid[DEFAULT_START], EMPTY);
    assert.equal(grid[DEFAULT_GOAL], EMPTY);
  }
});

test("optimality properties hold across 500 seeded grids", () => {
  const generatedRows = 9, generatedCols = 13;
  const generatedStart = 0, generatedGoal = generatedRows * generatedCols - 1;

  for (let seed = 1; seed <= 500; seed++) {
    const grid = randomGrid(generatedRows, generatedCols, generatedStart, generatedGoal, true, seededRandom(seed));
    const diagonal = seed % 2 === 0;
    const context = `seed=${seed}, diagonal=${diagonal}`;
    const dijkstra = search({ algorithm: "dijkstra", grid, rows: generatedRows, cols: generatedCols, start: generatedStart, goal: generatedGoal, diagonal });

    for (const heuristic of ["manhattan", "euclidean", "chebyshev"] as const) {
      const astar = search({ algorithm: "astar", grid, rows: generatedRows, cols: generatedCols, start: generatedStart, goal: generatedGoal, diagonal, heuristic });
      assert.equal(astar.found, dijkstra.found, `${context}, heuristic=${heuristic}`);
      if (dijkstra.found) assert.ok(Math.abs(astar.cost - dijkstra.cost) < 1e-9, `${context}, heuristic=${heuristic}`);
    }

    const unweightedGrid = grid.map(cell => cell === WEIGHT ? EMPTY : cell);
    const bfs = search({ algorithm: "bfs", grid: unweightedGrid, rows: generatedRows, cols: generatedCols, start: generatedStart, goal: generatedGoal, diagonal });
    const bidirectional = search({ algorithm: "bidirectional", grid: unweightedGrid, rows: generatedRows, cols: generatedCols, start: generatedStart, goal: generatedGoal, diagonal });
    assert.equal(bidirectional.found, bfs.found, context);
    if (bfs.found) assert.equal(bidirectional.path.length, bfs.path.length, context);
  }
});

test("invalid input fails early", () => {
  assert.throws(() => search({ algorithm: "bfs", grid: [EMPTY], rows: 2, cols: 2, start: 0, goal: 3 }), /invalid grid/);
  assert.throws(() => search({ algorithm: "bfs", grid: open, rows, cols, start: 0, goal: open.length }), /invalid markers/);
});
