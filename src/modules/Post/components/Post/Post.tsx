import { Link } from 'react-router-dom'
import { PostType } from '../PostBlock/PostBlock'
import styles from './Post.module.scss'

// Light pastel gradients — white background, dark text, minimal style.
const GRADIENTS: Record<number, string> = {
  [-1]: 'linear-gradient(150deg, #fffbf0 0%, #f0d880 55%, #d4b84a 100%)', // gold — диплом
  0:    'linear-gradient(150deg, #fff4f0 0%, #f0c0a0 55%, #d8906a 100%)', // peach — курс 4
  1:    'linear-gradient(150deg, #f5f0ff 0%, #cfc0f0 55%, #a890e0 100%)', // lavender — курс 3
  2:    'linear-gradient(150deg, #f0faf4 0%, #b8dcc8 55%, #88c0a8 100%)', // mint — курс 2
  3:    'linear-gradient(150deg, #f0f5ff 0%, #b8cef0 55%, #88aae0 100%)', // sky — курс 1
  4:    'linear-gradient(150deg, #f4f5f8 0%, #c8cdd8 55%, #9aa0b0 100%)', // slate — лаб
}
const DEFAULT_GRADIENT = GRADIENTS[4]

export const Post: React.FC<{ post: PostType; featured?: boolean; courseIndex?: number }> = ({
  post,
  featured,
  courseIndex,
}) => {
  const gradient = GRADIENTS[courseIndex ?? (featured ? -1 : 4)] ?? DEFAULT_GRADIENT

  return (
    <Link
      to={`/post/${post.id}`}
      className={`${styles.link} ${featured ? styles.featured_wrapper : ''}`}
    >
      <div
        className={`${styles.post_card} ${featured ? styles.featured : ''}`}
        style={{ background: gradient }}
      >
        <div className={styles.post_overlay} />
        <h2 className={`${styles.post_title} ${featured ? styles.featured_title : ''}`}>
          {post.title}
        </h2>
      </div>
    </Link>
  )
}
