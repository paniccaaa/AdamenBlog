import { Link } from 'react-router-dom'

import React from 'react'
import styles from './Header.module.scss'

export const Header: React.FC = () => {
  return (
    <div className={styles.header_container}>
      <div className={styles.button_container}>
        <Link to="/">
          <h1 className={styles.title}>Adamen Blog</h1>
        </Link>
      </div>

      <div className={styles.button_container}>
        <Link to="/">
          <button className={styles.nav}>Главная</button>
        </Link>

        <Link to="/about">
          <button className={styles.nav}>Обо мне</button>
        </Link>

        <Link to="/contacts">
          <button className={styles.nav}>Контакты</button>
        </Link>

        {import.meta.env.DEV && (
          <Link to="/editor">
            <button className={styles.nav}>Редактор</button>
          </Link>
        )}
      </div>
    </div>
  )
}
