import { renderHook, act } from '@testing-library/react';

import {
  checkValidFileSize,
  checkValidFileType,
  parseAssetName,
  useErrorToggle,
} from './fileValidation';

describe('fileValidation utilities', () => {
  describe('checkValidFileSize', () => {
    it('returns false and calls onSizeFail when the file exceeds the max size', () => {
      const onSizeFail = jest.fn();

      const isValid = checkValidFileSize({
        file: { size: 101 },
        onSizeFail,
        maxBytes: 100,
      });

      expect(isValid).toEqual(false);
      expect(onSizeFail).toHaveBeenCalled();
    });

    it('returns true when the file is within the max size', () => {
      const onSizeFail = jest.fn();

      const isValid = checkValidFileSize({
        file: { size: 100 },
        onSizeFail,
        maxBytes: 100,
      });

      expect(isValid).toEqual(true);
      expect(onSizeFail).not.toHaveBeenCalled();
    });
  });

  describe('checkValidFileType', () => {
    it('returns true when the mime type is allowed', () => {
      const isValid = checkValidFileType({
        file: { type: 'audio/mpeg', name: 'audio-description.bin' },
        allowedTypes: ['audio/mpeg'],
        allowedExtensions: ['.mp3'],
        onTypeFail: jest.fn(),
      });

      expect(isValid).toEqual(true);
    });

    it('returns true when the extension is allowed even if the mime type is generic', () => {
      const isValid = checkValidFileType({
        file: { type: 'application/octet-stream', name: 'audio-description.MP3' },
        allowedTypes: ['audio/mpeg'],
        allowedExtensions: ['.mp3'],
        onTypeFail: jest.fn(),
      });

      expect(isValid).toEqual(true);
    });

    it('returns false and calls onTypeFail when neither the mime type nor extension is allowed', () => {
      const onTypeFail = jest.fn();

      const isValid = checkValidFileType({
        file: { type: 'text/plain', name: 'notes.txt' },
        allowedTypes: ['audio/mpeg'],
        allowedExtensions: ['.mp3'],
        onTypeFail,
      });

      expect(isValid).toEqual(false);
      expect(onTypeFail).toHaveBeenCalled();
    });
  });

  describe('parseAssetName', () => {
    it('returns None for an empty asset path', () => {
      expect(parseAssetName('')).toEqual('None');
    });

    it('extracts the filename after @ for legacy asset keys', () => {
      expect(parseAssetName('/asset-v1:org+course+run@audio-description.mp3')).toEqual('audio-description.mp3');
    });

    it('extracts the filename after the last slash for regular urls', () => {
      expect(parseAssetName('https://cdn.example.com/path/audio-description.mp3')).toEqual('audio-description.mp3');
    });
  });

  describe('useErrorToggle', () => {
    it('toggles the error visibility on set and dismiss', () => {
      const { result } = renderHook(() => useErrorToggle());

      expect(result.current.show).toEqual(false);

      act(() => {
        result.current.set();
      });
      expect(result.current.show).toEqual(true);

      act(() => {
        result.current.dismiss();
      });
      expect(result.current.show).toEqual(false);
    });
  });
});
