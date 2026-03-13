# Digital Image Processing Toolkit

A full-stack learning and experimentation platform for Digital Image Processing (DIP), built with a React frontend and a FastAPI backend.

The project combines:
- Guided chapter-based learning content
- Interactive image labs
- Real backend-powered image operations (OpenCV, NumPy, scikit-image, SciPy)
- Optional Firebase authentication and progress sync
- Exportable experiment code snippets to support learning-by-doing

## Table of Contents

1. [What This Project Does](#what-this-project-does)
2. [Core Features](#core-features)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Local Setup](#local-setup)
7. [Environment Variables](#environment-variables)
8. [Firebase Setup](#firebase-setup)
9. [Backend API Reference](#backend-api-reference)
10. [How the Learning Labs Work](#how-the-learning-labs-work)


## What This Project Does

This toolkit maps textbook-style DIP topics into hands-on modules. Users can upload an image, pick an operation, tune parameters, and view output instantly. For many operations, the app also provides reproducible Python snippets so learners can move from UI experimentation to code implementation.

Current module focus includes:
- Fundamentals of digital image representation
- Intensity and spatial filtering
- Frequency-domain filtering
- Image restoration
- Color image processing
- Morphological processing
- Segmentation

Some advanced chapter placeholders (feature extraction/classification tracks) are scaffolded in frontend data and can be expanded further.

## Core Features

- Chapter-based interactive learning flow
- Visualizer labs with file upload + parameter controls
- Backend API integrations for real image processing operations
- Fallback/local browser operations for selected demos
- API health checks and friendly network error handling
- Auth-aware experience:
  - Guest mode works without Firebase
  - Sign-up/sign-in when Firebase config is present
  - Progress sync to Firestore per user
- "Get Code" modal that exports runnable Python examples for selected experiments

## Architecture

```text
React + Vite frontend
    |
    | HTTP (multipart/form-data: image + params)
    v
FastAPI backend (/api/*)
    |
    | OpenCV / NumPy / SciPy / scikit-image
    v
Processed image result (base64 PNG) + metadata
```

Auth/progress path:

```text
Firebase Auth (optional) -> Firestore users/{uid}
```

If Firebase is not configured, the app remains usable in guest mode and stores progress locally.

## Tech Stack

### Frontend
- React 19 + Vite 7
- React Router
- Tailwind CSS
- Framer Motion
- Firebase JS SDK
- Three.js / React Three Fiber / Drei (available in dependencies)

### Backend
- FastAPI + Uvicorn
- OpenCV (headless)
- NumPy
- scikit-image
- SciPy
- Pillow
- imageio

## Project Structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- main.py
|   |   `-- routers/
|   |       |-- fundamentals.py
|   |       |-- enhancement.py
|   |       |-- frequency.py
|   |       |-- restoration.py
|   |       |-- color_processing.py
|   |       |-- segmentation.py
|   |       `-- morphological.py
|   |-- requirements.txt
|   `-- start_backend.ps1
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- data/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- utils/
|   `-- package.json
|-- firebase/
|   `-- firestore.rules
`-- README.md
```

## Local Setup

## 1) Start backend (Windows PowerShell)

```powershell
cd backend
.\start_backend.ps1
```

What this script does:
- Creates `backend/venv` if missing
- Installs `backend/requirements.txt`
- Starts FastAPI at `http://127.0.0.1:8000`

Manual backend alternative:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## 2) Start frontend

```powershell
cd frontend
npm install
npm run dev
```

Default Vite dev server is typically `http://127.0.0.1:5173`.

## 3) Verify system health

- Backend health endpoint: `GET http://127.0.0.1:8000/api/health`
- Frontend calls this endpoint to detect API availability

## Environment Variables

Create `frontend/.env` and set:

- `VITE_API_BASE_URL` (example: `http://127.0.0.1:8000`)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Notes:
- Firebase variables are optional for guest mode.
- If required Firebase keys are missing, auth/progress sync features are disabled gracefully.

## Firebase Setup

Enable in your Firebase project:
- Authentication -> Email/Password
- Firestore Database

Expected Firestore document:
- Collection: `users`
- Document ID: `{uid}`
- Fields:
  - `completedModules` (array)
  - `updatedAt` (timestamp)
  - `email` (string, optional)

Apply rules from `firebase/firestore.rules` so each user can only read/write their own document.

## Backend API Reference

Base URL: `http://127.0.0.1:8000`

Common behavior:
- Most endpoints are `POST`
- Request: `multipart/form-data` with `file` plus optional params
- Response: JSON with processed image data (base64 PNG) and optional metadata

### Health
- `GET /api/health`

### Fundamentals (`/api/fundamentals`)
- `/sampling-quantization`
- `/bit-plane`
- `/gray-level-reduction`
- `/reduce-resolution`
- `/histogram`
- `/pixel-value`
- `/interpolation-compare`

### Enhancement (`/api/enhance`)
- `/histogram-eq`
- `/negative`
- `/log-transform`
- `/gamma`
- `/median-filter`
- `/laplacian`
- `/mean-filter`
- `/unsharp-mask`
- `/gaussian-blur`
- `/sharpen`
- `/edge-detect`

### Frequency (`/api/frequency`)
- `/fft-spectrum`
- `/band-pass`
- `/band-reject`
- `/gaussian-low-pass`
- `/gaussian-high-pass`
- `/butterworth-low-pass`
- `/butterworth-high-pass`
- `/low-pass`
- `/high-pass`
- `/notch-reject`

### Restoration (`/api/restore`)
- `/denoise`
- `/add-gaussian-noise`
- `/add-salt-pepper-noise`
- `/mean-filter`
- `/gaussian-filter`
- `/wiener-filter`
- `/motion-blur`
- `/median-filter`
- `/degradation-model`
- `/noise-model`
- `/spatial-noise-filter`
- `/adaptive-local-filter`
- `/linear-degradation`
- `/estimate-psf`
- `/inverse-filter`
- `/cls-filter`
- `/geometric-mean-filter`
- `/radon-transform`
- `/fourier-slice`
- `/reconstruct-projections`

### Color Processing (`/api/color`)
- `/saturation-boost`
- `/pseudocolor`
- `/hsv-mask`
- `/rgb-model`
- `/cmy-cmyk-model`
- `/hsv-hsi-model`
- `/color-space-transform`
- `/channel-representation`
- `/color-filter`
- `/color-edge`
- `/color-segment-rgb`
- `/color-noise`
- `/vector-median`
- `/color-compression`

### Segmentation (`/api/segment`)
- `/threshold`
- `/otsu`

### Morphological (`/api/morphological`)
- `/erode`
- `/dilate`
- `/opening`
- `/closing`

## How the Learning Labs Work

The frontend lab engine (`ModuleLab`) supports:
- Selecting an experiment per module
- Uploading an image
- Supplying one or multiple parameters
- Running either:
  - `type: "api"` operations against FastAPI
  - local in-browser operations (`localImageOps.js`)
- Showing input/output side-by-side
- Opening a "Get Code" modal with Python snippets matching the experiment

This makes the project useful both for visual intuition and for code-first assignments.

## Troubleshooting

Backend import errors (`cv2` not found):
- Run backend with the project venv (`backend/start_backend.ps1`), not global Python.

Frontend says API offline:
- Ensure backend is running at `VITE_API_BASE_URL`.
- Confirm `/api/health` returns `{"status":"ok"}`.

Auth not working:
- Verify all required `VITE_FIREBASE_*` values.
- Enable Email/Password sign-in in Firebase console.

Progress not syncing:
- Confirm Firestore rules and `users/{uid}` document permissions.


## Security and Repository Hygiene

Before publishing or pushing:
- Do not commit `.env` files with real credentials.
- Keep all `.env*` files out of version control.
- Exclude local artifacts:
  - Python virtual environments (`backend/venv/`)
  - `node_modules/`
  - build outputs (`dist/`, `.next/`, etc.)
  - caches (`__pycache__/`, `.pytest_cache/`)

Recommended `.gitignore` baseline for this repo:

```gitignore
# Environment files
.env
.env.*

# Frontend
frontend/node_modules/
frontend/dist/

# Backend
backend/venv/
backend/__pycache__/
backend/app/__pycache__/
**/__pycache__/
*.pyc

# OS/editor noise
.DS_Store
Thumbs.db
.vscode/
```

If secrets were ever committed, rotate them and clean git history before open-sourcing.

---

If you want, this README can be extended next with:
- request/response schema examples per endpoint
- animated screenshots/GIF walkthroughs
- Dockerized one-command setup
