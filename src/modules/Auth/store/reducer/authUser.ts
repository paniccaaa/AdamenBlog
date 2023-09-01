import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux/store";

const initialState = {
  token: "",
  isAuthenticated: false,
  username: "",
  email: "",
};

const authUserSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
  },
});

export const selectAuth = (state: RootState) => state.authUser;
export const { setToken, setIsAuthenticated, setUsername, setEmail } =
  authUserSlice.actions;
export default authUserSlice.reducer;
