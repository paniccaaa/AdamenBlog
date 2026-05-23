import React from 'react'
import { Post } from '../../../../modules/Post/components/Post/Post'
import { getStructure } from '../../../../utils/structure'
import { getPostById } from '../../../../utils/posts'
import styles from './Home.module.scss'

export const Home: React.FC = () => {
  const structure = getStructure()
  const featuredPost = structure.featured ? getPostById(structure.featured.postId) : null

  return (
    <div className={styles.page}>
      {featuredPost && (
        <section className={styles.section}>
          <Post post={featuredPost} featured />
        </section>
      )}

      {structure.sections.map((section) => (
        <section key={section.id} className={styles.section}>
          <h2 className={styles.section_title}>{section.title}</h2>
          {section.disciplines.length > 0 && (() => {
            const cards = section.disciplines
              .map((discipline) => ({ discipline, post: getPostById(discipline.postId) }))
              .filter(({ post }) => post != null)
            return (
              <div className={styles.grid} data-count={Math.min(cards.length, 3)}>
                {cards.map(({ discipline, post }) => (
                  <Post
                    key={discipline.id}
                    post={{ ...post!, title: discipline.title }}
                    courseIndex={section.order}
                  />
                ))}
              </div>
            )
          })()}
        </section>
      ))}
    </div>
  )
}
