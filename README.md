<div align="center">
  <img src="./docs/assets/patchpulse.png" width="360" alt="PatchPulse" />
  <br />
  <img src="./docs/assets/patchpulse-path.svg" width="620" alt="The A character travelling along a path to B" />
  <p><strong>Pathfinding you can actually see.</strong></p>
  <p>Draw the problem. Run six strategies. Understand every decision.</p>
  <p>
    <a href="https://github.com/miguelconfuso/patchpulse/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/miguelconfuso/patchpulse/ci.yml?branch=main&style=flat-square&label=build" /></a>
    <img alt="Node.js 22+" src="https://img.shields.io/badge/Node.js-22%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-7-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <a href="./LICENSE"><img alt="MIT" src="https://img.shields.io/github/license/miguelconfuso/patchpulse?style=flat-square" /></a>
  </p>
  <p><strong>English</strong> · <a href="./README.pt-BR.md">Português</a></p>
</div>

---

PatchPulse is an interactive pathfinding laboratory that runs entirely in the terminal. BFS, DFS, Dijkstra, A*, Greedy Best-First, and Bidirectional BFS solve the same grid while you observe the explored nodes, frontier, and final route—without treating the algorithms as black boxes.

## The difference shows up in the numbers

On the deterministic `showcase` scenario, A* finds the same cost-`26` route as Dijkstra while visiting roughly **71% fewer nodes**.

| Strategy | Visited nodes | Steps | Cost | Peak frontier |
|---|---:|---:|---:|---:|
| BFS | 252 | 26 | 26 | 15 |
| DFS | 49 | 48 | 48 | 49 |
| Dijkstra | 255 | 26 | 26 | 20 |
| **A\*** | **75** | **26** | **26** | 47 |
| Greedy | 30 | 26 | 26 | 36 |
| Bi-BFS | 237 | 26 | 26 | 28 |

Reproduce the comparison with `npm run benchmark`. Visiting fewer nodes does not automatically mean finding the lowest-cost path—that distinction is one of the ideas the laboratory makes visible.

## Quick start

PatchPulse requires Node.js 22 or newer.

```bash
git clone https://github.com/miguelconfuso/patchpulse.git
cd patchpulse
npm ci
npm run build
npm start
```

On Windows, you can also open `start.cmd` after cloning the repository. Once the npm package is released, run it without cloning:

```bash
npx patchpulse-tui
```

## What is inside

- A grid editor for walls, weighted terrain, start, and goal cells.
- Animated execution with pause, single-step mode, and six speeds.
- Five scenarios: `showcase`, `weighted`, `open`, `maze`, and `random`.
- Safe diagonal movement that cannot cut through blocked corners.
- Manhattan, Euclidean, and Chebyshev heuristics.
- In-app theory, side-by-side comparison, and search metrics.
- Automatic, dark, and light themes with an 80×24 minimum layout.

## Algorithms

| Algorithm | Worst-case time | What it demonstrates |
|---|---:|---|
| BFS | `O(V + E)` | Fewest edges on an unweighted graph |
| DFS | `O(V + E)` | Deep exploration without an optimality guarantee |
| Dijkstra | `O((V + E) log V)` | Lowest cost with non-negative weights |
| A* | `O((V + E) log V)` | Dijkstra guided by an admissible heuristic |
| Greedy Best-First | `O((V + E) log V)` | Goal-directed speed without an optimality guarantee |
| Bidirectional BFS | `O(V + E)` | Two BFS waves meeting between start and goal |

`V` is the number of traversable cells and `E` is the number of valid neighbour connections. On a grid, `E = O(V)`.

## CLI

```bash
# Automatic demonstration
npm run demo

# Reproducible comparison
npm run benchmark

# Specific algorithm and scenario
node dist/cli.js --demo --algorithm astar --scenario weighted

# Machine-readable benchmark output
node dist/cli.js --benchmark --scenario maze --json
```

Run `node dist/cli.js --help` for every option.

<details>
<summary><strong>Keyboard map</strong></summary>

| Key | Action |
|---|---|
| Arrows or `WASD` | Move the cursor |
| `Space` / `Z` | Paint a cell / toggle continuous drawing |
| `Tab` | Cycle wall, weight, eraser, start, and goal tools |
| `1`–`6` | Select an algorithm |
| `Enter` | Start the animation |
| `P` / `N` / `R` | Pause, advance one step, or reset |
| `G` / `M` / `X` / `C` | Cycle scenario, maze, random, or open grid |
| `I` / `U` | Toggle diagonals or cycle the heuristic |
| `+` / `-` | Change animation speed |
| `H` / `V` / `?` | Open theory, comparison, or help |
| `T` / `Q` | Cycle the theme or quit |

</details>

## Architecture

```text
src/
├── pathfinding.ts   pure algorithms, binary heap, and grid generation
├── scenarios.ts     deterministic scenarios shared by the app and CLI
├── app.tsx          Ink interface, state, and animation
└── cli.tsx          arguments, benchmark, and terminal lifecycle
```

The search engine does not depend on the interface. The same `search()` function powers the visualization, benchmark, and tests, keeping each comparison consistent.

## Engineering checks

```bash
npm ci
npm run check
```

`npm run check` runs focused examples and seeded property tests, checks TypeScript, and creates the production bundle. The property suite compares A* with Dijkstra and Bidirectional BFS with BFS across 500 reproducible grids. CI repeats the same locked installation and verification on every push and pull request.

## Project documents

- [Presentation guide](docs/PRESENTATION.md)
- [Release process](docs/RELEASING.md)
- [Changelog](CHANGELOG.md)
- [Contributing guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Simplicity review](docs/PONYTAIL_REVIEW.md)

## Credits

The visual language was inspired by [Yoinks](https://github.com/pablostanley/yoinks), by Pablo Stanley. The simplicity review follows ideas from [Ponytail](https://github.com/DietrichGebert/ponytail). No brand, component, or implementation from either project was copied.

## License

[MIT](LICENSE) — use it, study it, and adapt it.
