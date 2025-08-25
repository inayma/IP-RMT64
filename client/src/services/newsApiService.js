import { instance } from "../libs/http";

const NewsAPIService = {
  // Get tech headlines from server
  async getTechHeadlines(options = {}) {
    console.log(
      "📱 CLIENT NewsAPIService: getTechHeadlines called with options:",
      options
    );
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append("count", options.limit);
      if (options.page) params.append("page", options.page);

      console.log("📱 Making request to:", `/news/headlines?${params}`);
      const response = await instance.get(`/news/headlines?${params}`);
      console.log("📱 Response received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching tech headlines:", error);
      return this.getFallbackNews();
    }
  },

  // Get articles by specific category
  async getArticlesByCategory(categoryName, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append("count", options.limit);
      if (options.page) params.append("page", options.page);

      const response = await instance.get(
        `/news/category/${categoryName}?${params}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching articles for category ${categoryName}:`,
        error
      );
      throw error;
    }
  },

  // Search articles by keywords
  async searchArticles(keywords, options = {}) {
    try {
      const params = new URLSearchParams();
      params.append(
        "q",
        Array.isArray(keywords) ? keywords.join(",") : keywords
      );
      if (options.limit) params.append("count", options.limit);
      if (options.page) params.append("page", options.page);

      const response = await instance.get(`/news/search?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error searching articles:", error);
      throw error;
    }
  },

  // Get available categories
  async getAvailableCategories() {
    try {
      const response = await instance.get("/news/categories");
      return response.data.categories || this.getDefaultCategories();
    } catch (error) {
      console.error("Error fetching available categories:", error);
      return this.getDefaultCategories();
    }
  },

  // Get trending categories with popularity data
  async getTrendingCategories() {
    try {
      // For now, return static trending categories
      // In the future, this could be calculated based on server analytics
      return [
        { name: "AI & Machine Learning", icon: "🤖", popularity: 245 },
        { name: "Mobile Technology", icon: "📱", popularity: 189 },
        { name: "Web Development", icon: "🌐", popularity: 156 },
        { name: "Cybersecurity", icon: "🔒", popularity: 134 },
        { name: "Cloud Computing", icon: "☁️", popularity: 98 },
        { name: "Blockchain & Crypto", icon: "⛓️", popularity: 87 },
        { name: "Hardware & Gadgets", icon: "⚡", popularity: 76 },
        { name: "Software Development", icon: "💻", popularity: 65 },
      ];
    } catch (error) {
      console.error("Error fetching trending categories:", error);
      return this.getDefaultCategories().map((cat) => ({
        ...cat,
        popularity: 0,
      }));
    }
  },

  // Get default categories (fallback)
  getDefaultCategories() {
    return [
      { name: "AI & Machine Learning", icon: "🤖" },
      { name: "Mobile Technology", icon: "📱" },
      { name: "Web Development", icon: "🌐" },
      { name: "Cybersecurity", icon: "🔒" },
      { name: "Cloud Computing", icon: "☁️" },
      { name: "Blockchain & Crypto", icon: "⛓️" },
      { name: "Hardware & Gadgets", icon: "⚡" },
      { name: "Software Development", icon: "💻" },
    ];
  },

  // Get fallback news data when API fails
  getFallbackNews() {
    return {
      articles: [
        {
          id: "fallback-1",
          title: "Tech News Temporarily Unavailable",
          description:
            "We're having trouble loading the latest tech news. Please try again later.",
          content:
            "Service temporarily unavailable. Our team is working to restore normal functionality.",
          url: "#",
          imageUrl: null,
          author: "System",
          source: "Local",
          publishedAt: new Date().toISOString(),
          upvotes: 0,
          downvotes: 0,
          commentsCount: 0,
          category: "System",
        },
      ],
      totalResults: 1,
    };
  },
};

export default NewsAPIService;
