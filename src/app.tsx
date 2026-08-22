import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Box, Text, useApp, useInput, useStdout } from "ink";
import { ALGORITHMS, EMPTY, WALL, WEIGHT, search, type Algorithm, type Heuristic, type SearchResult } from "./pathfinding.js";
import { DEFAULT_GOAL, DEFAULT_START, LAB_COLS, LAB_ROWS, SCENARIOS, scenarioGrid, type Scenario } from "./scenarios.js";

const ROWS = LAB_ROWS, COLS = LAB_COLS, INITIAL_START = DEFAULT_START, INITIAL_GOAL = DEFAULT_GOAL;
const algorithms = Object.keys(ALGORITHMS) as Algorithm[];
const tools = ["wall", "weight", "erase", "start", "goal"] as const;
type Tool = typeof tools[number];
type Phase = "idle" | "running" | "paused" | "done";
type Screen = "lab" | "theory" | "compare" | "help";
type ThemeMode = "auto" | "dark" | "light";

const toolLabels: Record<Tool, string> = { wall: "wall", weight: "weight ×7", erase: "erase", start: "move A", goal: "move B" };
const palettes = {
  auto: { primary: "#e4e4e7", gray: "#71717a", border: "#3f3f46", background: undefined, surface: "#18181b", accent: "#67e8f9", visited: "#38bdf8", hot: "#c4b5fd", path: "#a3e635", weight: "#fbbf24", wall: "#52525b", start: "#22d3ee", goal: "#fb7185", button: "#082f49" },
  dark: { primary: "#f4f4f5", gray: "#71717a", border: "#3f3f46", background: "#09090b", surface: "#18181b", accent: "#67e8f9", visited: "#38bdf8", hot: "#c4b5fd", path: "#a3e635", weight: "#fbbf24", wall: "#52525b", start: "#22d3ee", goal: "#fb7185", button: "#082f49" },
  light: { primary: "#27272a", gray: "#71717a", border: "#d4d4d8", background: "#fafafa", surface: "#e4e4e7", accent: "#0369a1", visited: "#0284c7", hot: "#7c3aed", path: "#4d7c0f", weight: "#b45309", wall: "#52525b", start: "#0891b2", goal: "#e11d48", button: "#ecfeff" },
} as const;
type Palette = typeof palettes[ThemeMode];
const ThemeContext = createContext<Palette>(palettes.auto);
const useTheme = () => useContext(ThemeContext);

export function App({ initialTheme = "auto" as ThemeMode, initialAlgorithm = "astar" as Algorithm, initialScenario = "showcase" as Exclude<Scenario, "custom">, autoRun = false }) {
  const [themeMode, setThemeMode] = useState(initialTheme);
  return <ThemeContext.Provider value={palettes[themeMode]}><Lab themeMode={themeMode} initialAlgorithm={initialAlgorithm} initialScenario={initialScenario} autoRun={autoRun} cycleTheme={() => setThemeMode(themeMode === "auto" ? "dark" : themeMode === "dark" ? "light" : "auto")} /></ThemeContext.Provider>;
}

function Lab({ themeMode, initialAlgorithm, initialScenario, autoRun, cycleTheme }: { themeMode: ThemeMode; initialAlgorithm: Algorithm; initialScenario: Exclude<Scenario, "custom">; autoRun: boolean; cycleTheme: () => void }) {
  const theme = useTheme(), { exit } = useApp(), { stdout } = useStdout();
  const [grid, setGrid] = useState(() => scenarioGrid(initialScenario));
  const [start, setStart] = useState(INITIAL_START), [goal, setGoal] = useState(INITIAL_GOAL), [cursorCell, setCursorCell] = useState(INITIAL_START);
  const [algorithm, setAlgorithm] = useState<Algorithm>(initialAlgorithm), [heuristic, setHeuristic] = useState<Heuristic>("manhattan"), [scenario, setScenario] = useState<Scenario>(initialScenario);
  const [tool, setTool] = useState<Tool>("wall"), [pen, setPen] = useState(false), [diagonal, setDiagonal] = useState(false), [speed, setSpeed] = useState(5);
  const [screen, setScreen] = useState<Screen>("lab"), [phase, setPhase] = useState<Phase>(autoRun ? "running" : "idle"), [result, setResult] = useState<SearchResult | undefined>(() => autoRun ? search({ algorithm: initialAlgorithm, grid, rows: ROWS, cols: COLS, start, goal }) : undefined), [step, setStep] = useState(0);
  const columns = stdout?.columns ?? 80, rows = stdout?.rows ?? 30;
  const compact = rows < 32;

  const clearRun = () => { setResult(undefined); setStep(0); setPhase("idle"); };
  const applyTool = (index: number) => {
    if (tool === "start" && index !== goal && grid[index] !== WALL) { setStart(index); setScenario("custom"); clearRun(); return; }
    if (tool === "goal" && index !== start && grid[index] !== WALL) { setGoal(index); setScenario("custom"); clearRun(); return; }
    if (index === start || index === goal) return;
    const value = tool === "wall" ? WALL : tool === "weight" ? WEIGHT : EMPTY;
    setGrid(current => current.with(index, current[index] === value && tool !== "erase" ? EMPTY : value)); setScenario("custom"); clearRun();
  };
  const move = (dr: number, dc: number) => {
    const row = Math.floor(cursorCell / COLS), col = cursorCell % COLS;
    const next = Math.max(0, Math.min(ROWS - 1, row + dr)) * COLS + Math.max(0, Math.min(COLS - 1, col + dc));
    setCursorCell(next); if (pen) applyTool(next);
  };
  const run = () => { setResult(search({ algorithm, grid, rows: ROWS, cols: COLS, start, goal, diagonal, heuristic })); setStep(0); setPhase("running"); };
  const loadScenario = (next: Exclude<Scenario, "custom">) => { setGrid(scenarioGrid(next, start, goal)); setScenario(next); clearRun(); };
  const totalSteps = (result?.visited.length ?? 0) + (result?.path.length ?? 0);

  useEffect(() => {
    if (phase !== "running" || !result) return;
    if (step >= totalSteps) { setPhase("done"); return; }
    const timer = setTimeout(() => setStep(value => value + 1), [110, 75, 45, 25, 12, 5][speed]);
    return () => clearTimeout(timer);
  }, [phase, result, speed, step, totalSteps]);

  useInput((input, key) => {
    if (key.ctrl && input === "c" || input === "q") { exit(); return; }
    if (input === "t" || input === "\x14") { cycleTheme(); return; }
    if (screen !== "lab") { if (key.escape || input === "h" || input === "v" || input === "?") setScreen("lab"); return; }
    if (key.leftArrow || input === "a") move(0, -1);
    else if (key.rightArrow || input === "d") move(0, 1);
    else if (key.upArrow || input === "w") move(-1, 0);
    else if (key.downArrow || input === "s") move(1, 0);
    else if (input === " ") applyTool(cursorCell);
    else if (key.tab) setTool(tools[(tools.indexOf(tool) + 1) % tools.length]!);
    else if (input === "z") setPen(value => !value);
    else if (/^[1-6]$/.test(input)) { setAlgorithm(algorithms[Number(input) - 1]!); clearRun(); }
    else if (key.return) run();
    else if (input === "p" && result && (phase === "running" || phase === "paused")) setPhase(phase === "running" ? "paused" : "running");
    else if (input === "n" && result) { const next = Math.min(totalSteps, step + 1); setStep(next); setPhase(next >= totalSteps ? "done" : "paused"); }
    else if (input === "r") clearRun();
    else if (input === "m") loadScenario("maze");
    else if (input === "x") loadScenario("random");
    else if (input === "c") loadScenario("open");
    else if (input === "g") { const current = SCENARIOS.indexOf(scenario as typeof SCENARIOS[number]); loadScenario(SCENARIOS[(current + 1 + SCENARIOS.length) % SCENARIOS.length]!); }
    else if (input === "i") { setDiagonal(value => !value); clearRun(); }
    else if (input === "u") { const values: Heuristic[] = ["manhattan", "euclidean", "chebyshev"]; setHeuristic(values[(values.indexOf(heuristic) + 1) % values.length]!); clearRun(); }
    else if (input === "+" || input === "=") setSpeed(value => Math.min(5, value + 1));
    else if (input === "-") setSpeed(value => Math.max(0, value - 1));
    else if (input === "h") setScreen("theory");
    else if (input === "v") setScreen("compare");
    else if (input === "?") setScreen("help");
  });

  const visited = new Set(result?.visited.slice(0, Math.min(step, result.visited.length)) ?? []);
  const path = new Set(result?.path.slice(0, Math.max(0, step - (result?.visited.length ?? 0))) ?? []);
  const pathStep = Math.max(0, step - (result?.visited.length ?? 0));
  const activeCell = pathStep > 0 ? result?.path[Math.min(pathStep, result.path.length) - 1] : result?.visited[Math.min(step, result.visited.length) - 1];
  const comparisons = useMemo(() => algorithms.map(name => ({ name, result: search({ algorithm: name, grid, rows: ROWS, cols: COLS, start, goal, diagonal, heuristic }) })), [diagonal, goal, grid, heuristic, start]);

  if (columns < 80 || rows < 24) return <FullScreen>
    <Text color={theme.accent} bold>PATCHPULSE NEEDS MORE ROOM</Text>
    <Text color={theme.gray}>minimum 80×24  ·  current {columns}×{rows}</Text>
    <Text color={theme.primary}>Resize the terminal to reveal the laboratory.</Text>
    <Gap/>
    <Text color={theme.gray}>[Q] QUIT  ·  [T] THEME</Text>
  </FullScreen>;

  return <FullScreen>
    {!compact && <><Logo/><Text color={theme.primary}>find a path. watch it think. learn.</Text><Text color={theme.gray}>BFS / DFS / DIJKSTRA / A*  ·  NO BLACK BOXES</Text><Gap/></>}
    {screen === "lab" && <Box gap={2}>
      <Panel title="CONTROL DECK" width={24} height={21}>
        <Text color={theme.gray}>ALGORITHM</Text>
        {algorithms.map((name, index) => <Text key={name} color={algorithm === name ? theme.accent : theme.primary} backgroundColor={algorithm === name ? theme.surface : theme.background} bold={algorithm === name}>{algorithm === name ? ">" : " "} {index + 1}  {ALGORITHMS[name].name.padEnd(12)}</Text>)}
        <Gap/>
        <Text color={theme.gray}>TOOL  <Text color={theme.border}>TAB TO CYCLE</Text></Text>
        <Text color={theme.primary}><Text color={theme.accent}>&gt;</Text> {toolLabels[tool]}</Text>
        <Text color={pen ? theme.path : theme.gray}>{pen ? "ON " : "OFF"} draw mode [z]</Text>
        <Gap/>
        <Text color={theme.gray}>OPTIONS</Text>
        <Text color={diagonal ? theme.accent : theme.gray}>{diagonal ? "ON " : "OFF"} diagonal [i]</Text>
        <Text color={algorithm === "astar" ? theme.primary : theme.gray}>h: {heuristic} [u]</Text>
        <Text color={theme.primary}>speed <Text color={theme.accent}>[{"=".repeat(speed + 1)}{"-".repeat(5 - speed)}]</Text></Text>
        <Text color={theme.gray}>theme <Text color={theme.hot}>{themeMode}</Text> [t]</Text>
        <Text color={theme.gray}>scene <Text color={theme.weight}>{scenario}</Text> [g]</Text>
        <Text backgroundColor={theme.accent} color={theme.button} bold> RUN {ALGORITHMS[algorithm].name.toUpperCase()} </Text>
      </Panel>
      <Panel title={`${ALGORITHMS[algorithm].name}  /  ${COLS}×${ROWS}`} width={53} height={21}>
        <Grid grid={grid} start={start} goal={goal} cursor={cursorCell} visited={visited} path={path} active={activeCell}/>
        <Status phase={phase} result={result} step={step}/>
        <Text color={theme.border}>{"─".repeat(49)}</Text>
        <Text color={theme.gray}>TIME {ALGORITHMS[algorithm].time}  /  <Text color={theme.primary}>{ALGORITHMS[algorithm].optimal}</Text></Text>
      </Panel>
    </Box>}
    {screen === "theory" && <Theory/>}
    {screen === "compare" && <Comparison rows={comparisons}/>} 
    {screen === "help" && <Help/>}
    <Gap lines={compact ? 1 : 2}/>
    <Shortcuts screen={screen} phase={phase} themeMode={themeMode} compact={compact}/>
  </FullScreen>;
}

function Grid({ grid, start, goal, cursor, visited, path, active }: { grid: number[]; start: number; goal: number; cursor: number; visited: Set<number>; path: Set<number>; active?: number }) {
  const theme = useTheme();
  return <Box flexDirection="column" height={ROWS} flexShrink={0}>{Array.from({ length: ROWS }, (_, row) => <Text key={row}>{grid.slice(row * COLS, (row + 1) * COLS).map((value, offset) => {
    const index = row * COLS + offset, selected = index === cursor;
    const symbol = index === start ? "A " : index === goal ? "B " : path.has(index) ? "* " : active === index ? "+ " : visited.has(index) ? "· " : value === WALL ? "██" : value === WEIGHT ? "7 " : "· ";
    const color = index === start ? theme.start : index === goal ? theme.goal : path.has(index) ? theme.path : active === index ? theme.hot : visited.has(index) ? theme.visited : value === WEIGHT ? theme.weight : value === WALL ? theme.wall : theme.border;
    return <Text key={index} color={selected ? theme.button : color} backgroundColor={selected ? theme.accent : theme.background} bold={selected || index === start || index === goal || path.has(index)}>{symbol}</Text>;
  })}</Text>)}</Box>;
}

function Status({ phase, result, step }: { phase: Phase; result?: SearchResult; step: number }) {
  const theme = useTheme();
  if (!result) return <>
    <Text><Text color={theme.start} bold>A</Text><Text color={theme.gray}> start  </Text><Text color={theme.goal} bold>B</Text><Text color={theme.gray}> goal  </Text><Text color={theme.wall}>██</Text><Text color={theme.gray}> wall  </Text><Text color={theme.weight}>7</Text><Text color={theme.gray}> weight</Text></Text>
    <Text color={theme.gray}>SPACE paint  ·  TAB tool  ·  ENTER launch</Text>
  </>;
  const total = result.visited.length + result.path.length;
  const progress = Math.min(1, step / Math.max(1, total)), filled = progress === 1 ? 14 : Math.floor(progress * 14), complete = phase === "done" || step >= total;
  const label = complete ? result.found ? "ROUTE" : "BLOCKED" : phase === "paused" ? "PAUSED" : "SEARCH";
  const color = complete ? result.found ? theme.path : theme.goal : phase === "paused" ? theme.weight : theme.accent;
  return <>
    <Text><Text color={color} bold>{label.padEnd(7)}</Text><Text color={theme.border}>[</Text><Text color={color}>{"=".repeat(filled)}</Text><Text color={theme.border}>{"-".repeat(14 - filled)}]</Text><Text color={theme.gray}> {Math.min(step, total)}/{total}</Text></Text>
    <Text color={theme.gray}>seen <Text color={theme.visited} bold>{Math.min(step, result.visited.length)}</Text>  path <Text color={theme.path} bold>{result.found ? result.path.length - 1 : "—"}</Text>  cost <Text color={theme.weight} bold>{result.found ? result.cost.toFixed(1) : "—"}</Text>  open <Text color={theme.hot} bold>{result.maxFrontier}</Text></Text>
  </>;
}

function Theory() {
  const theme = useTheme();
  const notes: Record<Algorithm, string> = {
    bfs: "layers; ignores weights",
    dfs: "deep branch, then backtracks",
    dijkstra: "expands lowest accumulated cost",
    astar: "g(n)+h(n); optimal with admissible h",
    greedy: "h(n) only; fast, not optimal",
    bidirectional: "two BFS waves meet in the middle",
  };
  return <Panel title="THEORY · COMPLEXITY WITHOUT MAGIC" width={79}>
    <Text color={theme.gray}>{"ALGORITHM".padEnd(13)}{"TIME".padEnd(25)}IDEA</Text>
    {(Object.entries(ALGORITHMS) as [Algorithm, typeof ALGORITHMS[Algorithm]][]).map(([name, info], index) => <Text key={name}>
      <Text color={theme.accent} bold>{`${index + 1} ${info.name}`.padEnd(13)}</Text><Text color={theme.primary}>{info.time.padEnd(25)}</Text><Text color={theme.gray}>{notes[name]}</Text>
    </Text>)}
    <Gap/>
    <Text><Text color={theme.primary} bold>BFS ≠ Dijkstra  </Text><Text color={theme.gray}>BFS minimizes steps. Dijkstra minimizes accumulated cost.</Text></Text>
    <Text><Text color={theme.primary} bold>A* formula       </Text><Text color={theme.gray}>f(n) = g(n) + h(n). Admissible h never overestimates.</Text></Text>
    <Text><Text color={theme.primary} bold>V and E          </Text><Text color={theme.gray}>V = open cells; E = legal neighbor connections.</Text></Text>
  </Panel>;
}

function Comparison({ rows }: { rows: Array<{ name: Algorithm; result: SearchResult }> }) {
  const theme = useTheme(), bestVisited = Math.min(...rows.filter(row => row.result.found).map(row => row.result.visited.length));
  return <Panel title="COMPARE · SAME GRID, SIX STRATEGIES" width={79}>
    <Text color={theme.gray}>algorithm       visited     path     cost     max frontier     optimal</Text>
    <Text color={theme.gray}>─────────────────────────────────────────────────────────────────────────</Text>
    {rows.map(({ name, result }, index) => <Text key={name} color={result.visited.length === bestVisited ? theme.path : theme.primary} bold={result.visited.length === bestVisited}>
      {`${index + 1} ${ALGORITHMS[name].name}`.padEnd(16)}{String(result.visited.length).padEnd(12)}{String(result.found ? result.path.length - 1 : "—").padEnd(9)}{String(result.found ? result.cost.toFixed(1) : "—").padEnd(9)}{String(result.maxFrontier).padEnd(17)}{ALGORITHMS[name].optimal}
    </Text>)}
    <Gap/><Text color={theme.gray}>Fewest explored ≠ lowest cost. BFS, DFS and Bi-BFS do not optimize weights.</Text>
  </Panel>;
}

function Help() {
  const theme = useTheme();
  const rows = [["←↑↓→ / wasd","move cursor"],["space","paint selected tool"],["z","toggle continuous draw"],["tab","cycle wall · weight · erase · A · B"],["1—6","choose algorithm"],["enter","run animation"],["p / n / r","pause · one step · reset"],["g / m / x / c","scene · maze · random · clear"],["i / u","diagonal · heuristic"],["+ / -","animation speed"],["h / v / ?","theory · comparison · help"],["t / q","theme · quit"]];
  return <Panel title="Help · keyboard map" width={64}>{rows.map(([key, action]) => <Text key={key}><Text color={theme.primary} bold>{key!.padEnd(19)}</Text><Text color={theme.gray}>{action}</Text></Text>)}</Panel>;
}

function FullScreen({ children }: { children: ReactNode }) {
  const theme = useTheme(), { stdout } = useStdout();
  return <Box width={stdout?.columns || 80} height={Math.max(23, (stdout?.rows || 30) - 1)} flexDirection="column" alignItems="center" justifyContent="center" backgroundColor={theme.background}>{children}</Box>;
}

function Panel({ title, width, height, children }: { title: string; width: number; height?: number; children: ReactNode }) {
  const theme = useTheme(), tail = Math.max(0, width - title.length - 6);
  return <Box flexDirection="column" width={width} height={height}>
    <Text><Text color={theme.border}>╭─ </Text><Text color={theme.accent} bold>{title}</Text><Text color={theme.border}> {"─".repeat(tail)}╮</Text></Text>
    <Box width={width} height={height ? height - 1 : undefined} borderStyle="round" borderTop={false} borderColor={theme.border} borderBackgroundColor={theme.background} paddingX={1} flexDirection="column">{children}</Box>
  </Box>;
}

const ART = ["█▀█ ▄▀█ ▀█▀ █ █ █▀", "█▀▀ █▀█  █  █▀█ ▄█"];
function Logo() {
  const theme = useTheme(), [beam, setBeam] = useState(-4);
  useEffect(() => { const timer = setInterval(() => setBeam(value => value > 28 ? -4 : value + 1), 90); return () => clearInterval(timer); }, []);
  return <Box flexDirection="column">{ART.map((row, y) => <Text key={row}>{[...row].map((char, x) => <Text key={x} color={Math.abs(x + y * 2 - beam) < 2 ? theme.hot : x < beam ? theme.accent : theme.primary}>{char}</Text>)}</Text>)}</Box>;
}

function Shortcuts({ screen, phase, themeMode, compact }: { screen: Screen; phase: Phase; themeMode: ThemeMode; compact: boolean }) {
  const theme = useTheme();
  if (screen !== "lab") return <Text color={theme.gray}><Text color={theme.accent}>[ESC]</Text> BACK  ·  <Text color={theme.accent}>[Q]</Text> QUIT</Text>;
  const main = <Text color={theme.gray}><Text color={theme.accent}>[ARROWS]</Text> MOVE  <Text color={theme.accent}>[SPACE]</Text> PAINT  <Text color={theme.accent}>[ENTER]</Text> RUN  <Text color={theme.accent}>[H]</Text> LEARN  <Text color={theme.accent}>[V]</Text> COMPARE  <Text color={theme.accent}>[Q]</Text> QUIT</Text>;
  if (compact) return main;
  const secondary = phase === "running" || phase === "paused"
    ? <><Text color={theme.hot}>[P]</Text> {phase === "running" ? "PAUSE" : "RESUME"}  <Text color={theme.hot}>[N]</Text> STEP  <Text color={theme.hot}>[R]</Text> RESET</>
    : phase === "done"
      ? <><Text color={theme.hot}>[ENTER]</Text> RERUN  <Text color={theme.hot}>[R]</Text> RESET  <Text color={theme.hot}>[TAB]</Text> TOOL</>
      : <><Text color={theme.hot}>[TAB]</Text> TOOL  <Text color={theme.hot}>[G]</Text> SCENE  <Text color={theme.hot}>[X]</Text> RANDOM</>;
  return <Box flexDirection="column" alignItems="center">{main}<Text color={theme.gray}>{secondary}  <Text color={theme.hot}>[T]</Text> THEME:{themeMode.toUpperCase()}</Text></Box>;
}

function Gap({ lines = 1 }: { lines?: number }) { return <Box flexDirection="column" flexShrink={0}>{Array.from({ length: lines }, (_, index) => <Text key={index}> </Text>)}</Box>; }
