import './FullPost.scss'

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import ReactMarkdown from 'react-markdown'
import { getPostById } from '../../../../utils/posts'
import { FileLink } from '../../../../components/FileLink'
import { PdfPreview } from '../../../../components/PdfPreview/PdfPreview'

export const FullPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const post = getPostById(Number(id))
  const [pdfOpen, setPdfOpen] = useState(false)

  useEffect(() => {
    if (!post) navigate('/')
  }, [post, navigate])

  if (!post) return null

  return (
    <div className="full-post-container">
      <div className="full-post-header">
        <h1 className="full-post-title">{post.title}</h1>
        {post.pdf && (
          <button className="full-post-pdf-btn" onClick={() => setPdfOpen(true)}>
            Открыть PDF
          </button>
        )}
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ReactMarkdown className="full-post-content" components={{ a: FileLink as any }}>
        {post.text}
      </ReactMarkdown>

      {post.pdf && pdfOpen && (
        <PdfPreview
          src={post.pdf}
          title={post.title}
          onClose={() => setPdfOpen(false)}
        />
      )}
    </div>
  )
}
