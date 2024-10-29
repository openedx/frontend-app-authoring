import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { mergeConfig } from '@edx/frontend-platform';

/* need to mock window for tinymce on import, as it is JSDOM incompatible */

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Intersection Observer which is unavailable in the context of a test.
global.IntersectionObserver = jest.fn(function mockIntersectionObserver() {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
});

// Mock getComputedStyle which some Paragon components use to do size calculations.  In general
// These calculations don't matter for our test suite.
window.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(),
}));

// Ensure app-specific configs are loaded during tests since
// initialize() is not called.
mergeConfig({
  SUPPORT_URL: process.env.SUPPORT_URL || null,
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || null,
  LEARNING_BASE_URL: process.env.LEARNING_BASE_URL,
  EXAMS_BASE_URL: process.env.EXAMS_BASE_URL || null,
  CALCULATOR_HELP_URL: process.env.CALCULATOR_HELP_URL || null,
  ENABLE_PROGRESS_GRAPH_SETTINGS: process.env.ENABLE_PROGRESS_GRAPH_SETTINGS || 'false',
  ENABLE_TEAM_TYPE_SETTING: process.env.ENABLE_TEAM_TYPE_SETTING === 'true',
  ENABLE_CHECKLIST_QUALITY: process.env.ENABLE_CHECKLIST_QUALITY || 'true',
  STUDIO_BASE_URL: process.env.STUDIO_BASE_URL || null,
  LMS_BASE_URL: process.env.LMS_BASE_URL || null,
  LIBRARY_SUPPORTED_BLOCKS: (process.env.LIBRARY_SUPPORTED_BLOCKS || 'problem,video,html').split(','),
}, 'CourseAuthoringConfig');

class ResizeObserver {
  observe() {
    // do nothing
  }

  unobserve() {
    // do nothing
  }

  disconnect() {
    // do nothing
  }
}

window.ResizeObserver = ResizeObserver;

// Mock the plugins repo so jest will stop complaining about ES6 syntax
jest.mock('frontend-components-tinymce-advanced-plugins', () => {});
