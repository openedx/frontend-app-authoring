import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

/* eslint-disable import/no-extraneous-dependencies */
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import 'babel-polyfill';

import { mergeConfig } from '@edx/frontend-platform';

Enzyme.configure({ adapter: new Adapter() });

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
}, 'CourseAuthoringConfig');
