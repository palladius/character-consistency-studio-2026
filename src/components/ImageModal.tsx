import React, { useState, useEffect, useCallback } from 'react';
import { GeneratedImage } from '@/types';
import Loader from '@/components/Loader';
import { ICONS } from '@/constants';
import { editImage, enhanceImage, generateWithCharacter } from '@/services/geminiService';

interface ImageModalProps {
  image: GeneratedImage | null;
  characterName?: string;
  onClose: () => void;
  onImageUpdate: (characterId: string, prompt: string, dataUrl: string, parentId?: string, usageMetadata?: any, requestedAspectRatio?: string) => void;
  onDeleteImage: (characterId: string, imageId: string) => void;
  allGeneratedImages: GeneratedImage[];
  onSelectImage: (image: GeneratedImage) => void;
  characterReferenceImages?: {id: string; dataUrl: string}[]; // Needed for regenerate
}

const ImageModal: React.FC<ImageModalProps> = ({ image, characterName, onClose, onImageUpdate, onDeleteImage, allGeneratedImages, onSelectImage, characterReferenceImages }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    if (image?.dataUrl) {
      const img = new window.Image();
      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        console.error("Failed to load image to get dimensions.");
        setDimensions(null);
      };
      img.src = image.dataUrl;
    } else {
        setDimensions(null);
    }
  }, [image?.dataUrl]);
  
  // Reset transient state when the image changes
  useEffect(() => {
    if (image) {
      setEditPrompt('');
      setError(null);
      setCopyStatus('Copy');
      setIsEditing(false);
      setIsEnhancing(false);
      setIsRegenerating(false);
      setDetailsVisible(false); // Hide details on image change for mobile
    }
  }, [image]);

  const currentIndex = image ? allGeneratedImages.findIndex(i => i.id === image.id) : -1;

  const handleNext = useCallback(() => {
    if (allGeneratedImages.length > 1 && currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % allGeneratedImages.length;
      onSelectImage(allGeneratedImages[nextIndex]);
    }
  }, [currentIndex, allGeneratedImages, onSelectImage]);

  const handlePrevious = useCallback(() => {
    if (allGeneratedImages.length > 1 && currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + allGeneratedImages.length) % allGeneratedImages.length;
      onSelectImage(allGeneratedImages[prevIndex]);
    }
  }, [currentIndex, allGeneratedImages, onSelectImage]);

  const handleDelete = useCallback(() => {
    if (image) {
      onDeleteImage(image.characterId, image.id);
    }
  }, [image, onDeleteImage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            handleNext();
        } else if (e.key === 'ArrowLeft') {
            handlePrevious();
        } else if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            handleDelete();
        } else if (e.key.toLowerCase() === 'i' || e.key === 'ArrowDown') {
            e.preventDefault();
            setDetailsVisible(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, onClose, handleDelete]);

  if (!image) return null;

  const handleEdit = async () => {
    if (!editPrompt.trim()) return;
    setIsEditing(true);
    setError(null);
    try {
      const { dataUrl: editedImageUrl, usageMetadata } = await editImage(editPrompt, image);
      const newImage = {
        id: `gen_${Date.now()}`,
        dataUrl: editedImageUrl,
        prompt: `Edit: ${editPrompt} (from original: ${image.prompt})`,
        characterId: image.characterId,
        parentId: image.id,
        requestedAspectRatio: image.requestedAspectRatio,
      };
      onImageUpdate(newImage.characterId, newImage.prompt, newImage.dataUrl, newImage.id, usageMetadata, newImage.requestedAspectRatio);
      setEditPrompt('');
      onSelectImage(newImage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit image');
    } finally {
      setIsEditing(false);
    }
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    setError(null);
    try {
        const { dataUrl: enhancedImageUrl, usageMetadata } = await enhanceImage(image);
        const newImage = {
            id: `gen_${Date.now()}`,
            dataUrl: enhancedImageUrl,
            prompt: `Enhanced: ${image.prompt}`,
            characterId: image.characterId,
            parentId: image.id,
            requestedAspectRatio: image.requestedAspectRatio,
        };
        onImageUpdate(newImage.characterId, newImage.prompt, newImage.dataUrl, newImage.id, usageMetadata, newImage.requestedAspectRatio);
        onSelectImage(newImage);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to enhance image');
    } finally {
        setIsEnhancing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!characterReferenceImages || characterReferenceImages.length === 0) {
      setError("Reference images are not available for regeneration.");
      return;
    }
    setIsRegenerating(true);
    setError(null);
    try {
      const aspectRatioToUse = image.requestedAspectRatio || (dimensions ? `${dimensions.width}:${dimensions.height}` : '1:1');
      const safeAspectRatio = ['1:1', '4:3', '3:4'].includes(aspectRatioToUse.split(':').sort((a,b)=>+b-+a).join(':')) ? aspectRatioToUse : '1:1';
      
      const { dataUrl: regeneratedImageUrl, usageMetadata, requestedAspectRatio } = await generateWithCharacter(image.prompt, characterReferenceImages, safeAspectRatio);
      
      const newImage = {
          id: `gen_${Date.now()}`,
          dataUrl: regeneratedImageUrl,
          prompt: image.prompt, // Same prompt
          characterId: image.characterId,
          parentId: image.parentId, // Keep the same parent if it exists
          requestedAspectRatio: requestedAspectRatio,
      };
      onImageUpdate(newImage.characterId, newImage.prompt, newImage.dataUrl, newImage.parentId, usageMetadata, newImage.requestedAspectRatio);
      onSelectImage(newImage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate image');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    const safePrompt = image.prompt.substring(0, 40).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${characterName?.replace(/\s/g, '_') || 'character'}_${safePrompt}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (copyStatus !== 'Copy' || !navigator.clipboard) return;
    try {
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      setCopyStatus('Error!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    }
  };

  const parentImage = image.parentId ? allGeneratedImages.find(i => i.id === image.parentId) : null;
  const childImages = allGeneratedImages.filter(i => i.parentId === image.id);

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 animate-[fade-in_0.3s_ease-out]" onClick={onClose}>
      <div className="flex w-full h-full" onClick={e => e.stopPropagation()}>
        
        {/* Details Panel */}
        <div className={`
            absolute top-0 right-0 h-full w-full max-w-sm bg-slate-800 shadow-lg z-40 
            transform transition-transform duration-300 ease-in-out
            flex flex-col
            ${detailsVisible ? 'translate-x-0' : 'translate-x-full'}
            md:static md:w-[420px] md:flex-shrink-0 md:translate-x-0
        `}>
          <div className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => {
                    const isMobile = window.innerWidth < 768;
                    if (isMobile) {
                      setDetailsVisible(false);
                    } else {
                      onClose();
                    }
                  }} 
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-semibold">
                  <div className="w-5 h-5">{ICONS.back}</div>
                  <span>Back</span>
                </button>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">{ICONS.close}</button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
              
              <div>
                  <h2 className="text-xl font-bold text-slate-100 mb-4">Image Details</h2>
                  {characterName && <div className="mb-4"><p className="text-sm text-slate-400 mb-1 font-semibold">Character</p><p className="text-yellow-300 bg-slate-700/50 p-2 rounded-md text-sm font-medium">{characterName}</p></div>}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                          <p className="text-sm text-slate-400 mb-1 font-semibold">Dimensions</p>
                          <p className="text-slate-200 bg-slate-700/50 p-2 rounded-md text-sm font-medium">{dimensions ? `${dimensions.width} x ${dimensions.height}px` : 'Loading...'}</p>
                      </div>
                      {image.requestedAspectRatio && (
                          <div>
                              <p className="text-sm text-slate-400 mb-1 font-semibold">Requested Ratio</p>
                              <p className="text-slate-200 bg-slate-700/50 p-2 rounded-md text-sm font-medium">{image.requestedAspectRatio}</p>
                          </div>
                      )}
                  </div>
                  <div><p className="text-sm text-slate-400 mb-1 font-semibold">Prompt</p><p className="text-slate-200 bg-slate-700/50 p-3 rounded-md text-sm">{image.prompt}</p></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button onClick={handleDownload} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-2 rounded-md transition-colors flex items-center justify-center gap-3 text-sm"><div className="w-4 h-4">{ICONS.download}</div><span>Download</span></button>
                  <button onClick={handleCopy} disabled={copyStatus !== 'Copy'} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-2 rounded-md transition-colors flex items-center justify-center gap-3 text-sm disabled:opacity-60"><div className="w-4 h-4">{ICONS.copy}</div><span>{copyStatus}</span></button>
                  <button onClick={handleEnhance} disabled={isEnhancing} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-2 rounded-md transition-colors flex items-center justify-center gap-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed">{isEnhancing ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-slate-400 border-t-white"></div> : <div className="w-4 h-4">{ICONS.sparkles}</div>}<span>{isEnhancing ? '...' : 'Enhance'}</span></button>
                  <button onClick={handleRegenerate} disabled={isRegenerating || !characterReferenceImages} title={!characterReferenceImages ? 'Reference images unavailable' : 'Generate a new image with the same prompt'} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-2 rounded-md transition-colors flex items-center justify-center gap-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed">{isRegenerating ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-slate-400 border-t-white"></div> : <div className="w-4 h-4">{ICONS.regenerate}</div>}<span>{isRegenerating ? '...' : 'Regen'}</span></button>
                  <button onClick={handleDelete} className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-2 rounded-md transition-colors flex items-center justify-center gap-3 text-sm"><div className="w-4 h-4">{ICONS.trash}</div><span>Delete</span></button>
              </div>
              
              {(parentImage || childImages.length > 0) && (
                  <div className="border-t border-slate-700 pt-6">
                      <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">{ICONS.history} Image History</h3>
                      {parentImage && <div className="mb-3">
                          <p className="text-sm text-slate-400 mb-2 font-semibold">Original Image</p>
                          <img src={parentImage.dataUrl} onClick={() => onSelectImage(parentImage)} alt="Parent" className="w-20 h-20 object-cover rounded-md cursor-pointer hover:ring-2 ring-yellow-400"/>
                      </div>}
                      {childImages.length > 0 && <div>
                          <p className="text-sm text-slate-400 mb-2 font-semibold">Edits & Enhancements ({childImages.length})</p>
                          <div className="flex flex-wrap gap-2">
                          {childImages.map(child => <img key={child.id} src={child.dataUrl} onClick={() => onSelectImage(child)} alt="Child" className="w-20 h-20 object-cover rounded-md cursor-pointer hover:ring-2 ring-yellow-400"/>)}
                          </div>
                      </div>}
                  </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2 border-t border-slate-700 pt-6">{ICONS.edit} Edit Image</h3>
                <p className="text-sm text-slate-400 mb-3">Describe the changes you want to make.</p>
                
                {isEditing || isRegenerating ? ( <div className="py-8"><Loader text={isEditing ? "Applying edits..." : "Regenerating image..."} /></div>) : (
                  <>
                    <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="e.g., add a retro filter, make the background a forest..." className="w-full h-24 p-2 bg-slate-700 border border-slate-600 rounded-md resize-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"/>
                    <button onClick={handleEdit} disabled={isEditing || isEnhancing || isRegenerating} className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-600 text-slate-900 font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2">
                      {ICONS.sparkles} Apply Changes
                    </button>
                    {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
                  </>
                )}
              </div>
              
              <div className="border-t border-slate-700 pt-4 mt-6">
                  {image.usageMetadata ? (
                      <div className="text-slate-500 bg-slate-900/50 p-2 rounded-md text-[11px] font-mono leading-tight">
                          <div className="flex justify-between"><span>PROMPT_TOKENS:</span> <span>{image.usageMetadata.promptTokenCount}</span></div>
                          <div className="flex justify-between"><span>OUTPUT_TOKENS:</span> <span>{image.usageMetadata.candidatesTokenCount}</span></div>
                          <div className="flex justify-between font-bold text-slate-400 border-t border-slate-700 mt-1 pt-1"><span>TOTAL_TOKENS:</span> <span>{image.usageMetadata.totalTokenCount}</span></div>
                      </div>
                  ) : (
                      <div className="text-slate-500 bg-slate-900/50 p-2 rounded-md text-xs text-center italic">
                          Token usage data is not available for images generated with this model.
                      </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop for mobile details panel */}
        {detailsVisible && <div className="md:hidden absolute inset-0 bg-black/60 z-30" onClick={() => setDetailsVisible(false)}></div>}

        {/* Image Container */}
        <div className="flex-grow h-full relative flex items-center justify-center bg-black overflow-hidden">
           <div className="w-full h-full flex items-center justify-center p-4">
             <img src={image.dataUrl} alt={image.prompt} className="max-w-full max-h-full object-contain rounded-sm shadow-2xl" />
           </div>

           {allGeneratedImages.length > 1 && (
            <>
              <button onClick={handlePrevious} aria-label="Previous image" className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/60 rounded-full text-white transition-all duration-300 z-20"><div className="w-6 h-6">{ICONS.leftArrow}</div></button>
              <button onClick={handleNext} aria-label="Next image" className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/60 rounded-full text-white transition-all duration-300 z-20"><div className="w-6 h-6">{ICONS.rightArrow}</div></button>
            </>
           )}

            {allGeneratedImages.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center overflow-hidden z-10">
                    <div className="flex items-center gap-4 transition-transform duration-300 ease-out" style={{ transform: `translateX(calc(50% - ${currentIndex * (96 + 16)}px - 48px))` }}>
                        {allGeneratedImages.map((thumb, index) => {
                            const distance = Math.abs(index - currentIndex);
                            const scale = Math.max(1 - distance * 0.15, 0.4);
                            const opacity = Math.max(1 - distance * 0.3, 0.2);

                            return (
                                <img key={thumb.id} src={thumb.dataUrl} onClick={() => onSelectImage(thumb)} alt="thumbnail" className="w-24 h-24 object-cover rounded-md cursor-pointer transition-all duration-300 ease-out flex-shrink-0" style={{ transform: `scale(${scale})`, opacity: opacity, boxShadow: index === currentIndex ? '0 0 15px 5px rgba(250, 204, 21, 0.6)' : '0 10px 15px -3px rgb(0 0 0 / 0.4)', border: index === currentIndex ? '3px solid rgb(250 204 21)' : '3px solid transparent' }} />
                            )
                        })}
                    </div>
                </div>
            )}
            
            {/* Mobile-only button to show details */}
            <button
                onClick={() => setDetailsVisible(true)}
                aria-label="Show image details"
                className="md:hidden absolute top-4 right-4 z-20 p-2 bg-slate-700/80 hover:bg-slate-600 rounded-full text-white transition-colors"
            >
                <div className="w-5 h-5">{ICONS.info}</div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;