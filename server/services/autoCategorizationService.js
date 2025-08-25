const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define category keywords for automatic categorization
const CATEGORY_KEYWORDS = {
  "AI & Machine Learning": [
    "artificial intelligence",
    "machine learning",
    "neural network",
    "deep learning",
    "GPT",
    "LLM",
    "ChatGPT",
    "AI model",
    "algorithm",
    "automation",
    "chatbot",
    "generative AI",
    "computer vision",
    "natural language processing",
    "robotics",
  ],
  "Mobile Technology": [
    "smartphone",
    "iPhone",
    "Android",
    "mobile app",
    "iOS",
    "mobile development",
    "tablet",
    "mobile security",
    "app store",
    "mobile gaming",
    "5G",
    "wireless",
  ],
  "Web Development": [
    "JavaScript",
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "frontend",
    "backend",
    "web development",
    "HTML",
    "CSS",
    "API",
    "framework",
    "responsive design",
    "TypeScript",
    "Next.js",
    "GraphQL",
    "REST",
  ],
  Cybersecurity: [
    "security",
    "cybersecurity",
    "encryption",
    "hacking",
    "malware",
    "firewall",
    "data breach",
    "privacy",
    "authentication",
    "vulnerability",
    "ransomware",
    "phishing",
    "zero-day",
    "penetration testing",
  ],
  "Cloud Computing": [
    "cloud",
    "AWS",
    "Azure",
    "Google Cloud",
    "serverless",
    "microservices",
    "containerization",
    "Docker",
    "Kubernetes",
    "cloud native",
    "SaaS",
    "PaaS",
    "infrastructure",
    "scalability",
  ],
  "Blockchain & Crypto": [
    "blockchain",
    "cryptocurrency",
    "Bitcoin",
    "Ethereum",
    "NFT",
    "DeFi",
    "smart contract",
    "crypto",
    "digital currency",
    "mining",
    "Web3",
    "metaverse",
    "decentralized",
    "tokenization",
  ],
  "Hardware & Gadgets": [
    "processor",
    "GPU",
    "CPU",
    "hardware",
    "gadget",
    "laptop",
    "desktop",
    "chip",
    "semiconductor",
    "electronics",
    "device",
    "Intel",
    "AMD",
    "NVIDIA",
    "motherboard",
    "RAM",
    "storage",
  ],
  "Software Development": [
    "software",
    "programming",
    "coding",
    "development",
    "open source",
    "GitHub",
    "version control",
    "testing",
    "debugging",
    "deployment",
    "DevOps",
    "CI/CD",
    "agile",
    "scrum",
  ],
};

class AutoCategorizationService {
  // Keyword-based categorization
  static categorizeContentKeywords(title, description) {
    const content = `${title} ${description}`.toLowerCase();
    const categories = [];

    for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const matchedKeywords = keywords.filter((keyword) =>
        content.includes(keyword.toLowerCase())
      );

      if (matchedKeywords.length > 0) {
        categories.push({
          name: categoryName,
          matchedKeywords,
          confidence: Math.min(matchedKeywords.length / keywords.length, 1),
          source: "keyword",
        });
      }
    }

    // Sort by confidence and return top categories
    return categories.sort((a, b) => b.confidence - a.confidence).slice(0, 3); // Max 3 categories per post
  }

  // AI-enhanced categorization
  static async categorizeContentAI(title, description) {
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

      const response =
        await model.generateContent(`Analyze this tech content and assign it to the most relevant categories. Return only a JSON array of category names.

        Title: "${title}"
        Description: "${description}"
        
        Available Categories:
        - AI & Machine Learning
        - Mobile Technology  
        - Web Development
        - Cybersecurity
        - Cloud Computing
        - Blockchain & Crypto
        - Hardware & Gadgets
        - Software Development
        
        Rules:
        - Return 1-3 most relevant categories
        - Base decision on content keywords and context
        - Return only JSON array like: ["AI & Machine Learning", "Software Development"]
        
        Categories:`);

      try {
        const responseText = response.response.text();
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const aiCategories = JSON.parse(jsonMatch[0]);
          return aiCategories.map((name) => ({
            name,
            confidence: 0.8, // AI confidence
            source: "ai",
          }));
        }
      } catch (parseError) {
        console.warn(
          "Failed to parse AI categorization, using keyword fallback"
        );
      }

      // Fallback to keyword-based
      return this.categorizeContentKeywords(title, description);
    } catch (error) {
      console.error("AI categorization failed:", error);
      // Fallback to keyword-based categorization
      return this.categorizeContentKeywords(title, description);
    }
  }

  // Main categorization method (combines keyword and AI)
  static async categorizeContent(title, description) {
    // Use both keyword and AI categorization, then merge results
    const keywordCategories = this.categorizeContentKeywords(
      title,
      description
    );

    try {
      const aiCategories = await this.categorizeContentAI(title, description);

      // Merge and deduplicate
      const allCategories = [...keywordCategories];

      for (const aiCat of aiCategories) {
        const existing = allCategories.find((cat) => cat.name === aiCat.name);
        if (!existing) {
          allCategories.push(aiCat);
        } else {
          // Boost confidence if both AI and keywords agree
          existing.confidence = Math.min(existing.confidence + 0.2, 1.0);
          existing.source = "hybrid";
        }
      }

      return allCategories
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
    } catch (error) {
      // If AI fails, return keyword-based categories
      return keywordCategories;
    }
  }

  static getAvailableCategories() {
    return Object.keys(CATEGORY_KEYWORDS);
  }

  static getCategoryKeywords() {
    return CATEGORY_KEYWORDS;
  }
}

module.exports = AutoCategorizationService;
