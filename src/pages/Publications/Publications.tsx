import React from 'react'
import styles from './Publications.module.scss'

export const Publications: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.meta}>
        <h2 className={styles.title}>Разработка системы управления задачами на базе Telegram-бота</h2>
        <span className={styles.badge}>Статья</span>
      </div>
      <iframe
        src="/publications/telegram-bot-article.pdf"
        className={styles.embed}
        title="Разработка системы управления задачами на базе Telegram-бота"
      />
    </div>
  )
}
