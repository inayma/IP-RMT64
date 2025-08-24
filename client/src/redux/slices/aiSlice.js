import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  generateSummary as apiGenerateSummary,
  generate5W1H as apiGenerate5W1H,
  generateComparison as apiGenerateComparison,
  generateAllAnalyses as apiGenerateAllAnalyses,
} from "../../libs/http";

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

export const generate5W1H = createAsyncThunk(
  "ai/generate5W1H",
  async ({ postId }, { rejectWithValue }) => {
    try {
      const response = await apiGenerate5W1H(postId);

      return {
        postId,
        analysis: response.data.analysis,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate 5W1H analysis"
      );
    }
  }
);

export const generateComparison = createAsyncThunk(
  "ai/generateComparison",
  async ({ postId }, { rejectWithValue }) => {
    try {
      const response = await apiGenerateComparison(postId);

      return {
        postId,
        comparison: response.data.comparison,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate market comparison"
      );
    }
  }
);

export const generateAllAnalyses = createAsyncThunk(
  "ai/generateAllAnalyses",
  async ({ postId }, { rejectWithValue }) => {
    try {
      const response = await apiGenerateAllAnalyses(postId);

      return {
        postId,
        summary: response.data.summary,
        analysis: response.data.analysis,
        comparison: response.data.comparison,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate all analyses"
      );
    }
  }
);

const initialState = {
  summaries: {},
  analyses: {},
  comparisons: {},
  allAnalyses: {},
  isLoading: {
    summary: false,
    analysis: false,
    comparison: false,
    allAnalyses: false,
  },
  error: null,
  aiFeatures: {
    summarization: true,
    analysis5W1H: true,
    marketComparison: true,
    allAnalyses: true,
  },
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    toggleAiFeature: (state, action) => {
      const { feature, enabled } = action.payload;
      if (state.aiFeatures[feature] !== undefined) {
        state.aiFeatures[feature] = enabled;
      }
    },
    clearAiData: (state) => {
      state.summaries = {};
      state.analyses = {};
      state.comparisons = {};
      state.allAnalyses = {};
    },
    // Clear specific post data
    clearPostAiData: (state, action) => {
      const postId = action.payload;
      delete state.summaries[postId];
      delete state.analyses[postId];
      delete state.comparisons[postId];
      delete state.allAnalyses[postId];
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
        const { postId } = action.payload;
        state.summaries[postId] = action.payload;
      })
      .addCase(generatePostSummary.rejected, (state, action) => {
        state.isLoading.summary = false;
        state.error = action.payload;
      })
      // Generate 5W1H Analysis
      .addCase(generate5W1H.pending, (state) => {
        state.isLoading.analysis = true;
        state.error = null;
      })
      .addCase(generate5W1H.fulfilled, (state, action) => {
        state.isLoading.analysis = false;
        const { postId } = action.payload;
        state.analyses[postId] = action.payload;
      })
      .addCase(generate5W1H.rejected, (state, action) => {
        state.isLoading.analysis = false;
        state.error = action.payload;
      })
      // Generate Market Comparison
      .addCase(generateComparison.pending, (state) => {
        state.isLoading.comparison = true;
        state.error = null;
      })
      .addCase(generateComparison.fulfilled, (state, action) => {
        state.isLoading.comparison = false;
        const { postId } = action.payload;
        state.comparisons[postId] = action.payload;
      })
      .addCase(generateComparison.rejected, (state, action) => {
        state.isLoading.comparison = false;
        state.error = action.payload;
      })
      // Generate All Analyses
      .addCase(generateAllAnalyses.pending, (state) => {
        state.isLoading.allAnalyses = true;
        state.error = null;
      })
      .addCase(generateAllAnalyses.fulfilled, (state, action) => {
        state.isLoading.allAnalyses = false;
        const { postId } = action.payload;
        state.allAnalyses[postId] = action.payload;
        // Also update individual stores
        state.summaries[postId] = {
          ...action.payload,
          summary: action.payload.summary,
        };
        state.analyses[postId] = {
          ...action.payload,
          analysis: action.payload.analysis,
        };
        state.comparisons[postId] = {
          ...action.payload,
          comparison: action.payload.comparison,
        };
      })
      .addCase(generateAllAnalyses.rejected, (state, action) => {
        state.isLoading.allAnalyses = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, toggleAiFeature, clearAiData, clearPostAiData } =
  aiSlice.actions;
export default aiSlice.reducer;
