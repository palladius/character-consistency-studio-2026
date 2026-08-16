# Implementation Plan: Core Frontend Port

## Phase 1: Project Scaffolding
- **Goal**: Set up Vite + React + TypeScript project
- **Steps**:
  1. [ ] Initialize Vite project with React-TS template
  2. [ ] Install dependencies: `@google/genai`, `react`, `react-dom`
  3. [ ] Configure `vite.config.ts` with environment variable handling
  4. [ ] Configure `tsconfig.json` with path aliases (`@/`)
- **Verification**: `npm run dev` starts without errors, shows blank page

## Phase 2: Core Types & Constants
- **Goal**: Port the data model and constants
- **Steps**:
  1. [ ] Port `types.ts` (Character, ReferenceImage, GeneratedImage interfaces)
  2. [ ] Port `constants.tsx` (MIN_IMAGES, MAX_IMAGES, SUGGESTION_PROMPTS, ICONS)
  3. [ ] Port `utils/fileUtils.ts` (fileToDataUrl)
- **Verification**: TypeScript compiles without errors (`npx tsc --noEmit`)

## Phase 3: Services Layer
- **Goal**: Port the Gemini API integration with API key flexibility
- **Steps**:
  1. [ ] Port `services/geminiService.ts` with modification: read API key from localStorage first, then env var fallback
  2. [ ] Add `getApiKey()` utility that checks localStorage -> env var -> returns null
  3. [ ] Add `isApiKeyConfigured()` check
- **Verification**: API service compiles, `getApiKey()` returns null when nothing configured

## Phase 4: State Management
- **Goal**: Port the character manager hook
- **Steps**:
  1. [ ] Port `hooks/useCharacterManager.ts` (character CRUD, image management)
- **Verification**: Hook compiles, unit test for addCharacter/deleteCharacter

## Phase 5: API Key Input Component
- **Goal**: NEW - create the self-service API key entry UI
- **Steps**:
  1. [ ] Create `components/ApiKeyInput.tsx` - modal for entering Gemini API key
  2. [ ] "Test Connection" button that validates the key
  3. [ ] Store in localStorage, clear button
  4. [ ] Link to https://aistudio.google.com/apikey for getting a key
- **Verification**: Can enter, test, save, and clear API key

## Phase 6: Core UI Components
- **Goal**: Port all UI components
- **Steps**:
  1. [ ] Port `components/Sidebar.tsx` (character list, add/delete)
  2. [ ] Port `components/Workspace.tsx` (main area, prompt input, generate button)
  3. [ ] Port `components/ImageGrid.tsx` (thumbnail grid with actions)
  4. [ ] Port `components/ImageModal.tsx` (full-size view, edit, enhance, regenerate)
  5. [ ] Port `components/Loader.tsx` (loading spinner)
  6. [ ] Port `components/Footer.tsx`
  7. [ ] Add read-only mode: grey out generation controls when no API key
- **Verification**: Full UI renders, all interactions work with API key set

## Phase 7: App Assembly & Styling
- **Goal**: Wire everything together
- **Steps**:
  1. [ ] Port `App.tsx` (main app component wiring all parts)
  2. [ ] Port/create `index.css` (dark theme, Google Sans Text, animations)
  3. [ ] Port `index.html` (root HTML with meta tags)
  4. [ ] Port `config.ts` if needed
- **Verification**: `npm run dev` shows full working app

## Phase 8: Build & Deploy Config
- **Goal**: Production-ready build and Cloud Run deployment
- **Steps**:
  1. [ ] Create `deploy/Dockerfile` (multi-stage: node build + nginx serve)
  2. [ ] Create `deploy/nginx.conf` for SPA routing
  3. [ ] Verify `npm run build` produces clean output in `dist/`
  4. [ ] Test Docker build locally
- **Verification**: `docker build` succeeds, app runs in container
