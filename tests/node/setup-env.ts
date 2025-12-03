/* eslint-disable import/no-extraneous-dependencies, max-classes-per-file */
import { JSDOM } from 'jsdom';
import { expect as expectFn } from 'expect';
import matchers from '@testing-library/jest-dom/matchers';
import { mergeConfig } from '@edx/frontend-platform';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: process.env.JSDOM_URL || 'http://localhost/',
});

const { window } = dom;

function noop() {}

globalThis.window = window as unknown as typeof globalThis.window;
globalThis.document = window.document;
globalThis.navigator = window.navigator;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Node = window.Node;
globalThis.CustomEvent = window.CustomEvent;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: noop,
  }),
});

globalThis.IntersectionObserver = class IntersectionObserver {
  root = null;

  rootMargin = '';

  thresholds: number[] = [];

  observe() {}

  unobserve() {}

  disconnect() {}

  takeRecords() {
    return [];
  }
} as unknown as typeof globalThis.IntersectionObserver;

window.getComputedStyle = () => ({
  getPropertyValue: () => '',
} as unknown as CSSStyleDeclaration);

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
};

mergeConfig({
  SUPPORT_URL: process.env.SUPPORT_URL || null,
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || null,
  LEARNING_BASE_URL: process.env.LEARNING_BASE_URL,
  EXAMS_BASE_URL: process.env.EXAMS_BASE_URL || null,
  CALCULATOR_HELP_URL: process.env.CALCULATOR_HELP_URL || null,
  ACCOUNT_PROFILE_URL: process.env.ACCOUNT_PROFILE_URL || null,
  ACCOUNT_SETTINGS_URL: process.env.ACCOUNT_SETTINGS_URL || null,
  IGNORED_ERROR_REGEX: process.env.IGNORED_ERROR_REGEX || null,
  MFE_CONFIG_API_URL: process.env.MFE_CONFIG_API_URL || null,
  ENABLE_PROGRESS_GRAPH_SETTINGS: process.env.ENABLE_PROGRESS_GRAPH_SETTINGS || 'false',
  ENABLE_TEAM_TYPE_SETTING: process.env.ENABLE_TEAM_TYPE_SETTING === 'true',
  ENABLE_CHECKLIST_QUALITY: process.env.ENABLE_CHECKLIST_QUALITY || 'true',
  STUDIO_BASE_URL: process.env.STUDIO_BASE_URL || null,
  LMS_BASE_URL: process.env.LMS_BASE_URL || null,
  LIBRARY_UNSUPPORTED_BLOCKS: (process.env.LIBRARY_UNSUPPORTED_BLOCKS
    || 'conditional,step-builder,problem-builder').split(','),
  PARAGON_THEME_URLS: process.env.PARAGON_THEME_URLS || null,
  COURSE_TEAM_SUPPORT_EMAIL: process.env.COURSE_TEAM_SUPPORT_EMAIL || null,
}, 'CourseAuthoringConfig');

expectFn.extend(matchers);

type GlobalWithExpect = typeof globalThis & { expect: typeof expectFn };
(globalThis as GlobalWithExpect).expect = expectFn;
