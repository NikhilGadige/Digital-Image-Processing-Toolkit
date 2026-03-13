export const chapter3Detail = {
  moduleId: 'intensity-and-spatial-filtering',
  deepDive: [
    {
      title: 'Histogram Equalization Insight',
      text: 'Equalization remaps pixel values using cumulative histogram distribution so frequently occurring intensities spread across the full range.',
      code: `hist = cv2.calcHist([img],[0],None,[256],[0,256])\ncdf = hist.cumsum()\neq = cv2.equalizeHist(img)`,
    },
    {
      title: 'Spatial Kernel Behavior',
      text: 'Lowpass kernels average neighbors and suppress noise, while highpass kernels amplify local differences and sharpen transitions.',
      code: `smooth = cv2.GaussianBlur(img, (5,5), 0)\nk = np.array([[0,-1,0],[-1,5,-1],[0,-1,0]])\nsharp = cv2.filter2D(smooth, -1, k)`,
    },
  ],
  figure: {
    title: 'Histogram Stretch Concept',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="220"><rect width="560" height="220" fill="#f6f8fb"/><text x="14" y="24" font-size="18" fill="#124f73">Before vs After Equalization</text><rect x="36" y="80" width="150" height="90" fill="#bfc8d2"/><rect x="250" y="50" width="270" height="120" fill="#0f7cb2" opacity="0.22"/><text x="36" y="188" font-size="13" fill="#445">Narrow dynamic range</text><text x="250" y="188" font-size="13" fill="#445">Expanded dynamic range</text></svg>`,
  },
};
