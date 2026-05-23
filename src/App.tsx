import { Route, Routes } from 'react-router-dom'

import { Contacts } from './pages/Contacts/components/Contacts/Contacts'
import { Editor } from './pages/Editor/Editor'
import { FullPost } from './pages/FullPost/components/FullPost/FullPost'
import { Header } from './modules/Header'
import { Home } from './pages/Home/components/Home/Home'
import styles from './App.module.scss'

export const App = () => {
  return (
    <div className={styles.main_container}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/post/:id" element={<FullPost />} />
      </Routes>
    </div>
  )
}
