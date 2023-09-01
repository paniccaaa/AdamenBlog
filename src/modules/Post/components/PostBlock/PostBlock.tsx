import React from "react";

import { useAppDispatch } from "../../../../redux/store";
import { Post } from "../Post/Post";
import { setPosts } from "../../store/reducer/posts";

export type PostType = {
  title: string;
  text: string;
  image: string;
  id: number;
};

export const PostBlock: React.FC = () => {
  const [posts, setPostss] = React.useState<PostType[] | []>([]);
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    fetch("https://501881a3cd249a1b.mokky.dev/posts")
      .then((response) => response.json())
      .then((data) => setPostss(data))
      .catch((error) => {
        console.log(error);
        alert("Извините, произошла ошибка при получении постов :(");
      });
  }, []);

  React.useEffect(() => {
    dispatch(setPosts(posts));
  }, [posts]);

  return (
    <div>
      {posts.reverse().map((post: PostType) => (
        <Post key={post.title} post={post} />
      ))}
    </div>
  );
};
