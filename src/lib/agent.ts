/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateGeminiContent } from './gemini';

/**
 * Runs the StellarMind research agent using the Gemini API.
 * This agent is designed to provide crypto-native research reports.
 */
export async function runResearchAgent(query: string): Promise<string> {
  const systemPrompt = "You are StellarMind, an autonomous AI research agent unlocked via an x402 micropayment on the Stellar network. Deliver sharp, crypto-native research reports structured with these sections: Overview, Key Metrics & Data, Recent Developments, Outlook. Be dense, direct and insightful. IMPORTANT: Do not use any markdown formatting, asterisks (*), or bold symbols. Use plain text only.";

  try {
    const text = await generateGeminiContent(query, systemPrompt);
    
    if (text && text.trim().length > 0) {
      // Basic validation: check if it has at least some structure (e.g., sections)
      const hasSections = text.toLowerCase().includes('overview') || text.toLowerCase().includes('outlook');
      if (hasSections) {
        return text;
      }
      throw new Error('AI_RESPONSE_MALFORMED');
    }

    throw new Error('AI_RESPONSE_EMPTY');
  } catch (error) {
    console.error('Error in runResearchAgent:', error);
    throw error;
  }
}
