import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// For future implementation with NewsAPI or other news sources
export const fetchTechNews = createAsyncThunk(
  "news/fetchTechNews",
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Integrate with actual news API
      // For now, return mock data
      const mockNews = [
        {
          id: 1,
          title: "Latest AI Breakthrough in Machine Learning",
          description:
            "Revolutionary advances in neural network architectures.",
          url: "https://example.com/ai-breakthrough",
          source: "TechNews",
          publishedAt: new Date().toISOString(),
          category: "AI",
        },
        {
          id: 2,
          title: "New Smartphone Technology Announced",
          description: "Next-generation mobile processors and displays.",
          url: "https://example.com/smartphone-tech",
          source: "GadgetReview",
          publishedAt: new Date().toISOString(),
          category: "Gadgets",
        },
      ];

      return mockNews;
    } catch (error) {
      return rejectWithValue("Failed to fetch tech news");
    }
  }
);

const initialState = {
  articles: [],
  isLoading: false,
  error: null,
  categories: ["AI", "Gadgets", "Software", "Hardware", "Startups"],
  selectedCategory: "all",
};

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearNews: (state) => {
      state.articles = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTechNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.articles = action.payload;
      })
      .addCase(fetchTechNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedCategory, clearNews } = newsSlice.actions;
export default newsSlice.reducer;
