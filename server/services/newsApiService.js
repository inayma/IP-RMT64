const axios = require("axios");
const AutoCategorizationService = require("./autoCategorizationService");

class NewsAPIService {
  constructor() {
    this.apiKey = process.env.NEWSAPI_AI_KEY;
    this.baseUrl = "https://eventregistry.org/api/v1/article/getArticles";
  }

  // Get tech headlines with automatic categorization
  async getTechHeadlines(options = {}) {
    console.log(
      "📰 NewsAPIService: getTechHeadlines called with options:",
      options
    );
    try {
      // If no API key, immediately return fallback news
      if (!this.apiKey) {
        console.log("🔑 No NewsAPI key found, using fallback news");
        return this.getFallbackNews();
      }

      const {
        count = 20,
        page = 1,
        category = null,
        sortBy = "date",
        lang = "eng",
      } = options;

      // Define tech-related keywords for general tech news
      const techKeywords = [
        "technology",
        "tech",
        "artificial intelligence",
        "AI",
        "machine learning",
        "software",
        "hardware",
        "mobile",
        "smartphone",
        "computer",
        "internet",
        "cybersecurity",
        "blockchain",
        "cloud computing",
        "programming",
        "coding",
        "startup",
        "Silicon Valley",
        "innovation",
        "digital",
        "app",
        "platform",
      ];

      // Use category-specific keywords if category is specified
      const categoryKeywords = AutoCategorizationService.getCategoryKeywords();
      const searchKeywords =
        category && categoryKeywords[category]
          ? categoryKeywords[category]
          : techKeywords;

      const requestBody = {
        action: "getArticles",
        keyword: searchKeywords,
        keywordOper: "or",
        keywordLoc: "body,title",
        lang: [lang],
        dataType: ["news"],
        sourceLocationUri: [
          "http://en.wikipedia.org/wiki/United_States",
          "http://en.wikipedia.org/wiki/United_Kingdom",
          "http://en.wikipedia.org/wiki/Canada",
        ],
        ignoreSourceGroupUri: "paywall/paywalled_sources",
        articlesPage: page,
        articlesCount: Math.min(count, 100),
        articlesSortBy: sortBy,
        articlesSortByAsc: false,
        forceMaxDataTimeWindow: 31, // Last month only
        resultType: "articles",
        apiKey: this.apiKey,

        // Include additional data
        includeArticleTitle: true,
        includeArticleBasicInfo: true,
        includeArticleBody: true,
        includeArticleImage: true,
        includeArticleCategories: true,
        includeArticleConcepts: true,
        includeArticleSentiment: true,
        includeSourceTitle: true,
        articleBodyLen: 500, // Limit body length
      };

      const response = await axios.post(this.baseUrl, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      if (
        response.data &&
        response.data.articles &&
        response.data.articles.results
      ) {
        const articles = response.data.articles.results.map((article) => {
          // Auto-categorize each article
          const categories =
            AutoCategorizationService.categorizeContentKeywords(
              article.title || "",
              article.body || ""
            );

          return {
            id: `newsapi-${article.uri}`,
            title: article.title,
            description:
              article.summary || article.body?.substring(0, 200) + "...",
            content: article.body,
            url: article.url,
            urlToImage: article.image,
            publishedAt: article.dateTime,
            source: {
              id: article.source?.uri,
              name: article.source?.title || "Unknown Source",
            },
            author: article.authors?.[0]?.name || null,
            categories: categories,
            sentiment: article.sentiment,
            isNewsApi: true,
            type: "news",
          };
        });

        return {
          status: "ok",
          totalResults: response.data.articles.totalResults,
          articles: articles,
        };
      }

      return {
        status: "ok",
        totalResults: 0,
        articles: [],
      };
    } catch (error) {
      console.error("NewsAPI.ai Error:", error.response?.data || error.message);

      // Return fallback tech articles with categories
      return this.getFallbackNews();
    }
  }

  // Get fallback news when API fails
  getFallbackNews() {
    console.log("🔄 Returning fallback news articles");
    const fallbackArticles = [
      {
        id: "fallback-1",
        title: "AI Technology Advances Continue to Shape Industry",
        description:
          "Latest developments in artificial intelligence and machine learning are transforming various sectors with new innovations in neural networks and deep learning algorithms.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        source: { name: "Tech Fallback" },
        categories: [
          {
            name: "AI & Machine Learning",
            confidence: 1.0,
            source: "fallback",
          },
        ],
        isNewsApi: true,
        type: "news",
      },
      {
        id: "fallback-2",
        title: "Mobile Technology Innovations Drive Market Growth",
        description:
          "Smartphone manufacturers continue to push boundaries with new features and capabilities, including advanced camera systems and 5G connectivity improvements.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "Tech Fallback" },
        categories: [
          { name: "Mobile Technology", confidence: 1.0, source: "fallback" },
        ],
        isNewsApi: true,
        type: "news",
      },
      {
        id: "fallback-3",
        title: "Cybersecurity Threats Require Enhanced Protection Measures",
        description:
          "Security experts warn of increasing cyber attacks and recommend implementing stronger authentication and encryption protocols to protect sensitive data.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: "Tech Fallback" },
        categories: [
          { name: "Cybersecurity", confidence: 1.0, source: "fallback" },
        ],
        isNewsApi: true,
        type: "news",
      },
    ];

    return {
      status: "fallback",
      totalResults: fallbackArticles.length,
      articles: fallbackArticles,
    };
  }

  // Get articles by specific category
  async getArticlesByCategory(categoryName, options = {}) {
    return this.getTechHeadlines({
      ...options,
      category: categoryName,
    });
  }

  // Search articles with custom keywords
  async searchArticles(keywords, options = {}) {
    try {
      // If no API key, return fallback news
      if (!this.apiKey) {
        console.log("No NewsAPI key found, using fallback news for search");
        return this.getFallbackNews();
      }

      const { count = 20, page = 1, sortBy = "date", lang = "eng" } = options;

      const searchKeywords = Array.isArray(keywords) ? keywords : [keywords];

      const requestBody = {
        action: "getArticles",
        keyword: searchKeywords,
        keywordOper: "or",
        keywordLoc: "body,title",
        lang: [lang],
        dataType: ["news"],
        articlesPage: page,
        articlesCount: Math.min(count, 100),
        articlesSortBy: sortBy,
        articlesSortByAsc: false,
        forceMaxDataTimeWindow: 31,
        resultType: "articles",
        apiKey: this.apiKey,

        includeArticleTitle: true,
        includeArticleBasicInfo: true,
        includeArticleBody: true,
        includeArticleImage: true,
        includeArticleCategories: true,
        includeArticleConcepts: true,
        articleBodyLen: 500,
      };

      const response = await axios.post(this.baseUrl, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      if (
        response.data &&
        response.data.articles &&
        response.data.articles.results
      ) {
        const articles = response.data.articles.results.map((article) => {
          const categories =
            AutoCategorizationService.categorizeContentKeywords(
              article.title || "",
              article.body || ""
            );

          return {
            id: `search-${article.uri}`,
            title: article.title,
            description:
              article.summary || article.body?.substring(0, 200) + "...",
            content: article.body,
            url: article.url,
            urlToImage: article.image,
            publishedAt: article.dateTime,
            source: {
              id: article.source?.uri,
              name: article.source?.title || "Unknown Source",
            },
            categories: categories,
            isNewsApi: true,
            type: "news",
          };
        });

        return {
          status: "ok",
          totalResults: response.data.articles.totalResults,
          articles: articles,
        };
      }

      return {
        status: "ok",
        totalResults: 0,
        articles: [],
      };
    } catch (error) {
      console.error(
        "NewsAPI.ai Search Error:",
        error.response?.data || error.message
      );
      throw new Error("Search temporarily unavailable");
    }
  }

  // Get available categories
  getAvailableCategories() {
    return AutoCategorizationService.getAvailableCategories().map((name) => ({
      name,
      keywordCount:
        AutoCategorizationService.getCategoryKeywords()[name].length,
    }));
  }
}

module.exports = new NewsAPIService();
