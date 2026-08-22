# Contributing to PatchPulse

Thank you for taking the time to improve the project. Small, explainable, and tested changes are the easiest to review.

## Development environment

- Node.js 22 or newer.
- npm, included with Node.js.

```bash
git clone https://github.com/miguelconfuso/patchpulse.git
cd patchpulse
npm ci
npm run check
```

## Workflow

1. Open an issue for significant behavioural changes.
2. Create a focused branch from `main`.
3. Keep each pull request centred on one change.
4. Add or update tests whenever behaviour changes.
5. Run `npm run check` before submitting.

Algorithm changes must explain the expected guarantee and include a deterministic case. Visual changes must remain usable in an 80×24 terminal.

## Pull requests

Describe the problem, the solution, and how the change was verified. Screenshots help with visual work; reproducible numbers help with performance work.
