import { mergeConfig } from '@edx/frontend-platform';
import { getUploadFileMaxSize } from '@src/constants';

const DEFAULT_MAX = 20 * 1024 * 1024;

describe('getUploadFileMaxSize()', () => {
  afterEach(() => {
    // Reset config after each test to avoid leaks
    mergeConfig({});
  });

  it('returns the global default when no config value is set', () => {
    expect(getUploadFileMaxSize()).toEqual(DEFAULT_MAX);
  });

  it('returns OVERRIDE_UPLOAD_FILE_MAX_SIZE_IN_MB when set to a valid positive integer', () => {
    mergeConfig({ OVERRIDE_UPLOAD_FILE_MAX_SIZE_IN_MB: 7 });
    expect(getUploadFileMaxSize()).toEqual(7 * 1024 * 1024);
  });

  it('falls back to default when override is not a number', () => {
    mergeConfig({ OVERRIDE_UPLOAD_FILE_MAX_SIZE_IN_MB: 'not-a-number' as any });
    expect(getUploadFileMaxSize()).toEqual(DEFAULT_MAX);
  });

  it('falls back to default when override is 0', () => {
    mergeConfig({ OVERRIDE_UPLOAD_FILE_MAX_SIZE_IN_MB: 0 });
    expect(getUploadFileMaxSize()).toEqual(DEFAULT_MAX);
  });

  it('falls back to default when override is negative', () => {
    mergeConfig({ OVERRIDE_UPLOAD_FILE_MAX_SIZE_IN_MB: -5 });
    expect(getUploadFileMaxSize()).toEqual(DEFAULT_MAX);
  });
});
