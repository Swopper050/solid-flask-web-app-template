#!/usr/bin/env node
/*  find-unused-translations.js
    --------------------------------------------------------------
    Reports (or in CI mode, fails on) translation keys that exist
    in the default locale file but are never referenced in the UI
    source tree.                                                   */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ─── Configuration ──────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const LOCALES_PATH = path.join(__dirname, '../src/locales')
const UI_SRC_PATH = path.join(__dirname, '../src')
const LOCALE_TO_CHECK = 'en.ts' // change if you need another default

// ─── ANSI helpers (pretty printing) ─────────────────────────────
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'
// ────────────────────────────────────────────────────────────────

// ─── CLI flags ─────────────────────────────────────────────────
const args = process.argv.slice(2)
const ciMode = args.includes('--ci')
const quietMode = args.includes('--quiet')
// ────────────────────────────────────────────────────────────────

// ─── Step 1: get all translation keys ──────────────────────────
function extractKeys(localePath) {
  const src = fs.readFileSync(localePath, 'utf-8')
  const pattern = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/gm
  const keys = []
  let m
  while ((m = pattern.exec(src)) !== null) keys.push(m[1])
  return keys
}

const localeFile = path.join(LOCALES_PATH, LOCALE_TO_CHECK)
if (!fs.existsSync(localeFile)) {
  console.error(`❌  Locale file '${LOCALE_TO_CHECK}' not found`)
  process.exit(1)
}
const keys = extractKeys(localeFile)
if (!quietMode)
  console.log(`🔍  Found ${keys.length} keys in ${LOCALE_TO_CHECK}`)
// ────────────────────────────────────────────────────────────────

// ─── Step 2: load all .ts/.tsx source files into memory ────────
function walk(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const item of items) {
    const full = path.join(dir, item.name)
    if (item.isDirectory()) {
      if (full.includes(`${path.sep}locales${path.sep}`)) continue // skip locale files
      files.push(...walk(full))
    } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
      files.push(full)
    }
  }
  return files
}
const sourceFiles = walk(UI_SRC_PATH)
const fileContents = sourceFiles.map((p) => fs.readFileSync(p, 'utf-8'))
// ────────────────────────────────────────────────────────────────

// ─── Step 3: helper to test if a key is referenced ─────────────
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function buildRegexes(key) {
  const k = escapeRegExp(key)
  return [
    new RegExp(`t\\('${k}'\\)`),
    new RegExp(`t\\("${k}"\\)`),
    new RegExp(`t\\(\`${k}\`\\)`),
    new RegExp(`'${k}'`),
    new RegExp(`"${k}"`),
    new RegExp(`\`${k}\``),
  ]
}
function keyIsUsed(key) {
  const rex = buildRegexes(key)
  for (const content of fileContents) {
    if (rex.some((r) => r.test(content))) return true
  }
  return false
}
// ────────────────────────────────────────────────────────────────

// ─── Step 4: iterate over keys ─────────────────────────────────
const unused = []
const used = []

for (const key of keys) {
  if (!quietMode) process.stdout.write(` • ${key.padEnd(40)} `)
  if (keyIsUsed(key)) {
    used.push(key)
    if (!quietMode) console.log(`${GREEN}USED${RESET}`)
  } else {
    unused.push(key)
    if (!quietMode) console.log(`${RED}UNUSED${RESET}`)
  }
}
// ────────────────────────────────────────────────────────────────

// ─── Final summary ─────────────────────────────────────────────
console.log('\n— SUMMARY —')
if (unused.length === 0) {
  console.log(`${GREEN}No unused translation keys found!${RESET}`)
} else {
  const colour = ciMode ? RED : YELLOW
  console.log(
    `${colour}Found ${unused.length} unused translation key(s):${RESET}`
  )
  unused.forEach((k) => console.log(' -', k))
}

console.log(`\nTotal keys : ${keys.length}`)
console.log(`Used       : ${used.length}`)
console.log(`Unused     : ${unused.length}`)

// ─── CI-mode exit code ─────────────────────────────────────────
if (ciMode && unused.length) {
  console.error(
    `${RED}\nCI mode: failing build because of unused keys.${RESET}`
  )
  process.exit(1)
}
