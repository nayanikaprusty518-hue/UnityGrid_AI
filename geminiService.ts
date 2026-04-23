import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractSurveyData(base64Image: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Extract humanitarian need data from this handwritten survey. 
  Provide the result in JSON format with the following keys:
  - category: One of "Medical", "Food", "Shelter", "Sanitation", "Security", or "Other".
  - urgency: One of "Low", "Medium", or "High".
  - lat: A numeric latitude (if found, otherwise null).
  - lng: A numeric longitude (if found, otherwise null).
  - description: A brief summary of the need.
  - requesterName: The name on the survey.
  - requesterPhone: The 10-digit phone number on the survey.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          urgency: { type: Type.STRING },
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER },
          description: { type: Type.STRING },
          requesterName: { type: Type.STRING },
          requesterPhone: { type: Type.STRING },
        }
      }
    }
  });

  return JSON.parse(response.text);
}
