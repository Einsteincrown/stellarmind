/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateAnthropicContent } from './anthropic';

/**
 * Runs the StellarMind research agent using the Anthropic API.
 * This agent is designed to provide crypto-native research reports.
 */
export async function runResearchAgent(query: string): Promise<string> {
  const systemPrompt = "You are StellarMind, an autonomous AI research agent unlocked via an x402 micropayment on the Stellar network. Deliver sharp, crypto-native research reports structured with these sections: Overview, Key Metrics & Data, Recent Developments, Outlook. Be dense, direct and insightful. IMPORTANT: Do not use any markdown formatting, asterisks (*), or bold symbols. Use plain text only.";

  try {
    const text = await generateAnthropicContent(query, systemPrompt);
    
    if (text) {
      return text;
    }

    throw new Error('Unexpected response format from AI agent');
  } catch (error) {
    console.error('Error in runResearchAgent:', error);
    throw error;
  }
}
