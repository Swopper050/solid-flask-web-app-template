import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const mode = process.argv[2] === '--check' ? 'check' : 'fix'
const localesDir = path.join(__dirname, '../src/locales')
const files = fs.readdirSync(localesDir).filter((file) => file.endsWith('.ts'))

const MAX_LINE_LENGTH = 100
let hasError = false

for (const file of files) {
  const filePath = path.join(localesDir, file)
  const fileContent = fs.readFileSync(filePath, 'utf-8')

  const dictMatch = fileContent.match(/export const dict.*?=\s*({[\s\S]*});?/)
  if (!dictMatch) {
    console.error(`❌ Could not extract dict from ${file}`)
    hasError = true
    continue
  }

  let dict
  try {
    eval('dict = ' + dictMatch[1])
  } catch (err) {
    console.error(`❌ Failed to parse dict in ${file}: ${err.message}`)
    hasError = true
    continue
  }

  const sortedEntries = Object.entries(dict).sort(([a], [b]) =>
    a.localeCompare(b)
  )
  let output = ''

  if (file === 'en.ts') {
    output += 'export const dict = {\n'
  } else {
    output += `import { Translations } from '../context/LocaleProvider'\n\n`
    output += 'export const dict: Translations = {\n'
  }

  for (const [key, value] of sortedEntries) {
    if (typeof value === 'string') {
      if (value.includes('\n')) {
        const multilineValue = value
          .split('\n')
          .filter((line) => line.trim() !== '')
          .map((line) => '    ' + line.trim())
          .join('\n')
        output += `  ${key}: \`\n${multilineValue}\n  \`,\n`
      } else if (7 + key.length + value.length > MAX_LINE_LENGTH) {
        const wrappedLines = []
        let currentLine = ''
        for (const word of value.split(' ')) {
          if ((currentLine + ' ' + word).trim().length > MAX_LINE_LENGTH) {
            wrappedLines.push('    ' + currentLine.trim())
            currentLine = word
          } else {
            currentLine += ' ' + word
          }
        }
        if (currentLine.trim()) {
          wrappedLines.push('    ' + currentLine.trim())
        }
        output += `  ${key}: \`\n${wrappedLines.join('\n')}\n  \`,\n`
      } else {
        output += `  ${key}: '${value.replace(/'/g, "\\'")}',\n`
      }
    } else {
      output += `  ${key}: ${JSON.stringify(value)},\n`
    }
  }

  output += '};\n'

  if (mode === 'check') {
    const originalNormalized = fileContent.replace(/\r\n/g, '\n').trim()
    const generatedNormalized = output.replace(/\r\n/g, '\n').trim()
    if (originalNormalized !== generatedNormalized) {
      console.error(`❌ ${file} is not formatted`)
      hasError = true
    } else {
      console.log(`✅ ${file} is formatted`)
    }
  } else {
    fs.writeFileSync(filePath, output, 'utf-8')
    console.log(`✅ Sorted: ${file}`)
  }
}

if (mode === 'check' && hasError) {
  console.error('\n🔒 Translation format check failed.')
  process.exit(1)
} else if (mode === 'check') {
  console.log('\n✨ All translations are properly formatted!')
}
