#!/usr/bin/env node
/**
 * Скачивает файлы из GitHub-ссылок в public/github_works/ для офлайн-доступа.
 * Запуск: node scripts/download_github_works.js
 *
 * После скачивания обновляет ссылки в src/content/posts/*.md:
 * добавляет локальный путь в title: [label](github_url "/github_works/...")
 *
 * Для blob → скачивает raw-файл
 * Для tree → рекурсивно скачивает все файлы + создаёт index.html
 *
 * Опционально: GITHUB_TOKEN=... node scripts/download_github_works.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const POSTS_DIR = join(ROOT, 'src/content/posts')
const OUTPUT_DIR = join(ROOT, 'public/github_works')

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const DELAY_MS = 300 // пауза между API запросами, чтобы не превысить rate limit

const apiHeaders = {
  'User-Agent': 'AdamenBlog/1.0',
  'Accept': 'application/vnd.github.v3+json',
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
}

// ── Парсинг URL ────────────────────────────────────────────────────────────

function parseGithubUrl(url) {
  const m = url.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(blob|tree)\/([^/]+)\/(.+?)(?:\?.*)?$/
  )
  if (!m) return null
  const [, owner, repo, type, branch, rawPath] = m
  return { owner, repo, type, branch, path: decodeURIComponent(rawPath) }
}

function localPathFor(parsed) {
  const { repo, branch, path, type } = parsed
  if (type === 'blob') return `/github_works/${repo}/${branch}/${path}`
  return `/github_works/${repo}/${branch}/${path}/index.html`
}

// ── Сетевые утилиты ────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchRaw(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'AdamenBlog/1.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.arrayBuffer()
}

async function fetchApi(url) {
  await sleep(DELAY_MS)
  const res = await fetch(url, { headers: apiHeaders })
  if (res.status === 403) {
    const remaining = res.headers.get('X-RateLimit-Remaining')
    const reset = res.headers.get('X-RateLimit-Reset')
    const resetTime = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : '?'
    throw new Error(`Rate limit exceeded (resets ~${resetTime}). Set GITHUB_TOKEN= для повышения лимита.`)
  }
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`)
  return res.json()
}

async function downloadRawFile(owner, repo, branch, filePath) {
  const encoded = filePath.split('/').map(p => encodeURIComponent(p)).join('/')
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encoded}`
  return fetchRaw(url)
}

// ── Рекурсивная загрузка папки ─────────────────────────────────────────────

async function downloadDir(owner, repo, branch, dirPath, outputDir) {
  const encoded = dirPath.split('/').map(encodeURIComponent).join('/')
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encoded}?ref=${branch}`
  const items = await fetchApi(url)

  if (!Array.isArray(items)) throw new Error(`Unexpected response for ${url}`)
  mkdirSync(outputDir, { recursive: true })

  const fileList = []

  for (const item of items) {
    if (item.type === 'file') {
      const buf = await downloadRawFile(owner, repo, branch, item.path)
      const out = join(outputDir, item.name)
      writeFileSync(out, Buffer.from(buf))
      process.stdout.write(`    ✅ ${item.name} (${(buf.byteLength / 1024).toFixed(0)}KB)\n`)
      fileList.push({ type: 'file', name: item.name })
    } else if (item.type === 'dir') {
      process.stdout.write(`    📁 → ${item.name}/\n`)
      const sub = await downloadDir(owner, repo, branch, item.path, join(outputDir, item.name))
      fileList.push({ type: 'dir', name: item.name, children: sub })
    }
  }

  return fileList
}

// ── Генерация index.html для папок ────────────────────────────────────────

function buildHtmlList(items, basePath = '') {
  return items.map(item => {
    if (item.type === 'file') {
      const href = basePath + item.name
      return `<li><a href="${href}">${item.name}</a></li>`
    }
    const subHtml = buildHtmlList(item.children, basePath + item.name + '/')
    return `<li>📁 <strong>${item.name}</strong><ul>${subHtml}</ul></li>`
  }).join('\n')
}

function generateIndex(title, items, githubUrl) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, sans-serif; padding: 2rem; max-width: 640px; margin: auto }
    h2 { font-family: monospace; font-size: 1.2rem }
    ul { line-height: 2 }
    a { color: #2563eb; text-decoration: none }
    a:hover { text-decoration: underline }
    small { color: #888 }
  </style>
</head>
<body>
  <h2>📁 ${title}</h2>
  <ul>
${buildHtmlList(items)}
  </ul>
  <hr>
  <small>Офлайн-копия · <a href="${githubUrl}" target="_blank">Открыть на GitHub</a></small>
</body>
</html>`
}

// ── Извлечение GitHub-ссылок из md-файлов ─────────────────────────────────

function extractGithubLinks(content) {
  const re = /\[([^\]]*)\]\((https:\/\/github\.com\/[^)\s"]+)(?:\s+"([^"]*)")?\)/g
  const links = []
  let m
  while ((m = re.exec(content)) !== null) {
    const [full, label, url, existingTitle] = m
    const parsed = parseGithubUrl(url)
    if (parsed) links.push({ full, label, url, existingTitle: existingTitle || null, parsed })
  }
  return links
}

// ── Скачивание картинок из markdown-файлов ────────────────────────────────

async function downloadMarkdownImages(mdContent, owner, repo, branch, mdDir, outputDir) {
  const re = /!\[[^\]]*\]\(([^)]+)\)/g
  let m
  while ((m = re.exec(mdContent)) !== null) {
    const src = m[1].trim()
    if (src.startsWith('http')) continue // только относительные пути

    const imgRepoPath = mdDir ? `${mdDir}/${src}` : src
    const outPath = join(outputDir, src)

    if (existsSync(outPath)) {
      process.stdout.write(`    ⏭  ${src} уже есть\n`)
      continue
    }

    try {
      const buf = await downloadRawFile(owner, repo, branch, imgRepoPath)
      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, Buffer.from(buf))
      process.stdout.write(`    🖼  ${src} (${(buf.byteLength / 1024).toFixed(0)}KB)\n`)
    } catch (e) {
      process.stdout.write(`    ⚠️  ${src}: ${e.message}\n`)
    }
  }
}

// ── Главная функция ────────────────────────────────────────────────────────

async function main() {
  const mdFiles = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort()

  // Собираем все уникальные GitHub-ссылки
  const allLinks = new Map()
  for (const file of mdFiles) {
    const content = readFileSync(join(POSTS_DIR, file), 'utf-8')
    for (const link of extractGithubLinks(content)) {
      if (!allLinks.has(link.url)) allLinks.set(link.url, link.parsed)
    }
  }

  console.log(`\n🔍 Найдено ${allLinks.size} уникальных GitHub-ссылок\n`)

  let ok = 0, fail = 0

  for (const [url, parsed] of allLinks) {
    const { owner, repo, branch, path, type } = parsed
    const outBase = join(OUTPUT_DIR, repo, branch, path)
    const alreadyExists = existsSync(type === 'blob' ? outBase : join(outBase, 'index.html'))

    console.log(`\n${type === 'blob' ? '📄' : '📁'} [${branch}] ${path}`)

    if (alreadyExists) {
      console.log('  ⏭  уже скачан, пропускаем (удали файл чтобы обновить)')
      ok++
      continue
    }

    try {
      if (type === 'blob') {
        const buf = await downloadRawFile(owner, repo, branch, path)
        mkdirSync(dirname(outBase), { recursive: true })
        writeFileSync(outBase, Buffer.from(buf))
        console.log(`  ✅ ${(buf.byteLength / 1024).toFixed(0)}KB`)

        if (path.endsWith('.md')) {
          const mdContent = Buffer.from(buf).toString('utf-8')
          const mdDir = dirname(path) === '.' ? '' : dirname(path)
          await downloadMarkdownImages(mdContent, owner, repo, branch, mdDir, dirname(outBase))
        }
      } else {
        mkdirSync(outBase, { recursive: true })
        const files = await downloadDir(owner, repo, branch, path, outBase)
        const html = generateIndex(path.split('/').pop(), files, url)
        writeFileSync(join(outBase, 'index.html'), html)
        console.log('  📋 index.html создан')
      }
      ok++
    } catch (err) {
      console.error(`  ❌ Ошибка: ${err.message}`)
      fail++
    }
  }

  // Обновляем md-файлы: добавляем local path в title
  console.log('\n\n📝 Обновление .md файлов...\n')

  for (const file of mdFiles) {
    const filePath = join(POSTS_DIR, file)
    let content = readFileSync(filePath, 'utf-8')
    let changed = false

    const newContent = content.replace(
      /\[([^\]]*)\]\((https:\/\/github\.com\/[^)\s"]+)(?:\s+"([^"]*)")?\)/g,
      (full, label, url, existingTitle) => {
        if (existingTitle?.startsWith('/github_works/')) return full
        const parsed = parseGithubUrl(url)
        if (!parsed) return full
        const local = localPathFor(parsed)
        changed = true
        return `[${label}](${url} "${local}")`
      }
    )

    if (changed) {
      writeFileSync(filePath, newContent)
      console.log(`  ✅ ${file}`)
    }
  }

  console.log(`\n✅ Готово! Скачано: ${ok}, ошибок: ${fail}`)
  if (fail > 0) {
    console.log('Для повышения rate limit: GITHUB_TOKEN=ghp_xxx node scripts/download_github_works.js')
  }
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
