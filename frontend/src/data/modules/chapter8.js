import { lesson } from './lesson';

export const chapter8Module = {
  id: 'compression',
  chapter: 'Chapter 8',
  title: 'Image Compression',
  routeTitle: 'Redundancy and Compression Methods',
  overview: 'This module explains coding redundancy and practical compression tradeoffs.',
  lessons: [
    lesson('Lossless vs lossy', 'Lossless preserves exact pixels; lossy trades quality for size.', 'PNG vs JPEG is a common comparison.', `cv2.imwrite("q90.jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 90])`, 'Compare file size and artifacts.'),
    lesson('Rate-distortion tradeoff', 'More compression usually increases distortion.', 'Choose quality based on use-case constraints.', `for q in [90, 60, 30]:\n    cv2.imwrite(f"q{q}.jpg", img, [cv2.IMWRITE_JPEG_QUALITY, q])`, 'Inspect edges/textures at different qualities.'),
  ],
  codeSnippet: `cv2.imwrite("q95.jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 95])\ncv2.imwrite("q35.jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 35])`,
  lab: { type: 'local', operation: 'jpeg-sim', defaultParam: 60, paramLabel: 'JPEG Quality' },
};
