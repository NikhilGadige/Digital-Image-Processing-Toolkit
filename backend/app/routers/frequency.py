from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
import base64
import numpy as np
from app.routers._deps import get_cv2

router = APIRouter()


def encode_image(img):
    cv2 = get_cv2()
    _, buf = cv2.imencode(".png", img)
    return base64.b64encode(buf).decode("utf-8")


def decode_image(data: bytes):
    cv2 = get_cv2()
    arr = np.frombuffer(data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)


def fft_image(img):
    f = np.fft.fft2(img)
    return np.fft.fftshift(f)


def ifft_image(freq):
    restored = np.fft.ifft2(np.fft.ifftshift(freq))
    return np.abs(restored).astype(np.uint8)

@router.post("/fft-spectrum")
async def fft_spectrum(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    fshift = fft_image(img)
    magnitude = 20 * np.log(np.abs(fshift) + 1)

    magnitude = cv2.normalize(magnitude, None, 0, 255, cv2.NORM_MINMAX)

    return JSONResponse({
        "result": encode_image(magnitude.astype(np.uint8)),
        "original": encode_image(img)
    })

@router.post("/band-pass")
async def band_pass(
    file: UploadFile = File(...),
    r1: int = Form(20),
    r2: int = Form(60)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    fshift = fft_image(img)

    rows, cols = img.shape
    crow, ccol = rows // 2, cols // 2

    mask = np.zeros((rows, cols), np.float32)
    cv2.circle(mask, (ccol, crow), r2, 1, -1)
    cv2.circle(mask, (ccol, crow), r1, 0, -1)

    filtered = fshift * mask
    out = ifft_image(filtered)

    return JSONResponse({
        "result": encode_image(out),
        "original": encode_image(img),
        "meta": {"inner": r1, "outer": r2}
    })

@router.post("/band-reject")
async def band_reject(
    file: UploadFile = File(...),
    r1: int = Form(20),
    r2: int = Form(60)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    fshift = fft_image(img)

    rows, cols = img.shape
    crow, ccol = rows // 2, cols // 2

    mask = np.ones((rows, cols), np.float32)
    cv2.circle(mask, (ccol, crow), r2, 0, -1)
    cv2.circle(mask, (ccol, crow), r1, 1, -1)

    filtered = fshift * mask
    out = ifft_image(filtered)

    return JSONResponse({
        "result": encode_image(out),
        "original": encode_image(img),
        "meta": {"inner": r1, "outer": r2}
    })

@router.post("/gaussian-low-pass")
async def gaussian_low_pass(
    file: UploadFile = File(...),
    sigma: float = Form(30)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    fshift = fft_image(img)

    rows, cols = img.shape
    crow, ccol = rows // 2, cols // 2

    x = np.arange(cols)
    y = np.arange(rows)
    X, Y = np.meshgrid(x, y)

    D = np.sqrt((X - ccol)**2 + (Y - crow)**2)
    mask = np.exp(-(D**2) / (2 * sigma**2))

    filtered = fshift * mask
    out = ifft_image(filtered)

    return JSONResponse({
        "result": encode_image(out),
        "original": encode_image(img),
        "meta": {"sigma": sigma}
    })

@router.post("/gaussian-high-pass")
async def gaussian_high_pass(
    file: UploadFile = File(...),
    sigma: float = Form(30)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    fshift = fft_image(img)

    rows, cols = img.shape
    crow, ccol = rows // 2, cols // 2

    x = np.arange(cols)
    y = np.arange(rows)
    X, Y = np.meshgrid(x, y)

    D = np.sqrt((X - ccol)**2 + (Y - crow)**2)
    mask = 1 - np.exp(-(D**2) / (2 * sigma**2))

    filtered = fshift * mask
    out = ifft_image(filtered)

    return JSONResponse({
        "result": encode_image(out),
        "original": encode_image(img),
        "meta": {"sigma": sigma}
    })

@router.post("/butterworth-low-pass")
async def butterworth_low_pass(
    file: UploadFile = File(...),
    d0: int = Form(40),
    n: int = Form(2)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    fshift = fft_image(img)

    rows, cols = img.shape
    crow, ccol = rows // 2, cols // 2

    x = np.arange(cols)
    y = np.arange(rows)
    X, Y = np.meshgrid(x, y)

    D = np.sqrt((X - ccol)**2 + (Y - crow)**2)

    mask = 1 / (1 + (D / d0)**(2*n))

    filtered = fshift * mask
    out = ifft_image(filtered)

    return JSONResponse({
        "result": encode_image(out),
        "original": encode_image(img),
        "meta": {"cutoff": d0, "order": n}
    })

@router.post("/butterworth-high-pass")
async def butterworth_high_pass(
    file: UploadFile = File(...),
    d0: int = Form(40),
    n: int = Form(2)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    fshift = fft_image(img)

    rows, cols = img.shape
    crow, ccol = rows // 2, cols // 2

    x = np.arange(cols)
    y = np.arange(rows)
    X, Y = np.meshgrid(x, y)

    D = np.sqrt((X - ccol)**2 + (Y - crow)**2)

    mask = 1 - (1 / (1 + (D / d0)**(2*n)))

    filtered = fshift * mask
    out = ifft_image(filtered)

    return JSONResponse({
        "result": encode_image(out),
        "original": encode_image(img),
        "meta": {"cutoff": d0, "order": n}
    })

@router.post("/low-pass")
async def low_pass(file: UploadFile = File(...), radius: int = Form(35)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    fshift = fft_image(img)

    r = max(5, min(min(img.shape) // 2, radius))
    rows, cols = img.shape
    crow, ccol = rows // 2, cols // 2

    mask = np.zeros((rows, cols), np.float32)
    cv2.circle(mask, (ccol, crow), r, 1, -1)
    filtered = fshift * mask
    out = ifft_image(filtered)

    return JSONResponse({"result": encode_image(out), "original": encode_image(img), "meta": {"radius": r}})


@router.post("/high-pass")
async def high_pass(file: UploadFile = File(...), radius: int = Form(30)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    fshift = fft_image(img)

    r = max(3, min(min(img.shape) // 2, radius))
    rows, cols = img.shape
    crow, ccol = rows // 2, cols // 2

    mask = np.ones((rows, cols), np.float32)
    cv2.circle(mask, (ccol, crow), r, 0, -1)
    filtered = fshift * mask
    out = ifft_image(filtered)

    return JSONResponse({"result": encode_image(out), "original": encode_image(img), "meta": {"radius": r}})


@router.post("/notch-reject")
async def notch_reject(
    file: UploadFile = File(...),
    u0: int = Form(30),
    v0: int = Form(30),
    radius: int = Form(8),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    fshift = fft_image(img)

    rows, cols = img.shape
    crow, ccol = rows // 2, cols // 2

    safe_u0 = max(0, min(cols // 2 - 1, abs(u0)))
    safe_v0 = max(0, min(rows // 2 - 1, abs(v0)))
    safe_radius = max(1, min(min(rows, cols) // 6, radius))

    notch1 = (ccol + safe_u0, crow + safe_v0)
    notch2 = (ccol - safe_u0, crow - safe_v0)

    mask = np.ones((rows, cols), np.float32)
    cv2.circle(mask, notch1, safe_radius, 0, -1)
    cv2.circle(mask, notch2, safe_radius, 0, -1)

    filtered = fshift * mask
    out = ifft_image(filtered)

    return JSONResponse({
        "result": encode_image(out),
        "original": encode_image(img),
        "meta": {"u0": safe_u0, "v0": safe_v0, "radius": safe_radius}
    })
