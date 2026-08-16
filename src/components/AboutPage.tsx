import React from 'react';
import { ICONS } from '@/constants';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="flex-grow bg-slate-900 p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-semibold">
            <div className="w-5 h-5">{ICONS.back}</div>
            <span>Back to Studio</span>
        </button>

        <header className="mb-8 border-b border-slate-700 pb-4">
            <h1 className="text-4xl font-bold text-white">About Character Consistency Studio</h1>
            <p className="text-slate-400 mt-2">A demonstration of the Gemini API's capabilities.</p>
        </header>
        
        <main className="text-slate-300 space-y-6 text-lg leading-relaxed">
            <p>
              This application serves as a hands-on sample to demonstrate how the
              <a href="https://ai.google.dev/gemini-api" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-500 underline"> Google Gemini API</a>
              can be used to achieve character consistency in image generation.
            </p>

            <p>
              Character consistency is a common challenge in AI image generation where the goal is to create multiple images of the same character in different scenes, poses, or styles while maintaining their key features. This app showcases a workflow where a user provides a few reference images of a character, and then uses text prompts to generate new, consistent images of that character.
            </p>

            <h2 className="text-2xl font-semibold text-white pt-4">How It Works</h2>
            <p>
              The core functionality relies on the multimodal capabilities of the <strong>Gemini 2.5 Flash Image</strong> (<code className="bg-slate-700 text-yellow-300 text-sm px-2 py-1 rounded-md">gemini-2.5-flash-image</code>) model. When you provide reference images and a text prompt, the model analyzes the visual information from the images and combines it with the instructions from your prompt to create a new image that respects the character's appearance.
            </p>
            <p>
              The "Quick Generate" feature uses the <strong>Imagen 4</strong> (<code className="bg-slate-700 text-yellow-300 text-sm px-2 py-1 rounded-md">imagen-4.0-generate-001</code>) model for high-quality, general-purpose image generation from a single text prompt.
            </p>

            <div className="!mt-10 p-4 border border-slate-700 bg-slate-800/50 rounded-lg text-base">
              <p className="text-sm">
                  <strong>Note:</strong> This is a sample application. It is not an official Google product. The code is provided for educational and demonstration purposes.
              </p>
            </div>
        </main>
      </div>
    </div>
  );
};

export default AboutPage;
