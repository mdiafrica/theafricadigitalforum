// pm2 config for the production app (run from the repo root):
//   pm2 start deploy/ecosystem.config.cjs
// The built server reads all config from process.env, loaded here from .env.
const { readFileSync } = require("node:fs")
const { resolve } = require("node:path")

function parseEnvFile(path) {
  const env = {}
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

module.exports = {
  apps: [
    {
      name: "tadf",
      script: ".output/server/index.mjs",
      cwd: resolve(__dirname, ".."),
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "1G",
      env: {
        ...parseEnvFile(resolve(__dirname, "../.env")),
        NODE_ENV: "production",
        PORT: "3000",
        // Only Caddy is public — never expose the app port directly.
        HOST: "127.0.0.1",
      },
    },
  ],
}
