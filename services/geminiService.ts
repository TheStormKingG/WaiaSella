
import { GoogleGenAI, Type } from "@google/genai";
import type { Product } from '../types';

const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'The name of the product.',
        },
        stock: {
          type: Type.INTEGER,
          description: 'The quantity or stock count of the item.',
        },
        price: {
          type: Type.NUMBER,
          description: 'The selling price of a single unit of the product.',
        },
        cost: {
          type: Type.NUMBER,
          description: 'The cost of a single unit of the product. Infer if possible, otherwise can be omitted.',
        },
      },
      required: ["name", "stock", "price"],
    },
};

export const extractInventoryFromImage = async (base64Image: string): Promise<Partial<Product>[]> => {
  const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.warn("Gemini API key not set. Image extraction feature is disabled.");
    throw new Error("Gemini API key is required for image extraction. Please set GEMINI_API_KEY in your environment.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: 'Extract product information from this invoice or product list. Identify the product name, quantity, and price. If you can distinguish a cost price from a selling price, use the cost for the "cost" field and selling price for the "price" field.'
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    // Fix: The model may wrap the JSON in a markdown code block. This extracts the JSON.
    let jsonText = response.text.trim();
    const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      jsonText = match[1];
    }
    // FIX: Explicitly type parsedData as unknown to satisfy strict type checking.
    const parsedData: unknown = JSON.parse(jsonText);

    if (Array.isArray(parsedData)) {
        return parsedData as Partial<Product>[];
    }
    
    return [];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to extract inventory from image.");
  }
};