import React, { useState } from 'react'
import { PdfPreview } from '../PdfPreview/PdfPreview'
import styles from './PublicationCard.module.scss'

interface PublicationCardProps {
  title: string
  description?: string
  pdfSrc: string
  gradient?: string
  featured?: boolean
}

export const PublicationCard: React.FC<PublicationCardProps> = ({
  title,
  description,
  pdfSrc,
  gradient = 'linear-gradient(150deg, #f0f8ff 0%, #b8d8f0 55%, #7ab0d8 100%)',
  featured,
}) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className={`${styles.card} ${featured ? styles.featured : ''}`}
        style={{ background: gradient }}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(true) }}
      >
        <h3 className={`${styles.title} ${featured ? styles.featured_title : ''}`}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {open && (
        <PdfPreview
          src={pdfSrc}
          title={title}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
