import { spawnSync } from "node:child_process"

const host = process.env.DEPLOY_HOST ?? "tadf-vm"

function run(command, argumentsList) {
  const result = spawnSync(command, argumentsList, { stdio: "inherit" })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run("git", ["push", "origin", "HEAD"])
run("ssh", [host, "cd /opt/tadf/app && bash deploy/deploy.sh"])