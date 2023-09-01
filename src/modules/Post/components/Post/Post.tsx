import React from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

import { PostType } from "../PostBlock/PostBlock";
import styles from "./Post.module.scss";

export const Post: React.FC<{ post: PostType }> = ({ post }) => {
  const truncateText = (str: string, length: number) => {
    if (str.length >= length) {
      return str.substring(0, length) + "...";
    }
    return str;
  };

  return (
    <Link to={`/post/${post.id}`}>
      <div className={styles.post_container}>
        <div className={styles.post_image}>
          <img src={post.image} />
        </div>
        <div className={styles.post_info}>
          <h1 className={styles.post_title}>{truncateText(post.title, 55)}</h1>
          <ReactMarkdown className={styles.post_description}>
            {truncateText(post.text, 80)}
          </ReactMarkdown>
        </div>
      </div>
    </Link>
  );
};
