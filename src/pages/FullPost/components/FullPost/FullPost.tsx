import './FullPost.scss'

import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import ReactMarkdown from 'react-markdown'
import { getPostById } from '../../../../utils/posts'

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
      <ReactMarkdown className="full-post-content">{post.text}</ReactMarkdown>
    </div>
  )
}
