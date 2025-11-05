import {
  ApiError,
  EditMode,
  GoogleGenAI,
  RawReferenceImage,
  SubjectReferenceImage,
  SubjectReferenceType,
} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_ID = 'imagen-3.0-capability-001';

let client: GoogleGenAI | null = null;

interface EnhancementInput {
  base64Image: string;
  mimeType: string;
  itemName: string;
  category: string;
}

const nanobananaPrompt = ({ itemName, category }: Pick<EnhancementInput, 'itemName' | 'category'>) => `You are Nano Banana, an AI product-photography finisher.
Your job is to take the provided reference photo and return a single, high-definition, photorealistic product packshot.

Product name: ${itemName}
Category: ${category}

Cleanup goals:
- Preserve the real product geometry, brand marks, labels, and proportions.
- Remove noise, blur, and low-light artifacts while keeping the authentic textures.
- Produce a crisp lighting setup with balanced highlights and shadows that feel studio-grade.
- Use a neutral, commerce-ready background (pure white or softly graded light gray) with soft shadowing below the item.
- Avoid stylizing or hallucinating accessories that are not present in the original.

Return only the improved image.`;

function assertClient(): GoogleGenAI {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Set it in your environment to enable Nano Banana cleanup.');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return client;
}

export async function enhanceProductImageWithNanoBanana({
  base64Image,
  mimeType,
  itemName,
  category,
}: EnhancementInput): Promise<string> {
  try {
    const ai = assertClient();

    const rawReference = new RawReferenceImage();
    rawReference.referenceImage = {
      imageBytes: base64Image,
      mimeType,
    };

    const subjectReference = new SubjectReferenceImage();
    subjectReference.referenceImage = {
      imageBytes: base64Image,
      mimeType,
    };
    subjectReference.config = {
      subjectType: SubjectReferenceType.SUBJECT_TYPE_PRODUCT,
      subjectDescription: `${itemName} product photo needing cleanup`,
    };

    const response = await ai.models.editImage({
      model: MODEL_ID,
      prompt: nanobananaPrompt({ itemName, category }),
      referenceImages: [rawReference, subjectReference],
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        editMode: EditMode.EDIT_MODE_PRODUCT_IMAGE,
        addWatermark: false,
        guidanceScale: 12,
        baseSteps: 30,
      },
    });

    const cleanedImageBytes = response.generatedImages?.[0]?.image?.imageBytes;

    if (!cleanedImageBytes) {
      throw new Error('Nano Banana did not return an image.');
    }

    return `data:image/png;base64,${cleanedImageBytes}`;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Nano Banana image enhancement failed:', error.status, error.message);
    } else {
      console.error('Nano Banana image enhancement failed:', error);
    }
    throw error;
  }
}

