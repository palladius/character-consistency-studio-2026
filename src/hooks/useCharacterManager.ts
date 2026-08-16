import { useState, useCallback } from 'react';
import { Character, Image, GeneratedImage } from '@/types';
import { fileToDataUrl } from '@/utils/fileUtils';

export const QUICK_GEN_CHARACTER_ID = 'QUICK_GEN_CHARACTER';

const quickGenCharacter: Character = {
  id: QUICK_GEN_CHARACTER_ID,
  name: 'Quick Generations',
  referenceImages: [],
  generatedImages: [],
};

const initialCharacters: Character[] = [
    quickGenCharacter,
];

export const useCharacterManager = () => {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const addCharacter = useCallback((name: string): string | undefined => {
    if (!name.trim()) return;
    const id = `char_${Date.now()}`;
    const newCharacter: Character = {
      id,
      name,
      referenceImages: [],
      generatedImages: [],
    };
    setCharacters(prev => [...prev, newCharacter]);
    setSelectedCharacterId(newCharacter.id);
    return id;
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    if (id === QUICK_GEN_CHARACTER_ID) return; // Prevent deletion of special character

    setCharacters(prev => prev.filter(c => c.id !== id));
    if (selectedCharacterId === id) {
      const remainingUserChars = characters.filter(c => c.id !== id && c.id !== QUICK_GEN_CHARACTER_ID);
      setSelectedCharacterId(remainingUserChars.length > 0 ? remainingUserChars[0].id : QUICK_GEN_CHARACTER_ID);
    }
  }, [characters, selectedCharacterId]);

  const addReferenceImages = useCallback(async (characterId: string, files: FileList) => {
    const imagePromises = Array.from(files).map(file => fileToDataUrl(file));
    const dataUrls = await Promise.all(imagePromises);

    const newImages: Image[] = dataUrls.map(url => ({
      id: `ref_${Date.now()}_${Math.random()}`,
      dataUrl: url,
    }));

    setCharacters(prev => prev.map(c => 
      c.id === characterId ? { ...c, referenceImages: [...c.referenceImages, ...newImages] } : c
    ));
  }, []);
  
  const deleteReferenceImage = useCallback((characterId: string, imageId: string) => {
    setCharacters(prev => prev.map(c => 
      c.id === characterId ? { ...c, referenceImages: c.referenceImages.filter(img => img.id !== imageId) } : c
    ));
  }, []);

  const addPreloadedImages = useCallback((characterId: string, images: { id: string; dataUrl: string; fileName?: string }[]) => {
    setCharacters(prev => prev.map(c => 
      c.id === characterId ? { ...c, referenceImages: [...c.referenceImages, ...images] } : c
    ));
  }, []);

  const addGeneratedImage = useCallback((characterId: string, prompt: string, dataUrl: string, parentId?: string, usageMetadata?: any, requestedAspectRatio?: string) => {
    const newImage: GeneratedImage = {
      id: `gen_${Date.now()}_${Math.random()}`,
      dataUrl,
      prompt,
      characterId,
      parentId,
      usageMetadata,
      requestedAspectRatio,
    };
    setCharacters(prev => prev.map(c => 
      c.id === characterId ? { ...c, generatedImages: [newImage, ...c.generatedImages] } : c
    ));
  }, []);
  
  const deleteGeneratedImage = useCallback((characterId: string, imageId: string) => {
    setCharacters(prev => prev.map(c => 
      c.id === characterId ? { ...c, generatedImages: c.generatedImages.filter(img => img.id !== imageId) } : c
    ));
  }, []);

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || null;

  return {
    characters,
    selectedCharacter,
    selectedCharacterId,
    addCharacter,
    deleteCharacter,
    setSelectedCharacterId,
    addReferenceImages,
    addPreloadedImages,
    deleteReferenceImage,
    addGeneratedImage,
    deleteGeneratedImage,
  };
};