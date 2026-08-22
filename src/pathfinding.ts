export type Algorithm = "bfs" | "dfs" | "dijkstra" | "astar" | "greedy" | "bidirectional";
export type Heuristic = "manhattan" | "euclidean" | "chebyshev";

export const EMPTY = 0, WALL = -1, WEIGHT = 7;
export const ALGORITHMS = {
  bfs: { name: "BFS", time: "O(V + E)", space: "O(V)", optimal: "fewest steps", description: "expands in even layers; weights are ignored" },
  dfs: { name: "DFS", time: "O(V + E)", space: "O(V)", optimal: "no", description: "dives down one branch before backtracking" },
  dijkstra: { name: "Dijkstra", time: "O((V+E) log V)", space: "O(V)", optimal: "lowest cost", description: "always expands the cheapest known frontier node" },
  astar: { name: "A*", time: "O((V+E) log V) worst", space: "O(V)", optimal: "admissible h", description: "adds a goal estimate to the accumulated cost" },
  greedy: { name: "Greedy", time: "O((V+E) log V)", space: "O(V)", optimal: "no", description: "follows only the goal estimate; fast but shortsighted" },
  bidirectional: { name: "Bi-BFS", time: "O(V + E)", space: "O(V)", optimal: "fewest steps", description: "grows BFS waves from both ends until they meet" },
} as const;

export interface SearchOptions { algorithm: Algorithm; grid: number[]; rows: number; cols: number; start: number; goal: number; diagonal?: boolean; heuristic?: Heuristic }
export interface SearchResult { visited: number[]; path: number[]; cost: number; maxFrontier: number; found: boolean }
type Edge = { index: number; cost: number };

class MinHeap {
  #items: Array<{ index: number; priority: number }> = [];
  get size() { return this.#items.length; }
  push(item: { index: number; priority: number }) {
    let child = this.#items.length;
    this.#items.push(item);
    while (child > 0) {
      const parent = (child - 1) >> 1;
      if (this.#items[parent]!.priority <= item.priority) break;
      this.#items[child] = this.#items[parent]!; child = parent;
    }
    this.#items[child] = item;
  }
  pop() {
    const root = this.#items[0], last = this.#items.pop();
    if (this.#items.length && last) {
      let parent = 0;
      while (true) {
        let child = parent * 2 + 1;
        if (child >= this.#items.length) break;
        if (child + 1 < this.#items.length && this.#items[child + 1]!.priority < this.#items[child]!.priority) child++;
        if (this.#items[child]!.priority >= last.priority) break;
        this.#items[parent] = this.#items[child]!; parent = child;
      }
      this.#items[parent] = last;
    }
    return root;
  }
}

function edges(index: number, grid: number[], rows: number, cols: number, diagonal: boolean): Edge[] {
  const row = Math.floor(index / cols), col = index % cols;
  const directions = diagonal
    ? [[-1,0,1],[0,1,1],[1,0,1],[0,-1,1],[-1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[1,1,Math.SQRT2],[1,-1,Math.SQRT2]]
    : [[-1,0,1],[0,1,1],[1,0,1],[0,-1,1]];
  return directions.flatMap(([dr, dc, distance]) => {
    const r = row + dr!, c = col + dc!;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return [];
    const next = r * cols + c;
    if (grid[next] === WALL || (dr && dc && (grid[row * cols + c] === WALL || grid[r * cols + col] === WALL))) return [];
    return [{ index: next, cost: distance! * Math.max(1, grid[next]!) }];
  });
}

function heuristic(from: number, goal: number, cols: number, kind: Heuristic, diagonal: boolean) {
  const dx = Math.abs(from % cols - goal % cols), dy = Math.abs(Math.floor(from / cols) - Math.floor(goal / cols));
  if (diagonal && kind === "manhattan") return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
  if (kind === "euclidean") return Math.hypot(dx, dy);
  if (kind === "chebyshev") return Math.max(dx, dy);
  return dx + dy;
}

function pathFrom(parent: Int32Array, start: number, goal: number) {
  if (start !== goal && parent[goal]! < 0) return [];
  const path = [goal];
  while (path.at(-1) !== start) path.push(parent[path.at(-1)!]!);
  return path.reverse();
}

function pathCost(path: number[], grid: number[], cols: number) {
  return path.slice(1).reduce((cost, cell, position) => {
    const previous = path[position]!;
    const diagonal = Math.abs(cell % cols - previous % cols) === 1 && Math.abs(Math.floor(cell / cols) - Math.floor(previous / cols)) === 1;
    return cost + (diagonal ? Math.SQRT2 : 1) * Math.max(1, grid[cell]!);
  }, 0);
}

function unweighted(options: SearchOptions, depthFirst: boolean): SearchResult {
  const { grid, rows, cols, start, goal, diagonal = false } = options;
  const frontier = [start], seen = new Uint8Array(grid.length), parent = new Int32Array(grid.length).fill(-1), visited: number[] = [];
  let head = 0, maxFrontier = 1;
  seen[start] = 1;
  while (depthFirst ? frontier.length : head < frontier.length) {
    const current = depthFirst ? frontier.pop()! : frontier[head++]!;
    visited.push(current);
    if (current === goal) break;
    const adjacent = edges(current, grid, rows, cols, diagonal);
    if (depthFirst) adjacent.reverse();
    for (const edge of adjacent) if (!seen[edge.index]) { seen[edge.index] = 1; parent[edge.index] = current; frontier.push(edge.index); }
    maxFrontier = Math.max(maxFrontier, depthFirst ? frontier.length : frontier.length - head);
  }
  const path = pathFrom(parent, start, goal);
  return { visited, path, cost: path.length ? pathCost(path, grid, cols) : Infinity, maxFrontier, found: path.length > 0 };
}

function weighted(options: SearchOptions, strategy: "dijkstra" | "astar" | "greedy"): SearchResult {
  const { grid, rows, cols, start, goal, diagonal = false, heuristic: kind = "manhattan" } = options;
  const frontier = new MinHeap(), distance = new Float64Array(grid.length).fill(Infinity), parent = new Int32Array(grid.length).fill(-1), closed = new Uint8Array(grid.length), visited: number[] = [];
  distance[start] = 0; frontier.push({ index: start, priority: 0 });
  let maxFrontier = 1;
  while (frontier.size) {
    const current = frontier.pop();
    if (!current || closed[current.index]) continue;
    closed[current.index] = 1; visited.push(current.index);
    if (current.index === goal) break;
    for (const edge of edges(current.index, grid, rows, cols, diagonal)) {
      const candidate = distance[current.index]! + edge.cost;
      if (candidate >= distance[edge.index]!) continue;
      distance[edge.index] = candidate; parent[edge.index] = current.index;
      const estimate = heuristic(edge.index, goal, cols, kind, diagonal);
      frontier.push({ index: edge.index, priority: strategy === "greedy" ? estimate : candidate + (strategy === "astar" ? estimate : 0) });
    }
    maxFrontier = Math.max(maxFrontier, frontier.size);
  }
  const path = pathFrom(parent, start, goal);
  return { visited, path, cost: path.length ? distance[goal]! : Infinity, maxFrontier, found: path.length > 0 };
}

function bidirectional(options: SearchOptions): SearchResult {
  const { grid, rows, cols, start, goal, diagonal = false } = options;
  if (start === goal) return { visited: [start], path: [start], cost: 0, maxFrontier: 1, found: true };
  const frontiers = [[start], [goal]];
  const distances = [new Int32Array(grid.length).fill(-1), new Int32Array(grid.length).fill(-1)];
  const parents = [new Int32Array(grid.length).fill(-1), new Int32Array(grid.length).fill(-1)];
  const reported = new Uint8Array(grid.length), visited: number[] = [];
  distances[0]![start] = 0; distances[1]![goal] = 0;
  let maxFrontier = 2;

  while (frontiers[0]!.length && frontiers[1]!.length) {
    const side = frontiers[0]!.length <= frontiers[1]!.length ? 0 : 1;
    const other = 1 - side, next: number[] = [];
    let meeting = -1, bestDistance = Infinity;

    for (const current of frontiers[side]!) {
      if (!reported[current]) { reported[current] = 1; visited.push(current); }
      for (const edge of edges(current, grid, rows, cols, diagonal)) {
        if (distances[side]![edge.index]! >= 0) continue;
        distances[side]![edge.index] = distances[side]![current]! + 1;
        parents[side]![edge.index] = current;
        next.push(edge.index);

        const otherDistance = distances[other]![edge.index]!;
        const totalDistance = distances[side]![edge.index]! + otherDistance;
        if (otherDistance >= 0 && totalDistance < bestDistance) {
          bestDistance = totalDistance;
          meeting = edge.index;
        }
      }
    }

    frontiers[side] = next;
    maxFrontier = Math.max(maxFrontier, frontiers[0]!.length + frontiers[1]!.length);
    if (meeting < 0) continue;

    const fromStart = pathFrom(parents[0]!, start, meeting), fromGoal = [meeting];
    while (fromGoal.at(-1) !== goal) fromGoal.push(parents[1]![fromGoal.at(-1)!]!);
    const path = [...fromStart, ...fromGoal.slice(1)];
    return { visited, path, cost: pathCost(path, grid, cols), maxFrontier, found: true };
  }

  return { visited, path: [], cost: Infinity, maxFrontier, found: false };
}

export function search(options: SearchOptions): SearchResult {
  const { grid, rows, cols, start, goal } = options;
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1 || grid.length !== rows * cols) throw new Error("invalid grid dimensions");
  if (!Number.isInteger(start) || !Number.isInteger(goal) || start < 0 || goal < 0 || start >= grid.length || goal >= grid.length) throw new Error("invalid markers");
  if (options.grid[options.start] === WALL || options.grid[options.goal] === WALL) throw new Error("markers cannot be walls");
  if (options.algorithm === "bfs") return unweighted(options, false);
  if (options.algorithm === "dfs") return unweighted(options, true);
  if (options.algorithm === "bidirectional") return bidirectional(options);
  return weighted(options, options.algorithm);
}

export function maze(rows: number, cols: number, start: number, goal: number, random = Math.random) {
  const grid = Array(rows * cols).fill(WALL), stack = [cols + 1], seen = new Set(stack), directions = [[-2,0],[0,2],[2,0],[0,-2]];
  grid[stack[0]!] = EMPTY;
  while (stack.length) {
    const current = stack.at(-1)!, row = Math.floor(current / cols), col = current % cols;
    const choices = directions.map(([dr, dc]) => [row + dr!, col + dc!]).filter(([r, c]) => r! > 0 && r! < rows - 1 && c! > 0 && c! < cols - 1 && !seen.has(r! * cols + c!));
    if (!choices.length) { stack.pop(); continue; }
    const [nextRow, nextCol] = choices[Math.floor(random() * choices.length)]!, next = nextRow! * cols + nextCol!;
    grid[(row + (nextRow! - row) / 2) * cols + col + (nextCol! - col) / 2] = EMPTY;
    grid[next] = EMPTY; seen.add(next); stack.push(next);
  }
  for (const marker of [start, goal]) { grid[marker] = EMPTY; grid[marker + (marker % cols < cols / 2 ? -1 : 1)] = EMPTY; }
  return grid;
}

export function randomGrid(rows: number, cols: number, start: number, goal: number, withWeights = false, random = Math.random) {
  return Array.from({ length: rows * cols }, (_, index) => index === start || index === goal ? EMPTY : random() < .2 ? WALL : withWeights && random() < .18 ? WEIGHT : EMPTY);
}
