import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { nitro } from "nitro/vite"
import viteReact from "@vitejs/plugin-react"
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
    // sharp ships a native binary the server bundle can't carry (the
    // bundled copy throws "Could not load the sharp module" in prod).
    // Explicit external entries take priority over nitro's noExternal:
    // true, so it resolves from node_modules at runtime instead.
    external: ["sharp"],
  },
  plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
})

export default config
