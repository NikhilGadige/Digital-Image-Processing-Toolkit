import { chapter2Module } from './modules/chapter2';
import { chapter3Module } from './modules/chapter3';
import { chapter4Module } from './modules/chapter4';
import { chapter5Module } from './modules/chapter5';
import { chapter6Module } from './modules/chapter6';
import { chapter7Module } from './modules/chapter7';
import { chapter8Module } from './modules/chapter8';
import { chapter9Module } from './modules/chapter9';
import { chapter10Module } from './modules/chapter10';
import { chapter11Module } from './modules/chapter11';
import { chapter12Module } from './modules/chapter12';

export const moduleCatalog = [
  chapter2Module,
  chapter3Module,
  chapter4Module,
  chapter5Module,
  chapter6Module,
  chapter7Module,
  chapter8Module,
  chapter9Module,
  chapter10Module,
  chapter11Module,
  chapter12Module,
];

export const textbookMapNodes = [
  { key: 'c6', chapter: 'module 5', title: 'Color Image Processing', moduleId: chapter6Module.id, zone: 'top-1' },
  { key: 'c7', chapter: 'module 6', title: 'Wavelets & Other Image Transforms', moduleId: chapter7Module.id, zone: 'top-2' },
  { key: 'c8', chapter: 'module 7', title: 'Compression and Watermarking', moduleId: chapter8Module.id, zone: 'top-3' },
  { key: 'c9', chapter: 'module 8', title: 'Morphological Processing', moduleId: chapter9Module.id, zone: 'top-4' },
  { key: 'c5', chapter: 'module 4', title: 'Image Restoration', moduleId: chapter5Module.id, zone: 'left-1' },
  { key: 'c34', chapter: 'module 2 & 3', title: 'Image Filtering and Enhancement', moduleId: chapter3Module.id, altModuleId: chapter4Module.id, zone: 'left-2' },
  { key: 'c2', chapter: 'module 1', title: 'Image Acquisition', moduleId: chapter2Module.id, zone: 'left-3' },
  { key: 'c10', chapter: 'module 9', title: 'Segmentation', moduleId: chapter10Module.id, zone: 'right-1' },
  { key: 'c11', chapter: 'module 10', title: 'Feature Extraction', moduleId: chapter11Module.id, zone: 'right-2' },
  { key: 'c12', chapter: 'module 11', title: 'Image Pattern Classification', moduleId: chapter12Module.id, zone: 'right-3' },
];

export const dipRoadmap = textbookMapNodes.map((item) => ({
  key: item.key,
  title: item.title,
  description: `${item.chapter} module`,
  moduleId: item.moduleId,
}));

export const moduleMap = moduleCatalog.reduce((acc, moduleInfo) => {
  acc[moduleInfo.id] = moduleInfo;
  return acc;
}, {});
