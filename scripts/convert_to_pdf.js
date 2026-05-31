#!/usr/bin/env node
/**
 * Конвертирует DOCX/PPTX/XLSX/DOC/PPT/XLS в PDF для офлайн-просмотра в браузере.
 * Запуск: node scripts/convert_to_pdf.js
 *
 * Параллельная конвертация — каждый процесс LibreOffice получает свой
 * изолированный профиль, чтобы не было конфликтов блокировок.
 *
 * Требования: LibreOffice (brew install --cask libreoffice)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs'
import { readdirSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { fileURLToPath } from 'url'
import { execSync, execFile } from 'child_process'
import { promisify } from 'util'
import os from 'os'

const execFileAsync = promisify(execFile)

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const POSTS_DIR = join(ROOT, 'src/content/posts')
const PUBLIC_DIR = join(ROOT, 'public')

const CONVERT_EXTS = new Set(['.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.odt', '.odp', '.ods'])
const CONCURRENCY = Math.max(2, os.cpus().length - 1) // все ядра минус одно

// ── Найти soffice ──────────────────────────────────────────────────────────

function findSoffice() {
  const candidates = [
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    'soffice',
    '/usr/bin/soffice',
    '/usr/local/bin/soffice',
  ]
  for (const c of candidates) {
    try { execSync(`"${c}" --version`, { stdio: 'ignore' }); return c } catch {}
  }
  throw new Error('LibreOffice не найден. Установи: brew install --cask libreoffice')
}

// ── Параллельная конвертация с изолированным профилем ─────────────────────

async function convertToPdf(soffice, filePath, workerIdx) {
  const dir = dirname(filePath)
  const profileDir = join(os.tmpdir(), `soffice-profile-${workerIdx}-${process.pid}`)
  mkdirSync(profileDir, { recursive: true })

  try {
    await execFileAsync(soffice, [
      '--headless',
      `-env:UserInstallation=file://${profileDir}`,
      '--convert-to', 'pdf',
      filePath,
      '--outdir', dir,
    ], { timeout: 120_000 })
  } finally {
    try { rmSync(profileDir, { recursive: true, force: true }) } catch {}
  }

  const pdfPath = join(dir, basename(filePath, extname(filePath)) + '.pdf')
  if (!existsSync(pdfPath)) throw new Error(`PDF не создан`)
  return pdfPath
}

// ── Пул параллельных задач ─────────────────────────────────────────────────

async function runPool(tasks, concurrency) {
  let idx = 0
  let ok = 0, skip = 0, fail = 0

  async function worker(workerIdx) {
    while (idx < tasks.length) {
      const taskIdx = idx++
      const { shortPath, absPath, newAbsPath } = tasks[taskIdx]

      if (existsSync(newAbsPath)) {
        console.log(`  ⏭  [${taskIdx + 1}/${tasks.length}] ${shortPath}`)
        skip++
        continue
      }

      console.log(`  🔄 [${taskIdx + 1}/${tasks.length}] ${shortPath}`)
      try {
        await convertToPdf(soffice, absPath, workerIdx)
        const size = (readFileSync(newAbsPath).length / 1024).toFixed(0)
        console.log(`  ✅ [${taskIdx + 1}/${tasks.length}] ${shortPath} → ${size}KB`)
        ok++
      } catch (err) {
        console.error(`  ❌ [${taskIdx + 1}/${tasks.length}] ${shortPath} → ${err.message}`)
        fail++
      }
    }
  }

  // Нужен soffice в замыкании
  var soffice = tasks._soffice
  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i)))
  return { ok, skip, fail }
}

// ── Парсинг md ─────────────────────────────────────────────────────────────

function extractLocalLinks(content) {
  const re = /\[([^\]]*)\]\(([^)"\s]+)(?:\s+"([^"]+)")?\)/g
  const links = []
  let m
  while ((m = re.exec(content)) !== null) {
    const [, , , title] = m
    if (!title) continue
    if (!title.startsWith('/works/') && !title.startsWith('/github_works/')) continue
    const ext = extname(title).toLowerCase()
    if (!CONVERT_EXTS.has(ext)) continue
    links.push({ title, ext })
  }
  return links
}

// ── Главная функция ────────────────────────────────────────────────────────

const soffice = findSoffice()

async function main() {
  console.log(`✅ LibreOffice: ${execSync(`"${soffice}" --version`).toString().trim()}`)
  console.log(`🚀 Параллелизм: ${CONCURRENCY} потоков (${os.cpus().length} ядер)\n`)

  const mdFiles = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort()

  const toConvert = new Map()
  const mdUpdates = new Map()

  for (const file of mdFiles) {
    const content = readFileSync(join(POSTS_DIR, file), 'utf-8')
    for (const { title, ext } of extractLocalLinks(content)) {
      const decoded = decodeURIComponent(title)
      const absPath = join(PUBLIC_DIR, decoded)
      if (!existsSync(absPath)) {
        console.warn(`  ⚠️  не найден: ${decoded}`)
        continue
      }
      const newTitle = title.slice(0, -ext.length) + '.pdf'
      const newAbsPath = join(PUBLIC_DIR, decodeURIComponent(newTitle))
      if (!toConvert.has(title)) toConvert.set(title, { absPath, newAbsPath, newTitle })
      if (!mdUpdates.has(file)) mdUpdates.set(file, new Map())
      mdUpdates.get(file).set(title, newTitle)
    }
  }

  console.log(`📋 Найдено ${toConvert.size} файлов для конвертации\n`)

  const tasks = [...toConvert.entries()].map(([localPath, v]) => ({
    shortPath: localPath.replace('/works/', '').replace('/github_works/', ''),
    ...v,
  }))
  tasks._soffice = soffice

  const { ok, skip, fail } = await runPool(tasks, CONCURRENCY)

  // Обновляем md файлы
  console.log(`\n📝 Обновление .md файлов...`)
  for (const [file, updates] of mdUpdates) {
    const filePath = join(POSTS_DIR, file)
    let content = readFileSync(filePath, 'utf-8')
    let changed = false
    for (const [oldTitle, newTitle] of updates) {
      const pdfExists = existsSync(join(PUBLIC_DIR, decodeURIComponent(newTitle)))
      if (!pdfExists) continue
      if (content.includes(`"${oldTitle}"`)) {
        content = content.replaceAll(`"${oldTitle}"`, `"${newTitle}"`)
        changed = true
      }
    }
    if (changed) {
      writeFileSync(filePath, content)
      console.log(`  ✅ ${file}`)
    }
  }

  console.log(`\n✅ Готово! Конвертировано: ${ok}, пропущено: ${skip}, ошибок: ${fail}`)
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
