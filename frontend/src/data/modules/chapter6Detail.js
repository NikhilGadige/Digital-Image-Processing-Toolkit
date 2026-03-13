export const chapter6Detail = {
  moduleId: 'color-image-processing',
  deepDive: [
    {
      title: 'Color Spaces for Processing',
      text: 'RGB is device-centric, HSV is intuitive for color masking, and Lab separates luminance from chromaticity for robust operations.',
      code: `hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)\nlab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)`,
    },
    {
      title: 'Color Segmentation',
      text: 'HSV thresholding isolates objects by hue/saturation/value ranges and is widely used in traffic sign, fruit, and marker detection tasks.',
      code: `lower = np.array([0, 100, 80], dtype=np.uint8)\nupper = np.array([20, 255, 255], dtype=np.uint8)\nmask = cv2.inRange(hsv, lower, upper)`,
    },
  ],
  figure: {
    title: 'RGB to HSV Interpretation',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="220"><rect width="560" height="220" fill="#f6f8fb"/><rect x="28" y="64" width="150" height="110" fill="#d9534f"/><rect x="202" y="64" width="150" height="110" fill="#5cb85c"/><rect x="376" y="64" width="150" height="110" fill="#428bca"/><text x="92" y="190" font-size="13" fill="#334">R</text><text x="266" y="190" font-size="13" fill="#334">G</text><text x="440" y="190" font-size="13" fill="#334">B</text><text x="18" y="28" font-size="18" fill="#124f73">Channel-wise and color-space processing</text></svg>`,
  },
};
