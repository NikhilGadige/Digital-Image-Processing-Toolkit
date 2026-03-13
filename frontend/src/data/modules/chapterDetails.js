import { chapter2Detail } from './chapter2Detail';
import { chapter3Detail } from './chapter3Detail';
import { chapter4Detail } from './chapter4Detail';
import { chapter5Detail } from './chapter5Detail';
import { chapter6Detail } from './chapter6Detail';

const detailedChapters = [chapter2Detail, chapter3Detail, chapter4Detail, chapter5Detail, chapter6Detail];

export const chapterDetailMap = detailedChapters.reduce((acc, item) => {
  acc[item.moduleId] = item;
  return acc;
}, {});
