import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import postsReducer from "./slices/postsSlice";
import newsReducer from "./slices/newsSlice";
import commentsReducer from "./slices/commentsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    news: newsReducer,
    comments: commentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});
