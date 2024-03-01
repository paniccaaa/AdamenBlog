import "easymde/dist/easymde.min.css";
import "./Admin.scss";

import { Button, TextField } from "@mui/material";

import { PostType } from "../../../../modules/Post/components/PostBlock/PostBlock";
import React from "react";
import ReactMarkdown from "react-markdown";
import SimpleMDE from "react-simplemde-editor";
import { handlePostDelete } from "../../helpers/handlePostDelete";
import { handlePostEdit } from "../../helpers/handlePostEdit ";
import { handlePostPublish } from "../../helpers/handlePostPublish";
import { selectPosts } from "../../../../modules/Post/store/reducer/posts";
import { truncateText } from "../../helpers/truncateText";
import { useSelector } from "react-redux";

export const Admin: React.FC = () => {
  const [value, setValue] = React.useState("Initial value");
  const [title, setTitle] = React.useState("");
  const [image, setImage] = React.useState("");
  const [post, setPost] = React.useState<PostType>({
    title: "",
    text: "",
    image: "",
    id: 0,
  });

  const { posts } = useSelector(selectPosts);

  const onChange = React.useCallback((value: string) => {
    setValue(value);
  }, []);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImage(event.target.value);
  };

  const handlePostClick = (post: PostType) => {
    setPost(post);
    setValue(post.text);
    setTitle(post.title);
    setImage(post.image);
  };

  return (
    <div className="admin_container">
      <div>
        {posts.map((post: PostType) => (
          <div
            className="post_container"
            key={post.title}
            onClick={() => handlePostClick(post)}
          >
            <h1 className="post_h1">{truncateText(post.title, 30)}</h1>
          </div>
        ))}
      </div>
      <ReactMarkdown className="custom-image">{value}</ReactMarkdown>
      <TextField
        label="Название статьи"
        value={title}
        onChange={handleTitleChange}
      />
      <TextField
        label="Ссылка на изображение"
        value={image}
        onChange={handleImageChange}
      />
      <div className="image-container">
        <SimpleMDE value={value} onChange={onChange} />
      </div>

      <Button
        variant="contained"
        onClick={() => handlePostPublish(value, title, image)}
      >
        Опубликовать
      </Button>
      <Button
        variant="contained"
        onClick={() => handlePostEdit(post.id, value, title, image)}
      >
        Редактировать
      </Button>
      <Button variant="contained" onClick={() => handlePostDelete(post.id)}>
        Удалить
      </Button>
    </div>
  );
};

