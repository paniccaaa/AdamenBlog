import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { marked } from 'marked'

const POSTS_DIR      = path.resolve(__dirname, 'src/content/posts')
const IMAGES_DIR     = path.resolve(__dirname, 'public/images')
const STRUCTURE_FILE = path.resolve(__dirname, 'src/content/structure.json')

function devPostsPlugin() {
  return {
    name: 'dev-posts',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use('/api/dev/upload', (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
        const chunks: Buffer[] = []
        req.on('data', (c: Buffer) => chunks.push(c))
        req.on('end', () => {
          try {
            const { filename, base64 } = JSON.parse(Buffer.concat(chunks).toString())
            if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true })
            const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
            const unique = Date.now() + '_' + safeName
            fs.writeFileSync(path.join(IMAGES_DIR, unique), Buffer.from(base64, 'base64'))
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ url: `/images/${unique}` }))
          } catch (e) {
            res.writeHead(500)
            res.end(String(e))
          }
        })
      })

      server.middlewares.use('/api/dev/structure', (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
        const chunks: Buffer[] = []
        req.on('data', (c: Buffer) => chunks.push(c))
        req.on('end', () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString())
            fs.writeFileSync(STRUCTURE_FILE, JSON.stringify(body, null, 2), 'utf8')
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true }))
          } catch (e) {
            res.writeHead(500)
            res.end(String(e))
          }
        })
      })

      server.middlewares.use('/api/dev/posts', (req, res) => {
        const chunks: Buffer[] = []
        req.on('data', (c: Buffer) => chunks.push(c))
        req.on('end', () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString())
            const { id, title, text } = body

            if (req.method === 'DELETE') {
              const file = path.join(POSTS_DIR, id + '.md')
              if (fs.existsSync(file)) fs.unlinkSync(file)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true }))
              return
            }

            const newId = id ?? Date.now()
            const safeTitle = (title || '').replace(/"/g, '\\"')
            const content = `---\nid: ${newId}\ntitle: "${safeTitle}"\n---\n\n${text || ''}\n`
            fs.writeFileSync(path.join(POSTS_DIR, newId + '.md'), content, 'utf8')

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true, id: newId }))
          } catch (e) {
            res.writeHead(500)
            res.end(String(e))
          }
        })
      })
    },
  }
}

function markdownViewerPlugin() {
  return {
    name: 'markdown-viewer',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (!url.startsWith('/github_works/') || !url.endsWith('.md')) return next()

        const filePath = path.resolve(__dirname, 'public' + decodeURIComponent(url))
        if (!fs.existsSync(filePath)) return next()

        const raw = fs.readFileSync(filePath, 'utf-8')
        const html = marked.parse(raw) as string
        const fileName = path.basename(url)
        const backUrl = url.substring(0, url.lastIndexOf('/') + 1)

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${fileName}</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 860px; margin: 2rem auto; padding: 0 1.5rem; color: #222; line-height: 1.7 }
    h1,h2,h3 { border-bottom: 1px solid #eee; padding-bottom: .3em }
    code { background: #f4f4f4; padding: .2em .4em; border-radius: 4px; font-size: .9em }
    pre { background: #f4f4f4; padding: 1em; border-radius: 6px; overflow-x: auto }
    pre code { background: none; padding: 0 }
    a { color: #2563eb }
    img { max-width: 100% }
    nav { margin-bottom: 1.5rem; font-size: .9rem }
    nav a { color: #2563eb; text-decoration: none }
  </style>
</head>
<body>
  <nav>← <a href="${backUrl}">Назад</a></nav>
  ${html}
</body>
</html>`)
      })
    },
  }
}

function pdfInlinePlugin() {
  return {
    name: 'pdf-inline',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0].endsWith('.pdf')) {
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Disposition', 'inline')
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), devPostsPlugin(), markdownViewerPlugin(), pdfInlinePlugin()],
})
