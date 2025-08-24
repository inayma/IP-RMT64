const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini API with the new package
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

class GeminiService {
  static async generateSummary(postContent, postTitle) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
        As a tech expert specializing in AI, gadgets, and technology, please provide a concise summary of this tech article:
        
        Title: "${postTitle}"
        Content: "${postContent}"
        
        Instructions:
        - Summarize the key points in 2-3 sentences
        - Focus on technical aspects, innovations, or product features
        - Use clear, accessible language for tech enthusiasts
        - Include any important specifications, release dates, or market impact mentioned
        
        Summary:
      `,
      });

      return response.text || "AI summary temporarily unavailable.";
    } catch (error) {
      console.error("Gemini summary generation failed:", error);
      return "AI summary temporarily unavailable.";
    }
  }

  static async generate5W1H(postContent, postTitle) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
        As a tech journalist and analyst, analyze this technology article using the 5W1H framework:
        
        Title: "${postTitle}"
        Content: "${postContent}"
        
        Please provide detailed answers in this format:
        
        **WHO:** Who are the key players, companies, developers, or stakeholders involved?
        
        **WHAT:** What is the technology, product, or innovation being discussed? What are its key features?
        
        **WHERE:** Where is this technology being developed, launched, or used? What markets or regions?
        
        **WHEN:** When was this announced, released, or when will it be available? Any important timeline?
        
        **WHY:** Why is this significant? What problem does it solve? Why should people care?
        
        **HOW:** How does this technology work? How is it different from existing solutions?
        
        Focus on providing informative, fact-based analysis that helps readers understand the broader context and implications.
      `,
      });

      return response.text || "5W1H analysis temporarily unavailable.";
    } catch (error) {
      console.error("Gemini 5W1H generation failed:", error);
      return "5W1H analysis temporarily unavailable.";
    }
  }

  static async generateComparison(postContent, postTitle) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
        As a market analyst and tech expert, provide a competitive analysis for the technology/product mentioned in this article:
        
        Title: "${postTitle}"
        Content: "${postContent}"
        
        Please provide:
        
        **MARKET POSITION:**
        - Current market ranking and position
        - Market share estimates if available
        
        **KEY COMPETITORS:**
        - Main competing products/technologies
        - How they compare in features, pricing, performance
        
        **STRENGTHS:**
        - What advantages this product/technology has
        - Unique selling points
        
        **WEAKNESSES:**
        - Areas where competitors might be stronger
        - Potential limitations
        
        **INDUSTRY STANDING:**
        - How this fits in the broader industry landscape
        - Innovation level compared to industry standards
        - Future outlook and potential
        
        **RATING:** Provide an overall competitive rating (1-10) with brief justification.
        
        Base your analysis on factual information and industry knowledge. If specific data isn't available, make reasonable estimates based on typical industry patterns.
      `,
      });

      return response.text || "Competitive analysis temporarily unavailable.";
    } catch (error) {
      console.error("Gemini comparison generation failed:", error);
      return "Competitive analysis temporarily unavailable.";
    }
  }
}

module.exports = GeminiService;
