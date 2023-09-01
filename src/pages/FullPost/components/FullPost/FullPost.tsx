import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FullPost.scss";
import { selectPosts } from "../../../../modules/Post/store/reducer/posts";
import { useSelector } from "react-redux";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { PostType } from "../../../../modules/Post/components/PostBlock/PostBlock";

export const FullPost: React.FC = () => {
  const { id } = useParams<string>();
  const { posts } = useSelector(selectPosts);
  const post: PostType | undefined = posts.find(
    (item) => item.id === Number(id)
  );
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!post) {
      navigate("/");
    }
  }, []);

  return (
    <div className="full-post-container">
      <h1 className="full-post-content">{post?.title}</h1>
      <ReactMarkdown className="full-post-content">{post?.text}</ReactMarkdown>
    </div>
  );
};
