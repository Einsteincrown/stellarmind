import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic API client initialized with the VITE_ANTHROPIC_API_KEY.
 * Note: dangerouslyAllowBrowser is enabled for this client-side demo.
 */
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || 
               process.env.VITE_ANTHROPIC_API_KEY || 
               import.meta.env.ANTHROPIC_API_KEY || 
               process.env.ANTHROPIC_API_KEY;

export const anthropic = new Anthropic({
  apiKey: apiKey || '',
  dangerouslyAllowBrowser: true,
});

/**
 * Generates content using the Anthropic Claude 3.5 Sonnet model.
 */
export async function generateAnthropicContent(prompt: string, systemPrompt: string) {
  if (!apiKey) {
    throw new Error('API key is missing');
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from the response content
    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    
    throw new Error('Unexpected response format from Anthropic');
  } catch (error) {
    console.error('Anthropic API Error:', error);
    throw error;
  }
}
