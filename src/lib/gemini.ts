import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
// Note: GEMINI_API_KEY is provided by the environment in AI Studio
export const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

/**
 * Generates a response from Gemini
 */
export async function generateGeminiContent(prompt: string, systemInstruction?: string) {
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
