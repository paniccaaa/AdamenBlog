import React, { useEffect } from 'react'
import styles from './PdfPreview.module.scss'

interface PdfPreviewProps {
  src: string
  title: string
  onClose: () => void
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ src, title, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <button className={styles.close} onClick={onClose} aria-label="Закрыть">✕</button>
        </div>
        <iframe
          src={src}
          className={styles.embed}
          title={title}
        />
      </div>
    </div>
  )
}
