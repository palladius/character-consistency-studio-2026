# 🎭 Character Consistency Studio 2026

> *Same face, infinite worlds*

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Cloud Run](https://img.shields.io/badge/Cloud%20Run-deployed-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![GitHub](https://img.shields.io/github/stars/palladius/character-consistency-studio-2026?style=social)](https://github.com/palladius/character-consistency-studio-2026)

AI-powered web app for generating **consistent character images** using Google Gemini.
Upload reference photos of a person, describe a scene, and Gemini generates new images
that preserve the character's identity across infinite worlds.

---

## Features

- **🧑‍🎨 Character Management** - Upload and organize reference photos for multiple characters
- **🖼️ Image Generation** - Generate new images with consistent character appearance using Gemini
- **🤖 Auto-Eval with LLM Judge** - Automatically score generated images for character consistency
- **🤡 Benigni Easter Egg** - Comic relief when the AI judge scores below 6.0 (see below!)
- **🔒 Private Data Separation** - Family photos stay in `private/`, never committed to git
- **🌐 Dual Deployment Modes** - Open (self-service) and Private (preloaded family photos)
- **🐍 Python Eval CLI** - Standalone evaluation tools for batch processing

## Quick Start

```bash
# Clone the repo
git clone https://github.com/palladius/character-consistency-studio-2026.git
cd character-consistency-studio-2026

# Install dependencies
npm install

# Set your Gemini API key
export GEMINI_API_KEY='your-api-key-here'

# Start the dev server
npm run dev
```

Get your Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## Architecture

```
character-consistency-studio-2026/
|-- src/                  # React/TypeScript frontend
|   |-- components/       # UI components
|   |-- hooks/            # Custom React hooks
|   |-- services/         # Gemini API integration
|   `-- types/            # TypeScript type definitions
|-- eval/                 # Python CLI evaluation tools
|   |-- evaluate_reference_photos.py
|   |-- eval_single_model.py
|   `-- llm_judge.py
|-- conductor/            # Conductor SDD artifacts
|-- data/characters/      # Public demo character data
|-- private/              # Gitignored: family photos & local configs
|-- Justfile              # Task runner recipes
`-- .env.dist             # Environment variable template
```

**Frontend**: React + TypeScript + Vite -- modern SPA with responsive design.

**Eval CLI**: Python scripts using `uv` for dependency management. Supports batch
evaluation of generated images against reference photos using LLM-as-Judge.

## Deployment Modes

### Open / Public (Default)

Self-service mode where users bring their own Gemini API key.

- Users paste their API key in the UI
- No preloaded characters -- users upload their own photos
- Safe for public deployment on Cloud Run
- Set `DEPLOY_MODE=open` in `.env`

### Private / Family (Preloaded)

For personal/family use with preloaded reference photos.

- Reference photos pre-loaded from GCS or local `private/` folder
- Security through obscure Cloud Run URL (no auth required)
- Family members can generate images without uploading photos
- Set `DEPLOY_MODE=preloaded` in `.env`

## The Benigni Easter Egg 🤡

When the AI judge scores your generated image **below 6.0**, Roberto Benigni appears
(from *Johnny Stecchino*) to tell you:

> **"Nun me somijjia penniente!"**
>
> *(Sicilian for "It doesn't look like me at all!")*

Because if the character consistency is that bad, you deserve a laugh.

## Predecessor Repos

This project is the culmination of 5 predecessor repos:

1. [palladius/genai-googlecloud-scripts](https://github.com/palladius/genai-googlecloud-scripts) - Original GenAI experiments
2. [palladius/gemini-tools](https://github.com/palladius/gemini-tools) - Python eval CLI tools
3. [palladius/character-consistency-studio](https://github.com/palladius/character-consistency-studio) - First React prototype
4. [palladius/media-arneis](https://github.com/palladius/media-arneis) - Character photo management
5. [palladius/aia-ccs](https://github.com/palladius/aia-ccs) - Agent-in-Action Character Consistency experiments

## Credits

Built with :heart: by [Riccardo Carlesso](https://github.com/palladius) using
[Google Gemini](https://deepmind.google/technologies/gemini/),
[Antigravity](https://github.com/google/anthropic-antigravity),
and an unreasonable amount of espresso.

## License

[Apache License 2.0](LICENSE) -- see [LICENSE](LICENSE) for details.
