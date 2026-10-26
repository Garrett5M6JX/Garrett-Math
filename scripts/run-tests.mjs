// Lanzador de pruebas multiplataforma (Windows, macOS, Linux): evita depender de que la shell expanda comodines.
import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const dir = 'tests'
const files = readdirSync(dir).filter((f) => f.endsWith('.test.ts')).sort().map((f) => join(dir, f))
if (files.length === 0) { console.error('No se encontraron pruebas en ./tests'); process.exit(1) }
const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...files], { stdio: 'inherit' })
process.exit(result.status ?? 1)
