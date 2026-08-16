# Specification: Core Frontend Port

## Summary
Port the working React/TypeScript frontend from `character-consistency-studio` into `character-consistency-studio-2026`, adding self-service API key entry and read-only mode.

## Requirements
1. The app must load and render the character management UI
2. Users can enter their own Gemini API key via a UI modal (stored in localStorage)
3. When no API key is set, the app enters read-only mode (generation disabled, controls greyed out)
4. Character CRUD: create, delete, select characters
5. Reference image upload: drag-and-drop or file picker, 3-10 images per character
6. Image generation: text prompt + reference images -> new consistent image via Gemini 2.5 Flash Image
7. Image modal: full-size view, edit, enhance, regenerate, download, delete, keyboard nav
8. Quick generation mode (Imagen 4.0, no reference images needed)
9. `npm run dev` starts the dev server
10. `npm run build` produces a production bundle

## Out of Scope
- Auto-eval integration (Track 2)
- Benigni effect (Track 3)
- CLI eval tools (Track 4)
- Family preloading (Track 5)
- Backend/proxy (future FR)

## Source Repository
- https://github.com/palladius/character-consistency-studio
- Key files to port: `App.tsx`, `components/`, `hooks/`, `services/`, `types.ts`, `constants.tsx`, `utils/`
