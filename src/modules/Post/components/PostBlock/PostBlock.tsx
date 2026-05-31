import { Post } from '../Post/Post'
import React from 'react'
import { getAllPosts } from '../../../../utils/posts'

export type PostType = {
  title: string
  text: string
  image: string
  id: number
  course?: string
  featured?: boolean
  pdf?: string
}

export const PostBlock: React.FC = () => {
  const posts = getAllPosts()
  return (
    <>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </>
  )
}
