# Character Consistency Studio 2026

This is an AI-powered character consistency image generator.

## Project Structure
- `src/` - React/TypeScript frontend
- `eval/` - Python CLI evaluation tools
- `conductor/` - Conductor SDD artifacts (product definition, tech stack, etc.)
- `private/` - Gitignored folder for family photos and local configs
- `data/characters/` - Public demo character data

## Key Commands
- `just list` - Show all available tasks
- `just dev` - Start dev server
- `just test` - Run tests
- `just load-family` - Load family photos from GIC
- `just eval-refs <character>` - Evaluate reference photo quality

## Important
- NEVER commit anything in `private/` - it contains family photos
- NEVER write to `.env` - ask the user to update it
- Use gitmoji for commit messages
- Use SINGLE QUOTES in git commit -m '...'
