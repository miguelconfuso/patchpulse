import { render } from "ink";
import { App } from "./app.js";
import { ALGORITHMS, search, type Algorithm } from "./pathfinding.js";
import { DEFAULT_GOAL, DEFAULT_START, LAB_COLS, LAB_ROWS, SCENARIOS, scenarioGrid } from "./scenarios.js";

const args = process.argv.slice(2);
const VERSION = "2.1.0";
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
  patchpulse — watch pathfinding algorithms think

  Usage
    $ patchpulse
    $ patchpulse --theme dark
    $ patchpulse --demo --algorithm astar --scenario weighted
    $ patchpulse --benchmark [--json]

  Options
    --theme <auto|dark|light>  starting palette
    --algorithm <name>         bfs, dfs, dijkstra, astar, greedy, bidirectional
    --scenario <name>          showcase, weighted, open, maze, random
    --demo                     start the visualization automatically
    --benchmark                compare every algorithm without opening the TUI
    --json                     emit benchmark as JSON
    -h, --help                show help
    -v, --version             show version

  In the lab, press ? for the complete keyboard map.
`);
  process.exit(0);
}
if (args.includes("--version") || args.includes("-v")) { console.log(VERSION); process.exit(0); }
const option = (name: string) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : undefined; };
const theme = option("--theme"), algorithm = option("--algorithm") ?? "astar", scenario = option("--scenario") ?? "showcase";
const algorithmNames = Object.keys(ALGORITHMS) as Algorithm[];
if (args.includes("--theme") && !["auto", "dark", "light"].includes(theme ?? "")) {
  console.error("patchpulse: --theme expects auto, dark, or light"); process.exit(1);
}
if (!algorithmNames.includes(algorithm as Algorithm)) { console.error(`patchpulse: unknown algorithm '${algorithm}'`); process.exit(1); }
if (!SCENARIOS.includes(scenario as typeof SCENARIOS[number])) { console.error(`patchpulse: unknown scenario '${scenario}'`); process.exit(1); }
if (args.includes("--benchmark")) {
  const grid = scenarioGrid(scenario as typeof SCENARIOS[number]);
  const report = algorithmNames.map(name => {
    const result = search({ algorithm: name, grid, rows: LAB_ROWS, cols: LAB_COLS, start: DEFAULT_START, goal: DEFAULT_GOAL });
    return { algorithm: ALGORITHMS[name].name, found: result.found, visited: result.visited.length, steps: result.found ? result.path.length - 1 : null, cost: result.found ? Number(result.cost.toFixed(2)) : null, maxFrontier: result.maxFrontier };
  });
  if (args.includes("--json")) console.log(JSON.stringify({ scenario, rows: LAB_ROWS, cols: LAB_COLS, results: report }, null, 2));
  else {
    console.log(`\nPATCHPULSE BENCHMARK · ${scenario} · ${LAB_COLS}×${LAB_ROWS}\n`);
    console.log("algorithm   visited   steps   cost    frontier");
    for (const row of report) console.log(`${row.algorithm.padEnd(12)}${String(row.visited).padEnd(10)}${String(row.steps ?? "—").padEnd(8)}${String(row.cost ?? "—").padEnd(8)}${row.maxFrontier}`);
  }
  process.exit(0);
}

const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
try {
  const app = render(<App initialTheme={(theme as "auto" | "dark" | "light") ?? "auto"} initialAlgorithm={algorithm as Algorithm} initialScenario={scenario as typeof SCENARIOS[number]} autoRun={args.includes("--demo")} />, { alternateScreen: interactive, maxFps: 60 });
  if (interactive) process.stdout.write("\x1b[?25l");
  await app.waitUntilExit();
} finally {
  if (interactive) process.stdout.write("\x1b[?25h");
}
