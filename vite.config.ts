import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { nitro } from "nitro/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    // Ensure a single React instance across app + base-ui during SSR.
    dedupe: ["react", "react-dom"],
    // Bundle these for SSR (vite 8: resolve.noExternal, applies to server
    // environments). base-ui must resolve the same React instance (avoids
    // "Cannot read properties of null (reading 'useContext')");
    // @platejs/math's dist imports katex's CSS, which node's ESM loader
    // can't handle when the package is externalized.
    noExternal: ["@base-ui/react", "@platejs/math"],
    // Explicit external entries take priority over nitro's noExternal: true
    // in production server builds, so these resolve from node_modules at
    // runtime instead of being bundled.
    // - sharp: ships a native binary the bundle can't carry ("Could not
    //   load the sharp module").
    // - react/react-dom: bundling produces TWO React copies (a CJS interop
    //   path still require()s the external one), which crashes SSR with
    //   "Cannot read properties of null (reading 'useSyncExternalStore')".
    external: ["sharp", "react", "react-dom"],
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
    // React Compiler (auto-memoization) — the vite 8/rolldown wiring.
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
