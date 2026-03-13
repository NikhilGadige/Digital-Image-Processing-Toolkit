import { lesson } from './lesson';

export const chapter9Module = {
  id: 'morphological-processing',
  chapter: 'Chapter 9',
  title: 'Morphological Image Processing',
  routeTitle: 'Binary and Grayscale Morphology',
  overview: 'This module uses shape-based operators such as erosion, dilation, opening, and closing.',
  lessons: [
    lesson('Structuring elements', 'A small shape probes local geometry.', 'Kernel shape and size affect results.', `kernel = np.ones((5, 5), np.uint8)`, 'Change kernel size and observe boundaries.'),
    lesson('Opening and closing', 'Opening removes small bright artifacts; closing fills small dark gaps.', 'Useful for cleanup in masks.', `open_img = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)`, 'Try noisy binary-like inputs.'),
  ],
  codeSnippet: `opened = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)\nclosed = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)`,
  lab: {
    tools: [
      { id: 'erode', label: 'Erosion', type: 'api', endpoint: '/api/morphological/erode', methodName: 'Morphological Erosion', defaultParam: 5, paramLabel: 'Kernel Size', paramKey: 'ksize', paramMin: 1, paramStep: 1 },
      { id: 'dilate', label: 'Dilation', type: 'api', endpoint: '/api/morphological/dilate', methodName: 'Morphological Dilation', defaultParam: 5, paramLabel: 'Kernel Size', paramKey: 'ksize', paramMin: 1, paramStep: 1 },
      { id: 'opening', label: 'Opening', type: 'api', endpoint: '/api/morphological/opening', methodName: 'Morphological Opening', defaultParam: 5, paramLabel: 'Kernel Size', paramKey: 'ksize', paramMin: 1, paramStep: 1 },
      { id: 'closing', label: 'Closing', type: 'api', endpoint: '/api/morphological/closing', methodName: 'Morphological Closing', defaultParam: 5, paramLabel: 'Kernel Size', paramKey: 'ksize', paramMin: 1, paramStep: 1 },
    ],
  },
};
