import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
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
  },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
})

export default config
