import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

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

export default defineConfig({
  plugins: [react(), devPostsPlugin()],
})
