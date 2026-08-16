# Implementation Plan: GCS Image Persistence

## Phase 1: Sidecar Backend Service

- [ ] Task: Create `sidecar/` directory with Express.js project scaffold
  - [ ] `sidecar/package.json` (express, @google-cloud/storage, cors, multer)
  - [ ] `sidecar/tsconfig.json`
  - [ ] `sidecar/src/index.ts` (Express app entry)
  - [ ] `sidecar/Dockerfile` (node:20-alpine, <50MB)

- [ ] Task: Write tests for sidecar endpoints
  - [ ] `sidecar/tests/health.test.ts` - GET /api/health returns bucket info
  - [ ] `sidecar/tests/upload.test.ts` - POST /api/upload stores to GCS (mocked)
  - [ ] `sidecar/tests/gallery.test.ts` - GET /api/gallery/:character returns image list

- [ ] Task: Implement `GET /api/health` endpoint
  - [ ] Read `GCS_BUCKET` from env
  - [ ] Return `{ status: "ok", bucket, gcs_available: true }`
  - [ ] Return `{ status: "error", gcs_available: false }` if no bucket configured

- [ ] Task: Implement `POST /api/upload` endpoint
  - [ ] Accept JSON body: `{ character, type, fileName, data (base64), metadata }`
  - [ ] Build GCS path: `characters/{character}/{type}/{YYYYMMDD}_{HHmmss}_{slug}.{ext}`
  - [ ] Upload image bytes to GCS
  - [ ] Write sidecar `*.metadata.json`
  - [ ] Return `{ url, path, metadata_path }`

- [ ] Task: Implement `GET /api/gallery/:character` endpoint
  - [ ] List objects in `characters/{character}/generations/`
  - [ ] Generate signed URLs (1 hour expiry) for each image
  - [ ] Return JSON array with `{ url, path, metadata, timestamp }`
  - [ ] Also include `references/` listing

- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Frontend StorageService

- [ ] Task: Write tests for StorageService
  - [ ] `src/services/__tests__/storageService.test.ts`
  - [ ] Test auto-detection (mock fetch /api/health)
  - [ ] Test upload (mock POST /api/upload)
  - [ ] Test gallery load (mock GET /api/gallery)
  - [ ] Test graceful fallback when sidecar unavailable

- [ ] Task: Implement `src/services/storageService.ts`
  - [ ] `detectSidecar()` - probe GET /api/health, cache result
  - [ ] `isCloudStorageAvailable()` - returns cached detection result
  - [ ] `uploadToCloud(character, type, fileName, base64Data, metadata)` - fire-and-forget POST
  - [ ] `loadGallery(characterName)` - fetch gallery from sidecar
  - [ ] Retry logic: 1 retry on failure, then log warning
  - [ ] Health re-check: retry detection every 60 seconds

- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: Frontend Integration

- [ ] Task: Write tests for cloud sync hook
  - [ ] `src/hooks/__tests__/useCloudSync.test.ts`

- [ ] Task: Implement `src/hooks/useCloudSync.ts`
  - [ ] On mount: call `detectSidecar()`
  - [ ] Expose `isCloudAvailable`, `syncStatus` ('syncing' | 'synced' | 'offline')
  - [ ] `syncImage(character, type, fileName, base64, metadata)` - calls uploadToCloud
  - [ ] Track pending uploads count for sync indicator

- [ ] Task: Integrate cloud sync into image generation flow
  - [ ] After `generateWithCharacter()` succeeds in Workspace.tsx, call `syncImage()`
  - [ ] After `generateImage()` succeeds in StandaloneGenerator, call `syncImage()`
  - [ ] After reference image upload in ImageGrid.tsx, call `syncImage()`

- [ ] Task: Integrate GCS gallery loading on startup
  - [ ] In `useCharacterManager.ts`: if cloud available, fetch galleries and merge into state
  - [ ] Deduplicate: skip images already in local state (by filename or hash)

- [ ] Task: Add cloud sync UI indicator to Sidebar
  - [ ] Cloud icon with status: syncing (rotating), synced (checkmark), offline (hidden)
  - [ ] Show pending upload count badge when syncing

- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 4: Deployment & Documentation

- [ ] Task: Create GCS bucket setup script
  - [ ] `scripts/setup-gcs.sh` - creates bucket, sets CORS, sets lifecycle
  - [ ] Use `gsutil` or `gcloud storage` commands
  - [ ] Default bucket name: `ccs-2026-{PROJECT_ID}`

- [ ] Task: Update deploy/Dockerfile for dual-service mode
  - [ ] Multi-stage build: frontend (nginx) + sidecar (node)
  - [ ] Or: separate Dockerfiles for frontend and sidecar

- [ ] Task: Update `.env.dist` with GCS configuration
  - [ ] Add `GCS_BUCKET`, `GCS_PREFIX`, `SIDECAR_URL` vars with documentation

- [ ] Task: Update `tech-stack.md` with GCS/sidecar addition

- [ ] Task: Update README.md with GCS setup instructions

- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)
