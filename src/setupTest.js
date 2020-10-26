/* eslint-disable import/no-extraneous-dependencies */
import 'babel-polyfill';
import MutationObserver from '@sheerun/mutationobserver-shim';
import { mergeConfig } from '@edx/frontend-platform';

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
