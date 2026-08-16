# Character Consistency Studio 2026
# Justfile for common development tasks

# List all available recipes
list:
  just -l

# Install dependencies
install:
  npm install

# Start development server
dev:
  npm run dev

# Run TypeScript type checking
typecheck:
  npx tsc --noEmit

# Run tests
test:
  npx vitest run

# Run Python eval tests
test-eval:
  cd eval && python -m pytest

# Evaluate reference photos for a character (e.g., just eval-refs kate)
eval-refs CHARACTER:
  uv run eval/evaluate_reference_photos.py -d private/characters/{{CHARACTER}}

# Run single model CC eval (e.g., just eval-model gemini-2.5-flash-image kate)
eval-model MODEL CHARACTER:
  uv run eval/eval_single_model.py --model {{MODEL}} -d private/characters/{{CHARACTER}}

# Load family photos from GIC into private/characters/
load-family:
  mkdir -p private/characters
  cp -r ~/git/gic/private/projects/git-privatize/github.com__palladius__media-arneis/data/characters/kate private/characters/
  cp -r ~/git/gic/private/projects/git-privatize/github.com__palladius__media-arneis/data/characters/kate2016 private/characters/
  cp -r ~/git/gic/private/projects/git-privatize/github.com__palladius__media-arneis/data/characters/riccardo private/characters/
  cp -r ~/git/gic/private/projects/git-privatize/github.com__palladius__media-arneis/data/characters/riccardo2016 private/characters/
  cp -r ~/git/gic/private/projects/git-privatize/github.com__palladius__media-arneis/data/characters/alessandro private/characters/
  cp -r ~/git/gic/private/projects/git-privatize/github.com__palladius__media-arneis/data/characters/sebastian private/characters/
  echo '🎭 Family photos loaded into private/characters/'

# Build for production
build:
  npm run build

# Deploy to Cloud Run (open version)
deploy-open:
  gcloud run deploy character-consistency-studio-2026 \
    --source . \
    --project palladius-genai \
    --region us-west1 \
    --allow-unauthenticated

# Clean build artifacts
clean:
  rm -rf dist/ node_modules/ out/ __pycache__/
