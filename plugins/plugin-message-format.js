import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const pluginDir = join(process.cwd(), 'plugins')
const source = [
  'part-01.txt',
  'part-02.txt',
  'part-03.txt',
  'part-04.txt',
  'part-05.txt',
  'part-06.txt',
  'part-07.txt',
  'part-08.txt',
  'part-09.txt',
  'part-10.txt',
]
  .map((name) =>
    readFileSync(join(pluginDir, 'plugin-message-format.parts', name), 'utf8'),
  )
  .join('')
const hash = createHash('sha256').update(source).digest('hex').slice(0, 16)
const compiledPath = join(
  tmpdir(),
  `awf-paraglide-plugin-message-format-${hash}.mjs`,
)

if (!existsSync(compiledPath)) {
  writeFileSync(compiledPath, source)
}

const plugin = await import(pathToFileURL(compiledPath).href)

export default plugin.default
