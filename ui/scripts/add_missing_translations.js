#!/usr/bin/env node
/*  add-missing-translations.js
    --------------------------------------------------------------
    Make every non-default locale file contain (and alphabetically
    sort) all keys that exist in the default locale.               */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ─── Configuration ──────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const LOCALES_PATH = path.join(__dirname, '../src/locales')
const DEFAULT_LOCALE = 'en.ts'
const NON_DEFAULT_LOCALES = ['nl.ts'] // add more if you have them
const MAX_LINE_LENGTH = 100 // only cosmetic – for wrapping long strings
// ────────────────────────────────────────────────────────────────

// ─── CLI flags ─────────────────────────────────────────────────
const args = process.argv.slice(2)
const ciMode = args.includes('--ci') || args.includes('--check')
const quietMode = args.includes('--quiet')
// ────────────────────────────────────────────────────────────────

// ─── Utilities ─────────────────────────────────────────────────
/*  grab “export const dict = { … };” (or the typed variant) and
    evaluate it to an object we can inspect.                      */
function extractDict(fileContent, fileName) {
  const match = fileContent.match(/export const dict.*?=\s*({[\s\S]*});?/)
  if (!match) throw new Error(`Could not extract dict from ${fileName}`)

  let dict // using ‘eval’ is okay here – the file is trusted.
  eval('dict = ' + match[1])
  return dict
}

/*  Turn a JS object back into nicely formatted TypeScript with
    the import header (for non-default locales) and wrapped long
    template strings – exactly like the existing files.           */
function makeFileContent(fileName, dict) {
  const sortedEntries = Object.entries(dict).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  let out = ''
  if (fileName === DEFAULT_LOCALE) {
    out += 'export const dict = {\n'
  } else {
    out += "import { Translations } from '../context/LocaleProvider'\n\n"
    out += 'export const dict: Translations = {\n'
  }

  for (const [key, value] of sortedEntries) {
    if (typeof value === 'string') {
      if (value.includes('\n')) {
        // multi-line template
        const lines = value
          .split('\n')
          .filter((l) => l.trim() !== '')
          .map((l) => '    ' + l.trim())
          .join('\n')
        out += `  ${key}: \`\n${lines}\n  \`,\n`
      } else if (7 + key.length + value.length > MAX_LINE_LENGTH) {
        // very long single-line → wrap it into a template
        const words = value.split(' ')
        let current = ''
        const wrapped = []
        for (const w of words) {
          if ((current + ' ' + w).trim().length > MAX_LINE_LENGTH) {
            wrapped.push('    ' + current.trim())
            current = w
          } else {
            current += ' ' + w
          }
        }
        if (current.trim()) wrapped.push('    ' + current.trim())
        out += `  ${key}: \`\n${wrapped.join('\n')}\n  \`,\n`
      } else {
        // short single-line
        out += `  ${key}: '${value.replace(/'/g, "\\'")}',\n`
      }
    } else {
      out += `  ${key}: ${JSON.stringify(value)},\n`
    }
  }
  out += '};\n'
  return out
}
// ────────────────────────────────────────────────────────────────

// ─── Read default locale ───────────────────────────────────────
const defaultPath = path.join(LOCALES_PATH, DEFAULT_LOCALE)
if (!fs.existsSync(defaultPath)) {
  console.error(`❌  Default locale '${DEFAULT_LOCALE}' not found`)
  process.exit(1)
}
const defaultDict = extractDict(
  fs.readFileSync(defaultPath, 'utf-8'),
  DEFAULT_LOCALE
)
const defaultKeys = Object.keys(defaultDict)
// ────────────────────────────────────────────────────────────────

let missingOverall = 0
let hadError = false

// ─── Iterate over non-default locales ──────────────────────────
for (const locale of NON_DEFAULT_LOCALES) {
  const filePath = path.join(LOCALES_PATH, locale)
  if (!fs.existsSync(filePath)) {
    console.error(`❌  Target locale '${locale}' not found`)
    hadError = true
    continue
  }

  if (!quietMode) console.log(`\n🔍  Checking ${locale}…`)

  const raw = fs.readFileSync(filePath, 'utf-8')
  let dict
  try {
    dict = extractDict(raw, locale)
  } catch (err) {
    console.error(`❌  ${err.message}`)
    hadError = true
    continue
  }

  const missing = defaultKeys.filter((k) => !(k in dict))
  if (missing.length === 0) {
    if (!quietMode) console.log(`✅  No missing keys`)
    continue
  }

  // ––– CI / check mode ––––––––––––––––––––––––––––––––––––––––
  if (ciMode) {
    console.error(`❌  ${locale} is missing ${missing.length} key(s):`)
    missing.sort().forEach((k) => console.error('   - ' + k))
    hadError = true
    continue
  }

  // ––– Fix-mode – add empty entries & rewrite file ––––––––––––
  for (const k of missing) dict[k] = ''
  const updated = makeFileContent(locale, dict)
  fs.writeFileSync(filePath, updated, 'utf-8')
  missingOverall += missing.length

  if (!quietMode) {
    console.log(`✍️   Added ${missing.length} key(s):`)
    missing.sort().forEach((k) => console.log('   - ' + k))
  }
}

// ─── Final exit handling ───────────────────────────────────────
if (ciMode && hadError) {
  console.error('\n🔒  Translation check failed.')
  process.exit(1)
}

if (!ciMode) {
  if (missingOverall) {
    console.log(`\n✨  Added a total of ${missingOverall} missing key(s).`)
    console.log('⚠️   Remember to translate the empty strings!')
  } else if (!hadError && !quietMode) {
    console.log('\n✅  All locale files already contain every key.')
  }
}
