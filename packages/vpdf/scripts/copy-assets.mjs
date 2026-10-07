import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const root = dirname(fileURLToPath(import.meta.url))
const pkgRoot = join(root, '..')
const outDir = join(pkgRoot, 'dist', 'assets')
const pdfjsRoot = dirname(require.resolve('pdfjs-dist/package.json'))

function ensureDir(path) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }
}

ensureDir(outDir)

const copies = [
  {
    from: join(pdfjsRoot, 'legacy', 'build', 'pdf.worker.min.mjs'),
    to: join(outDir, 'pdf.worker.min.mjs'),
  },
  {
    from: join(pdfjsRoot, 'cmaps'),
    to: join(outDir, 'cmaps'),
    dir: true,
  },
  {
    from: join(pdfjsRoot, 'standard_fonts'),
    to: join(outDir, 'standard_fonts'),
    dir: true,
  },
]

for (const item of copies) {
  if (!existsSync(item.from)) {
    console.warn(`[vpdf] missing asset: ${item.from}`)
    continue
  }
  if (item.dir) {
    ensureDir(item.to)
    cpSync(item.from, item.to, { recursive: true })
  } else {
    ensureDir(dirname(item.to))
    copyFileSync(item.from, item.to)
  }
}

// Optional wasm / annotation assets when present in the installed build
for (const optional of ['wasm', 'web/images']) {
  const from = join(pdfjsRoot, optional)
  if (!existsSync(from)) continue
  const to = join(outDir, optional.replace('web/', ''))
  ensureDir(to)
  cpSync(from, to, { recursive: true })
}

console.log('[vpdf] copied PDF.js assets to dist/assets')
