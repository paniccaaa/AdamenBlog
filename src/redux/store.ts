import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import authUser from "../modules/Auth/store/reducer/authUser";
import posts from "../modules/Post/store/reducer/posts";
export const store = configureStore({
  reducer: {
    authUser,
    posts,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
