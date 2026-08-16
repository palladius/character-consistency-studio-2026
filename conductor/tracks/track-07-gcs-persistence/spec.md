# Track 7: GCS Image Persistence

## Overview

Add optional Google Cloud Storage (GCS) persistence so that generated images, reference photos, eval results, and character metadata are automatically backed up to a GCS bucket. The architecture follows the "Optional Sidecar" pattern: the frontend stays a pure SPA, and a tiny Cloud Run backend handles GCS I/O when present. Public users never see or need it; Riccardo's private deployment gets it automatically via environment variables.

## Functional Requirements

### FR-1: GCS Sidecar API (Cloud Run)

A minimal Express.js service running on the same Cloud Run instance (or as a separate service) with two primary endpoints:

- **`POST /api/upload`**: Accepts an image (base64 or multipart), character name, prompt, and metadata. Writes to GCS with the structured path pattern.
- **`GET /api/gallery/{character_name}`**: Returns a JSON array of all stored images for a character, including signed URLs for thumbnails and full-size images.
- **`GET /api/health`**: Returns `{ "status": "ok", "bucket": "...", "gcs_available": true }`.

Authentication: Application Default Credentials (ADC). The Cloud Run service account has `roles/storage.objectAdmin` on the bucket.

Configuration via environment variables:
- `GCS_BUCKET`: Bucket name (e.g., `ccs-2026-riccardo-pvt`)
- `GCS_PREFIX`: Optional path prefix (default: empty)
- `GCS_ENABLED`: Boolean flag (default: `true` if `GCS_BUCKET` is set)

### FR-2: GCS Path Structure

```
gs://{GCS_BUCKET}/{GCS_PREFIX}/characters/{character_name}/
  references/
    {original_filename}
  generations/
    {YYYYMMDD}_{HHmmss}_{prompt_slug_max40chars}.png
    {YYYYMMDD}_{HHmmss}_{prompt_slug_max40chars}.metadata.json
  eval/
    eval_results.jsonl
  character.json   # Name, creation date, reference image list
```

Each `*.metadata.json` sidecar file contains:
```json
{
  "prompt": "Kate at a coffee shop in Rome",
  "model": "gemini-2.5-flash-image",
  "aspect_ratio": "1:1",
  "timestamp": "2026-08-16T18:51:00Z",
  "eval_score": 7.8,
  "parent_id": null,
  "usage_metadata": { ... }
}
```

### FR-3: Frontend GCS Integration (StorageService)

A new `src/services/storageService.ts` that:

1. **Auto-detects** the sidecar by probing `GET /api/health` on startup.
2. **Exposes** `isCloudStorageAvailable(): boolean` for the UI.
3. **Sync-on-generate**: After each successful image generation, fires a non-blocking `POST /api/upload` in the background. Retries once on failure, then logs a warning to console.
4. **Load-on-startup**: When sidecar is detected, fetches character galleries from GCS and merges them into the local React state (enabling cross-device access).
5. **UI indicator**: Shows a small cloud icon (syncing/synced/offline) in the sidebar when GCS is available.

### FR-4: What Gets Persisted

| Data Type | Persisted? | Trigger |
| :--- | :--- | :--- |
| Generated images | Yes | After each generation |
| Reference images | Yes | After upload |
| Eval results (JSONL) | Yes | After each eval |
| Character metadata | Yes | After creation/modification |

### FR-5: Graceful Degradation

- **Public version** (no sidecar): App works exactly as today. `isCloudStorageAvailable()` returns `false`. No GCS-related UI elements shown. Zero friction.
- **Private version** (with sidecar): Automatic persistence. Cloud sync icon visible. Gallery loads from GCS on startup.
- **Sidecar down**: If `/api/health` fails, fall back to local-only mode silently. Retry health check every 60 seconds.

## Non-Functional Requirements

- **NFR-1**: Upload must be fire-and-forget (non-blocking). User should never wait for GCS upload.
- **NFR-2**: Sidecar Docker image must be <50 MB (Alpine + Express + @google-cloud/storage).
- **NFR-3**: No secrets in the frontend. The sidecar uses ADC, never API keys.
- **NFR-4**: GCS bucket and all paths are configurable via env vars.

## Acceptance Criteria

1. With `GCS_BUCKET` set, generated images appear in the bucket within 5 seconds of generation.
2. With `GCS_BUCKET` set, refreshing the page reloads the gallery from GCS (cross-device persistence).
3. Without `GCS_BUCKET`, the app works identically to today (no errors, no GCS UI elements).
4. The sidecar responds to `GET /api/health` with correct bucket info.
5. Cloud sync icon shows syncing/synced/offline states accurately.

## Out of Scope

- User authentication (tracked separately in future GHI)
- Billing/quota management
- Multi-tenant bucket isolation
- GCS lifecycle policies (can be set manually via gsutil)
- Image CDN/caching layer
