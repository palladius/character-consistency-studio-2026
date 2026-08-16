# Product Guidelines

## Brand Identity

- **Name**: Character Consistency Studio 2026 (CC Studio)
- **Tagline**: "Same face, infinite worlds"
- **Personality**: Playful, technically rigorous, with Italian flair
- **Emoji Identity**: 🎭 (primary), 🎨 (creation), 🔬 (eval), 🎬 (Benigni effect)

## Voice & Tone

### Public-Facing
- **Warm and approachable**: Like explaining AI to a smart friend over espresso
- **Developer-friendly**: Clear API references, no hand-waving about how things work
- **Multilingual touches**: Occasional Italian expressions are welcome (but always with context)
- **Self-deprecating humor**: The Benigni easter egg sets the tone - we don't take ourselves too seriously

### Technical Documentation
- **Direct and concrete**: Show, don't tell. Code examples > prose
- **Gitmoji-flavored**: Commit messages and changelogs use gitmoji
- **Honest about limitations**: If the eval says "nun me somijjia penniente", we own it

## UX Principles

1. **Zero-friction onboarding**: The app must be usable within 60 seconds of landing. Show a demo gallery even without an API key.
2. **API key transparency**: Always show clearly whether a Gemini API key is configured. Never hide controls - grey them out with a tooltip explaining why.
3. **Progressive disclosure**: Start simple (upload photos, type prompt, generate). Advanced features (eval details, aspect ratios, history) reveal on demand.
4. **Delight through feedback**: Every generated image gets an eval score. High scores get celebration, low scores get Benigni. The UX should make evaluation fun, not punitive.
5. **Mobile-responsive**: The app must work well on phones (people take reference photos on their phones).

## Visual Design

- **Theme**: Dark mode primary (slate-800/900 backgrounds), warm yellow accents (amber/yellow-400)
- **Typography**: Google Sans Text (matching current deployed version)
- **Cards**: Rounded corners, subtle hover animations with scale transforms
- **Color Coding for Eval Scores**:
  - Green (>= 7.5): "EXCELLENT" / "GOLDEN_KEEP"
  - Yellow (>= 6.0): "GOOD" / "ACCEPTABLE"
  - Red (< 6.0): "POOR" / triggers Benigni overlay

## Content Guidelines

- **No smart/curly quotes**: Straight quotes only (' and "). We are developers, not Medium writers.
- **Dates**: ISO 8601 format (YYYY-MM-DD) in code, human-readable in UI
- **File naming**: snake_case for code files, kebab-case for docs/markdown
- **Comments**: English in code, Italian welcome in user-facing strings and easter eggs

## Accessibility

- All images must have alt text (generated from prompts)
- Eval score badges must be accessible via screen readers
- Keyboard navigation for the image modal (arrow keys, Escape, Delete already implemented)
- Sufficient color contrast for score badges on dark backgrounds
