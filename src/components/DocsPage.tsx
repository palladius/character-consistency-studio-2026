import React, { useMemo } from 'react';
import showdown from 'showdown';
import { ICONS } from '@/constants';

interface DocsPageProps {
  onBack: () => void;
}

// The markdown content is now embedded directly in the component to avoid network errors in deployed environments.
const userManualMarkdown = `# Character Consistency Studio - User Manual

Welcome to the Character Consistency Studio, vibe-coded by Riccardo using AI Studio "build" feature! 

This guide will walk you through all the features of the application to help you get the most out of your creative process.

## Core Concepts

The primary goal of this tool is to help you create consistent images of a specific person or character across various styles and scenarios. You provide a set of reference images, and the AI uses them to understand the character's appearance when generating new pictures.

## 1. Characters & Setup

The sidebar on the left is your main navigation hub. It's divided into two sections: a special **Quick Generations** folder and your list of custom **Characters**.

### Creating a Character

1.  **Add Character**: Click the \`+\` icon next to the "Characters" title.
2.  **Name Character**: Give your character a distinct name (e.g., "Alice", "Cyberpunk Detective") and save.
3.  **Upload Reference Images**: Select your new character. In the workspace, you'll see a "Reference Images" grid. You must upload **at least 3** high-quality images of the character's face, preferably from different angles and in different lighting. For best results, use 5-10 images.

## 2. Generating Images with a Character

Once you have uploaded at least 3 reference images, the generation panel will become active.

-   **Use the Prompt Box**: Type a description of the scene you want to create (e.g., "A photo of Alice as a superhero, cinematic lighting").
-   **Use Suggestion Prompts**: For quick ideas, click on one of the colorful buttons below the input box. The app will automatically combine it with your character's name and generate an image.
-   **Choose Aspect Ratio**: Use the icons in the top-right of the workspace to select the image shape: **Square (1:1)**, **Landscape (4:3)**, or **Portrait (3:4)**.
-   **Set Number of Images**: Next to the "Generate" button, you can choose to create **1, 2, or 4 images** at once.

Click the **Generate** button to start.

## 3. The Image Viewer & Actions

Click on any generated image in the grid to open the full-screen Image Viewer.

### Navigating Images
The viewer is a carousel that lets you easily browse all images for the current character.
-   **Mouse**: Click the left/right arrows on the screen or click on the thumbnails at the bottom.
-   **Keyboard**:
    -   \`Left Arrow\` / \`Right Arrow\`: Navigate between images.
    -   \`Spacebar\`: Go to the next image.
    -   \`Delete\` / \`Backspace\`: Delete the current image.
    -   \`i\` / \`Down Arrow\`: Show or hide the details panel.
    -   \`Esc\`: Close the viewer.

### Image Actions
In the right-hand panel of the viewer, you'll find several actions:

-   **Download**: Saves the current image to your computer.
-   **Copy**: Copies the image to your clipboard to paste into other applications.
-   **Regenerate (Regen)**: Creates a new variation of the image using the **exact same prompt** but a different random result. It's perfect for when you like an idea but want to see another take on it.
-   **Enhance**: This is a powerful tool for improving your image. When you click "Enhance", the app sends the image back to the AI with a specialized instruction: _"Enhance the quality of this image. Increase sharpness, improve lighting, refine details, and add more realism without changing the content or composition."_ The result is a new, higher-quality version of the same image without changing the subject.

## 4. Editing & Image History

-   **Editing with Prompts**: Use the "Edit Image" text box to describe a change, like "add a retro filter" or "change the background to a forest." The AI will generate a new version with your requested changes.
-   **Image History**: The app keeps track of your edits. You can see the "Original Image" (parent) and any "Edits & Enhancements" (children) created from it, allowing you to easily navigate your creative process.

## 5. Saving Your Work

You can save your images in two ways:

1.  **Individual Download**: Hover over any thumbnail in the workspace grid and click the **download icon** in the bottom-right corner.
2.  **Download All**: In the workspace, click the **Download All** button at the top of the "Generated Images" grid. This will save all images for the selected character into a single \`.zip\` file.

## 6. Quick Generate

The **Quick Generate** feature lets you create high-quality standalone images without needing a character or reference photos.

1.  **Open**: Click the "Quick Generate" button at the bottom-right of the screen.
2.  **Prompt**: The modal opens with a random, creative prompt to get you started. You can use it or type your own.
3.  **Generate**: Choose your aspect ratio and number of images, then click "Generate".
4.  **View Results**: After generation, the app will automatically switch to the **Quick Generations** folder in the sidebar, where all your standalone images are saved.
`;

const converter = new showdown.Converter({
    ghCompatibleHeaderId: true,
    simpleLineBreaks: true,
    tables: true,
});

const DocsPage: React.FC<DocsPageProps> = ({ onBack }) => {
  const htmlContent = useMemo(() => {
    return converter.makeHtml(userManualMarkdown);
  }, []);

  return (
    <div className="flex-grow bg-slate-900 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
            <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-semibold">
                <div className="w-5 h-5">{ICONS.back}</div>
                <span>Back to Studio</span>
            </button>

            <div id="content" className="markdown-body">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
        </div>
        <style>{`
          .markdown-body h1, .markdown-body h2, .markdown-body h3 {
            font-weight: bold;
            color: #f1f5f9; /* slate-100 */
            border-bottom: 1px solid #334155; /* slate-700 */
            padding-bottom: 0.3em;
            margin-top: 1.5em;
            margin-bottom: 1em;
          }
          .markdown-body h1 { font-size: 2.25rem; }
          .markdown-body h2 { font-size: 1.75rem; }
          .markdown-body h3 { font-size: 1.25rem; }
          .markdown-body p {
            line-height: 1.6;
            margin-bottom: 1rem;
          }
          .markdown-body a {
            color: #facc15; /* yellow-400 */
            text-decoration: underline;
          }
          .markdown-body a:hover {
            color: #eab308; /* yellow-500 */
          }
          .markdown-body code {
            background-color: #334155; /* slate-700 */
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            border-radius: 6px;
            color: #fde047; /* yellow-300 */
          }
          .markdown-body pre {
            background-color: #1e293b; /* slate-800 */
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
          }
           .markdown-body pre code {
            padding: 0;
            background-color: transparent;
            color: inherit;
          }
          .markdown-body ul, .markdown-body ol {
            padding-left: 2em;
            margin-bottom: 1rem;
            list-style: disc;
          }
           .markdown-body li {
            margin-bottom: 0.5rem;
          }
          .markdown-body strong {
            color: #f8fafc; /* slate-50 */
          }
        `}</style>
    </div>
  );
};

export default DocsPage;