export const chapter4Detail = {
  moduleId: 'frequency-domain-filtering',
  deepDive: [
    {
      title: 'Low-Frequency vs High-Frequency Content',
      text: 'Low frequencies encode smooth illumination and broad structures. High frequencies carry edges, fine texture, and noise.',
      code: `F = np.fft.fftshift(np.fft.fft2(img))\nmag = np.log1p(np.abs(F))`,
    },
    {
      title: 'Frequency Filtering Flow',
      text: 'Transform to frequency domain, apply mask, then inverse transform. Circular masks are common for low-pass/high-pass demonstrations.',
      code: `mask = np.zeros_like(img, dtype=np.float32)\ncv2.circle(mask, (ccol, crow), 35, 1, -1)\nout = np.abs(np.fft.ifft2(np.fft.ifftshift(F * mask))).astype("uint8")`,
    },
  ],
  figure: {
    title: 'Frequency Masking',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="220"><rect width="560" height="220" fill="#f6f8fb"/><text x="14" y="24" font-size="18" fill="#124f73">Frequency Plane (Centered)</text><rect x="150" y="40" width="260" height="160" fill="#1f2937" opacity="0.95"/><circle cx="280" cy="120" r="42" fill="#21c0a8" opacity="0.8"/><text x="430" y="112" font-size="13" fill="#334">Low-pass keeps center</text><text x="430" y="132" font-size="13" fill="#334">High-pass removes center</text></svg>`,
  },
};
