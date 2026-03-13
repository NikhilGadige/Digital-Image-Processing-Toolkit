import { useEffect, useMemo, useState } from 'react';
import { checkApiHealth, processWithApi } from '../services/dipApi';
import { runLocalOperation } from '../utils/localImageOps';

const EXPERIMENT_CODE_BLOCKS = {
  '/api/fundamentals/sampling-quantization': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
factor = max(1, min(16, int(downsample_factor)))
q_levels = max(2, min(256, int(levels)))
small = cv2.resize(gray, (max(1, gray.shape[1] // factor), max(1, gray.shape[0] // factor)), interpolation=cv2.INTER_AREA)
sampled = cv2.resize(small, (gray.shape[1], gray.shape[0]), interpolation=cv2.INTER_NEAREST)
step = max(1, 256 // q_levels)
out = ((sampled // step) * step).astype(np.uint8)`,
  '/api/fundamentals/interpolation-compare': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
safe_scale = max(1.2, min(6.0, float(scale)))
method_map = {'nearest': cv2.INTER_NEAREST, 'linear': cv2.INTER_LINEAR, 'cubic': cv2.INTER_CUBIC}
interpolation = method_map.get(str(method).lower(), cv2.INTER_LINEAR)
out = cv2.resize(gray, None, fx=safe_scale, fy=safe_scale, interpolation=interpolation)`,
  '/api/fundamentals/bit-plane': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
p = max(0, min(7, int(plane)))
out = (((gray >> p) & 1) * 255).astype(np.uint8)`,
  '/api/fundamentals/gray-level-reduction': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
q_levels = max(2, min(256, int(levels)))
step = max(1, 256 // q_levels)
out = ((gray // step) * step).astype(np.uint8)`,
  '/api/fundamentals/reduce-resolution': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
f = max(1, min(16, int(factor)))
small = cv2.resize(gray, (max(1, gray.shape[1] // f), max(1, gray.shape[0] // f)), interpolation=cv2.INTER_AREA)
out = cv2.resize(small, (gray.shape[1], gray.shape[0]), interpolation=cv2.INTER_NEAREST)`,
  '/api/enhance/histogram-eq': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
out = cv2.equalizeHist(gray)`,
  '/api/enhance/negative': `out = 255 - img`,
  '/api/enhance/log-transform': `img_float = img.astype(np.float32)
log_img = np.log1p(img_float)
log_img = cv2.normalize(log_img, None, 0, 255, cv2.NORM_MINMAX)
out = np.uint8(log_img)`,
  '/api/enhance/gamma': `g = max(0.1, float(gamma))
img_norm = img / 255.0
gamma_img = np.power(img_norm, g)
out = np.uint8(gamma_img * 255)`,
  '/api/enhance/median-filter': `k = int(kernel)
if k < 1:
    k = 1
if k % 2 == 0:
    k += 1
out = cv2.medianBlur(img, k)`,
  '/api/enhance/laplacian': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
lap = cv2.Laplacian(gray, cv2.CV_64F)
out = cv2.convertScaleAbs(lap)`,
  '/api/enhance/mean-filter': `k = int(kernel)
if k < 1:
    k = 1
if k % 2 == 0:
    k += 1
out = cv2.blur(img, (k, k))`,
  '/api/enhance/unsharp-mask': `blur = cv2.GaussianBlur(img, (5, 5), 0)
out = cv2.addWeighted(img, 1.5, blur, -0.5, 0)`,
  '/api/enhance/gaussian-blur': `k = int(kernel)
if k < 1:
    k = 1
if k % 2 == 0:
    k += 1
out = cv2.GaussianBlur(img, (k, k), 0)`,
  '/api/enhance/sharpen': `kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
out = cv2.filter2D(img, -1, kernel)`,
  '/api/enhance/edge-detect': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
out = cv2.Canny(gray, 100, 200)`,
  '/api/frequency/fft-spectrum': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
f = np.fft.fft2(gray)
fshift = np.fft.fftshift(f)
magnitude = 20 * np.log(np.abs(fshift) + 1)
out = cv2.normalize(magnitude, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)`,
  '/api/frequency/band-pass': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
fshift = np.fft.fftshift(np.fft.fft2(gray))
rows, cols = gray.shape
crow, ccol = rows // 2, cols // 2
inner = max(1, int(r1))
outer = max(inner + 1, int(r2))
mask = np.zeros((rows, cols), np.float32)
cv2.circle(mask, (ccol, crow), outer, 1, -1)
cv2.circle(mask, (ccol, crow), inner, 0, -1)
filtered = fshift * mask
restored = np.fft.ifft2(np.fft.ifftshift(filtered))
out = np.abs(restored).astype(np.uint8)`,
  '/api/frequency/band-reject': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
fshift = np.fft.fftshift(np.fft.fft2(gray))
rows, cols = gray.shape
crow, ccol = rows // 2, cols // 2
inner = max(1, int(r1))
outer = max(inner + 1, int(r2))
mask = np.ones((rows, cols), np.float32)
cv2.circle(mask, (ccol, crow), outer, 0, -1)
cv2.circle(mask, (ccol, crow), inner, 1, -1)
filtered = fshift * mask
restored = np.fft.ifft2(np.fft.ifftshift(filtered))
out = np.abs(restored).astype(np.uint8)`,
  '/api/frequency/gaussian-low-pass': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
fshift = np.fft.fftshift(np.fft.fft2(gray))
rows, cols = gray.shape
crow, ccol = rows // 2, cols // 2
sig = max(0.1, float(sigma))
x = np.arange(cols)
y = np.arange(rows)
X, Y = np.meshgrid(x, y)
D = np.sqrt((X - ccol) ** 2 + (Y - crow) ** 2)
mask = np.exp(-(D ** 2) / (2 * sig ** 2))
filtered = fshift * mask
restored = np.fft.ifft2(np.fft.ifftshift(filtered))
out = np.abs(restored).astype(np.uint8)`,
  '/api/frequency/gaussian-high-pass': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
fshift = np.fft.fftshift(np.fft.fft2(gray))
rows, cols = gray.shape
crow, ccol = rows // 2, cols // 2
sig = max(0.1, float(sigma))
x = np.arange(cols)
y = np.arange(rows)
X, Y = np.meshgrid(x, y)
D = np.sqrt((X - ccol) ** 2 + (Y - crow) ** 2)
mask = 1 - np.exp(-(D ** 2) / (2 * sig ** 2))
filtered = fshift * mask
restored = np.fft.ifft2(np.fft.ifftshift(filtered))
out = np.abs(restored).astype(np.uint8)`,
  '/api/frequency/butterworth-low-pass': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
fshift = np.fft.fftshift(np.fft.fft2(gray))
rows, cols = gray.shape
crow, ccol = rows // 2, cols // 2
cutoff = max(1, int(d0))
order = max(1, int(n))
x = np.arange(cols)
y = np.arange(rows)
X, Y = np.meshgrid(x, y)
D = np.sqrt((X - ccol) ** 2 + (Y - crow) ** 2)
mask = 1 / (1 + (D / cutoff) ** (2 * order))
filtered = fshift * mask
restored = np.fft.ifft2(np.fft.ifftshift(filtered))
out = np.abs(restored).astype(np.uint8)`,
  '/api/frequency/butterworth-high-pass': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
fshift = np.fft.fftshift(np.fft.fft2(gray))
rows, cols = gray.shape
crow, ccol = rows // 2, cols // 2
cutoff = max(1, int(d0))
order = max(1, int(n))
x = np.arange(cols)
y = np.arange(rows)
X, Y = np.meshgrid(x, y)
D = np.sqrt((X - ccol) ** 2 + (Y - crow) ** 2)
mask = 1 - (1 / (1 + (D / cutoff) ** (2 * order)))
filtered = fshift * mask
restored = np.fft.ifft2(np.fft.ifftshift(filtered))
out = np.abs(restored).astype(np.uint8)`,
  '/api/frequency/low-pass': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
fshift = np.fft.fftshift(np.fft.fft2(gray))
r = max(5, min(min(gray.shape) // 2, int(radius)))
rows, cols = gray.shape
crow, ccol = rows // 2, cols // 2
mask = np.zeros((rows, cols), np.float32)
cv2.circle(mask, (ccol, crow), r, 1, -1)
filtered = fshift * mask
restored = np.fft.ifft2(np.fft.ifftshift(filtered))
out = np.abs(restored).astype(np.uint8)`,
  '/api/frequency/high-pass': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
fshift = np.fft.fftshift(np.fft.fft2(gray))
r = max(3, min(min(gray.shape) // 2, int(radius)))
rows, cols = gray.shape
crow, ccol = rows // 2, cols // 2
mask = np.ones((rows, cols), np.float32)
cv2.circle(mask, (ccol, crow), r, 0, -1)
filtered = fshift * mask
restored = np.fft.ifft2(np.fft.ifftshift(filtered))
out = np.abs(restored).astype(np.uint8)`,
  '/api/frequency/notch-reject': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
fshift = np.fft.fftshift(np.fft.fft2(gray))
rows, cols = gray.shape
crow, ccol = rows // 2, cols // 2
safe_u0 = max(0, min(cols // 2 - 1, abs(int(u0))))
safe_v0 = max(0, min(rows // 2 - 1, abs(int(v0))))
safe_radius = max(1, min(min(rows, cols) // 6, int(radius)))
notch1 = (ccol + safe_u0, crow + safe_v0)
notch2 = (ccol - safe_u0, crow - safe_v0)
mask = np.ones((rows, cols), np.float32)
cv2.circle(mask, notch1, safe_radius, 0, -1)
cv2.circle(mask, notch2, safe_radius, 0, -1)
filtered = fshift * mask
restored = np.fft.ifft2(np.fft.ifftshift(filtered))
out = np.abs(restored).astype(np.uint8)`,
  '/api/restore/denoise': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
out = cv2.fastNlMeansDenoising(gray, h=10)`,
  '/api/restore/median-filter': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
k = int(ksize)
if k < 1:
    k = 1
if k % 2 == 0:
    k += 1
out = cv2.medianBlur(gray, k)`,
  '/api/restore/mean-filter': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
k = int(ksize)
if k < 1:
    k = 1
if k % 2 == 0:
    k += 1
out = cv2.blur(gray, (k, k))`,
  '/api/restore/gaussian-filter': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
k = int(ksize)
if k < 1:
    k = 1
if k % 2 == 0:
    k += 1
out = cv2.GaussianBlur(gray, (k, k), 0)`,
  '/api/restore/wiener-filter': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
kernel = np.ones((5, 5), dtype=np.float32) / 25
local_mean = cv2.filter2D(gray, -1, kernel)
local_var = cv2.filter2D(gray ** 2, -1, kernel) - local_mean ** 2
noise_var = np.mean(local_var)
result = local_mean + ((local_var - noise_var) / (local_var + 1e-5)) * (gray - local_mean)
out = np.clip(result, 0, 255).astype(np.uint8)`,
  '/api/restore/motion-blur': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
s = int(size)
if s < 3:
    s = 3
if s % 2 == 0:
    s += 1
kernel = np.zeros((s, s), dtype=np.float32)
kernel[(s - 1) // 2, :] = 1.0
kernel = kernel / s
out = cv2.filter2D(gray, -1, kernel)`,
  '/api/restore/add-gaussian-noise': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
noise = np.random.normal(float(mean), float(sigma), gray.shape)
out = np.clip(gray + noise, 0, 255).astype(np.uint8)`,
  '/api/restore/add-salt-pepper-noise': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
safe_amount = max(0.0, min(1.0, float(amount)))
out = gray.copy()
num_salt = int(safe_amount * gray.size / 2)
num_pepper = int(safe_amount * gray.size / 2)
coords = [np.random.randint(0, i - 1, num_salt) for i in gray.shape]
out[coords[0], coords[1]] = 255
coords = [np.random.randint(0, i - 1, num_pepper) for i in gray.shape]
out[coords[0], coords[1]] = 0`,
  '/api/restore/degradation-model': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
sigma = max(0.1, float(blur_sigma))
k = max(3, int(round(sigma * 4 + 1)))
if k % 2 == 0:
    k += 1
blurred = cv2.GaussianBlur(gray, (k, k), sigma)
noise = np.random.normal(0, max(0.0, float(noise_sigma)), gray.shape)
out = np.clip(blurred + noise, 0, 255).astype(np.uint8)`,
  '/api/restore/noise-model': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
nt = str(noise_type).lower()
a = max(0.0, float(amount))
if nt == 'uniform':
    noisy = gray + np.random.uniform(-a, a, gray.shape)
elif nt == 'rayleigh':
    noisy = gray + np.random.rayleigh(max(0.1, a / 3), gray.shape) - a
elif nt == 'gamma':
    noisy = gray + np.random.gamma(2.0, max(0.1, a / 4), gray.shape) - a
elif nt == 'exponential':
    noisy = gray + np.random.exponential(max(0.1, a / 3), gray.shape) - a
elif nt == 'impulse':
    noisy = gray.copy()
    density = min(1.0, a / 255.0)
    num = int(density * gray.size)
    ys = np.random.randint(0, gray.shape[0], num)
    xs = np.random.randint(0, gray.shape[1], num)
    noisy[ys, xs] = np.random.choice([0, 255], size=num)
else:
    noisy = gray + np.random.normal(0, a, gray.shape)
out = np.clip(noisy, 0, 255).astype(np.uint8)`,
  '/api/restore/spatial-noise-filter': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
k = max(1, int(ksize))
if k % 2 == 0:
    k += 1
m = str(method).lower()
if m == 'mean':
    out = cv2.blur(gray, (k, k))
elif m == 'gaussian':
    out = cv2.GaussianBlur(gray, (k, k), 0)
else:
    out = cv2.medianBlur(gray, k)`,
  '/api/restore/adaptive-local-filter': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
k = max(3, int(ksize))
if k % 2 == 0:
    k += 1
kernel = np.ones((k, k), dtype=np.float32) / (k * k)
local_mean = cv2.filter2D(gray, -1, kernel)
local_var = cv2.filter2D(gray * gray, -1, kernel) - (local_mean * local_mean)
nv = max(0.0, float(noise_var))
out = gray - (nv / (local_var + 1e-5)) * (gray - local_mean)
out = np.clip(out, 0, 255).astype(np.uint8)`,
  '/api/restore/linear-degradation': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
k = max(3, int(ksize))
if k % 2 == 0:
    k += 1
if str(model).lower() == 'gaussian':
    out = cv2.GaussianBlur(gray, (k, k), 0)
else:
    kernel = np.zeros((k, k), dtype=np.float32)
    kernel[(k - 1) // 2, :] = 1.0
    kernel /= np.sum(kernel)
    out = cv2.filter2D(gray, -1, kernel)
out = np.clip(out, 0, 255).astype(np.uint8)`,
  '/api/restore/estimate-psf': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
h, w = gray.shape
s = max(3, int(size))
if s % 2 == 0:
    s += 1
if str(model).lower() == 'gaussian':
    ax = np.arange(-(s // 2), s // 2 + 1)
    xx, yy = np.meshgrid(ax, ax)
    sigma = max(1.0, s / 6.0)
    kernel = np.exp(-(xx * xx + yy * yy) / (2 * sigma * sigma)).astype(np.float32)
    kernel /= np.sum(kernel)
else:
    kernel = np.zeros((s, s), dtype=np.float32)
    kernel[(s - 1) // 2, :] = 1.0
    kernel /= np.sum(kernel)
canvas = np.zeros((h, w), dtype=np.float32)
y0 = h // 2 - s // 2
x0 = w // 2 - s // 2
canvas[y0:y0 + s, x0:x0 + s] = kernel
out = cv2.normalize(canvas, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)`,
  '/api/restore/inverse-filter': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
h, w = gray.shape
s = max(3, int(motion_size))
if s % 2 == 0:
    s += 1
kernel = np.zeros((s, s), dtype=np.float32)
kernel[(s - 1) // 2, :] = 1.0
kernel /= np.sum(kernel)
padded = np.zeros((h, w), dtype=np.float32)
padded[:s, :s] = kernel
H = np.fft.fft2(np.fft.ifftshift(padded))
G = np.fft.fft2(gray)
F_hat = G / (H + max(1e-6, float(eps)))
out = np.abs(np.fft.ifft2(F_hat))
out = np.clip(out, 0, 255).astype(np.uint8)`,
  '/api/restore/cls-filter': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
h, w = gray.shape
s = max(3, int(motion_size))
if s % 2 == 0:
    s += 1
kernel = np.zeros((s, s), dtype=np.float32)
kernel[(s - 1) // 2, :] = 1.0
kernel /= np.sum(kernel)
padded = np.zeros((h, w), dtype=np.float32)
padded[:s, :s] = kernel
H = np.fft.fft2(np.fft.ifftshift(padded))
lap = np.array([[0, -1, 0], [-1, 4, -1], [0, -1, 0]], dtype=np.float32)
Pp = np.zeros((h, w), dtype=np.float32)
Pp[:3, :3] = lap
P = np.fft.fft2(np.fft.ifftshift(Pp))
g = max(1e-8, float(gamma))
G = np.fft.fft2(gray)
F_hat = (np.conj(H) / ((np.abs(H) ** 2) + g * (np.abs(P) ** 2))) * G
out = np.abs(np.fft.ifft2(F_hat))
out = np.clip(out, 0, 255).astype(np.uint8)`,
  '/api/restore/geometric-mean-filter': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
h, w = gray.shape
s = max(3, int(motion_size))
if s % 2 == 0:
    s += 1
kernel = np.zeros((s, s), dtype=np.float32)
kernel[(s - 1) // 2, :] = 1.0
kernel /= np.sum(kernel)
padded = np.zeros((h, w), dtype=np.float32)
padded[:s, :s] = kernel
H = np.fft.fft2(np.fft.ifftshift(padded))
G = np.fft.fft2(gray)
a = min(1.0, max(0.0, float(alpha)))
inv_part = 1.0 / (H + 1e-6)
wiener_part = np.conj(H) / ((np.abs(H) ** 2) + max(1e-8, float(k)))
F_hat = (inv_part ** a) * (wiener_part ** (1.0 - a)) * G
out = np.abs(np.fft.ifft2(F_hat))
out = np.clip(out, 0, 255).astype(np.uint8)`,
  '/api/restore/radon-transform': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
h, w = gray.shape
n = max(10, min(180, int(num_angles)))
angles = np.linspace(0, 180, n, endpoint=False)
sinogram = np.zeros((n, w), dtype=np.float32)
for i, a in enumerate(angles):
    m = cv2.getRotationMatrix2D((w / 2, h / 2), float(a), 1.0)
    rot = cv2.warpAffine(gray, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    sinogram[i, :] = np.sum(rot, axis=0)
out = cv2.normalize(sinogram, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)`,
  '/api/restore/fourier-slice': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
h, w = gray.shape
F2 = np.fft.fftshift(np.fft.fft2(gray))
spec2 = np.log1p(np.abs(F2))
spec2_img = cv2.normalize(spec2, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
m = cv2.getRotationMatrix2D((w / 2, h / 2), float(angle), 1.0)
rot = cv2.warpAffine(gray, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
proj = np.sum(rot, axis=0)
P1 = np.fft.fftshift(np.fft.fft(proj))
p_spec = np.log1p(np.abs(P1))
p_spec = (255 * (p_spec - p_spec.min()) / (p_spec.max() - p_spec.min() + 1e-6)).astype(np.uint8)
slice_img = np.tile(p_spec, (max(24, h // 8), 1))
out = np.vstack([spec2_img, slice_img])`,
  '/api/restore/reconstruct-projections': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
h, w = gray.shape
n = max(10, min(180, int(num_angles)))
angles = np.linspace(0, 180, n, endpoint=False)
sinogram = np.zeros((n, w), dtype=np.float32)
for i, a in enumerate(angles):
    m = cv2.getRotationMatrix2D((w / 2, h / 2), float(a), 1.0)
    rot = cv2.warpAffine(gray, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    sinogram[i, :] = np.sum(rot, axis=0)
freqs = np.fft.fftfreq(w)
ram_lak = np.abs(freqs)
filtered = np.zeros_like(sinogram)
for i in range(n):
    P = np.fft.fft(sinogram[i])
    filtered[i] = np.real(np.fft.ifft(P * ram_lak))
recon = np.zeros((h, w), dtype=np.float32)
for i, a in enumerate(angles):
    plane = np.tile(filtered[i], (h, 1))
    m = cv2.getRotationMatrix2D((w / 2, h / 2), -float(a), 1.0)
    back = cv2.warpAffine(plane, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    recon += back
recon /= max(1, n)
out = cv2.normalize(recon, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)`,
  '/api/color/saturation-boost': `safe_boost = max(0, min(120, int(boost)))
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
h, s, v = cv2.split(hsv)
s = cv2.add(s, safe_boost)
out = cv2.cvtColor(cv2.merge([h, s, v]), cv2.COLOR_HSV2BGR)`,
  '/api/color/rgb-model': `out = img.copy()`,
  '/api/color/cmy-cmyk-model': `rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
c = 1.0 - rgb[:, :, 0]
m = 1.0 - rgb[:, :, 1]
y = 1.0 - rgb[:, :, 2]
if str(mode).lower() == 'cmyk':
    k = np.minimum(np.minimum(c, m), y)
    k_view = np.clip(k * 255, 0, 255).astype(np.uint8)
    out = cv2.cvtColor(k_view, cv2.COLOR_GRAY2BGR)
else:
    cmy = np.stack([c, m, y], axis=2)
    out = cv2.cvtColor(np.clip(cmy * 255, 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR)`,
  '/api/color/hsv-hsi-model': `hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
if str(mode).lower() == 'hsi':
    intensity = np.mean(img.astype(np.float32), axis=2).astype(np.uint8)
    h, s, _ = cv2.split(hsv)
    hsi_like = cv2.merge([h, s, intensity])
    out = cv2.cvtColor(hsi_like, cv2.COLOR_HSV2BGR)
else:
    out = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)`,
  '/api/color/color-space-transform': `t = str(target).lower()
if t == 'lab':
    transformed = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    out = cv2.cvtColor(transformed, cv2.COLOR_LAB2BGR)
elif t == 'ycrcb':
    transformed = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    out = cv2.cvtColor(transformed, cv2.COLOR_YCrCb2BGR)
else:
    transformed = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
    out = cv2.cvtColor(transformed, cv2.COLOR_YUV2BGR)`,
  '/api/color/channel-representation': `b, g, r = cv2.split(img)
z = np.zeros_like(b)
r_view = cv2.merge([z, z, r])
g_view = cv2.merge([z, g, z])
b_view = cv2.merge([b, z, z])
out = np.hstack([r_view, g_view, b_view])`,
  '/api/color/pseudocolor': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
cmap_lookup = {'jet': cv2.COLORMAP_JET, 'hot': cv2.COLORMAP_HOT, 'turbo': cv2.COLORMAP_TURBO, 'viridis': cv2.COLORMAP_VIRIDIS}
cmap = cmap_lookup.get(str(map_name).lower(), cv2.COLORMAP_JET)
out = cv2.applyColorMap(gray, cmap)`,
  '/api/color/color-filter': `k = max(1, int(ksize))
if k % 2 == 0:
    k += 1
m = str(method).lower()
if m == 'mean':
    out = cv2.blur(img, (k, k))
elif m == 'sharpen':
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
    out = cv2.filter2D(img, -1, kernel)
else:
    out = cv2.GaussianBlur(img, (k, k), 0)`,
  '/api/color/color-edge': `b, g, r = cv2.split(img.astype(np.float32))
edges = np.zeros_like(b)
for ch in [b, g, r]:
    gx = cv2.Sobel(ch, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(ch, cv2.CV_32F, 0, 1, ksize=3)
    mag = cv2.magnitude(gx, gy)
    edges = np.maximum(edges, mag)
edge_img = np.clip(cv2.normalize(edges, None, 0, 255, cv2.NORM_MINMAX), 0, 255).astype(np.uint8)
out = cv2.applyColorMap(edge_img, cv2.COLORMAP_TURBO)`,
  '/api/color/hsv-mask': `hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
lower = np.array([max(0, min(179, int(h_min))), max(0, min(255, int(s_min))), max(0, min(255, int(v_min)))], dtype=np.uint8)
upper = np.array([max(0, min(179, int(h_max))), max(0, min(255, int(s_max))), max(0, min(255, int(v_max)))], dtype=np.uint8)
mask = cv2.inRange(hsv, lower, upper)
out = cv2.bitwise_and(img, img, mask=mask)`,
  '/api/color/color-segment-rgb': `target = np.array([int(b), int(g), int(r)], dtype=np.float32)
dist = np.sqrt(np.sum((img.astype(np.float32) - target) ** 2, axis=2))
mask = (dist <= max(1.0, float(threshold))).astype(np.uint8) * 255
out = cv2.bitwise_and(img, img, mask=mask)`,
  '/api/color/color-noise': `a = max(0.0, float(amount))
if str(noise_type).lower() == 'impulse':
    out = img.astype(np.float32)
    density = min(1.0, a / 255.0)
    num = int(density * img.shape[0] * img.shape[1])
    ys = np.random.randint(0, img.shape[0], num)
    xs = np.random.randint(0, img.shape[1], num)
    out[ys, xs, :] = np.random.choice([0, 255], size=(num, 1))
else:
    out = img.astype(np.float32) + np.random.normal(0, a, img.shape)
out = np.clip(out, 0, 255).astype(np.uint8)`,
  '/api/color/vector-median': `k = max(3, int(ksize))
if k % 2 == 0:
    k += 1
pad = k // 2
padded = np.pad(img, ((pad, pad), (pad, pad), (0, 0)), mode='reflect').astype(np.float32)
out = np.zeros_like(img, dtype=np.uint8)
for y in range(img.shape[0]):
    for x in range(img.shape[1]):
        patch = padded[y:y + k, x:x + k].reshape(-1, 3)
        diffs = patch[:, None, :] - patch[None, :, :]
        dist = np.sqrt(np.sum(diffs * diffs, axis=2))
        idx = np.argmin(np.sum(dist, axis=1))
        out[y, x] = np.clip(patch[idx], 0, 255).astype(np.uint8)`,
  '/api/color/color-compression': `q = max(1, min(100, int(quality)))
ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
y, cr, cb = cv2.split(ycrcb)
cr_small = cv2.resize(cr, (cr.shape[1] // 2, cr.shape[0] // 2), interpolation=cv2.INTER_AREA)
cb_small = cv2.resize(cb, (cb.shape[1] // 2, cb.shape[0] // 2), interpolation=cv2.INTER_AREA)
cr_up = cv2.resize(cr_small, (cr.shape[1], cr.shape[0]), interpolation=cv2.INTER_LINEAR)
cb_up = cv2.resize(cb_small, (cb.shape[1], cb.shape[0]), interpolation=cv2.INTER_LINEAR)
merged = cv2.merge([y, cr_up, cb_up])
out = cv2.cvtColor(merged, cv2.COLOR_YCrCb2BGR)
ok, enc = cv2.imencode('.jpg', out, [int(cv2.IMWRITE_JPEG_QUALITY), q])
if ok:
    out = cv2.imdecode(enc, cv2.IMREAD_COLOR)`,
  '/api/morphological/erode': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
k = max(1, int(ksize))
kernel = np.ones((k, k), np.uint8)
out = cv2.erode(gray, kernel, iterations=1)`,
  '/api/morphological/dilate': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
k = max(1, int(ksize))
kernel = np.ones((k, k), np.uint8)
out = cv2.dilate(gray, kernel, iterations=1)`,
  '/api/morphological/opening': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
k = max(1, int(ksize))
kernel = np.ones((k, k), np.uint8)
out = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)`,
  '/api/morphological/closing': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
k = max(1, int(ksize))
kernel = np.ones((k, k), np.uint8)
out = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)`,
  '/api/segment/threshold': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
t = max(0, min(255, int(thresh_val)))
_, out = cv2.threshold(gray, t, 255, cv2.THRESH_BINARY)`,
  '/api/segment/otsu': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, out = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)`,
  pyramid: `levels = max(1, int(levels))
tmp = img.copy()
for _ in range(levels):
    tmp = cv2.pyrDown(tmp)
for _ in range(levels):
    tmp = cv2.pyrUp(tmp)
out = cv2.resize(tmp, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_LINEAR)`,
  'jpeg-sim': `q = max(1, min(100, int(quality)))
ok, encoded = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, q])
if not ok:
    raise RuntimeError('JPEG encode failed')
out = cv2.imdecode(encoded, cv2.IMREAD_COLOR)`,
  'contour-outline': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
t = max(0, min(255, int(binary_threshold)))
_, mask = cv2.threshold(gray, t, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
out = img.copy()
cv2.drawContours(out, contours, -1, (0, 120, 255), 2)`,
  'feature-view': `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
t = max(0, min(255, int(feature_threshold)))
_, mask = cv2.threshold(gray, t, 255, cv2.THRESH_BINARY)
num_labels, labels = cv2.connectedComponents(mask)
out = cv2.cvtColor(mask, cv2.COLOR_GRAY2BGR)
print(f'Connected components (including background): {num_labels}')
for label in range(1, num_labels):
    area = int(np.sum(labels == label))
    print(f'Label {label}: area = {area} pixels')`,
};

function pythonLiteral(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '0';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (value === null || value === undefined) return 'None';
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function buildPythonParamLines(tool) {
  if (!tool) return [];
  if (Array.isArray(tool.params) && tool.params.length > 0) {
    return tool.params.map((p) => `${p.key} = ${pythonLiteral(p.default ?? '')}`);
  }
  if (tool.paramKey) {
    return [`${tool.paramKey} = ${pythonLiteral(tool.defaultParam ?? 5)}`];
  }
  if (tool.operation === 'pyramid') return ['levels = 2'];
  if (tool.operation === 'jpeg-sim') return ['quality = 60'];
  if (tool.operation === 'contour-outline') return ['binary_threshold = 120'];
  if (tool.operation === 'feature-view') return ['feature_threshold = 110'];
  return [];
}

function buildLocalOrEndpointKey(tool) {
  if (!tool) return '';
  if (tool.endpoint) return tool.endpoint;
  if (tool.operation) return tool.operation;
  return tool.id || '';
}

function buildApiFallbackSnippet(tool) {
  const paramLines = buildPythonParamLines(tool);
  const paramObject =
    paramLines.length > 0
      ? paramLines.map((line) => line.split(' = ')[0]).map((key) => `    "${key}": ${key},`).join('\n')
      : '';
  return `import base64
import requests

INPUT_IMAGE_PATH = "path/to/your/input_image.png"  # <-- Put your image path here
OUTPUT_IMAGE_PATH = "output.png"
API_URL = "http://localhost:8000${tool.endpoint || ''}"

${paramLines.join('\n')}
params = {
${paramObject}
}

with open(INPUT_IMAGE_PATH, "rb") as f:
    response = requests.post(API_URL, files={"file": f}, data=params, timeout=30)
response.raise_for_status()

result_b64 = response.json()["result"]
with open(OUTPUT_IMAGE_PATH, "wb") as f:
    f.write(base64.b64decode(result_b64))

print(f"Saved result to {OUTPUT_IMAGE_PATH}")`;
}

function buildCodeSnippet(tool) {
  if (!tool) return '';
  const key = buildLocalOrEndpointKey(tool);
  const block = EXPERIMENT_CODE_BLOCKS[key];
  if (block) {
    const paramLines = buildPythonParamLines(tool);
    return `import cv2
import numpy as np

INPUT_IMAGE_PATH = "path/to/your/input_image.png"  # <-- Put your image path here
OUTPUT_IMAGE_PATH = "output.png"

img = cv2.imread(INPUT_IMAGE_PATH, cv2.IMREAD_COLOR)
if img is None:
    raise FileNotFoundError(f"Could not read image: {INPUT_IMAGE_PATH}")

# Parameters for this experiment
${paramLines.length > 0 ? paramLines.join('\n') : '# (no extra parameters)'}

# Processing
${block}

cv2.imwrite(OUTPUT_IMAGE_PATH, out)
print(f"Saved result to {OUTPUT_IMAGE_PATH}")
cv2.imshow("Result", out)
cv2.waitKey(0)
cv2.destroyAllWindows()`;
  }
  if (tool.type === 'api') return buildApiFallbackSnippet(tool);
  return `# Full code is not available for this experiment yet.
# Try selecting an API-backed experiment or add a block in EXPERIMENT_CODE_BLOCKS.`;
}

function createDefaultImage() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="280" viewBox="0 0 420 280">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#113c68" />
        <stop offset="100%" stop-color="#2b9d9d" />
      </linearGradient>
    </defs>
    <rect width="420" height="280" fill="url(#bg)" />
    <circle cx="120" cy="140" r="72" fill="#ffcc70" />
    <rect x="180" y="78" width="180" height="130" rx="18" fill="#f0f4f8" opacity="0.82" />
    <line x1="20" y1="20" x2="400" y2="260" stroke="#ffffff" stroke-opacity="0.24" stroke-width="6" />
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

async function svgDataUrlToPngDataUrl(svgDataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 420;
        canvas.height = img.height || 280;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = svgDataUrl;
  });
}

async function dataUrlToFile(dataUrl, fileName) {
  const safeDataUrl = dataUrl.startsWith('data:image/svg+xml')
    ? await svgDataUrlToPngDataUrl(dataUrl)
    : dataUrl;
  const [meta, base64] = safeDataUrl.split(',');
  const mimeMatch = meta.match(/data:(.*);base64/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) buffer[i] = bytes.charCodeAt(i);
  return new File([buffer], fileName, { type: mime });
}

function buildDefaultTool(labConfig) {
  if (Array.isArray(labConfig?.tools) && labConfig.tools.length > 0) {
    return labConfig.tools[0];
  }
  return labConfig;
}

function getParamDefaults(tool) {
  if (!tool?.params) return {};
  const values = {};
  tool.params.forEach((paramConfig) => {
    values[paramConfig.key] = paramConfig.default ?? '';
  });
  return values;
}

function coerceParamValue(rawValue, type) {
  if (type === 'number') {
    if (rawValue === '') return '';
    return Number(rawValue);
  }
  return rawValue;
}

function ModuleLab({ labConfig, title }) {
  const initialTool = buildDefaultTool(labConfig);
  const [inputPreview, setInputPreview] = useState(createDefaultImage());
  const [outputPreview, setOutputPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiReachable, setApiReachable] = useState(true);
  const [selectedToolId, setSelectedToolId] = useState(initialTool?.id || 'single');
  const [param, setParam] = useState(initialTool?.defaultParam || 5);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  // for tools that define multiple parameters we keep an object of values
  const [paramValues, setParamValues] = useState(() => getParamDefaults(initialTool));

  const toolOptions = useMemo(() => {
    if (Array.isArray(labConfig?.tools) && labConfig.tools.length > 0) {
      return labConfig.tools;
    }
    return [labConfig];
  }, [labConfig]);

  const activeTool = useMemo(
    () => toolOptions.find((tool) => tool.id === selectedToolId) || toolOptions[0],
    [selectedToolId, toolOptions],
  );

  const helperText = useMemo(() => {
    if (!activeTool) return '';
    if (activeTool.type === 'api') return `Using backend processing: ${activeTool.methodName}`;
    return 'Using in-browser visual simulation.';
  }, [activeTool]);

  const activeCode = useMemo(() => buildCodeSnippet(activeTool), [activeTool]);

  useEffect(() => {
    const validateApi = async () => {
      const ok = await checkApiHealth();
      setApiReachable(ok);
    };
    void validateApi();
  }, []);

  useEffect(() => {
    if (!showCodeModal) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowCodeModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showCodeModal]);

  const handleFileInput = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setInputPreview(reader.result);
      setOutputPreview('');
    };
    reader.readAsDataURL(file);
  };

  const handleToolChange = (event) => {
    const next = toolOptions.find((tool) => tool.id === event.target.value);
    setSelectedToolId(event.target.value);
    setOutputPreview('');
    // reset parameter state depending on tool type
    if (next?.params) {
      setParamValues(getParamDefaults(next));
    } else {
      setParam(next?.defaultParam || 5);
      setParamValues({});
    }
  };

  const handleOpenCode = () => {
    setCopyStatus('');
    setShowCodeModal(true);
  };

  const handleCopyCode = async () => {
    try {
      if (!activeCode) return;
      await navigator.clipboard.writeText(activeCode);
      setCopyStatus('Code copied.');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = activeCode;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyStatus('Code copied.');
    }
  };

  const handleRun = async () => {
    if (!activeTool) return;
    setError('');
    setLoading(true);
    try {
      if (activeTool.type === 'api') {
        const healthyNow = await checkApiHealth();
        setApiReachable(healthyNow);
        if (!healthyNow) {
          throw new Error('Backend API is not reachable. Start FastAPI and verify VITE_API_BASE_URL.');
        }
        const file = await dataUrlToFile(inputPreview, 'input.png');
        const params = {};
        if (activeTool.params) {
          Object.entries(paramValues).forEach(([key, value]) => {
            if (value !== '' && value !== undefined && value !== null) {
              params[key] = value;
            }
          });
        } else if (activeTool.paramKey) {
          params[activeTool.paramKey] = param;
        }
        const payload = await processWithApi(activeTool.endpoint, file, params);
        setOutputPreview(`data:image/png;base64,${payload.result}`);
      } else {
        const resultDataUrl = await runLocalOperation(inputPreview, activeTool.operation, param);
        setOutputPreview(resultDataUrl);
      }
    } catch (runError) {
      setError(runError.message || 'Processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="module-lab">
      <div className="lab-header">
        <h3>{title} Visualizer</h3>
        <p>{helperText}</p>
      </div>

      <div className="lab-controls">
        {toolOptions.length > 1 && (
          <label className="param-input">
            Experiment
            <select value={selectedToolId} onChange={handleToolChange}>
              {toolOptions.map((tool) => (
                <option value={tool.id} key={tool.id}>
                  {tool.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="file-input">
          Upload image
          <input type="file" accept="image/*" onChange={handleFileInput} />
        </label>

        {/* render either single-number parameter or multiple fields */}
        {activeTool?.paramLabel && !activeTool.params && (
          <label className="param-input">
            {activeTool.paramLabel}
            <input
              type="number"
              min={activeTool.paramMin ?? undefined}
              max={activeTool.paramMax ?? undefined}
              step={activeTool.paramStep ?? 'any'}
              value={param}
              onChange={(event) => setParam(Number(event.target.value))}
            />
          </label>
        )}
        {activeTool?.params && (
          <>
            {activeTool.params.map((p) => (
              <label className="param-input" key={p.key}>
                {p.label}
                {p.type === 'select' ? (
                  <select
                    value={paramValues[p.key]}
                    onChange={(e) =>
                      setParamValues((prev) => ({
                        ...prev,
                        [p.key]: e.target.value,
                      }))
                    }
                  >
                    {p.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={p.type === 'text' ? 'text' : 'number'}
                    min={p.type === 'number' ? (p.min ?? undefined) : undefined}
                    max={p.type === 'number' ? (p.max ?? undefined) : undefined}
                    step={p.type === 'number' ? (p.step ?? 'any') : undefined}
                    value={paramValues[p.key]}
                    onChange={(e) =>
                      setParamValues((prev) => ({
                        ...prev,
                        [p.key]: coerceParamValue(e.target.value, p.type || 'number'),
                      }))
                    }
                  />
                )}
              </label>
            ))}
          </>
        )}

        <button className="primary-btn" onClick={handleRun} disabled={loading}>
          {loading ? 'Processing...' : 'Run Visualizer'}
        </button>
        <button className="ghost-btn" onClick={handleOpenCode} type="button">
          Get Code
        </button>
      </div>

      {!apiReachable && <p className="error-text">Backend API is offline. Run backend and check API base URL.</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="image-grid">
        <figure>
          <figcaption>Input</figcaption>
          <img src={inputPreview} alt="Module input preview" />
        </figure>
        <figure>
          <figcaption>Output</figcaption>
          {outputPreview ? <img src={outputPreview} alt="Module output preview" /> : <div className="image-placeholder">Run visualizer to preview output</div>}
        </figure>
      </div>

      {showCodeModal && (
        <div className="modal-backdrop" onClick={() => setShowCodeModal(false)}>
          <div className="step-modal code-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{activeTool?.label || 'Experiment'} Code</h3>
            <pre className="code-modal-pre">
              <code>{activeCode}</code>
            </pre>
            {copyStatus && <p className="tiny-note">{copyStatus}</p>}
            <div className="modal-actions">
              <button className="primary-btn" type="button" onClick={handleCopyCode}>
                {copyStatus ? 'Copied' : 'Copy'}
              </button>
              <button className="ghost-btn" type="button" onClick={() => setShowCodeModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ModuleLab;
