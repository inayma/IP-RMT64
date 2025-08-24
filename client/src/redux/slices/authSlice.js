import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { instance } from "../../libs/http";

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await instance.post("/users/login", credentials);
      localStorage.setItem("access_token", response.data.access_token);
      window.dispatchEvent(new Event("authChange"));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await instance.post("/users/register", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const googleAuth = createAsyncThunk(
  "auth/googleAuth",
  async (googleData, { rejectWithValue }) => {
    try {
      // For now, use mock authentication
      const mockResponse = {
        access_token: "mock_jwt_token_" + Date.now(),
        user: {
          id: googleData.sub,
          username: googleData.name,
          email: googleData.email,
          picture: googleData.picture,
        },
      };

      localStorage.setItem("access_token", mockResponse.access_token);
      localStorage.setItem("google_user", JSON.stringify(googleData));
      window.dispatchEvent(new Event("authChange"));

      return mockResponse;
    } catch (error) {
      return rejectWithValue("Google authentication failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("google_user");
    window.dispatchEvent(new Event("authChange"));
    return null;
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem("access_token"),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthFromStorage: (state) => {
      const token = localStorage.getItem("access_token");
      const googleUser = localStorage.getItem("google_user");

      state.token = token;
      state.isAuthenticated = !!token;

      if (googleUser) {
        try {
          state.user = JSON.parse(googleUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Google Auth
      .addCase(googleAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;
