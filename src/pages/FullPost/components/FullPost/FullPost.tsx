import './FullPost.scss'

import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import ReactMarkdown from 'react-markdown'
import { getPostById } from '../../../../utils/posts'
import { FileLink } from '../../../../components/FileLink'

export const FullPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const post = getPostById(Number(id))

  useEffect(() => {
    if (!post) navigate('/')
  }, [post, navigate])

  if (!post) return null

  return (
    <div className="full-post-container">
      <h1 className="full-post-title">{post.title}</h1>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ReactMarkdown className="full-post-content" components={{ a: FileLink as any }}>
        {post.text}
      </ReactMarkdown>
    </div>
  )
}
