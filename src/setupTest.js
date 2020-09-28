/* eslint-disable import/no-extraneous-dependencies */
import 'babel-polyfill';
import MutationObserver from '@sheerun/mutationobserver-shim';
import { mergeConfig } from '@edx/frontend-platform';

mergeConfig({
  STUDIO_BASE_URL: process.env.STUDIO_BASE_URL,
  BLOCKSTORE_COLLECTION_UUID: process.env.BLOCKSTORE_COLLECTION_UUID,
});

window.MutationObserver = MutationObserver;
