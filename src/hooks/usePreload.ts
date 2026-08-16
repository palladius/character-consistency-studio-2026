import { useEffect } from 'react';

interface PreloadManifest {
  characters: Array<{
    id: string;
    name: string;
    images: string[];
  }>;
}

const fileToDataUrl = (url: string): Promise<string> => {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`Failed to read ${url}`));
      reader.readAsDataURL(blob);
    }));
};

export const usePreload = (
  addCharacter: (name: string) => string | undefined,
  addPreloadedImages: (characterId: string, images: Array<{ id: string; dataUrl: string; fileName: string }>) => void,
  characters: Array<{ id: string }>
) => {
  useEffect(() => {
    // Only preload if no user-created characters exist yet (besides the built-in Quick Gen)
    const QUICK_GEN_ID = 'QUICK_GEN_CHARACTER';
    const userChars = characters.filter(c => c.id !== QUICK_GEN_ID);
    if (userChars.length > 0) return;

    const loadPreloaded = async () => {
      try {
        const res = await fetch('/preloaded/manifest.json');
        if (!res.ok) return; // No preload data, that's fine
        const manifest: PreloadManifest = await res.json();

        for (const char of manifest.characters) {
          const charId = addCharacter(char.name);
          if (!charId) continue;

          const images = [];
          for (const imgPath of char.images) {
            try {
              const dataUrl = await fileToDataUrl(`/preloaded/${imgPath}`);
              const fileName = imgPath.split('/').pop() || imgPath;
              images.push({
                id: `preload_${crypto.randomUUID()}`,
                dataUrl,
                fileName,
              });
            } catch (err) {
              console.warn(`Failed to preload ${imgPath}:`, err);
            }
          }
          if (images.length > 0) {
            addPreloadedImages(charId, images);
          }
        }
      } catch (err) {
        // No manifest = no preloading, silently ignore
        console.debug('No preload manifest found, starting fresh.');
      }
    };

    loadPreloaded();
  }, []); // Run once on mount
};
