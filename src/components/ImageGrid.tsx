import React, { useRef } from 'react';
import { Image } from '@/types';
import { MAX_IMAGES } from '@/constants';
import { ICONS } from '@/constants';

interface ImageGridProps {
  title: string;
  images: Image[];
  onAddImages?: (files: FileList) => void;
  onDeleteImage: (id: string) => void;
  onImageClick?: (image: Image) => void;
  onDownloadImage?: (image: Image) => void;
  characterImageCount?: number;
  headerAction?: React.ReactNode;
}

const ImageGrid: React.FC<ImageGridProps> = ({ title, images, onAddImages, onDeleteImage, onImageClick, onDownloadImage, characterImageCount = 0, headerAction }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onAddImages) {
      onAddImages(e.target.files);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-200">{title}</h3>
        <div>{headerAction}</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map(image => (
          <div
            key={image.id}
            className={`group relative aspect-square rounded-lg overflow-hidden ${onImageClick ? 'cursor-pointer' : ''}`}
            onClick={() => onImageClick?.(image)}
          >
            <img 
              src={image.dataUrl} 
              alt="thumbnail" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
               {onImageClick && (
                 <div
                    aria-label="View image details"
                    className="absolute top-2 left-2 p-1.5 bg-slate-700/80 rounded-full text-white"
                  >
                    <div className="w-5 h-5">{ICONS.view}</div>
                  </div>
               )}
               <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening modal when deleting
                  onDeleteImage(image.id)
                }}
                aria-label="Delete image"
                className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-500 rounded-full text-white transition-colors">
                <div className="w-4 h-4">{ICONS.trash}</div>
               </button>
               {onDownloadImage && (
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadImage(image);
                  }}
                  aria-label="Download image"
                  className="absolute bottom-2 right-2 p-1.5 bg-slate-700/80 hover:bg-yellow-500 rounded-full text-white transition-colors">
                  <div className="w-4 h-4">{ICONS.download}</div>
                 </button>
               )}
            </div>
          </div>
        ))}
        {onAddImages && characterImageCount < MAX_IMAGES && (
          <button
            onClick={handleAddClick}
            className="aspect-square rounded-lg border-2 border-dashed border-slate-600 hover:border-yellow-400 hover:bg-slate-800 transition-colors flex flex-col items-center justify-center text-slate-400 hover:text-yellow-400"
          >
            <div className="w-8 h-8 mb-2">{ICONS.upload}</div>
            <span className="text-sm font-medium">Add Images</span>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageGrid;