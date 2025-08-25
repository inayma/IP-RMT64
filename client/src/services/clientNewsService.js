class ClientNewsService {
  constructor() {
    // Use environment variable for NewsAPI.ai key
    this.apiKey = import.meta.env.VITE_NEWS_API_KEY;
    this.baseUrl = "https://eventregistry.org/api/v1/article/getArticles";

    if (!this.apiKey) {
      console.error("❌ NewsAPI.ai key not found in environment variables");
      throw new Error("NewsAPI.ai API key is required");
    }
  }

  async getTechHeadlines() {
    try {
      console.log("🔄 Fetching news from NewsAPI.ai...");

      const data = {
        query: {
          $query: {
            $and: [
              {
                conceptUri: "http://en.wikipedia.org/wiki/Technology",
              },
              {
                conceptUri:
                  "http://en.wikipedia.org/wiki/Artificial_intelligence",
              },
              {
                conceptUri: "http://en.wikipedia.org/wiki/Software",
              },
              {
                conceptUri: "http://en.wikipedia.org/wiki/Gadget",
              },
            ],
          },
          $filter: {
            forceMaxDataTimeWindow: "31",
          },
        },
        resultType: "articles",
        articlesSortBy: "date",
        articlesCount: 20,
        apiKey: this.apiKey,
      };

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error(
          `❌ NewsAPI.ai error: ${response.status} ${response.statusText}`
        );
        throw new Error(`NewsAPI.ai error: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ NewsAPI.ai response:", result);

      if (result.error) {
        console.error("❌ NewsAPI.ai returned error:", result.error);
        throw new Error(result.error);
      }

      if (
        !result.articles ||
        !result.articles.results ||
        result.articles.results.length === 0
      ) {
        console.log("⚠️ No articles found, using fallback");
        return this.getFallbackNews();
      }

      const formattedArticles = this.formatNewsApiAiArticles(
        result.articles.results
      );
      console.log("✅ Formatted articles count:", formattedArticles.length);

      return formattedArticles;
    } catch (error) {
      console.error("❌ NewsAPI.ai error:", error);
      console.log("🔄 Falling back to default news");
      return this.getFallbackNews();
    }
  }

  async getArticlesByCategory(category) {
    try {
      console.log(`🔄 Fetching ${category} news from NewsAPI.ai...`);

      // Map categories to Wikipedia concept URIs
      const categoryConceptUris = {
        "AI & Machine Learning": [
          "http://en.wikipedia.org/wiki/Artificial_intelligence",
          "http://en.wikipedia.org/wiki/Machine_learning",
          "http://en.wikipedia.org/wiki/Deep_learning",
        ],
        "Mobile Technology": [
          "http://en.wikipedia.org/wiki/Mobile_technology",
          "http://en.wikipedia.org/wiki/Smartphone",
          "http://en.wikipedia.org/wiki/Android_(operating_system)",
        ],
        "Web Development": [
          "http://en.wikipedia.org/wiki/Web_development",
          "http://en.wikipedia.org/wiki/JavaScript",
          "http://en.wikipedia.org/wiki/Software_engineering",
        ],
        Cybersecurity: [
          "http://en.wikipedia.org/wiki/Computer_security",
          "http://en.wikipedia.org/wiki/Cybersecurity",
          "http://en.wikipedia.org/wiki/Data_security",
        ],
        "Cloud Computing": [
          "http://en.wikipedia.org/wiki/Cloud_computing",
          "http://en.wikipedia.org/wiki/Amazon_Web_Services",
          "http://en.wikipedia.org/wiki/Software_as_a_service",
        ],
        "Blockchain & Crypto": [
          "http://en.wikipedia.org/wiki/Blockchain",
          "http://en.wikipedia.org/wiki/Cryptocurrency",
          "http://en.wikipedia.org/wiki/Bitcoin",
        ],
        "Hardware & Gadgets": [
          "http://en.wikipedia.org/wiki/Computer_hardware",
          "http://en.wikipedia.org/wiki/Gadget",
          "http://en.wikipedia.org/wiki/Electronics",
        ],
        "Software Development": [
          "http://en.wikipedia.org/wiki/Software",
          "http://en.wikipedia.org/wiki/Software_development",
          "http://en.wikipedia.org/wiki/Programming",
        ],
      };

      let conceptUris = categoryConceptUris[category] || [
        "http://en.wikipedia.org/wiki/Technology",
      ];

      const data = {
        query: {
          $query: {
            $and: conceptUris.map((uri) => ({ conceptUri: uri })),
          },
          $filter: {
            forceMaxDataTimeWindow: "31",
          },
        },
        resultType: "articles",
        articlesSortBy: "date",
        articlesCount: 15,
        apiKey: this.apiKey,
      };

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`NewsAPI.ai error: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      return result.articles && result.articles.results
        ? this.formatNewsApiAiArticles(result.articles.results)
        : this.getFallbackNews().filter(
            (article) =>
              category === "All News" || article.category === category
          );
    } catch (error) {
      console.error("❌ Category news API error:", error);
      return this.getFallbackNews().filter(
        (article) => category === "All News" || article.category === category
      );
    }
  }

  formatNewsApiAiArticles(articles) {
    // Track seen URIs to prevent duplicates
    const seenUris = new Set();

    return articles
      .filter((article) => {
        if (!article.title) return false;

        // Check for duplicates using URI
        const uri = article.uri;
        if (uri && seenUris.has(uri)) {
          return false;
        }
        if (uri) seenUris.add(uri);

        return true;
      })
      .map((article, index) => {
        // Extract English content or fallback
        const title =
          typeof article.title === "object" ? article.title.eng : article.title;
        const body =
          typeof article.body === "object" ? article.body.eng : article.body;
        const summary =
          typeof article.summary === "object"
            ? article.summary.eng
            : article.summary;

        const description =
          summary ||
          (body ? body.substring(0, 200) + "..." : "No description available");

        return {
          id: `newsai-${article.uri || `${Date.now()}-${index}`}`,
          title: title || "Untitled",
          description: description,
          url: article.url,
          urlToImage: article.image || null,
          publishedAt:
            article.dateTime || article.date || new Date().toISOString(),
          source:
            article.source?.title || article.source?.uri || "Unknown Source",
          category: this.categorizeArticle(
            (title || "") + " " + (description || "")
          ),
          type: "news",
          author: article.authors?.[0]?.name || null,
          location: article.location || null,
        };
      })
      .slice(0, 10); // Limit to 10 articles to prevent too many duplicates
  }

  categorizeArticle(content) {
    if (!content) return "Latest Tech News";

    const categories = {
      "AI & Machine Learning": [
        "ai",
        "artificial intelligence",
        "machine learning",
        "neural network",
        "deep learning",
        "chatgpt",
        "openai",
        "llm",
        "gpt",
        "claude",
      ],
      "Mobile Technology": [
        "mobile",
        "smartphone",
        "android",
        "ios",
        "iphone",
        "samsung",
        "app store",
        "google play",
        "tablet",
        "ipad",
      ],
      "Web Development": [
        "web",
        "javascript",
        "react",
        "frontend",
        "backend",
        "developer",
        "html",
        "css",
        "node.js",
        "angular",
        "vue",
      ],
      Cybersecurity: [
        "security",
        "hack",
        "breach",
        "privacy",
        "cyber",
        "malware",
        "ransomware",
        "vulnerability",
        "phishing",
        "firewall",
      ],
      "Cloud Computing": [
        "cloud",
        "aws",
        "azure",
        "google cloud",
        "saas",
        "serverless",
        "kubernetes",
        "docker",
        "microservices",
      ],
      "Blockchain & Crypto": [
        "blockchain",
        "crypto",
        "bitcoin",
        "ethereum",
        "nft",
        "defi",
        "web3",
        "smart contract",
        "mining",
      ],
      "Hardware & Gadgets": [
        "hardware",
        "gadget",
        "device",
        "chip",
        "processor",
        "gpu",
        "cpu",
        "semiconductor",
        "electronics",
        "components",
      ],
      "Software Development": [
        "software",
        "app",
        "application",
        "programming",
        "code",
        "github",
        "developer",
        "api",
        "framework",
      ],
    };

    const contentLower = content.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => contentLower.includes(keyword))) {
        return category;
      }
    }

    return "Latest Tech News";
  }

  getFallbackNews() {
    return [
      {
        id: "news-fallback-1",
        title: "AI Revolution: ChatGPT-5 Changes Everything",
        description:
          "OpenAI releases the most advanced AI model yet, capable of multimodal reasoning and autonomous task completion.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        source: "TechCrunch",
        category: "AI & Machine Learning",
        type: "news",
      },
      {
        id: "news-fallback-2",
        title: "Apple Unveils iPhone 16 with Revolutionary Neural Engine",
        description:
          "The latest iPhone features an advanced neural processing unit that enables real-time AI computations.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: "The Verge",
        category: "Mobile Technology",
        type: "news",
      },
      {
        id: "news-fallback-3",
        title: "Meta Launches WebXR Platform for Immersive Web Experiences",
        description:
          "New web standard enables virtual and augmented reality directly in browsers without additional downloads.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: "Wired",
        category: "Web Development",
        type: "news",
      },
      {
        id: "news-fallback-4",
        title: "Zero-Day Vulnerability Discovered in Major Cloud Services",
        description:
          "Security researchers find critical flaw affecting millions of users across multiple cloud platforms.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: "Security Week",
        category: "Cybersecurity",
        type: "news",
      },
      {
        id: "news-fallback-5",
        title: "Tesla Humanoid Robots Begin Commercial Production",
        description:
          "Optimus robots are now being manufactured for deployment in warehouses and manufacturing facilities.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: "IEEE Spectrum",
        category: "Hardware & Gadgets",
        type: "news",
      },
    ];
  }
}

export default new ClientNewsService();
