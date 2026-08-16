import { GoogleGenAI, Modality } from "@google/genai";
import { Image } from '@/types';

let currentApiKey: string | null = null;
let ai: GoogleGenAI | null = null;

export const getApiKey = (): string | null => {
  // Check localStorage first (user-provided key)
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
  if (storedKey) return storedKey;
  // Fallback to env var (for preloaded deployments)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || null;
  return envKey;
};

export const isApiKeyConfigured = (): boolean => {
  return getApiKey() !== null;
};

const getAI = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('API key not configured. Please add your Gemini API key in Settings.');
    }
    if (!ai || currentApiKey !== apiKey) {
        currentApiKey = apiKey;
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};


const getMimeType = (dataUrl: string): string => {
    return dataUrl.substring(dataUrl.indexOf(":") + 1, dataUrl.indexOf(";"));
};

export const generateWithCharacter = async (prompt: string, referenceImages: Image[], aspectRatio: string): Promise<{ dataUrl: string; usageMetadata?: any; requestedAspectRatio: string; }> => {
    const gemini = getAI();
    
    const imageParts = referenceImages.map(img => ({
        inlineData: {
            data: img.dataUrl.split(",")[1],
            mimeType: getMimeType(img.dataUrl),
        },
    }));

    let finalPrompt: string;
    switch (aspectRatio) {
        case '4:3':
            finalPrompt = `A wide landscape photograph of ${prompt}. Aspect ratio 4:3.`;
            break;
        case '3:4':
            finalPrompt = `A tall portrait photograph of ${prompt}. Aspect ratio 3:4.`;
            break;
        case '1:1':
        default:
            finalPrompt = `A square photograph of ${prompt}. Aspect ratio 1:1.`;
            break;
    }

    const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash-preview-05-20',
        contents: {
            parts: [
                ...imageParts,
                { text: finalPrompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (imagePart?.inlineData) {
        const base64ImageBytes: string = imagePart.inlineData.data || '';
        const dataUrl = `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
        return { dataUrl, usageMetadata: response.usageMetadata, requestedAspectRatio: aspectRatio };
    }

    if (response.promptFeedback?.blockReason) {
        throw new Error(`Image generation blocked: ${response.promptFeedback.blockReason}. ${response.promptFeedback.blockReasonMessage || ''}`);
    }

    throw new Error("No image generated. The model did not return an image.");
};

export const editImage = async (prompt: string, baseImage: Image): Promise<{ dataUrl: string; usageMetadata?: any }> => {
    const gemini = getAI();

    const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash-preview-05-20',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: baseImage.dataUrl.split(",")[1],
                        mimeType: getMimeType(baseImage.dataUrl),
                    },
                },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (imagePart?.inlineData) {
        const base64ImageBytes: string = imagePart.inlineData.data || '';
        const dataUrl = `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
        return { dataUrl, usageMetadata: response.usageMetadata };
    }

    if (response.promptFeedback?.blockReason) {
        throw new Error(`Image editing blocked: ${response.promptFeedback.blockReason}. ${response.promptFeedback.blockReasonMessage || ''}`);
    }
    
    throw new Error("No image edited. The model did not return an image.");
};

export const enhanceImage = async (baseImage: Image): Promise<{ dataUrl: string; usageMetadata?: any }> => {
    const enhancePrompt = "Enhance the quality of this image. Increase sharpness, improve lighting, refine details, and add more realism without changing the content or composition. Make it look like a high-resolution photograph.";
    return editImage(enhancePrompt, baseImage);
};


export const generateImage = async (prompt: string, aspectRatio: string, numberOfImages: number): Promise<{ dataUrl: string; usageMetadata?: any; requestedAspectRatio: string; }[]> => {
    const gemini = getAI();

    // Try Imagen 4.0 first (faster, higher quality, but may not be available for all API keys)
    try {
        const response = await gemini.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: numberOfImages,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages.map(img => ({
                dataUrl: `data:image/png;base64,${img.image?.imageBytes || ''}`,
                usageMetadata: undefined,
                requestedAspectRatio: aspectRatio,
            }));
        }
    } catch (imagenError) {
        console.warn('Imagen 4.0 not available, falling back to Gemini Flash Image:', imagenError);
    }

    // Fallback: use Gemini Flash Image (generateContent with IMAGE modality)
    // This works with any Gemini API key
    const results: { dataUrl: string; usageMetadata?: any; requestedAspectRatio: string; }[] = [];

    for (let i = 0; i < numberOfImages; i++) {
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash-preview-05-20',
            contents: {
                parts: [{ text: `Generate a high quality image: ${prompt}. Aspect ratio: ${aspectRatio}.` }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            const base64ImageBytes: string = imagePart.inlineData.data || '';
            const dataUrl = `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
            results.push({ dataUrl, usageMetadata: response.usageMetadata, requestedAspectRatio: aspectRatio });
        }
    }

    if (results.length > 0) {
        return results;
    }

    throw new Error("Image generation failed with both Imagen 4.0 and Gemini Flash Image. Please check your API key permissions.");
};