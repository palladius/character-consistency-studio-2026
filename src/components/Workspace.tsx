import React, { useState } from 'react';
import JSZip from 'jszip';
import { Character, GeneratedImage } from '@/types';
import { MIN_IMAGES, SUGGESTION_PROMPTS, ICONS } from '@/constants';
import { generateWithCharacter } from '@/services/geminiService';
import Loader from '@/components/Loader';
import ImageGrid from '@/components/ImageGrid';
import { QUICK_GEN_CHARACTER_ID } from '@/hooks/useCharacterManager';

interface WorkspaceProps {
  character: Character | null;
  onAddReferenceImages: (characterId: string, files: FileList) => void;
  onDeleteReferenceImage: (characterId: string, imageId: string) => void;
  onAddGeneratedImage: (characterId: string, prompt: string, dataUrl: string, parentId?: string, usageMetadata?: any, requestedAspectRatio?: string) => void;
  onDeleteGeneratedImage: (characterId: string, imageId: string) => void;
  onImageClick: (image: GeneratedImage) => void;
  onBack: () => void;
  hasApiKey?: boolean;
}

const aspectRatios = [
  { value: '1:1', icon: ICONS.aspect1to1, label: 'Square (1:1)' },
  { value: '4:3', icon: ICONS.aspect4to3, label: 'Landscape (4:3)' },
  { value: '3:4', icon: ICONS.aspect3to4, label: 'Portrait (3:4)' },
];

const generationCounts = [1, 2, 4];

const Workspace: React.FC<WorkspaceProps> = ({ 
  character, 
  onAddReferenceImages, 
  onDeleteReferenceImage, 
  onAddGeneratedImage, 
  onDeleteGeneratedImage,
  onImageClick,
  onBack,
  hasApiKey = false,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageCount, setImageCount] = useState(1);

  if (!character) {
    return (
      <div className="flex-grow flex items-center justify-center p-8 text-center bg-slate-900">
        <div>
          <h2 className="text-3xl font-bold text-slate-300">Welcome to Character Studio</h2>
          <p className="mt-2 text-slate-400">Select a character or create a new one to get started.</p>
        </div>
      </div>
    );
  }

  const isQuickGenWorkspace = character.id === QUICK_GEN_CHARACTER_ID;
  const isReadyToGenerate = character.referenceImages.length >= MIN_IMAGES;

  const handleGenerate = async (currentPrompt: string) => {
    if (!currentPrompt.trim() || !isReadyToGenerate) return;

    setIsLoading(true);
    setError(null);
    try {
      const generationPromises = Array(imageCount).fill(0).map(() => 
        generateWithCharacter(currentPrompt, character.referenceImages, aspectRatio)
      );
      
      const results = await Promise.allSettled(generationPromises);
      
      let successCount = 0;
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          onAddGeneratedImage(character.id, currentPrompt, result.value.dataUrl, undefined, result.value.usageMetadata, result.value.requestedAspectRatio);
          successCount++;
        } else {
          console.error("A generation failed:", result.reason);
        }
      });

      if (successCount === 0 && results.length > 0) {
        throw new Error("All image generations failed. Check the console for details.");
      }

      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during generation.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadOne = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    const safePrompt = image.prompt.substring(0, 40).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = isQuickGenWorkspace ? `quick-gen_${safePrompt}.png` : `${character.name.replace(/\s/g, '_')}_${safePrompt}.png`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (character.generatedImages.length === 0) return;
    setIsZipping(true);
    setError(null);
    try {
      const zip = new JSZip();
      
      const imagePromises = character.generatedImages.map(async (image, index) => {
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const safePrompt = image.prompt.substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const paddedIndex = String(index + 1).padStart(3, '0');
        zip.file(`${paddedIndex}_${safePrompt}.png`, blob);
      });
      
      await Promise.all(imagePromises);
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      const zipName = isQuickGenWorkspace ? 'quick_generations.zip' : `${character.name.replace(/\s/g, '_')}_generated_images.zip`;
      link.download = zipName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (err) {
      console.error("Failed to create zip file", err);
      setError("Failed to create zip file. See console for details.");
    } finally {
      setIsZipping(false);
    }
  };

  const renderGenerationUI = () => (
    <div className="bg-slate-800/50 p-6 rounded-lg mb-8 sticky top-6 z-10 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4">Generate Image of {character.name}</h3>
      <div className="flex flex-col md:flex-row gap-2">
        <input 
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerate(prompt)}
          placeholder="Describe a scene, style, or action..."
          className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
        />
        <div className="flex items-center gap-1 bg-slate-700 border border-slate-600 rounded-md p-1">
            {aspectRatios.map(({ value, icon, label }) => (
                <button
                key={value}
                title={label}
                onClick={() => setAspectRatio(value)}
                className={`p-1.5 rounded-md transition-colors ${
                    aspectRatio === value
                    ? 'bg-yellow-500 text-slate-900'
                    : 'text-slate-400 hover:bg-slate-600 hover:text-slate-200'
                }`}
                >
                <div className="w-5 h-5">{icon}</div>
                </button>
            ))}
        </div>
        <div className="flex items-center gap-1 bg-slate-700 border border-slate-600 rounded-md p-1">
          {generationCounts.map(count => (
            <button
              key={count}
              title={`Generate ${count} image${count > 1 ? 's' : ''}`}
              onClick={() => setImageCount(count)}
              className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${
                imageCount === count
                  ? 'bg-yellow-500 text-slate-900'
                  : 'text-slate-300 hover:bg-slate-600'
              }`}
            >
              x{count}
            </button>
          ))}
        </div>
        <button
          onClick={() => handleGenerate(prompt)}
          disabled={isLoading || !hasApiKey}
          className={`bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-600 text-slate-900 font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2 ${!hasApiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Generating...' : <>{ICONS.sparkles}<span>Generate</span></>}
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {SUGGESTION_PROMPTS.map(p => (
          <button 
            key={p} 
            onClick={() => handleGenerate(`${character.name} ${p}`)}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1 px-3 rounded-full transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );

  return (
    <main className="flex-grow p-6 bg-slate-900 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-2 text-slate-300 hover:text-white md:hidden">
                <div className="w-6 h-6">{ICONS.back}</div>
            </button>
            <h2 className="text-3xl font-bold text-white">{isQuickGenWorkspace ? character.name : `Editing: ${character.name}`}</h2>
        </div>
      </div>
      
      {!hasApiKey && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Missing API Key: </strong>
          <span className="block sm:inline">Configure your Gemini API key to start generating images</span>
        </div>
      )}
      
      {!isQuickGenWorkspace && !isReadyToGenerate && (
        <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Action Required: </strong>
          <span className="block sm:inline">Upload at least {MIN_IMAGES} reference images to start generating. You currently have {character.referenceImages.length}.</span>
        </div>
      )}
      
      {!isQuickGenWorkspace && isReadyToGenerate && renderGenerationUI()}

      {isLoading && !character.generatedImages.length && <div className="mt-8"><Loader text={`Generating ${imageCount} image${imageCount > 1 ? 's' : ''}...`} /></div>}

      {isQuickGenWorkspace && character.generatedImages.length === 0 && (
          <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto text-slate-600">{ICONS.image}</div>
              <h3 className="text-xl font-semibold mt-4 text-slate-300">Your Quick Generations will appear here</h3>
              <p className="text-slate-500 mt-1">Use the "Quick Generate" button to create images without a specific character.</p>
          </div>
      )}

      <ImageGrid
        title={isQuickGenWorkspace ? "All Generations" : "Generated Images"}
        images={character.generatedImages}
        onDeleteImage={(id: string) => onDeleteGeneratedImage(character.id, id)}
        onImageClick={(img: any) => onImageClick(img as GeneratedImage)}
        onDownloadImage={(img: any) => handleDownloadOne(img as GeneratedImage)}
        headerAction={
          character.generatedImages.length > 0 ? (
            <button
                onClick={handleDownloadAll}
                disabled={isZipping}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-3 rounded-lg border border-slate-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-wait"
            >
                {isZipping ? 
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div> :
                  <div className="w-4 h-4">{ICONS.download}</div>
                }
                {isZipping ? 'Zipping...' : 'Download All'}
            </button>
          ) : null
        }
      />
      
      {!isQuickGenWorkspace && (
        <ImageGrid
            title="Reference Images"
            images={character.referenceImages}
            onAddImages={(files: FileList) => onAddReferenceImages(character.id, files)}
            onDeleteImage={(id: string) => onDeleteReferenceImage(character.id, id)}
            characterImageCount={character.referenceImages.length}
        />
      )}
    </main>
  );
};

export default Workspace;