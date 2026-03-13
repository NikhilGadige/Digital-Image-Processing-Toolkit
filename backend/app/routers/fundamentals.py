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


@router.post("/sampling-quantization")
async def sampling_quantization(
    file: UploadFile = File(...),
    downsample_factor: int = Form(4),
    levels: int = Form(16),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    factor = max(1, min(16, downsample_factor))
    q_levels = max(2, min(256, levels))

    small = cv2.resize(
        img,
        (max(1, img.shape[1] // factor), max(1, img.shape[0] // factor)),
        interpolation=cv2.INTER_AREA,
    )
    sampled = cv2.resize(small, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)

    step = max(1, 256 // q_levels)
    quantized = (sampled // step) * step

    return JSONResponse(
        {
            "result": encode_image(quantized.astype(np.uint8)),
            "original": encode_image(img),
            "meta": {"downsample_factor": factor, "levels": q_levels},
        }
    )

@router.post("/bit-plane")
async def bit_plane(
    file: UploadFile = File(...),
    plane: int = Form(7),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    p = max(0, min(7, plane))
    bit = ((img >> p) & 1) * 255

    return JSONResponse(
        {
            "result": encode_image(bit.astype(np.uint8)),
            "original": encode_image(img),
            "meta": {"bit_plane": p},
        }
    )

@router.post("/gray-level-reduction")
async def gray_level_reduction(
    file: UploadFile = File(...),
    levels: int = Form(8),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    q_levels = max(2, min(256, levels))
    step = 256 // q_levels
    reduced = (img // step) * step

    return JSONResponse(
        {
            "result": encode_image(reduced.astype(np.uint8)),
            "original": encode_image(img),
            "meta": {"levels": q_levels},
        }
    )

@router.post("/reduce-resolution")
async def reduce_resolution(
    file: UploadFile = File(...),
    factor: int = Form(2),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    f = max(1, min(16, factor))

    small = cv2.resize(
        img,
        (img.shape[1] // f, img.shape[0] // f),
        interpolation=cv2.INTER_AREA,
    )

    reduced = cv2.resize(
        small,
        (img.shape[1], img.shape[0]),
        interpolation=cv2.INTER_NEAREST,
    )

    return JSONResponse(
        {
            "result": encode_image(reduced),
            "original": encode_image(img),
            "meta": {"factor": f},
        }
    )

@router.post("/histogram")
async def histogram(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    hist = cv2.calcHist([img], [0], None, [256], [0, 256])
    hist = hist.flatten().tolist()

    return JSONResponse(
        {
            "histogram": hist,
            "original": encode_image(img),
        }
    )


@router.post("/pixel-value")
async def pixel_value(
    file: UploadFile = File(...),
    x: int = Form(...),
    y: int = Form(...),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    h, w = img.shape

    px = max(0, min(w - 1, x))
    py = max(0, min(h - 1, y))

    value = int(img[py, px])

    return JSONResponse(
        {
            "pixel": {"x": px, "y": py},
            "value": value,
        }
    )

@router.post("/interpolation-compare")
async def interpolation_compare(
    file: UploadFile = File(...),
    scale: float = Form(2.0),
    method: str = Form("linear"),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    safe_scale = max(1.2, min(6.0, scale))
    method_map = {
        "nearest": cv2.INTER_NEAREST,
        "linear": cv2.INTER_LINEAR,
        "cubic": cv2.INTER_CUBIC,
    }
    interpolation = method_map.get(method.lower(), cv2.INTER_LINEAR)
    out = cv2.resize(img, None, fx=safe_scale, fy=safe_scale, interpolation=interpolation)

    return JSONResponse(
        {
            "result": encode_image(out),
            "original": encode_image(img),
            "meta": {"scale": safe_scale, "method": method.lower()},
        }
    )
