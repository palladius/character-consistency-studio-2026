// =============================================================================
// Model Configuration
// =============================================================================
// Change these when Google releases new models or deprecates old ones.
// All model names in one place - never hardcoded in service files.

export const MODELS = {
  /** Primary model for character-consistent image generation (generateContent + IMAGE modality) */
  IMAGE_GENERATION: 'gemini-2.5-flash-preview-05-20',

  /** Imagen model for Quick Generate (generateImages API). Falls back to IMAGE_GENERATION if unavailable. */
  IMAGEN: 'imagen-4.0-generate-001',

  /** Model for auto-eval / LLM-as-Judge scoring (future Track 2) */
  EVAL_JUDGE: 'gemini-2.5-flash',

  /** Model for API key connection test */
  TEST_CONNECTION: 'gemini-2.0-flash',
} as const;

/** Known-working models for image generation (autocomplete suggestions). First = default. */
export const KNOWN_IMAGE_MODELS = [
  { id: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash (default)', description: 'Fast, good quality. Best balance of speed and consistency.' },
  { id: 'gemini-2.5-pro-preview-05-20', label: 'Gemini 2.5 Pro', description: 'Higher quality, slower. Best for important generations.' },
  { id: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Exp', description: 'Experimental. Try if 2.5 is unavailable.' },
] as const;

/** localStorage key for user-selected model */
export const LS_SELECTED_MODEL = 'ccs_selected_model';

// =============================================================================
// Cost Configuration
// =============================================================================

export const TOKEN_COSTS = {
  INPUT_PER_MILLION_USD: 0.15,
  OUTPUT_PER_MILLION_USD: 0.60,
} as const;

// =============================================================================
// App Configuration
// =============================================================================

export const APP = {
  NAME: 'Character Consistency Studio 2026',
  VERSION: '2.0.0',
  REPO_URL: 'https://github.com/palladius/character-consistency-studio-2026',
} as const;
