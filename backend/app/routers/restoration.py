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


def _safe_odd(value: int, minimum: int = 1):
    k = max(minimum, int(value))
    return k if k % 2 == 1 else k + 1


def _motion_kernel(size: int):
    s = _safe_odd(size, 3)
    kernel = np.zeros((s, s), dtype=np.float32)
    kernel[(s - 1) // 2, :] = 1.0
    kernel /= np.sum(kernel)
    return kernel


def _pad_kernel_to_image(kernel: np.ndarray, shape):
    h, w = shape
    kh, kw = kernel.shape
    padded = np.zeros((h, w), dtype=np.float32)
    padded[:kh, :kw] = kernel
    return np.fft.fft2(np.fft.ifftshift(padded))


def _radon_sinogram(img: np.ndarray, num_angles: int = 90):
    cv2 = get_cv2()
    h, w = img.shape
    center = (w / 2, h / 2)
    angles = np.linspace(0, 180, num_angles, endpoint=False)
    sinogram = np.zeros((num_angles, w), dtype=np.float32)

    for i, angle in enumerate(angles):
        m = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        sinogram[i, :] = np.sum(rotated, axis=0)

    return angles, sinogram

@router.post("/denoise")
async def denoise(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    denoised = cv2.fastNlMeansDenoising(img, h=10)
    return JSONResponse({"result": encode_image(denoised), "original": encode_image(img)})

@router.post("/add-gaussian-noise")
async def add_gaussian_noise(
    file: UploadFile = File(...),
    mean: float = Form(0.0),
    sigma: float = Form(20.0)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    noise = np.random.normal(mean, sigma, img.shape)
    noisy = img + noise
    noisy = np.clip(noisy, 0, 255).astype(np.uint8)

    return JSONResponse({
        "result": encode_image(noisy),
        "original": encode_image(img),
        "meta": {"mean": mean, "sigma": sigma}
    })

@router.post("/add-salt-pepper-noise")
async def add_salt_pepper_noise(
    file: UploadFile = File(...),
    amount: float = Form(0.02)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    noisy = img.copy()

    num_salt = int(amount * img.size / 2)
    num_pepper = int(amount * img.size / 2)

    coords = [
        np.random.randint(0, i - 1, num_salt)
        for i in img.shape
    ]
    noisy[coords[0], coords[1]] = 255

    coords = [
        np.random.randint(0, i - 1, num_pepper)
        for i in img.shape
    ]
    noisy[coords[0], coords[1]] = 0

    return JSONResponse({
        "result": encode_image(noisy),
        "original": encode_image(img)
    })

@router.post("/mean-filter")
async def mean_filter(
    file: UploadFile = File(...),
    ksize: int = Form(5)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    k = ksize if ksize % 2 == 1 else ksize + 1
    filtered = cv2.blur(img, (k, k))

    return JSONResponse({
        "result": encode_image(filtered),
        "original": encode_image(img)
    })

@router.post("/gaussian-filter")
async def gaussian_filter(
    file: UploadFile = File(...),
    ksize: int = Form(5)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    k = ksize if ksize % 2 == 1 else ksize + 1
    filtered = cv2.GaussianBlur(img, (k, k), 0)

    return JSONResponse({
        "result": encode_image(filtered),
        "original": encode_image(img)
    })

@router.post("/wiener-filter")
async def wiener_filter(file: UploadFile = File(...)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    img = img.astype(np.float32)

    kernel = np.ones((5,5)) / 25

    local_mean = cv2.filter2D(img, -1, kernel)
    local_var = cv2.filter2D(img**2, -1, kernel) - local_mean**2

    noise_var = np.mean(local_var)

    result = local_mean + (local_var - noise_var) / (local_var + 1e-5) * (img - local_mean)

    result = np.clip(result, 0, 255).astype(np.uint8)

    return JSONResponse({
        "result": encode_image(result),
        "original": encode_image(img.astype(np.uint8))
    })

@router.post("/motion-blur")
async def motion_blur(
    file: UploadFile = File(...),
    size: int = Form(15)
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)

    kernel = np.zeros((size, size))
    kernel[int((size-1)/2), :] = np.ones(size)
    kernel = kernel / size

    blurred = cv2.filter2D(img, -1, kernel)

    return JSONResponse({
        "result": encode_image(blurred),
        "original": encode_image(img)
    })

@router.post("/median-filter")
async def median_filter(file: UploadFile = File(...), ksize: int = Form(5)):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    k = ksize if ksize % 2 == 1 else ksize + 1
    filtered = cv2.medianBlur(img, k)
    return JSONResponse({"result": encode_image(filtered), "original": encode_image(img)})


@router.post("/degradation-model")
async def degradation_model(
    file: UploadFile = File(...),
    blur_sigma: float = Form(2.0),
    noise_sigma: float = Form(10.0),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data).astype(np.float32)

    sigma = max(0.1, float(blur_sigma))
    k = _safe_odd(int(max(3, round(sigma * 4 + 1))), 3)
    blurred = cv2.GaussianBlur(img, (k, k), sigma)
    noise = np.random.normal(0, max(0.0, float(noise_sigma)), img.shape)
    degraded = np.clip(blurred + noise, 0, 255).astype(np.uint8)

    return JSONResponse({
        "result": encode_image(degraded),
        "original": encode_image(img.astype(np.uint8)),
        "meta": {"blur_sigma": sigma, "noise_sigma": float(noise_sigma)}
    })


@router.post("/noise-model")
async def noise_model(
    file: UploadFile = File(...),
    noise_type: str = Form("gaussian"),
    amount: float = Form(20.0),
):
    data = await file.read()
    img = decode_image(data).astype(np.float32)
    noisy = img.copy()
    nt = noise_type.lower()
    a = max(0.0, float(amount))

    if nt == "gaussian":
        noisy += np.random.normal(0, a, img.shape)
    elif nt == "uniform":
        noisy += np.random.uniform(-a, a, img.shape)
    elif nt == "rayleigh":
        noisy += np.random.rayleigh(max(0.1, a / 3), img.shape) - a
    elif nt == "gamma":
        noisy += np.random.gamma(shape=2.0, scale=max(0.1, a / 4), size=img.shape) - a
    elif nt == "exponential":
        noisy += np.random.exponential(scale=max(0.1, a / 3), size=img.shape) - a
    elif nt == "impulse":
        out = img.copy()
        density = min(1.0, a / 255.0)
        num = int(density * img.size)
        ys = np.random.randint(0, img.shape[0], num)
        xs = np.random.randint(0, img.shape[1], num)
        out[ys, xs] = np.random.choice([0, 255], size=num)
        noisy = out
    else:
        noisy += np.random.normal(0, a, img.shape)
        nt = "gaussian"

    noisy = np.clip(noisy, 0, 255).astype(np.uint8)
    return JSONResponse({"result": encode_image(noisy), "original": encode_image(img.astype(np.uint8)), "meta": {"noise_type": nt}})


@router.post("/spatial-noise-filter")
async def spatial_noise_filter(
    file: UploadFile = File(...),
    method: str = Form("median"),
    ksize: int = Form(5),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    k = _safe_odd(ksize, 1)
    method_l = method.lower()

    if method_l == "mean":
        out = cv2.blur(img, (k, k))
    elif method_l == "gaussian":
        out = cv2.GaussianBlur(img, (k, k), 0)
    else:
        out = cv2.medianBlur(img, k)
        method_l = "median"

    return JSONResponse({"result": encode_image(out), "original": encode_image(img), "meta": {"method": method_l, "ksize": k}})


@router.post("/adaptive-local-filter")
async def adaptive_local_filter(
    file: UploadFile = File(...),
    ksize: int = Form(7),
    noise_var: float = Form(80.0),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data).astype(np.float32)
    k = _safe_odd(ksize, 3)
    kernel = np.ones((k, k), dtype=np.float32) / (k * k)

    local_mean = cv2.filter2D(img, -1, kernel)
    local_var = cv2.filter2D(img * img, -1, kernel) - (local_mean * local_mean)
    nv = max(0.0, float(noise_var))
    factor = nv / (local_var + 1e-5)
    out = img - factor * (img - local_mean)
    out = np.clip(out, 0, 255).astype(np.uint8)

    return JSONResponse({"result": encode_image(out), "original": encode_image(img.astype(np.uint8)), "meta": {"ksize": k, "noise_var": nv}})


@router.post("/linear-degradation")
async def linear_degradation(
    file: UploadFile = File(...),
    model: str = Form("motion"),
    ksize: int = Form(15),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data).astype(np.float32)
    m = model.lower()
    k = _safe_odd(ksize, 3)

    if m == "gaussian":
        out = cv2.GaussianBlur(img, (k, k), 0)
    else:
        kernel = _motion_kernel(k)
        out = cv2.filter2D(img, -1, kernel)
        m = "motion"

    out = np.clip(out, 0, 255).astype(np.uint8)
    return JSONResponse({"result": encode_image(out), "original": encode_image(img.astype(np.uint8)), "meta": {"model": m, "ksize": k}})


@router.post("/estimate-psf")
async def estimate_psf(
    file: UploadFile = File(...),
    model: str = Form("motion"),
    size: int = Form(15),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    h, w = img.shape
    s = _safe_odd(size, 3)

    if model.lower() == "gaussian":
        ax = np.arange(-(s // 2), s // 2 + 1)
        xx, yy = np.meshgrid(ax, ax)
        sigma = max(1.0, s / 6.0)
        kernel = np.exp(-(xx * xx + yy * yy) / (2 * sigma * sigma)).astype(np.float32)
        kernel /= np.sum(kernel)
        used = "gaussian"
    else:
        kernel = _motion_kernel(s)
        used = "motion"

    canvas = np.zeros((h, w), dtype=np.float32)
    y0 = h // 2 - s // 2
    x0 = w // 2 - s // 2
    canvas[y0:y0 + s, x0:x0 + s] = kernel
    psf_img = cv2.normalize(canvas, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    return JSONResponse({"result": encode_image(psf_img), "original": encode_image(img), "meta": {"model": used, "size": s}})


@router.post("/inverse-filter")
async def inverse_filter(
    file: UploadFile = File(...),
    motion_size: int = Form(15),
    eps: float = Form(0.01),
):
    data = await file.read()
    img = decode_image(data).astype(np.float32)
    h, w = img.shape
    kernel = _motion_kernel(motion_size)
    H = _pad_kernel_to_image(kernel, (h, w))
    G = np.fft.fft2(img)
    F_hat = G / (H + max(1e-6, float(eps)))
    out = np.abs(np.fft.ifft2(F_hat))
    out = np.clip(out, 0, 255).astype(np.uint8)
    return JSONResponse({"result": encode_image(out), "original": encode_image(img.astype(np.uint8)), "meta": {"motion_size": _safe_odd(motion_size, 3), "eps": float(eps)}})


@router.post("/cls-filter")
async def cls_filter(
    file: UploadFile = File(...),
    motion_size: int = Form(15),
    gamma: float = Form(0.002),
):
    data = await file.read()
    img = decode_image(data).astype(np.float32)
    h, w = img.shape
    kernel = _motion_kernel(motion_size)
    H = _pad_kernel_to_image(kernel, (h, w))
    G = np.fft.fft2(img)
    lap = np.array([[0, -1, 0], [-1, 4, -1], [0, -1, 0]], dtype=np.float32)
    P = _pad_kernel_to_image(lap, (h, w))
    g = max(1e-8, float(gamma))
    F_hat = (np.conj(H) / ((np.abs(H) ** 2) + g * (np.abs(P) ** 2))) * G
    out = np.abs(np.fft.ifft2(F_hat))
    out = np.clip(out, 0, 255).astype(np.uint8)
    return JSONResponse({"result": encode_image(out), "original": encode_image(img.astype(np.uint8)), "meta": {"motion_size": _safe_odd(motion_size, 3), "gamma": g}})


@router.post("/geometric-mean-filter")
async def geometric_mean_filter(
    file: UploadFile = File(...),
    motion_size: int = Form(15),
    alpha: float = Form(0.5),
    k: float = Form(0.01),
):
    data = await file.read()
    img = decode_image(data).astype(np.float32)
    h, w = img.shape
    kernel = _motion_kernel(motion_size)
    H = _pad_kernel_to_image(kernel, (h, w))
    G = np.fft.fft2(img)

    a = min(1.0, max(0.0, float(alpha)))
    inv_part = 1.0 / (H + 1e-6)
    wiener_part = np.conj(H) / ((np.abs(H) ** 2) + max(1e-8, float(k)))
    F_hat = (inv_part ** a) * (wiener_part ** (1.0 - a)) * G
    out = np.abs(np.fft.ifft2(F_hat))
    out = np.clip(out, 0, 255).astype(np.uint8)
    return JSONResponse({"result": encode_image(out), "original": encode_image(img.astype(np.uint8)), "meta": {"alpha": a, "k": float(k)}})


@router.post("/radon-transform")
async def radon_transform(
    file: UploadFile = File(...),
    num_angles: int = Form(90),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data)
    n = max(10, min(180, int(num_angles)))
    _, sinogram = _radon_sinogram(img.astype(np.float32), n)
    sino_img = cv2.normalize(sinogram, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    return JSONResponse({"result": encode_image(sino_img), "original": encode_image(img), "meta": {"num_angles": n}})


@router.post("/fourier-slice")
async def fourier_slice(
    file: UploadFile = File(...),
    angle: float = Form(45.0),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data).astype(np.float32)
    h, w = img.shape

    # 2D spectrum magnitude
    F2 = np.fft.fftshift(np.fft.fft2(img))
    spec2 = np.log1p(np.abs(F2))
    spec2_img = cv2.normalize(spec2, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

    # 1D projection spectrum (slice theorem intuition)
    ang = float(angle)
    m = cv2.getRotationMatrix2D((w / 2, h / 2), ang, 1.0)
    rotated = cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    proj = np.sum(rotated, axis=0)
    P1 = np.fft.fftshift(np.fft.fft(proj))
    p_spec = np.log1p(np.abs(P1))
    p_spec = (255 * (p_spec - p_spec.min()) / (p_spec.max() - p_spec.min() + 1e-6)).astype(np.uint8)
    slice_img = np.tile(p_spec, (max(24, h // 8), 1))

    combined = np.vstack([spec2_img, slice_img])
    return JSONResponse({"result": encode_image(combined), "original": encode_image(img.astype(np.uint8)), "meta": {"angle": ang}})


@router.post("/reconstruct-projections")
async def reconstruct_projections(
    file: UploadFile = File(...),
    num_angles: int = Form(90),
):
    cv2 = get_cv2()
    data = await file.read()
    img = decode_image(data).astype(np.float32)
    h, w = img.shape
    n = max(10, min(180, int(num_angles)))
    angles, sinogram = _radon_sinogram(img, n)

    # Ram-Lak filtering in frequency for each projection
    freqs = np.fft.fftfreq(w)
    ram_lak = np.abs(freqs)
    filtered_sino = np.zeros_like(sinogram, dtype=np.float32)
    for i in range(n):
        p = sinogram[i]
        P = np.fft.fft(p)
        pf = np.real(np.fft.ifft(P * ram_lak))
        filtered_sino[i] = pf

    recon = np.zeros((h, w), dtype=np.float32)
    center = (w / 2, h / 2)
    for i, angle in enumerate(angles):
        proj_line = np.tile(filtered_sino[i], (h, 1))
        m = cv2.getRotationMatrix2D(center, -float(angle), 1.0)
        back = cv2.warpAffine(proj_line, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        recon += back

    recon = recon / max(1, n)
    recon = cv2.normalize(recon, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    return JSONResponse({"result": encode_image(recon), "original": encode_image(img.astype(np.uint8)), "meta": {"num_angles": n}})
