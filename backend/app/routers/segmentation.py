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

@router.post("/threshold")
async def threshold(file: UploadFile = File(...), thresh_val: int = Form(127)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    _, binary = cv2.threshold(img, thresh_val, 255, cv2.THRESH_BINARY)
    return JSONResponse({"result": encode_image(binary), "original": encode_image(img)})

@router.post("/otsu")
async def otsu_threshold(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    _, binary = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return JSONResponse({"result": encode_image(binary), "original": encode_image(img)})
