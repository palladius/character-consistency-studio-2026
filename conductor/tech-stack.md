# Technology Stack

## Frontend (Web Application)
- **Language**: TypeScript (strict mode)
- **Framework**: React 19 (functional components, hooks)
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (dark theme, no Tailwind unless explicitly needed)
- **State Management**: React hooks (`useState`, `useCallback`, custom hooks)
- **API Client**: `@google/genai` SDK (browser-compatible)
- **Image Handling**: HTML5 Canvas, FileReader API

## Backend (Optional - for free tier)
- **Runtime**: Cloud Run (serverless)
- **Framework**: Express.js or Cloud Functions (minimal proxy for rate limiting)
- **Purpose**: Only needed for the "5 free generations/day" feature (future GHI)

## Eval & CLI Tools
- **Language**: Python 3.11+
- **Package Manager**: `uv` (inline script dependencies via PEP 723)
- **Key Libraries**:
  - `google-genai` - Gemini API client
  - `pydantic` - Structured eval output schemas
  - `rich` - CLI formatting and tables
  - `pillow` - Image processing
  - `python-slugify` - File naming
- **Data Format**: JSONL (one record per line, per subject directory)

## Infrastructure
- **Hosting**: Google Cloud Run (containerized)
- **Container**: Dockerfile (node:20-alpine for frontend build, nginx for serving)
- **CI/CD**: Cloud Build (`cloudbuild.yaml`)
- **Image Storage (Private)**: Google Cloud Storage bucket (for preloaded family photos)
- **Source Control**: GitHub (`palladius/character-consistency-studio-2026`)

## AI Models Used
- **Image Generation**: `gemini-2.5-flash-image` (character consistency), `imagen-4.0-generate-001` (quick generation)
- **Auto-Eval Judge**: `gemini-2.5-flash` (cost-effective judging)
- **Reference Photo Eval**: `gemini-3.5-flash` (LOO cross-validation)

## Development Tools
- **Task Runner**: `just` (Justfile)
- **Linting**: ESLint (TypeScript), Ruff (Python)
- **Type Checking**: `tsc --noEmit`
- **Testing**: Vitest (TypeScript), pytest (Python)
- **Git Conventions**: Gitmoji commits, conventional PR titles

## Project Structure

```
character-consistency-studio-2026/
  conductor/              # Conductor SDD artifacts
  src/                    # React/TypeScript frontend
    components/
    hooks/
    services/
    utils/
    assets/
  eval/                   # Python CLI eval tools
  data/
    characters/
      demo-cat/           # Public safe demo character
  private/                # .gitignored - family photos, local configs
    characters/
    family-manifest.json
  deploy/
    Dockerfile
    cloudbuild.yaml
  .env.dist               # Template for environment variables
  .gitignore
  Justfile
  package.json
  vite.config.ts
  tsconfig.json
  README.md
  CHANGELOG.md
  VERSION
```
