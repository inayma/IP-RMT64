import { GoogleGenAI } from "@google/genai";

class ClientGeminiService {
  constructor() {
    // Client-side API key should be restricted to specific domains/features
    this.ai = new GoogleGenAI({
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    });
  }

  async generateSummary(postContent, postTitle) {
    try {
      if (!this.ai) {
        throw new Error("Gemini AI not initialized");
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `As a tech expert specializing in AI, gadgets, and technology, please provide a concise summary of this tech article:
        
        Title: "${postTitle}"
        Content: "${postContent}"
        
        Instructions:
        - Summarize the key points in 2-3 sentences
        - Focus on technical aspects, innovations, or product features
        - Use clear, accessible language for tech enthusiasts
        - Include any important specifications, release dates, or market impact mentioned
        
        Summary:`,
      });

      return response.text || "Summary generation completed";
    } catch (error) {
      console.error("Client-side Gemini summary generation failed:", error);
      throw new Error("AI summary temporarily unavailable");
    }
  }

  async analyzeSentiment(text) {
    try {
      if (!this.ai) {
        throw new Error("Gemini AI not initialized");
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Analyze the sentiment of this tech-related text and provide a JSON response:

        Text: "${text}"
        
        Please respond with only a JSON object in this exact format:
        {
          "score": [number between -1 and 1, where -1 is very negative, 0 is neutral, 1 is very positive],
          "label": "[positive/negative/neutral]",
          "confidence": [number between 0 and 1],
          "reasoning": "[brief explanation of the sentiment analysis]"
        }`,
      });

      try {
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn("Failed to parse JSON response, using fallback");
      }

      // Fallback response if JSON parsing fails
      return {
        score: 0,
        label: "neutral",
        confidence: 0.5,
        reasoning: "Unable to determine sentiment",
      };
    } catch (error) {
      console.error("Client-side sentiment analysis failed:", error);
      throw new Error("Sentiment analysis temporarily unavailable");
    }
  }

  async generateTags(content) {
    try {
      if (!this.ai) {
        throw new Error("Gemini AI not initialized");
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Generate relevant tags for this tech content. Return only a JSON array of strings:

        Content: "${content}"
        
        Requirements:
        - Generate 3-6 relevant tags
        - Focus on technology categories, programming languages, companies, or product types
        - Use lowercase, hyphenated format (e.g., "artificial-intelligence", "machine-learning")
        - Return only a JSON array like: ["tag1", "tag2", "tag3"]
        
        Tags:`,
      });

      try {
        const jsonMatch = response.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn("Failed to parse tags JSON, using fallback");
      }

      // Fallback tags if parsing fails
      return ["technology", "ai", "innovation"];
    } catch (error) {
      console.error("Client-side tag generation failed:", error);
      throw new Error("Tag generation temporarily unavailable");
    }
  }

  async enhanceContent(content, enhancement = "improve") {
    try {
      if (!this.ai) {
        throw new Error("Gemini AI not initialized");
      }

      let prompt;
      switch (enhancement) {
        case "improve":
          prompt = `Improve the clarity and readability of this tech content while maintaining its technical accuracy:

          Content: "${content}"
          
          Instructions:
          - Fix grammar and spelling
          - Improve sentence structure
          - Maintain technical terminology
          - Keep the same length and tone`;
          break;
        case "expand":
          prompt = `Expand this tech content with additional relevant details and context:

          Content: "${content}"
          
          Instructions:
          - Add relevant technical details
          - Provide more context where appropriate
          - Maintain the original tone and style
          - Expand by 30-50%`;
          break;
        case "simplify":
          prompt = `Simplify this tech content to make it more accessible to general audiences:

          Content: "${content}"
          
          Instructions:
          - Use simpler language where possible
          - Explain technical terms briefly
          - Maintain accuracy
          - Keep it engaging`;
          break;
        default:
          prompt = `Enhance this tech content: "${content}"`;
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });

      return response.text || content;
    } catch (error) {
      console.error("Content enhancement failed:", error);
      throw new Error("Content enhancement temporarily unavailable");
    }
  }

  // Real-time content suggestions as user types
  async getSuggestions(partialContent) {
    try {
      if (!this.ai || !partialContent || partialContent.length < 20) {
        return [];
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Given this partial tech content, suggest 3 ways to continue or complete it:

        Partial content: "${partialContent}"
        
        Provide suggestions as a JSON array of strings, each suggestion should be 1-2 sentences:
        ["suggestion1", "suggestion2", "suggestion3"]`,
      });

      try {
        const jsonMatch = response.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn("Failed to parse suggestions JSON");
      }

      return [];
    } catch (error) {
      console.error("Content suggestions failed:", error);
      return [];
    }
  }
}

// Create a singleton instance
const clientGeminiService = new ClientGeminiService();
export default clientGeminiService;
