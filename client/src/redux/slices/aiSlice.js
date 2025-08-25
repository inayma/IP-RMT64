import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { generateSummary as apiGenerateSummary } from "../../libs/http";

// Server-side AI integration through API calls
export const generatePostSummary = createAsyncThunk(
  "ai/generatePostSummary",
  async ({ postId }, { rejectWithValue }) => {
    try {
      const response = await apiGenerateSummary(postId);

      return {
        postId,
        summary: response.data.summary,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate AI summary"
      );
    }
  }
);

const initialState = {
  summaries: {},
  isLoading: {
    summary: false,
  },
  error: null,
  aiFeatures: {
    summarization: true,
  },
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAiData: (state) => {
      state.summaries = {};
    },
    clearPostAiData: (state, action) => {
      const postId = action.payload;
      delete state.summaries[postId];
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate Post Summary
      .addCase(generatePostSummary.pending, (state) => {
        state.isLoading.summary = true;
        state.error = null;
      })
      .addCase(generatePostSummary.fulfilled, (state, action) => {
        state.isLoading.summary = false;
        const { postId, summary, timestamp } = action.payload;
        state.summaries[postId] = { summary, timestamp };
      })
      .addCase(generatePostSummary.rejected, (state, action) => {
        state.isLoading.summary = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAiData, clearPostAiData } = aiSlice.actions;
export default aiSlice.reducer;
