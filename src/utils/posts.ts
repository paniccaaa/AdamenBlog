import { PostType } from '../modules/Post/components/PostBlock/PostBlock'

const modules = import.meta.glob('../content/posts/*.md', { as: 'raw', eager: true })

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }
  const data: Record<string, unknown> = {}
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const val = line.slice(colonIdx + 1).trim().replace(/^"(.*)"$/, '$1')
    if (key === 'id') data[key] = Number(val)
    else if (key === 'featured') data[key] = val === 'true'
    else data[key] = val
  }
  return { data, content: match[2].trim() }
}

export function getAllPosts(): PostType[] {
  return Object.entries(modules)
    .map(([, raw]) => {
      const { data, content } = parseFrontmatter(raw as string)
      return {
        id: data.id as number,
        title: data.title as string,
        image: '',
        text: content,
        course: data.course as string | undefined,
        featured: data.featured as boolean | undefined,
      }
    })
    .sort((a, b) => b.id - a.id)
}

export function getPostById(id: number): PostType | undefined {
  return getAllPosts().find((p) => p.id === id)
}
