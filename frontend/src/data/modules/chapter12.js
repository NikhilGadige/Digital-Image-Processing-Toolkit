import { lesson } from './lesson';

export const chapter12Module = {
  id: 'object-recognition',
  chapter: 'Chapter 12',
  title: 'Object Recognition',
  routeTitle: 'Classification and Recognition Basics',
  overview: 'This module maps extracted features to semantic object classes.',
  lessons: [
    lesson('Feature vectors', 'Objects are represented by measurable descriptors.', 'Area and perimeter can form a simple feature vector.', `X = [[120, 50], [230, 72], [90, 41], [260, 78]]`, 'Try threshold changes and inspect class separability.'),
    lesson('Supervised classification', 'A model learns label boundaries from examples.', 'KNN predicts label from nearest known feature vectors.', `clf = KNeighborsClassifier(n_neighbors=1)\nclf.fit(X, y)`, 'Evaluate predictions near class boundaries.'),
  ],
  codeSnippet: `clf = KNeighborsClassifier(n_neighbors=1)\nclf.fit(X, y)\nprint(clf.predict([[200, 66]]))`,
  lab: { type: 'local', operation: 'feature-view', defaultParam: 110, paramLabel: 'Feature Threshold' },
};
