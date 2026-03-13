import { lesson } from './lesson';

export const chapter11Module = {
  id: 'representation-and-description',
  chapter: 'Chapter 11',
  title: 'Representation and Description',
  routeTitle: 'Shape Representation and Feature Description',
  overview: 'This module extracts geometric and statistical features from segmented objects.',
  lessons: [
    lesson('Boundary descriptors', 'Contours represent object boundaries.', 'Perimeter and contour shape are basic features.', `contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)`, 'Compare contour features across shapes.'),
    lesson('Region descriptors', 'Area, moments, and topology describe object regions.', 'Useful for downstream classification.', `area = cv2.contourArea(contour)\nM = cv2.moments(contour)`, 'Compare descriptors for similar objects.'),
  ],
  codeSnippet: `area = cv2.contourArea(c)\nperimeter = cv2.arcLength(c, True)`,
  lab: { type: 'local', operation: 'contour-outline', defaultParam: 120, paramLabel: 'Binary Threshold' },
};
