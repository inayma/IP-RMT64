import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllPosts,
  getPostById,
  createPost as createPostAPI,
  updatePost as updatePostAPI,
  deletePost as deletePostAPI,
  votePost as votePostAPI,
  getAvailableCategories,
  getPostsByCategory,
} from "../../libs/http";

// Async thunks for posts
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllPosts();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch posts"
      );
    }
  }
);

export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await getPostById(postId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch post"
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      const response = await createPostAPI(postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create post"
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "posts/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAvailableCategories();
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const fetchPostsByCategory = createAsyncThunk(
  "posts/fetchPostsByCategory",
  async ({ categoryName, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getPostsByCategory(categoryName, { page, limit });
      return {
        categoryName,
        ...response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch posts by category"
      );
    }
  }
);

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const response = await updatePostAPI(postId, postData);
      return { postId, updatedPost: response.data.post };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update post"
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      await deletePostAPI(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete post"
      );
    }
  }
);

export const votePost = createAsyncThunk(
  "posts/votePost",
  async ({ postId, voteType }, { rejectWithValue }) => {
    try {
      const response = await votePostAPI(postId, { voteType });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to vote");
    }
  }
);

const initialState = {
  posts: [],
  currentPost: null,
  categories: [],
  postsByCategory: {},
  selectedCategory: "all",
  isLoading: false,
  categoriesLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearPostsByCategory: (state) => {
      state.postsByCategory = {};
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload;
      })
      // Fetch Posts by Category
      .addCase(fetchPostsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const { categoryName, posts, pagination } = action.payload;
        state.postsByCategory[categoryName] = {
          posts: posts || [],
          pagination: pagination || {},
        };
      })
      .addCase(fetchPostsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Post By ID
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(
          (post) => post.id === action.payload.id
        );
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost && state.currentPost.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post.id !== action.payload);
        if (state.currentPost && state.currentPost.id === action.payload) {
          state.currentPost = null;
        }
      })
      // Vote Post
      .addCase(votePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(
          (post) => post.id === action.payload.id
        );
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost && state.currentPost.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      });
  },
});

export const {
  clearError,
  clearCurrentPost,
  setSelectedCategory,
  clearPostsByCategory,
  setPagination,
} = postsSlice.actions;
export default postsSlice.reducer;
