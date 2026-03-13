# DIP Toolkit Backend

## Recommended start command (Windows PowerShell)

```powershell
cd backend
.\start_backend.ps1
```

This script:
- uses `backend\venv\Scripts\python.exe`
- installs `requirements.txt`
- starts uvicorn at `http://127.0.0.1:8000`

## API endpoints

The FastAPI application exposes several groups of image processing endpoints under `/api`:

- `/api/health` – simple health check.
- `/api/fundamentals/*` – sampling, quantization, bit‑plane, resolution, histograms, pixel values, interpolation, etc.
- `/api/enhance/*` – smoothing, sharpening, histogram operations.
- `/api/frequency/*` – Fourier transforms, low/high‑pass, band‑pass/stop, Gaussian and Butterworth filters.
- `/api/restore/*` – denoising, noise injection, spatial filters, motion blur, Wiener.
- `/api/color/*` – saturation boost, pseudo‑color, HSV masking.
- `/api/segment/*` – global and Otsu thresholding.
- `/api/morphological/*` – erode, dilate, open, close.

Each endpoint is a POST that expects a `file` field containing an image and, when applicable, additional form fields such as `radius`, `ksize`, `sigma`, etc. Responses are JSON with an encoded PNG result (and sometimes metadata).

You can test quickly with `curl`:

```powershell
curl -F "file=@input.png" http://127.0.0.1:8000/api/restore/denoise
```

## Why your `cv2` error happened

You started uvicorn with global Python, not the backend virtual environment.  
`opencv-python-headless` (module `cv2`) is installed in the project venv, so run backend via the script above or:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
