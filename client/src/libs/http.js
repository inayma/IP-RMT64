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

// AI Analysis API calls
export const generateSummary = (postId) =>
  instance.post(`/ai/posts/${postId}/summary`);

export const generate5W1H = (postId) =>
  instance.post(`/ai/posts/${postId}/5w1h`);

export const generateComparison = (postId) =>
  instance.post(`/ai/posts/${postId}/comparison`);

export const generateAllAnalyses = (postId) =>
  instance.post(`/ai/posts/${postId}/analyze-all`);
