import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import NewsAPIService from "../../services/newsApiService";

// Async thunks for news
export const fetchTechHeadlines = createAsyncThunk(
  "news/fetchTechHeadlines",
  async (options = {}, { rejectWithValue }) => {
    try {
      const response = await NewsAPIService.getTechHeadlines(options);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch tech headlines");
    }
  }
);

export const fetchNewsByCategory = createAsyncThunk(
  "news/fetchNewsByCategory",
  async ({ categoryName, options = {} }, { rejectWithValue }) => {
    try {
      const response = await NewsAPIService.getArticlesByCategory(
        categoryName,
        options
      );
      return {
        categoryName,
        ...response,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch news by category"
      );
    }
  }
);

export const searchNews = createAsyncThunk(
  "news/searchNews",
  async ({ keywords, options = {} }, { rejectWithValue }) => {
    try {
      const response = await NewsAPIService.searchArticles(keywords, options);
      return {
        keywords,
        ...response,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to search news");
    }
  }
);

export const fetchNewsCategories = createAsyncThunk(
  "news/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const categories = await NewsAPIService.getAvailableCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch news categories"
      );
    }
  }
);

export const fetchTrendingCategories = createAsyncThunk(
  "news/fetchTrendingCategories",
  async (_, { rejectWithValue }) => {
    try {
      const categories = await NewsAPIService.getTrendingCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch trending categories"
      );
    }
  }
);

const initialState = {
  articles: [],
  categories: [],
  trendingCategories: [],
  articlesByCategory: {},
  searchResults: {},
  selectedCategory: "all",
  isLoading: false,
  categoriesLoading: false,
  searchLoading: false,
  error: null,
  pagination: {
    page: 1,
    count: 20,
    totalResults: 0,
    hasMore: false,
  },
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
    clearArticles: (state) => {
      state.articles = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = {};
    },
    clearArticlesByCategory: (state) => {
      state.articlesByCategory = {};
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tech Headlines
      .addCase(fetchTechHeadlines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTechHeadlines.fulfilled, (state, action) => {
        state.isLoading = false;
        const { articles, totalResults } = action.payload;
        state.articles = articles || [];
        state.pagination = {
          ...state.pagination,
          totalResults: totalResults || 0,
          hasMore: (articles?.length || 0) >= state.pagination.count,
        };
      })
      .addCase(fetchTechHeadlines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Use fallback data in case of error
        const fallback = NewsAPIService.getFallbackNews();
        state.articles = fallback.articles;
      })

      // Fetch News Categories
      .addCase(fetchNewsCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchNewsCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchNewsCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload;
        // Use default categories as fallback
        state.categories = NewsAPIService.getDefaultCategories();
      })

      // Fetch Trending Categories
      .addCase(fetchTrendingCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchTrendingCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.trendingCategories = action.payload;
      })
      .addCase(fetchTrendingCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload;
      })

      // Fetch News by Category
      .addCase(fetchNewsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNewsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const { categoryName, articles, totalResults } = action.payload;
        state.articlesByCategory[categoryName] = {
          articles: articles || [],
          totalResults: totalResults || 0,
          lastFetched: new Date().toISOString(),
        };
      })
      .addCase(fetchNewsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Search News
      .addCase(searchNews.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchNews.fulfilled, (state, action) => {
        state.searchLoading = false;
        const { keywords, articles, totalResults } = action.payload;
        const searchKey = Array.isArray(keywords)
          ? keywords.join(",")
          : keywords;
        state.searchResults[searchKey] = {
          articles: articles || [],
          totalResults: totalResults || 0,
          lastSearched: new Date().toISOString(),
        };
      })
      .addCase(searchNews.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setSelectedCategory,
  clearArticles,
  clearSearchResults,
  clearArticlesByCategory,
  setPagination,
} = newsSlice.actions;

export default newsSlice.reducer;
