import { lesson } from './lesson';

export const chapter10Module = {
  id: 'segmentation',
  chapter: 'Chapter 10',
  title: 'Image Segmentation',
  routeTitle: 'Partitioning and Object Isolation',
  overview: 'This module separates foreground structures from background for analysis.',
  lessons: [
    lesson('Thresholding', 'Converts grayscale to binary partition.', 'Global and Otsu thresholding are common baselines.', `_, otsu = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)`, 'Use images with clear bimodal histograms.'),
    lesson('Region-based concepts', 'Region growing and watershed separate connected structures.', 'Useful for touching objects.', `# marker-based segmentation concept`, 'Test clustered object images.'),
  ],
  codeSnippet: `_, binary = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)`,
  lab: {
    tools: [
      { id: 'threshold', label: 'Global Threshold', type: 'api', endpoint: '/api/segment/threshold', methodName: 'Global Threshold', defaultParam: 127, paramLabel: 'Threshold', paramKey: 'thresh_val', paramMin: 0, paramMax: 255, paramStep: 1 },
      { id: 'otsu', label: 'Otsu Threshold', type: 'api', endpoint: '/api/segment/otsu', methodName: 'Otsu Thresholding' },
    ],
  },
};
