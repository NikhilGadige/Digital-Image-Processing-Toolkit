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

@router.post("/erode")
async def erode(file: UploadFile = File(...), ksize: int = Form(5)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    kernel = np.ones((ksize, ksize), np.uint8)
    result = cv2.erode(img, kernel, iterations=1)
    return JSONResponse({"result": encode_image(result), "original": encode_image(img)})

@router.post("/dilate")
async def dilate(file: UploadFile = File(...), ksize: int = Form(5)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    kernel = np.ones((ksize, ksize), np.uint8)
    result = cv2.dilate(img, kernel, iterations=1)
    return JSONResponse({"result": encode_image(result), "original": encode_image(img)})

@router.post("/opening")
async def opening(file: UploadFile = File(...), ksize: int = Form(5)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    kernel = np.ones((ksize, ksize), np.uint8)
    result = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)
    return JSONResponse({"result": encode_image(result), "original": encode_image(img)})

@router.post("/closing")
async def closing(file: UploadFile = File(...), ksize: int = Form(5)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    kernel = np.ones((ksize, ksize), np.uint8)
    result = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)
    return JSONResponse({"result": encode_image(result), "original": encode_image(img)})
