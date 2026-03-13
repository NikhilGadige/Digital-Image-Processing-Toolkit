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


def _to_uint8(img):
    return np.clip(img, 0, 255).astype(np.uint8)


@router.post("/saturation-boost")
async def saturation_boost(file: UploadFile = File(...), boost: int = Form(25)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    safe_boost = max(0, min(120, boost))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    s = cv2.add(s, safe_boost)
    out = cv2.cvtColor(cv2.merge([h, s, v]), cv2.COLOR_HSV2BGR)

    return JSONResponse({"result": encode_image(out), "original": encode_image(img), "meta": {"boost": safe_boost}})


@router.post("/pseudocolor")
async def pseudocolor(file: UploadFile = File(...), map_name: str = Form("jet")):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    cmap_lookup = {
        "jet": cv2.COLORMAP_JET,
        "hot": cv2.COLORMAP_HOT,
        "turbo": cv2.COLORMAP_TURBO,
        "viridis": cv2.COLORMAP_VIRIDIS,
    }
    cmap = cmap_lookup.get(map_name.lower(), cv2.COLORMAP_JET)
    out = cv2.applyColorMap(gray, cmap)

    return JSONResponse({"result": encode_image(out), "original": encode_image(img), "meta": {"map": map_name}})


@router.post("/hsv-mask")
async def hsv_mask(
    file: UploadFile = File(...),
    h_min: int = Form(0),
    h_max: int = Form(25),
    s_min: int = Form(70),
    s_max: int = Form(255),
    v_min: int = Form(60),
    v_max: int = Form(255),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower = np.array([max(0, min(179, h_min)), max(0, min(255, s_min)), max(0, min(255, v_min))], dtype=np.uint8)
    upper = np.array([max(0, min(179, h_max)), max(0, min(255, s_max)), max(0, min(255, v_max))], dtype=np.uint8)
    mask = cv2.inRange(hsv, lower, upper)
    out = cv2.bitwise_and(img, img, mask=mask)

    return JSONResponse({"result": encode_image(out), "original": encode_image(img)})


@router.post("/rgb-model")
async def rgb_model(file: UploadFile = File(...)):
    data = await file.read()
    img = decode_image(data)
    return JSONResponse({"result": encode_image(img), "original": encode_image(img), "meta": {"model": "RGB"}})


@router.post("/cmy-cmyk-model")
async def cmy_cmyk_model(file: UploadFile = File(...), mode: str = Form("cmy")):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

    c = 1.0 - rgb[:, :, 0]
    m = 1.0 - rgb[:, :, 1]
    y = 1.0 - rgb[:, :, 2]

    if mode.lower() == "cmyk":
        k = np.minimum(np.minimum(c, m), y)
        k_view = _to_uint8(k * 255)
        out = cv2.cvtColor(k_view, cv2.COLOR_GRAY2BGR)
        used = "CMYK-K"
    else:
        cmy = np.stack([c, m, y], axis=2)
        out_rgb = _to_uint8(cmy * 255)
        out = cv2.cvtColor(out_rgb, cv2.COLOR_RGB2BGR)
        used = "CMY"

    return JSONResponse({"result": encode_image(out), "original": encode_image(img), "meta": {"mode": used}})


@router.post("/hsv-hsi-model")
async def hsv_hsi_model(file: UploadFile = File(...), mode: str = Form("hsv")):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    if mode.lower() == "hsi":
        # Approximate HSI visualization using HSV hue/sat with intensity channel replacement
        bgr = img.astype(np.float32)
        intensity = np.mean(bgr, axis=2).astype(np.uint8)
        h, s, _ = cv2.split(hsv)
        hsi_like = cv2.merge([h, s, intensity])
        out = cv2.cvtColor(hsi_like, cv2.COLOR_HSV2BGR)
        used = "HSI-like"
    else:
        out = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        used = "HSV"

    return JSONResponse({"result": encode_image(out), "original": encode_image(img), "meta": {"mode": used}})


@router.post("/color-space-transform")
async def color_space_transform(file: UploadFile = File(...), target: str = Form("yuv")):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    t = target.lower()
    if t == "lab":
        conv = cv2.COLOR_BGR2LAB
    elif t == "ycrcb":
        conv = cv2.COLOR_BGR2YCrCb
    else:
        conv = cv2.COLOR_BGR2YUV
        t = "yuv"
    transformed = cv2.cvtColor(img, conv)
    out = cv2.cvtColor(transformed, cv2.COLOR_LAB2BGR) if t == "lab" else cv2.cvtColor(transformed, cv2.COLOR_YUV2BGR) if t == "yuv" else cv2.cvtColor(transformed, cv2.COLOR_YCrCb2BGR)
    return JSONResponse({"result": encode_image(out), "original": encode_image(img), "meta": {"target": t}})


@router.post("/channel-representation")
async def channel_representation(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    b, g, r = cv2.split(img)
    zb = np.zeros_like(b)
    r_view = cv2.merge([zb, zb, r])
    g_view = cv2.merge([zb, g, zb])
    b_view = cv2.merge([b, zb, zb])
    panel = np.hstack([r_view, g_view, b_view])
    return JSONResponse({"result": encode_image(panel), "original": encode_image(img)})


@router.post("/color-filter")
async def color_filter(
    file: UploadFile = File(...),
    method: str = Form("gaussian"),
    ksize: int = Form(5),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    k = max(1, int(ksize))
    if k % 2 == 0:
        k += 1
    m = method.lower()
    if m == "mean":
        out = cv2.blur(img, (k, k))
    elif m == "sharpen":
        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
        out = cv2.filter2D(img, -1, kernel)
    else:
        out = cv2.GaussianBlur(img, (k, k), 0)
        m = "gaussian"
    return JSONResponse({"result": encode_image(out), "original": encode_image(img), "meta": {"method": m, "ksize": k}})


@router.post("/color-edge")
async def color_edge(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    b, g, r = cv2.split(img.astype(np.float32))
    edges = np.zeros_like(b)
    for ch in [b, g, r]:
        gx = cv2.Sobel(ch, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(ch, cv2.CV_32F, 0, 1, ksize=3)
        mag = cv2.magnitude(gx, gy)
        edges = np.maximum(edges, mag)
    edge_img = _to_uint8(cv2.normalize(edges, None, 0, 255, cv2.NORM_MINMAX))
    out = cv2.applyColorMap(edge_img, cv2.COLORMAP_TURBO)
    return JSONResponse({"result": encode_image(out), "original": encode_image(img)})


@router.post("/color-segment-rgb")
async def color_segment_rgb(
    file: UploadFile = File(...),
    r: int = Form(200),
    g: int = Form(50),
    b: int = Form(50),
    threshold: float = Form(80.0),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data).astype(np.float32)
    target = np.array([b, g, r], dtype=np.float32)
    dist = np.sqrt(np.sum((img - target) ** 2, axis=2))
    mask = (dist <= max(1.0, float(threshold))).astype(np.uint8) * 255
    out = cv2.bitwise_and(_to_uint8(img), _to_uint8(img), mask=mask)
    return JSONResponse({"result": encode_image(out), "original": encode_image(_to_uint8(img))})


@router.post("/color-noise")
async def color_noise(
    file: UploadFile = File(...),
    noise_type: str = Form("gaussian"),
    amount: float = Form(20.0),
):
    data = await file.read()
    img = decode_image(data).astype(np.float32)
    a = max(0.0, float(amount))
    nt = noise_type.lower()

    if nt == "impulse":
        out = img.copy()
        density = min(1.0, a / 255.0)
        num = int(density * img.shape[0] * img.shape[1])
        ys = np.random.randint(0, img.shape[0], num)
        xs = np.random.randint(0, img.shape[1], num)
        out[ys, xs, :] = np.random.choice([0, 255], size=(num, 1))
    else:
        noise = np.random.normal(0, a, img.shape)
        out = img + noise
        nt = "gaussian"

    out = _to_uint8(out)
    return JSONResponse({"result": encode_image(out), "original": encode_image(_to_uint8(img)), "meta": {"noise_type": nt}})


@router.post("/vector-median")
async def vector_median(
    file: UploadFile = File(...),
    ksize: int = Form(3),
):
    data = await file.read()
    img = decode_image(data)
    k = max(3, int(ksize))
    if k % 2 == 0:
        k += 1
    pad = k // 2
    padded = np.pad(img, ((pad, pad), (pad, pad), (0, 0)), mode="reflect").astype(np.float32)
    out = np.zeros_like(img, dtype=np.uint8)

    for y in range(img.shape[0]):
        for x in range(img.shape[1]):
            patch = padded[y:y + k, x:x + k].reshape(-1, 3)
            # Select vector with minimum sum of distances to others
            diffs = patch[:, None, :] - patch[None, :, :]
            dist = np.sqrt(np.sum(diffs * diffs, axis=2))
            idx = np.argmin(np.sum(dist, axis=1))
            out[y, x] = _to_uint8(patch[idx])

    return JSONResponse({"result": encode_image(out), "original": encode_image(img), "meta": {"ksize": k}})


@router.post("/color-compression")
async def color_compression(file: UploadFile = File(...), quality: int = Form(55)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    y, cr, cb = cv2.split(ycrcb)

    # 4:2:0-style subsample and upsample chroma channels
    cr_small = cv2.resize(cr, (cr.shape[1] // 2, cr.shape[0] // 2), interpolation=cv2.INTER_AREA)
    cb_small = cv2.resize(cb, (cb.shape[1] // 2, cb.shape[0] // 2), interpolation=cv2.INTER_AREA)
    cr_up = cv2.resize(cr_small, (cr.shape[1], cr.shape[0]), interpolation=cv2.INTER_LINEAR)
    cb_up = cv2.resize(cb_small, (cb.shape[1], cb.shape[0]), interpolation=cv2.INTER_LINEAR)

    merged = cv2.merge([y, cr_up, cb_up])
    out = cv2.cvtColor(merged, cv2.COLOR_YCrCb2BGR)

    q = max(1, min(100, int(quality)))
    ok, enc = cv2.imencode(".jpg", out, [int(cv2.IMWRITE_JPEG_QUALITY), q])
    if ok:
        out = cv2.imdecode(enc, cv2.IMREAD_COLOR)

    return JSONResponse({"result": encode_image(out), "original": encode_image(img), "meta": {"quality": q}})
