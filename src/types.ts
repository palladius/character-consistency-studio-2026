export interface Image {
  id: string;
  dataUrl: string;
}

export interface GeneratedImage extends Image {
  prompt: string;
  characterId: string;
  parentId?: string;
  requestedAspectRatio?: string;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface Character {
  id:string;
  name: string;
  referenceImages: Image[];
  generatedImages: GeneratedImage[];
}