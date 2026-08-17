// =============================================================================
// Model Configuration
// =============================================================================
// Change these when Google releases new models or deprecates old ones.
// All model names in one place - never hardcoded in service files.

export const MODELS = {
  /** Primary model for character-consistent image generation (generateContent + IMAGE modality) */
  IMAGE_GENERATION: 'gemini-2.5-flash-image',

  /** Imagen model for Quick Generate (generateImages API). Falls back to IMAGE_GENERATION if unavailable. */
  IMAGEN: 'imagen-4.0-generate-001',

  /** Model for auto-eval / LLM-as-Judge scoring (future Track 2) */
  EVAL_JUDGE: 'gemini-2.5-flash',

  /** Model for API key connection test */
  TEST_CONNECTION: 'gemini-2.0-flash',
} as const;

/** Known-working models for image generation (autocomplete suggestions). First = default. */
export const KNOWN_IMAGE_MODELS = [
  { id: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image (default)', description: 'Fast, good quality. Best balance of speed and consistency.' },
  { id: 'gemini-3.1-flash-image', label: 'Gemini 3.1 Flash Image', description: 'Latest generation. Try for newest capabilities.' },
  { id: 'gemini-3-pro-image', label: 'Gemini 3 Pro Image', description: 'Higher quality, slower. Best for important generations.' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', description: 'Newest model. Experimental image support.' },
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
