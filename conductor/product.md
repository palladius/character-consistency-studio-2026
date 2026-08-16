# Character Consistency Studio 2026

## Vision

An AI-powered web application that generates consistent character images across different scenes and styles. Users upload 3-10 reference photos of a person, then generate new images maintaining that person's identity using Google Gemini's multimodal capabilities.

## Problem Statement

Generating AI images of a specific person that actually *look like them* across multiple scenes is hard. Existing tools either produce inconsistent results or require expensive fine-tuning. Character Consistency Studio solves this by leveraging Gemini's native multimodal understanding to maintain identity consistency from simple reference photos.

## Target Users

1. **Open/Public Users**: Anyone with a Gemini API key who wants to generate consistent character images (friends, colleagues, developers, content creators).
2. **Private/Family Users**: Pre-configured deployments with family photos already loaded for personal use (Riccardo's family edition).

## Core Features

### MVP (v2.0)
- **Character Management**: Create named characters, upload 3-10 reference photos per character
- **Image Generation**: Generate new images of a character in custom scenes/styles using Gemini 2.5 Flash Image + Imagen 4.0
- **Self-Service API Key**: Users provide their own Gemini API key (stored in localStorage, never server-side)
- **Read-Only Mode**: When no API key is available, the app shows a gallery/demo but disables generation
- **Auto-Eval (LLM Judge)**: Every generated image automatically receives a resemblance score (1-10) from a Gemini judge model
- **Eval Badge**: Color-coded score overlay on generated image thumbnails (green >= 7.5, yellow >= 6.0, red < 6.0)
- **Benigni "Johnny Stecchino" Effect**: Comic overlay when auto-eval score < 6.0, showing a caricature with Sicilian dialect text "Nun me somijjia penniente!"

### Post-MVP Features (tracked as GHIs)
- **Free Tier**: 5 free generations/day via backend proxy (no API key needed)
- **User Accounts**: Optional login to persist API key + uploaded images across sessions
- **Animated Benigni**: Generated nano-banana Benigni image + text-to-speech with Sicilian accent
- **Video Generation**: Animate generated images as short video clips
- **Negative Eval Tests**: Automated golden test suite with non-matching people (blonde non-Kate, Richard Gere for non-Riccardo)

## Deployment Modes

### Open (Public)
- Frontend-only, no backend required
- User provides their own Gemini API key via UI
- Deployable on any static hosting or Cloud Run
- No private data bundled

### Private (Riccardo Family Edition)
- Same codebase, different deployment config
- Pre-loaded with family character references from GCS bucket
- v1: Security by obscure URL
- v2: Password-protected ("nunmesomijjiapenniente")
- Private data lives in gitignored `private/` folder locally, GCS bucket for deployments

## Architecture Principles

- **Public repo, private data**: All code is open source. Family photos, API keys, and deployment secrets live in `.env` and `private/` (both gitignored).
- **Frontend-first**: The core app is a React SPA with no mandatory backend.
- **Eval-driven**: Every generated image gets an automatic quality score. The eval framework is both in-app and available as CLI tools.
- **Gitmoji commits**: All commits use gitmoji convention.

## Lineage

This project consolidates and evolves code from:
- [character-consistency-studio](https://github.com/palladius/character-consistency-studio) (Oct 2025) - Original Firebase Studio app
- [character-consistency-studio-on-gcp](https://github.com/palladius/character-consistency-studio-on-gcp) (Oct 2025) - GCP variant
- [pvt-character-consistency-riccardo](https://github.com/palladius/pvt-character-consistency-riccardo) (Nov 2025) - Private family photos & deploy notes
- [media-arneis](https://github.com/palladius/media-arneis) (Apr 2026) - CLI engine with `arnectl`
- `~/git/gemini-tools/` - Eval framework (LOO evaluator, LLM judge, JSONL dataset management)
