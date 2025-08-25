import axios from "axios";

// Create axios instance with base configuration
export const instance = axios.create({
  baseURL: "http://localhost:3000", // Your server URL
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Posts API calls
export const getAllPosts = () => instance.get("/posts");
export const getPostById = (id) => instance.get(`/posts/${id}`);
export const createPost = (postData) => instance.post("/posts", postData);
export const updatePost = (id, postData) =>
  instance.put(`/posts/${id}`, postData);
export const deletePost = (id) => instance.delete(`/posts/${id}`);
export const votePost = (id, voteData) =>
  instance.post(`/posts/${id}/vote`, voteData);

// Category API calls
export const getAvailableCategories = () => instance.get("/posts/categories");
export const getPostsByCategory = (categoryName, params = {}) => {
  const searchParams = new URLSearchParams(params);
  return instance.get(`/posts/category/${categoryName}?${searchParams}`);
};

// News API calls (proxied through our server)
export const getTechHeadlines = (params = {}) => {
  const searchParams = new URLSearchParams(params);
  return instance.get(`/news/tech-headlines?${searchParams}`);
};
export const getNewsByCategory = (category, params = {}) => {
  const searchParams = new URLSearchParams(params);
  return instance.get(`/news/category/${category}?${searchParams}`);
};
export const searchNews = (params = {}) => {
  const searchParams = new URLSearchParams(params);
  return instance.get(`/news/search?${searchParams}`);
};

// AI API calls
export const generateSummary = (postId) =>
  instance.post(`/ai/posts/${postId}/summary`);
