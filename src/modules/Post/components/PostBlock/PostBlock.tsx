import { Post } from "../Post/Post";
import React from "react";
import { setPosts } from "../../store/reducer/posts";
import { useAppDispatch } from "../../../../redux/store";

export type PostType = {
  title: string;
  text: string;
  image: string;
  id: number;
};
//https://41adf6f41ba9f813.mokky.dev
export const PostBlock: React.FC = () => {
  const [posts, setPostss] = React.useState<PostType[] | []>([]);
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    fetch("https://41adf6f41ba9f813.mokky.dev/posts")
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
