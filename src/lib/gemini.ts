import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
// Note: GEMINI_API_KEY is provided by the environment in AI Studio
const apiKey = process.env.GEMINI_API_KEY || 
               import.meta.env.VITE_GEMINI_API_KEY || 
               process.env.VITE_GEMINI_API_KEY ||
               '';

export const ai = new GoogleGenAI({ 
  apiKey: apiKey
});

/**
 * Generates a response from Gemini
 */
export async function generateGeminiContent(prompt: string, systemInstruction?: string) {
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please ensure GEMINI_API_KEY is set in your environment secrets.');
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
