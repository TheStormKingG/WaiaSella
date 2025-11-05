export class NanoBananaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NanoBananaError';
  }
}

const MISSING_CONFIG_WARNING =
  'Nano Banana configuration missing. Falling back to the original image. Ensure VITE_NANO_BANANA_ENDPOINT and VITE_NANO_BANANA_API_KEY are set to enable AI enhancement.';

export interface EnhanceProductImageOptions {
  imageFile: File;
  itemName: string;
  category: string;
  quality?: 'standard' | 'hd';
  promptOverride?: string;
}

export interface EnhancedImageResult {
  imageUrl: string;
  source: 'enhanced' | 'original';
  inferenceId?: string;
  rawResponse?: unknown;
}

const QUALITY_TO_PROMPT: Record<'standard' | 'hd', string> = {
  standard:
    'Clean up this product photo. Return a sharp, retail-ready product shot on a neutral background with accurate colors.',
  hd:
    'Transform this into a high-definition, photorealistic ecommerce hero image with perfect lighting, crisp focus, and a clean neutral backdrop.',
};

const stripBase64Prefix = (base64: string) => base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

const ensureDataUrl = (base64: string, fallbackMime = 'image/png') => {
  if (base64.startsWith('data:image/')) return base64;
  return `data:${fallbackMime};base64,${base64}`;
};

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unable to convert file to Base64 string.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

export async function enhanceProductImage({
  imageFile,
  itemName,
  category,
  quality = 'hd',
  promptOverride,
}: EnhanceProductImageOptions): Promise<EnhancedImageResult> {
  const imageBase64 = await fileToBase64(imageFile);

  const endpoint = (import.meta.env.VITE_NANO_BANANA_ENDPOINT ?? '').trim();
  const apiKey = (import.meta.env.VITE_NANO_BANANA_API_KEY ?? '').trim();

  if (!endpoint || !apiKey) {
    console.warn(MISSING_CONFIG_WARNING);
    return {
      imageUrl: imageBase64,
      source: 'original',
    };
  }

  const prompt =
    promptOverride ??
    `${QUALITY_TO_PROMPT[quality]}
Product name: ${itemName}
Category: ${category}
Ensure the final image feels photorealistic and ready for ecommerce listings.`;

  const payload = {
    image: stripBase64Prefix(imageBase64),
    prompt,
    metadata: {
      itemName,
      category,
      quality,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new NanoBananaError(
      `Nano Banana enhancement failed (${response.status} ${response.statusText}): ${errorText}`
    );
  }

  const data = await response.json();

  const enhancedImageBase64 = (data?.enhancedImageBase64 as string | undefined) ??
    (data?.enhancedImage ?? data?.output ?? data?.data?.enhancedImage ?? data?.data?.imageBase64);
  const enhancedImageUrl = (data?.enhancedImageUrl as string | undefined) ??
    (data?.data?.enhancedImageUrl ?? data?.result?.imageUrl ?? data?.imageUrl);

  const inferenceId = (data?.id as string | undefined) ?? data?.jobId ?? data?.requestId;

  if (!enhancedImageBase64 && !enhancedImageUrl) {
    console.warn('Nano Banana response missing enhanced image payload. Falling back to original image.', data);
    return {
      imageUrl: imageBase64,
      source: 'original',
      inferenceId,
      rawResponse: data,
    };
  }

  const imageUrl = enhancedImageUrl ?? ensureDataUrl(enhancedImageBase64 as string);

  return {
    imageUrl,
    source: 'enhanced',
    inferenceId,
    rawResponse: data,
  };
}
