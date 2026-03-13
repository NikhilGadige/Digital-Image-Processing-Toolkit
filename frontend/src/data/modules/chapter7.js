import { lesson } from './lesson';

export const chapter7Module = {
  id: 'wavelets-and-multiresolution',
  chapter: 'Chapter 7',
  title: 'Wavelets and Multiresolution Processing',
  routeTitle: 'Scale-Space and Multiresolution Views',
  overview: 'This module studies image representations at multiple scales.',
  lessons: [
    lesson('Multiresolution representation', 'Images can be analyzed coarse-to-fine.', 'Pyramids summarize scale changes.', `g1 = cv2.pyrDown(img)\ng2 = cv2.pyrDown(g1)`, 'Increase levels and observe detail loss.'),
    lesson('Wavelet decomposition concept', 'Approximation and detail bands separate structure and texture.', 'Useful in denoising and compression.', `# LL, LH, HL, HH band intuition`, 'Observe detail suppression over scales.'),
  ],
  codeSnippet: `g1 = cv2.pyrDown(img)\ng2 = cv2.pyrDown(g1)\nrecon = cv2.pyrUp(g2)`,
  lab: { type: 'local', operation: 'pyramid', defaultParam: 2, paramLabel: 'Pyramid Levels' },
};
