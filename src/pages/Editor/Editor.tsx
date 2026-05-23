import 'easymde/dist/easymde.min.css'
import styles from './Editor.module.scss'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import SaveIcon from '@mui/icons-material/Save'
import SimpleMDE from 'react-simplemde-editor'
import { getAllPosts } from '../../utils/posts'
import { getStructure } from '../../utils/structure'
import type { Discipline, Section, Structure } from '../../utils/structure'
import { useNavigate } from 'react-router-dom'

const SENSOR_OPTIONS = { activationConstraint: { distance: 5 } }

// ─── Sortable Section ───────────────────────────────────────────────────────

function SortableSectionItem({
  section,
  selectedKey,
  onSelectDiscipline,
  onRenameSection,
  onDeleteSection,
  onAddDiscipline,
  onRenameDiscipline,
  onDeleteDiscipline,
  onReorderDisciplines,
}: {
  section: Section
  selectedKey: string | null
  onSelectDiscipline: (sectionId: string, disciplineId: string) => void
  onRenameSection: (id: string, title: string) => void
  onDeleteSection: (id: string) => void
  onAddDiscipline: (sectionId: string) => void
  onRenameDiscipline: (sectionId: string, id: string, title: string) => void
  onDeleteDiscipline: (sectionId: string, id: string) => void
  onReorderDisciplines: (sectionId: string, disciplines: Discipline[]) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const sensors = useSensors(
    useSensor(PointerSensor, SENSOR_OPTIONS),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(section.title)

  const commitSectionRename = () => {
    setEditing(false)
    if (editVal.trim()) onRenameSection(section.id, editVal.trim())
  }

  const handleDisciplineDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = section.disciplines.map((d) => d.id)
    const oldIdx = ids.indexOf(active.id as string)
    const newIdx = ids.indexOf(over.id as string)
    const reordered = arrayMove(section.disciplines, oldIdx, newIdx).map((d, i) => ({ ...d, order: i }))
    onReorderDisciplines(section.id, reordered)
  }

  return (
    <div ref={setNodeRef} style={style} className={styles.section_item}>
      <div className={styles.section_header}>
        <span className={styles.drag_handle} {...attributes} {...listeners}>
          <DragIndicatorIcon fontSize="small" />
        </span>
        {editing ? (
          <input
            className={styles.inline_input}
            autoFocus
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onBlur={commitSectionRename}
            onKeyDown={(e) => e.key === 'Enter' && commitSectionRename()}
          />
        ) : (
          <span className={styles.section_name} onDoubleClick={() => { setEditing(true); setEditVal(section.title) }}>
            {section.title}
          </span>
        )}
        <button className={styles.icon_btn} onClick={() => onDeleteSection(section.id)} title="Удалить курс">
          <DeleteIcon fontSize="small" />
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDisciplineDragEnd}>
        <SortableContext items={section.disciplines.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {section.disciplines.map((disc) => (
            <SortableDisciplineItem
              key={disc.id}
              discipline={disc}
              isSelected={selectedKey === `${section.id}:${disc.id}`}
              onSelect={() => onSelectDiscipline(section.id, disc.id)}
              onRename={(title) => onRenameDiscipline(section.id, disc.id, title)}
              onDelete={() => onDeleteDiscipline(section.id, disc.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button className={styles.add_disc_btn} onClick={() => onAddDiscipline(section.id)}>
        <AddIcon fontSize="small" /> Добавить дисциплину
      </button>
    </div>
  )
}

// ─── Sortable Discipline ────────────────────────────────────────────────────

function SortableDisciplineItem({
  discipline,
  isSelected,
  onSelect,
  onRename,
  onDelete,
}: {
  discipline: Discipline
  isSelected: boolean
  onSelect: () => void
  onRename: (title: string) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: discipline.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(discipline.title)

  const commit = () => {
    setEditing(false)
    if (editVal.trim()) onRename(editVal.trim())
  }

  const hasPost = discipline.postId !== -1

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.disc_item} ${isSelected ? styles.disc_selected : ''}`}
      onClick={onSelect}
    >
      <span className={styles.drag_handle} {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
        <DragIndicatorIcon fontSize="inherit" />
      </span>

      {editing ? (
        <input
          className={styles.inline_input}
          autoFocus
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className={styles.disc_name}
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); setEditVal(discipline.title) }}
        >
          {discipline.title}
        </span>
      )}

      <span className={`${styles.post_dot} ${hasPost ? styles.post_dot_linked : ''}`} title={hasPost ? 'Есть контент' : 'Нет контента'} />

      <button
        className={styles.icon_btn}
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        title="Удалить"
      >
        <DeleteIcon fontSize="inherit" />
      </button>
    </div>
  )
}

// ─── Main Editor ────────────────────────────────────────────────────────────

export const Editor: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    if (!import.meta.env.DEV) navigate('/')
  }, [navigate])

  const allPosts = useMemo(() => getAllPosts(), [])
  const mdeOptions = useMemo(() => ({ spellChecker: false, minHeight: '400px' }), [])

  const [structure, setStructure] = useState<Structure>(() => getStructure())
  const [selected, setSelected] = useState<{ sectionId: string; disciplineId: string } | null>(null)
  const [postText, setPostText] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [contentDirty, setContentDirty] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showLinkSelect, setShowLinkSelect] = useState(false)
  const [showChangePost, setShowChangePost] = useState(false)
  const mdeRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, SENSOR_OPTIONS),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const selectedDisc = useMemo(() => {
    if (!selected) return null
    return structure.sections
      .find((s) => s.id === selected.sectionId)
      ?.disciplines.find((d) => d.id === selected.disciplineId) ?? null
  }, [selected, structure])

  const selectedSection = useMemo(() => {
    if (!selected) return null
    return structure.sections.find((s) => s.id === selected.sectionId) ?? null
  }, [selected, structure])

  const selectedKey = selected ? `${selected.sectionId}:${selected.disciplineId}` : null
  const selectedDiscPostId = selectedDisc?.postId ?? null

  useEffect(() => {
    if (!selectedDisc) {
      setPostText('')
      setPostTitle('')
      setContentDirty(false)
      return
    }
    const post = allPosts.find((p) => p.id === selectedDisc.postId)
    setPostText(post?.text ?? '')
    setPostTitle(post?.title ?? selectedDisc.title)
    setContentDirty(false)
    setShowLinkSelect(false)
    setShowChangePost(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, selectedDiscPostId])

  // ── Structure mutations ────────────────────────────────────────────────────

  const updateSection = useCallback((id: string, patch: Partial<Section>) =>
    setStructure((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })), [])

  const updateDiscipline = useCallback((sectionId: string, discId: string, patch: Partial<Discipline>) =>
    setStructure((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? { ...s, disciplines: s.disciplines.map((d) => (d.id === discId ? { ...d, ...patch } : d)) }
          : s
      ),
    })), [])

  const addSection = useCallback(() => {
    const id = 'section-' + Date.now()
    setStructure((prev) => ({
      ...prev,
      sections: [...prev.sections, { id, title: 'Новый курс', order: prev.sections.length, disciplines: [] }],
    }))
  }, [])

  const deleteSection = useCallback((id: string) =>
    setStructure((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.id !== id) })), [])

  const addDiscipline = useCallback((sectionId: string) => {
    const id = 'disc-' + Date.now()
    setStructure((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              disciplines: [
                ...s.disciplines,
                { id, title: 'Новая дисциплина', postId: -1, order: s.disciplines.length },
              ],
            }
          : s
      ),
    }))
  }, [])

  const deleteDiscipline = useCallback((sectionId: string, discId: string) => {
    setSelected((prev) =>
      prev?.sectionId === sectionId && prev?.disciplineId === discId ? null : prev
    )
    setStructure((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, disciplines: s.disciplines.filter((d) => d.id !== discId) } : s
      ),
    }))
  }, [])

  const reorderDisciplines = useCallback((sectionId: string, disciplines: Discipline[]) =>
    setStructure((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, disciplines } : s)),
    })), [])

  const handleSectionDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setStructure((prev) => {
      const ids = prev.sections.map((s) => s.id)
      const reordered = arrayMove(prev.sections, ids.indexOf(active.id as string), ids.indexOf(over.id as string))
        .map((s, i) => ({ ...s, order: i }))
      return { ...prev, sections: reordered }
    })
  }, [])

  const handleSelectDiscipline = useCallback((sId: string, dId: string) => {
    setSelected({ sectionId: sId, disciplineId: dId })
  }, [])

  const handleRenameSection = useCallback((id: string, title: string) => {
    updateSection(id, { title })
  }, [updateSection])

  const handleRenameDiscipline = useCallback((sId: string, dId: string, title: string) => {
    updateDiscipline(sId, dId, { title })
  }, [updateDiscipline])

  // ── Save structure ─────────────────────────────────────────────────────────

  const saveStructure = async () => {
    setSaveStatus('saving')
    await fetch('/api/dev/structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(structure),
    })
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  const saveStructureWith = async (newStructure: Structure) => {
    await fetch('/api/dev/structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStructure),
    })
  }

  // ── Link post helpers ──────────────────────────────────────────────────────

  const linkPostToSelected = async (postId: number) => {
    if (!selected) return
    const newStructure: Structure = {
      ...structure,
      sections: structure.sections.map((s) =>
        s.id === selected.sectionId
          ? {
              ...s,
              disciplines: s.disciplines.map((d) =>
                d.id === selected.disciplineId ? { ...d, postId } : d
              ),
            }
          : s
      ),
    }
    setStructure(newStructure)
    await saveStructureWith(newStructure)
    setShowLinkSelect(false)
    setShowChangePost(false)
  }

  // ── Create new post for selected discipline ────────────────────────────────

  const handleCreatePost = async () => {
    if (!selected || !selectedDisc) return
    setCreating(true)
    try {
      const res = await fetch('/api/dev/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: selectedDisc.title, text: '' }),
      })
      const { id } = await res.json()
      await linkPostToSelected(id)
    } finally {
      setCreating(false)
    }
  }

  // ── Save post content ──────────────────────────────────────────────────────

  const savePost = async () => {
    if (!selectedDisc || selectedDisc.postId === -1) return
    await fetch('/api/dev/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedDisc.postId, title: postTitle, text: postText }),
    })
    setContentDirty(false)
  }

  // ── Image upload ───────────────────────────────────────────────────────────

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1]
      const res = await fetch('/api/dev/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, base64 }),
      })
      const { url } = await res.json()
      const md = `![image](${url})`
      if (mdeRef.current?.codemirror) {
        mdeRef.current.codemirror.replaceSelection(md)
      } else {
        setPostText((prev) => prev + '\n' + md)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const onMdeChange = useCallback((val: string) => {
    setPostText(val)
    setContentDirty(true)
  }, [])

  return (
    <div className={styles.editor}>
      {/* ── Left panel ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebar_header}>
          <span className={styles.sidebar_title}>Структура</span>
          <button
            className={`${styles.save_btn} ${saveStatus === 'saved' ? styles.save_done : ''}`}
            onClick={saveStructure}
          >
            <SaveIcon fontSize="small" />
            {saveStatus === 'saving' ? 'Сохранение...' : saveStatus === 'saved' ? 'Сохранено ✓' : 'Сохранить'}
          </button>
        </div>

        {/* Featured */}
        <div className={styles.featured_row}>
          <span className={styles.featured_label}>Диплом / Featured</span>
          <select
            className={styles.post_select}
            value={structure.featured?.postId ?? -1}
            onChange={(e) =>
              setStructure((prev) => ({
                ...prev,
                featured: Number(e.target.value) === -1 ? null : { postId: Number(e.target.value) },
              }))
            }
          >
            <option value={-1}>— нет —</option>
            {allPosts.map((p) => (
              <option key={p.id} value={p.id}>#{p.id} {p.title.slice(0, 35)}</option>
            ))}
          </select>
        </div>

        <div className={styles.divider} />

        {/* Sections */}
        <div className={styles.sections_list}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
            <SortableContext items={structure.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {structure.sections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  selectedKey={selectedKey}
                  onSelectDiscipline={handleSelectDiscipline}
                  onRenameSection={handleRenameSection}
                  onDeleteSection={deleteSection}
                  onAddDiscipline={addDiscipline}
                  onRenameDiscipline={handleRenameDiscipline}
                  onDeleteDiscipline={deleteDiscipline}
                  onReorderDisciplines={reorderDisciplines}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <button className={styles.add_section_btn} onClick={addSection}>
          <AddIcon fontSize="small" /> Добавить курс
        </button>
      </aside>

      {/* ── Right panel ── */}
      <main className={styles.content}>
        {!selected ? (
          /* No discipline selected */
          <div className={styles.empty_state}>
            <p>Выберите дисциплину слева,<br />чтобы редактировать её содержимое</p>
          </div>
        ) : selectedDisc?.postId === -1 ? (
          /* Discipline selected but has no post yet */
          <div className={styles.no_post_state}>
            <div className={styles.no_post_breadcrumb}>
              <span>{selectedSection?.title}</span>
              <span className={styles.breadcrumb_sep}>/</span>
              <span>{selectedDisc?.title}</span>
            </div>
            <div className={styles.no_post_card}>
              <div className={styles.no_post_icon}>✦</div>
              <h3 className={styles.no_post_title}>Нет контента</h3>
              <p className={styles.no_post_desc}>
                Эта дисциплина ещё не привязана к посту.
                <br />Создайте новый или привяжите существующий.
              </p>
              <button
                className={styles.create_btn}
                onClick={handleCreatePost}
                disabled={creating}
              >
                {creating ? 'Создание...' : '+ Создать новый пост'}
              </button>
              <div className={styles.no_post_divider}>
                <span>или</span>
              </div>
              {showLinkSelect ? (
                <div className={styles.link_select_row}>
                  <select
                    className={styles.link_post_select}
                    defaultValue={-1}
                    autoFocus
                    onChange={(e) => {
                      const id = Number(e.target.value)
                      if (id !== -1) linkPostToSelected(id)
                    }}
                  >
                    <option value={-1}>— выберите пост —</option>
                    {allPosts.map((p) => (
                      <option key={p.id} value={p.id}>#{p.id} {p.title}</option>
                    ))}
                  </select>
                  <button className={styles.cancel_link_btn} onClick={() => setShowLinkSelect(false)}>✕</button>
                </div>
              ) : (
                <button className={styles.link_btn} onClick={() => setShowLinkSelect(true)}>
                  Привязать существующий пост
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Discipline has a linked post — show editor */
          <div className={styles.post_editor}>
            <div className={styles.post_editor_header}>
              <input
                className={styles.title_input}
                value={postTitle}
                onChange={(e) => { setPostTitle(e.target.value); setContentDirty(true) }}
                placeholder="Заголовок поста"
              />
              <div className={styles.post_actions}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <button className={styles.outline_btn} onClick={() => fileInputRef.current?.click()}>
                  Изображение
                </button>
                <button
                  className={`${styles.primary_btn} ${contentDirty ? styles.dirty : ''}`}
                  onClick={savePost}
                >
                  Сохранить пост
                </button>
              </div>
            </div>

            <div className={styles.post_meta_row}>
              <span className={styles.post_breadcrumb}>
                {selectedSection?.title}
                <span className={styles.breadcrumb_sep}>/</span>
                {selectedDisc?.title}
              </span>
              <button
                className={styles.change_post_toggle}
                onClick={() => setShowChangePost((v) => !v)}
              >
                {showChangePost ? 'Скрыть' : 'Сменить пост'}
              </button>
            </div>

            {showChangePost && (
              <div className={styles.change_post_row}>
                <span className={styles.change_post_label}>Привязать другой пост:</span>
                <select
                  className={styles.link_post_select}
                  value={selectedDisc?.postId ?? -1}
                  onChange={(e) => linkPostToSelected(Number(e.target.value))}
                >
                  {allPosts.map((p) => (
                    <option key={p.id} value={p.id}>#{p.id} {p.title}</option>
                  ))}
                </select>
              </div>
            )}

            <SimpleMDE
              value={postText}
              onChange={onMdeChange}
              getMdeInstance={(instance) => { mdeRef.current = instance }}
              options={mdeOptions}
            />
          </div>
        )}
      </main>
    </div>
  )
}
