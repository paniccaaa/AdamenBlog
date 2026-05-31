import React, { useState, useEffect } from 'react'
import type { AnchorHTMLAttributes } from 'react'

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

export const FileLink: React.FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  href,
  title,
  children,
  ...rest
}) => {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  // локальный файл только когда: запущено локально И нет интернета
  const isLocalTitle = title?.startsWith('/works/') || title?.startsWith('/github_works/')
  const url = !online && isLocalhost && isLocalTitle ? title : href

  return (
    <a {...rest} href={url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}
