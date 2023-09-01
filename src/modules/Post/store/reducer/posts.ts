import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux/store";

import { PostType } from "../../components/PostBlock/PostBlock";

type initialType = {
  posts: PostType[];
  post: PostType;
};

const initialState: initialType = {
  posts: [{ title: "", image: "", id: 0, text: "" }],
  post: { title: "", image: "", id: 0, text: "" },
};

const postsSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<PostType[]>) => {
      state.posts = action.payload;
    },
    setPost: (state, action: PayloadAction<PostType>) => {
      state.post = action.payload;
    },
  },
});

export const selectPosts = (state: RootState) => state.posts;
export const { setPosts, setPost } = postsSlice.actions;
export default postsSlice.reducer;
