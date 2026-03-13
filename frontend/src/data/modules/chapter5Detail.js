export const chapter5Detail = {
  moduleId: 'image-restoration',
  deepDive: [
    {
      title: 'Degradation Model',
      text: 'A degraded image is modeled as blur (convolution with PSF) plus additive noise. Restoration attempts to invert this process under constraints.',
      code: `# g = h * f + n\n# h: point spread function, n: noise`,
    },
    {
      title: 'Restoration Methods in Practice',
      text: 'Median filters are effective for impulse noise, while non-local means can preserve texture better in Gaussian-like noise conditions.',
      code: `median = cv2.medianBlur(img, 5)\nnlm = cv2.fastNlMeansDenoising(img, h=10)`,
    },
  ],
  figure: {
    title: 'Restoration Pipeline',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="220"><rect width="560" height="220" fill="#f6f8fb"/><rect x="24" y="78" width="140" height="60" fill="#d7e3f0"/><rect x="208" y="78" width="140" height="60" fill="#f7d9c8"/><rect x="392" y="78" width="140" height="60" fill="#d1f0e8"/><text x="56" y="113" font-size="14" fill="#243">Degraded</text><text x="246" y="113" font-size="14" fill="#243">Filter</text><text x="430" y="113" font-size="14" fill="#243">Restored</text><line x1="164" y1="108" x2="208" y2="108" stroke="#124f73" stroke-width="3"/><line x1="348" y1="108" x2="392" y2="108" stroke="#124f73" stroke-width="3"/></svg>`,
  },
};
