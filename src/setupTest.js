/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import MutationObserver from '@sheerun/mutationobserver-shim';
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

mergeConfig({
  STUDIO_BASE_URL: process.env.STUDIO_BASE_URL,
  BLOCKSTORE_COLLECTION_UUID: process.env.BLOCKSTORE_COLLECTION_UUID,
  SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL: process.env.SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL,
});

window.MutationObserver = MutationObserver;

let store = {};

const mockStorage = {
  getItem: (key) => {
    if (key in store) {
      return store[key];
    }
    return null;
  },
  setItem: (key, value) => {
    store[key] = `${value}`;
  },
  removeItem: (key) => {
    delete store[key];
  },
  reset() {
    store = {};
  },
};

Object.defineProperty(window, 'localStorage', { value: mockStorage });
