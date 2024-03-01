// import "./FullPost.scss";

// import { useNavigate, useParams } from "react-router-dom";

// import { PostType } from "../../../../modules/Post/components/PostBlock/PostBlock";
// import React from "react";
// import { ReactMarkdown } from "react-markdown/lib/react-markdown";
// import { selectPosts } from "../../../../modules/Post/store/reducer/posts";
// import { useSelector } from "react-redux";

// export const FullPost: React.FC = () => {
//   const { id } = useParams<string>();
//   const { posts } = useSelector(selectPosts);
//   const post: PostType | undefined = posts.find(
//     (item) => item.id === Number(id)
//   );
  
//   const navigate = useNavigate();

//   React.useEffect(() => {
//     if (!post) {
//       navigate("/");
//     }
//   }, []);

//   const markdownText = post?.text || ""; // Здесь предполагается, что post?.text может быть null или undefined, поэтому явно устанавливаем его в пустую строку

//   return (
//     <div className="full-post-container">
//       <h1 className="full-post-content">{post?.title}</h1>
//       <ReactMarkdown className="full-post-content">
//         {markdownText}
//       </ReactMarkdown>
//     </div>
//   );
// };

import "./FullPost.scss";

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PostType } from "../../../../modules/Post/components/PostBlock/PostBlock";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

export const FullPost: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const [post, setPost] = useState<PostType | null>(null);

  // Используем эффект для отправки запроса к API при загрузке компонента
  useEffect(() => {
    fetch(`https://41adf6f41ba9f813.mokky.dev/posts/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        return response.json();
      })
      .then((data) => {
        setPost(data);
      })
      .catch((error) => {
        console.error("Error fetching post:", error);
        navigate("/"); 
      });
  }, [id, navigate]);

  const markdownText = post ? post.text : "";

  return (
    <div className="full-post-container">
      {post && (
          <div className="full-post-container">
              <h1 className="full-post-content">{post?.title}</h1>
              <ReactMarkdown className="full-post-content">
                {markdownText}
              </ReactMarkdown>
          </div>
      )}
    </div>
  );
};
