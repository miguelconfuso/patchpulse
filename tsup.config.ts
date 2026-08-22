import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.tsx"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  bundle: true,
  noExternal: [/.*/],
  define: { "process.env.DEV": '"false"' },
  esbuildPlugins: [{
    name: "ignore-optional-react-devtools",
    setup(build) {
      build.onResolve({ filter: /^react-devtools-core$/ }, () => ({ path: "react-devtools-core", namespace: "devtools-stub" }));
      build.onLoad({ filter: /.*/, namespace: "devtools-stub" }, () => ({ contents: "export default {initialize(){},connectToDevTools(){}}" }));
    },
  }],
  splitting: false,
  clean: true,
  sourcemap: true,
  banner: { js: "#!/usr/bin/env node\nimport { createRequire } from 'node:module';\nconst require = createRequire(import.meta.url);" }
});
