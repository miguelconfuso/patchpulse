# Changelog

All notable changes to this project are documented in this file.

## 2.2.0

- Added an English-first README and preserved the Portuguese documentation.
- Added reproducible npm installs with a committed lockfile and `npm ci` in CI.
- Added seeded property tests across 500 generated grids.
- Fixed Bidirectional BFS stopping before a complete search layer, which could return a longer diagonal route.
- Added an automated GitHub Release workflow with optional npm publishing.
- Pinned the build-only `esbuild` dependency to a compatible release without the known Windows dev-server advisory.
- Removed the duplicated CLI version constant; the version now comes from `package.json`.
- Clarified the worst-case complexity shown for A*.

## 2.1.0

- Consolidated the PatchPulse identity while keeping `pathlab` as a compatible alias.
- Reworked the README with a quick start, reproducible benchmark, and clearer navigation.
- Added package and repository metadata.
- Added issue and pull request templates, a security policy, and a contribution guide.
- Hardened CI with minimal permissions, concurrency cancellation, and an explicit timeout.
- Standardized line endings and editor settings across Windows, Linux, and macOS.

## 2.0.0

- Added Greedy Best-First and Bidirectional BFS.
- Added five switchable scenarios and an automatic demo mode.
- Added human-readable and JSON benchmarks to the CLI.
- Expanded comparison to six strategies.
- Displayed complexity and optimality guarantees inside the laboratory.
- Improved path reconstruction from `O(L²)` to `O(L)`.
- Added fixed-height panels, safe cursor handling, and contextual shortcuts.

## 1.1.1

- Fixed alignment, button, cursor, progress, and final-step behaviour.

## 1.1.0

- Added the visual identity, semantic colours, and designed initial scenario.

## 1.0.0

- First release with BFS, DFS, Dijkstra, and A*.
