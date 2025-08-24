const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = "https://api.newsapi.ai";

class NewsAPIService {
  // Get tech/gadget/AI focused headlines
  static async getTechHeadlines(country = "eng", pageSize = 20) {
    try {
      const requestData = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": NEWS_API_KEY,
        },
        body: JSON.stringify({
          query:
            '(technology OR gadgets OR "artificial intelligence" OR AI OR tech OR smartphone OR laptop OR software)',
          resultType: "articles",
          articlesSortBy: "date",
          articlesCount: pageSize,
          articlesSortByAsc: false,
          lang: country,
          dataType: ["news", "blog"],
        }),
      };

      const response = await fetch(
        `${NEWS_API_BASE_URL}/article/getArticles`,
        requestData
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.articles && data.articles.results) {
        // Transform the response to match the expected format
        return data.articles.results.map((article) => ({
          title: article.title,
          description: article.body || article.summary || "No description available",
          url: article.url,
          urlToImage: article.image,
          publishedAt: article.dateTime,
          source: { name: article.source?.title || "NewsAPI.ai" },
          content: article.body || article.summary || ""
        }));
      } else {
        throw new Error("Invalid response format from NewsAPI.ai");
      }
    } catch (error) {
      console.error("Error fetching tech headlines:", error);
      throw error;
    }
  }

  // Search for news articles
  static async searchNews(query, sortBy = "date", pageSize = 20) {
    try {
      const requestData = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": NEWS_API_KEY,
        },
        body: JSON.stringify({
          query: query,
          resultType: "articles",
          articlesSortBy: sortBy,
          articlesCount: pageSize,
          articlesSortByAsc: false,
          lang: "eng",
          dataType: ["news", "blog"],
        }),
      };

      const response = await fetch(
        `${NEWS_API_BASE_URL}/article/getArticles`,
        requestData
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }

      const data = await response.json();
      return data.articles;
    } catch (error) {
      console.error("Error searching news:", error);
      throw error;
    }
  }

  // Get tech news from specific sources
  static async getTechNewsBySources(pageSize = 20) {
    try {
      const requestData = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": NEWS_API_KEY,
        },
        body: JSON.stringify({
          query:
            'source:"techcrunch" OR source:"wired" OR source:"ars technica"',
          resultType: "articles",
          articlesSortBy: "date",
          articlesCount: pageSize,
          articlesSortByAsc: false,
          lang: "eng",
          dataType: ["news", "blog"],
        }),
      };

      const response = await fetch(
        `${NEWS_API_BASE_URL}/article/getArticles`,
        requestData
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }

      const data = await response.json();
      return data.articles;
    } catch (error) {
      console.error("Error fetching news by sources:", error);
      throw error;
    }
  }

  // Convert NewsAPI article to WarTek post format with NewsAPI as author
  static convertToWarTekPost(article) {
    return {
      title: article.title,
      description: article.description || article.content || "",
      url: article.url,
      imageUrl: article.urlToImage,
      source: article.source.name,
      publishedAt: article.publishedAt,
      author: "NewsAPI", // Set NewsAPI as the author
    };
  }

  // Get top 5 trending tech categories with their popularity scores
  static async getTrendingCategories() {
    const categories = [
      {
        name: "Artificial Intelligence",
        query: "artificial intelligence OR AI OR machine learning OR ChatGPT",
        icon: "🤖",
      },
      {
        name: "Smartphones & Gadgets",
        query: "smartphone OR iPhone OR Android OR gadgets OR tablet",
        icon: "📱",
      },
      {
        name: "Crypto & Blockchain",
        query: "cryptocurrency OR bitcoin OR blockchain OR web3 OR NFT",
        icon: "₿",
      },
      {
        name: "Electric Vehicles",
        query: "Tesla OR electric vehicle OR EV OR autonomous driving",
        icon: "🚗",
      },
      {
        name: "Gaming & VR",
        query: "gaming OR VR OR virtual reality OR AR OR metaverse",
        icon: "🎮",
      },
      {
        name: "Cybersecurity",
        query: "cybersecurity OR hacking OR data breach OR privacy",
        icon: "🔒",
      },
      {
        name: "Cloud & Software",
        query: "cloud computing OR software OR SaaS OR Microsoft OR Google",
        icon: "☁️",
      },
    ];

    try {
      // Test each category to get article counts (popularity indicator)
      const categoryPopularity = await Promise.all(
        categories.map(async (category) => {
          try {
            const requestData = {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Api-Key": NEWS_API_KEY,
              },
              body: JSON.stringify({
                query: category.query,
                resultType: "articles",
                articlesSortBy: "date",
                articlesCount: 1,
                articlesSortByAsc: false,
                lang: "eng",
                dataType: ["news", "blog"],
              }),
            };

            const response = await fetch(
              `${NEWS_API_BASE_URL}/article/getArticles`,
              requestData
            );
            const data = await response.json();
            return {
              ...category,
              popularity: data.articles?.results?.length || 0,
            };
          } catch (error) {
            return {
              ...category,
              popularity: 0,
            };
          }
        })
      );

      // Sort by popularity and return top 5
      return categoryPopularity
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5);
    } catch (error) {
      console.error("Error fetching trending categories:", error);
      // Return default categories if API fails
      return categories.slice(0, 5).map((cat) => ({ ...cat, popularity: 0 }));
    }
  }

  // Get news by category
  static async getNewsByCategory(category, pageSize = 20) {
    try {
      const requestData = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": NEWS_API_KEY,
        },
        body: JSON.stringify({
          query: category.query,
          resultType: "articles",
          articlesSortBy: "date",
          articlesCount: pageSize,
          articlesSortByAsc: false,
          lang: "eng",
          dataType: ["news", "blog"],
        }),
      };

      const response = await fetch(
        `${NEWS_API_BASE_URL}/article/getArticles`,
        requestData
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }

      const data = await response.json();
      return data.articles;
    } catch (error) {
      console.error("Error fetching news by category:", error);
      throw error;
    }
  }

  // Get trending tech news using concept-based search
  static async getTrendingTechNews() {
    try {
      const requestData = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": NEWS_API_KEY,
        },
        body: JSON.stringify({
          query:
            'artificial intelligence OR machine learning OR ChatGPT OR OpenAI OR blockchain OR cryptocurrency OR web3 OR metaverse OR quantum computing OR 5G OR IoT OR cybersecurity OR smartphone OR iPhone OR Android OR laptop OR gaming OR VR OR AR OR Tesla OR "electric vehicle" OR "autonomous driving" OR robotics OR "tech startup"',
          resultType: "articles",
          articlesSortBy: "socialScore",
          articlesCount: 10,
          articlesSortByAsc: false,
          lang: "eng",
          dataType: ["news", "blog"],
        }),
      };

      const response = await fetch(
        `${NEWS_API_BASE_URL}/article/getArticles`,
        requestData
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }

      const data = await response.json();
      return data.articles.results.map((article) => ({
        title: article.title,
        description: article.body,
        url: article.url,
        urlToImage: article.image,
        publishedAt: article.dateTime,
        source: { name: article.source.title },
      }));
    } catch (error) {
      console.error("Error fetching trending tech news:", error);
      throw error;
    }
  }
}

export default NewsAPIService;
