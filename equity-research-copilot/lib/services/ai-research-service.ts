/**
 * AI-powered research service using MegaLLM (Claude) API
 * Generates high-quality, detailed research analysis for any query
 */

interface AIResearchParams {
  query: string;
  ticker: string;
  deep?: boolean;
}

interface AIResearchResponse {
  headline: string;
  thesis: string;
  keyMetrics: {
    priceTarget?: number;
    upside?: number;
    conviction: "High" | "Medium" | "Low";
    convictionScore: number;
  };
  risks: string[];
  catalysts: string[];
  sources: string[];
}

class AIResearchService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    // Use MegaLLM API configuration
    this.apiKey = process.env.ANTHROPIC_API_KEY || "sk-mega-d7d56093e907560053448be2043c4e53b4a86aede767c3aad2ea536c9";
    this.baseUrl = process.env.ANTHROPIC_BASE_URL || "https://ai.megallm.io";
    this.model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
  }

  /**
   * Generate comprehensive research analysis using Claude AI
   */
  async generateResearch(params: AIResearchParams): Promise<AIResearchResponse> {
    const { query, ticker, deep = false } = params;

    const prompt = this.buildResearchPrompt(query, ticker, deep);

    try {
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 4096,
          temperature: 0.7,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error("AI API error:", await response.text());
        throw new Error(`AI API returned ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0].text;

      // Parse the structured response
      return this.parseAIResponse(content);
    } catch (error) {
      console.error("Error generating AI research:", error);
      // Return fallback data if API fails
      return this.getFallbackResponse(ticker, query);
    }
  }

  /**
   * Build a comprehensive research prompt for Claude
   */
  private buildResearchPrompt(query: string, ticker: string, deep: boolean): string {
    return `You are an institutional equity research analyst. Generate a ${deep ? "deep" : "standard"} research analysis for the following question.

**Question**: ${query}
**Ticker**: ${ticker}
**Analysis Depth**: ${deep ? "Deep Research (comprehensive, multi-factor analysis)" : "Standard (quick insights)"}

Please provide your analysis in the following JSON format:

{
  "headline": "A concise, professional headline summarizing the key takeaway (50-80 chars)",
  "thesis": "A detailed thesis statement explaining your view. For 1M horizon questions, explicitly state if the outlook is positive/negative and cite the expected return. Include specific numbers, catalysts, and risks. (200-400 words)",
  "keyMetrics": {
    "priceTarget": <number or null>,
    "upside": <percentage as decimal or null>,
    "conviction": "High" | "Medium" | "Low",
    "convictionScore": <number 0-100>
  },
  "risks": [
    "Risk factor 1 with specific details",
    "Risk factor 2 with specific details",
    "Risk factor 3 with specific details"
  ],
  "catalysts": [
    "Positive catalyst 1 with timeline",
    "Positive catalyst 2 with timeline",
    "Positive catalyst 3 with timeline"
  ],
  "sources": [
    "Bloomberg: Recent earnings report",
    "SEC Filings: 10-K FY2024",
    "Company IR: Management guidance"
  ]
}

**Important Guidelines**:
1. Be specific and quantitative - use numbers, percentages, dates
2. If the question asks about direction (up/down), clearly state your view
3. Match the thesis tone to the data - if metrics show negative, thesis should reflect that
4. Include realistic price targets based on valuation
5. Cite plausible sources (don't invent URLs, just source names)
6. Keep conviction scores realistic (55-85 range typically)
7. For Indian stocks (.NS), use ₹ for prices
8. For US stocks, use $ for prices

Generate ONLY the JSON response, no additional text.`;
  }

  /**
   * Parse Claude's JSON response
   */
  private parseAIResponse(content: string): AIResearchResponse {
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as AIResearchResponse;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      throw error;
    }
  }

  /**
   * Fallback response if AI API fails
   */
  private getFallbackResponse(ticker: string, query: string): AIResearchResponse {
    return {
      headline: `Analysis for ${ticker}: Balanced outlook with identifiable catalysts`,
      thesis: `Based on current market conditions and the query "${query}", we observe a balanced risk-reward profile for ${ticker}. Key factors include fundamental strength, market positioning, and macro headwinds. Further analysis recommended.`,
      keyMetrics: {
        priceTarget: undefined,
        upside: undefined,
        conviction: "Medium",
        convictionScore: 60,
      },
      risks: [
        "Market volatility and macro uncertainty",
        "Sector-specific headwinds",
        "Execution risk on growth initiatives",
      ],
      catalysts: [
        "Strong fundamentals and earnings visibility",
        "Favorable industry tailwinds",
        "Management track record",
      ],
      sources: [
        "Bloomberg: Market data",
        "Company filings: Latest earnings",
        "Industry reports: Sector analysis",
      ],
    };
  }

  /**
   * Quick health check for API connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 10,
          messages: [
            {
              role: "user",
              content: "Hello",
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("AI service health check failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const aiResearchService = new AIResearchService();
