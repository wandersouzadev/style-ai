
import { GoogleGenAI, Modality } from "@google/genai";
import { ImageData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseGeminiResponse = (response: any): { image: string; text: string } => {
  let image = '';
  let text = 'Sorry, I could not generate a text response.';

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      image = part.inlineData.data;
    } else if (part.text) {
      text = part.text;
    }
  }

  if (!image) {
    throw new Error('No image was generated. The model may have refused the request.');
  }

  return { image, text };
};

export const generateStyledImage = async (
  originalImage: ImageData,
  style: string
): Promise<{ image: string; text: string }> => {
  try {
    const prompt = `Reimagine this room in a ${style} style. Focus on changing furniture, color palette, and decor to match the style. Keep the original room layout and architectural features like windows and doors. Provide a short, friendly message about the new design.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: originalImage.base64, mimeType: originalImage.mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    return parseGeminiResponse(response);
  } catch (error) {
    console.error('Error generating styled image:', error);
    throw new Error('Failed to generate image. Please try another style or image.');
  }
};

export const refineImage = async (
  currentImage: ImageData,
  userPrompt: string
): Promise<{ image: string; text: string }> => {
  try {
    const systemInstruction = `You are an AI interior design assistant. The user provides an image of a room design you previously generated and a text prompt to modify it. Your task is to generate the modified image. In addition to the image, provide a brief, friendly text response that acknowledges the change and includes three markdown-formatted shoppable links for items that match the new design. For example: [Modern Oak Coffee Table](https://example.com/shop/item1). The user's request is: "${userPrompt}"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: currentImage.base64, mimeType: currentImage.mimeType } },
          { text: systemInstruction },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    return parseGeminiResponse(response);
  } catch (error) {
    console.error('Error refining image:', error);
    throw new Error('Failed to refine image. Please try a different prompt.');
  }
};
