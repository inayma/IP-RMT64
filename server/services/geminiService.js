const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

class GeminiService {
  static async generateSummary(postContent, postTitle) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
        You're a tech-savvy Gen Z content creator who breaks down tech news in a natural, conversational way. Analyze this tech article and give me the breakdown:
        
        Title: "${postTitle}"
        Content: "${postContent}"
        
        Start with a brief, catchy opening sentence that captures the main point. Then give me a detailed analysis that sounds like you're explaining this to your friends. Use bullet points for the important stuff, but keep it natural and conversational. Don't use formal markdown formatting like ** or ## - just write naturally.
        
        Structure it like this:

        [Start with one compelling sentence about what's happening]

        The Main Story
        What's actually happening here and why should anyone care?
        
        Key Players
        • Who's behind this tech?
        • Any big companies or people involved?
        • Anyone getting called out or praised?
        
        The Tech Breakdown  
        • What exactly does this thing do?
        • How is it different from what we already have?
        • Any cool features worth mentioning?
        • Is this actually innovative or just hype?
        
        Market Reality Check
        • How does this stack up against the competition?
        • Is this company winning or struggling?
        • What are people saying about the pricing?
        • Any red flags or major wins?
        
        Why This Matters
        • What problems is this solving if any?
        • Who's this actually for?
        • Is this going to change anything or just more tech noise?
        
        Bottom Line
        Give me your honest take - is this worth paying attention to or just another tech announcement? Rate it out of 10 and tell me why.
        
        Keep it real, keep it natural, and don't be afraid to call out overhype when you see it. Skip any sections where you don't have enough info.
        `,
      });

      return response.text || "AI analysis temporarily unavailable.";
    } catch (error) {
      console.error("Gemini analysis generation failed:", error);
      return "AI analysis temporarily unavailable.";
    }
  }
}

module.exports = GeminiService;
