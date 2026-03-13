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
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

@router.post("/histogram-eq")
async def histogram_equalization(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    eq = cv2.equalizeHist(gray)
    return JSONResponse({"result": encode_image(eq), "original": encode_image(gray)})

@router.post("/negative")
async def negative_transform(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    negative = 255 - img

    return JSONResponse({
        "result": encode_image(negative),
        "original": encode_image(img)
    })

@router.post("/log-transform")
async def log_transform(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    img_float = img.astype(np.float32)
    log_img = np.log1p(img_float)

    log_img = cv2.normalize(log_img, None, 0, 255, cv2.NORM_MINMAX)
    log_img = np.uint8(log_img)

    return JSONResponse({
        "result": encode_image(log_img),
        "original": encode_image(img)
    })

@router.post("/gamma")
async def gamma_transform(
    file: UploadFile = File(...),
    gamma: float = Form(1.5)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    img_norm = img / 255.0
    gamma_img = np.power(img_norm, gamma)

    gamma_img = np.uint8(gamma_img * 255)

    return JSONResponse({
        "result": encode_image(gamma_img),
        "original": encode_image(img)
    })

@router.post("/median-filter")
async def median_filter(
    file: UploadFile = File(...),
    kernel: int = Form(5)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    k = kernel if kernel % 2 == 1 else kernel + 1
    median = cv2.medianBlur(img, k)

    return JSONResponse({
        "result": encode_image(median),
        "original": encode_image(img)
    })


@router.post("/laplacian")
async def laplacian_filter(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    lap = cv2.Laplacian(gray, cv2.CV_64F)
    lap = cv2.convertScaleAbs(lap)

    return JSONResponse({
        "result": encode_image(lap),
        "original": encode_image(gray)
    })

@router.post("/mean-filter")
async def mean_filter(
    file: UploadFile = File(...),
    kernel: int = Form(5)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    k = kernel if kernel % 2 == 1 else kernel + 1
    mean = cv2.blur(img, (k, k))

    return JSONResponse({
        "result": encode_image(mean),
        "original": encode_image(img)
    })

@router.post("/unsharp-mask")
async def unsharp_mask(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    blur = cv2.GaussianBlur(img, (5,5), 0)
    sharpen = cv2.addWeighted(img, 1.5, blur, -0.5, 0)

    return JSONResponse({
        "result": encode_image(sharpen),
        "original": encode_image(img)
    })

@router.post("/gaussian-blur")
async def gaussian_blur(file: UploadFile = File(...), kernel: int = Form(5)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    k = kernel if kernel % 2 == 1 else kernel + 1
    blurred = cv2.GaussianBlur(img, (k, k), 0)
    return JSONResponse({"result": encode_image(blurred), "original": encode_image(img)})

@router.post("/sharpen")
async def sharpen(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    sharpened = cv2.filter2D(img, -1, kernel)
    return JSONResponse({"result": encode_image(sharpened), "original": encode_image(img)})

@router.post("/edge-detect")
async def edge_detect(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    return JSONResponse({"result": encode_image(edges), "original": encode_image(gray)})
