import rawStructure from '../content/structure.json'

export type Discipline = { id: string; title: string; postId: number; order: number }
export type Section    = { id: string; title: string; order: number; disciplines: Discipline[] }
export type Structure  = { featured: { postId: number } | null; sections: Section[] }

export function getStructure(): Structure {
  const data = rawStructure as unknown as Structure
  return {
    ...data,
    sections: [...data.sections]
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        ...s,
        disciplines: [...s.disciplines].sort((a, b) => a.order - b.order),
      })),
  }
}
