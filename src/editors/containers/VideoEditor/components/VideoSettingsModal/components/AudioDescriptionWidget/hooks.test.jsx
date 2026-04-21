import { renderHook, act } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';

import { thunkActions } from '../../../../../../data/redux';
import { fileInput as sharedFileInput } from '../../../../../../sharedComponents/FileInput';
import {
  checkValidFileSize,
  checkValidFileType,
} from '../../../../../../sharedComponents/FileInput/fileValidation';
import * as hooks from './hooks';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../../../../../data/redux', () => ({
  thunkActions: {
    video: {
      uploadAudioDescription: jest.fn(),
    },
  },
  selectors: {
    video: {
      duration: jest.fn(),
    },
  },
}));

jest.mock('../../../../../../sharedComponents/FileInput', () => ({
  fileInput: jest.fn(),
}));

jest.mock('../../../../../../sharedComponents/FileInput/fileValidation', () => ({
  checkValidFileSize: jest.fn(),
  checkValidFileType: jest.fn(),
}));

describe('AudioDescriptionWidget hooks', () => {
  const dispatch = jest.fn();
  const sharedHook = { click: jest.fn(), addFile: jest.fn(), ref: { current: null } };

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(dispatch);
    sharedFileInput.mockImplementation(({ onAddFile }) => ({
      ...sharedHook,
      onAddFile,
    }));
  });

  describe('fileInput', () => {
    const fileSizeError = { set: jest.fn() };
    const fileTypeError = { set: jest.fn() };
    const onDurationChecked = jest.fn();
    const selectedFile = { name: 'audio-description.mp3', size: 123, type: 'audio/mpeg' };

    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => 'blob:audio-description');
      global.URL.revokeObjectURL = jest.fn();
      global.Audio = jest.fn(() => ({
        preload: '',
        duration: 61.4,
        onloadedmetadata: null,
        onerror: null,
        set src(value) {
          this.sourceValue = value;
          if (this.onloadedmetadata) {
            this.onloadedmetadata();
          }
        },
      }));
    });

    it('delegates to the shared file input hook', () => {
      const hook = hooks.useFileInput({ fileSizeError, fileTypeError, onDurationChecked });

      expect(hook.click).toEqual(sharedHook.click);
      expect(sharedFileInput).toHaveBeenCalled();
    });

    it('dispatches upload after size and type validation succeed', () => {
      checkValidFileSize.mockReturnValue(true);
      checkValidFileType.mockReturnValue(true);
      thunkActions.video.uploadAudioDescription.mockReturnValue({ type: 'uploadAudioDescription' });
      const hook = hooks.useFileInput({ fileSizeError, fileTypeError, onDurationChecked });

      hook.onAddFile(selectedFile);

      expect(checkValidFileSize).toHaveBeenCalledWith({
        file: selectedFile,
        onSizeFail: expect.any(Function),
      });
      expect(checkValidFileType).toHaveBeenCalledWith({
        file: selectedFile,
        allowedTypes: expect.any(Array),
        allowedExtensions: ['.mp3', '.ogg', '.m4a', '.wav', '.aac'],
        onTypeFail: expect.any(Function),
      });
      expect(onDurationChecked).toHaveBeenCalledWith(61);
      expect(dispatch).toHaveBeenCalledWith({ type: 'uploadAudioDescription' });
      expect(thunkActions.video.uploadAudioDescription).toHaveBeenCalledWith({ file: selectedFile });
    });

    it('skips duration check when onDurationChecked is null', () => {
      checkValidFileSize.mockReturnValue(true);
      checkValidFileType.mockReturnValue(true);
      thunkActions.video.uploadAudioDescription.mockReturnValue({ type: 'uploadAudioDescription' });
      const hook = hooks.useFileInput({ fileSizeError, fileTypeError, onDurationChecked: null });

      hook.onAddFile(selectedFile);

      expect(dispatch).toHaveBeenCalledWith({ type: 'uploadAudioDescription' });
    });

    it('cleans up the object URL when audio.onerror fires', () => {
      global.Audio = jest.fn(() => ({
        preload: '',
        duration: 0,
        onloadedmetadata: null,
        onerror: null,
        set src(value) {
          this.sourceValue = value;
          if (this.onerror) {
            this.onerror();
          }
        },
      }));

      checkValidFileSize.mockReturnValue(true);
      checkValidFileType.mockReturnValue(true);
      thunkActions.video.uploadAudioDescription.mockReturnValue({ type: 'uploadAudioDescription' });
      const hook = hooks.useFileInput({ fileSizeError, fileTypeError, onDurationChecked });

      hook.onAddFile(selectedFile);

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:audio-description');
      expect(onDurationChecked).not.toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalled();
    });

    it('stops before type validation when the size validation fails', () => {
      checkValidFileSize.mockImplementation(({ onSizeFail }) => {
        onSizeFail();
        return false;
      });
      const hook = hooks.useFileInput({ fileSizeError, fileTypeError, onDurationChecked });

      hook.onAddFile(selectedFile);

      expect(fileSizeError.set).toHaveBeenCalled();
      expect(checkValidFileType).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('stops before dispatch when the type validation fails', () => {
      checkValidFileSize.mockReturnValue(true);
      checkValidFileType.mockImplementation(({ onTypeFail }) => {
        onTypeFail();
        return false;
      });
      const hook = hooks.useFileInput({ fileSizeError, fileTypeError, onDurationChecked });

      hook.onAddFile(selectedFile);

      expect(fileTypeError.set).toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
      expect(onDurationChecked).not.toHaveBeenCalled();
    });
  });

  describe('useDurationWarning', () => {
    it('shows a warning when the audio duration differs by more than one second', () => {
      useSelector.mockReturnValue({ total: '00:01:00' });

      const { result } = renderHook(() => hooks.useDurationWarning());

      act(() => {
        result.current.durationWarning.onDurationChecked(65);
      });

      expect(result.current.durationWarning.show).toEqual(true);
      expect(result.current.durationWarning.adDuration).toEqual(65);
      expect(result.current.durationWarning.videoDuration).toEqual(60);
    });

    it('does not show a warning when the durations are within one second', () => {
      useSelector.mockReturnValue({ total: '00:01:00' });

      const { result } = renderHook(() => hooks.useDurationWarning());

      act(() => {
        result.current.durationWarning.onDurationChecked(61);
      });

      expect(result.current.durationWarning.show).toEqual(false);
    });

    it('dismiss clears an active warning', () => {
      useSelector.mockReturnValue({ total: '00:01:00' });

      const { result } = renderHook(() => hooks.useDurationWarning());

      act(() => {
        result.current.durationWarning.onDurationChecked(70);
      });
      act(() => {
        result.current.durationWarning.dismiss();
      });

      expect(result.current.durationWarning.show).toEqual(false);
      expect(result.current.durationWarning.adDuration).toEqual(0);
      expect(result.current.durationWarning.videoDuration).toEqual(0);
    });

    it('handles MM:SS duration format correctly', () => {
      useSelector.mockReturnValue({ total: '02:30' });

      const { result } = renderHook(() => hooks.useDurationWarning());

      act(() => {
        result.current.durationWarning.onDurationChecked(160);
      });

      expect(result.current.durationWarning.show).toEqual(true);
      expect(result.current.durationWarning.videoDuration).toEqual(150);
    });

    it('handles plain number duration string correctly', () => {
      useSelector.mockReturnValue({ total: '90' });

      const { result } = renderHook(() => hooks.useDurationWarning());

      act(() => {
        result.current.durationWarning.onDurationChecked(100);
      });

      expect(result.current.durationWarning.show).toEqual(true);
      expect(result.current.durationWarning.videoDuration).toEqual(90);
    });

    it('handles numeric duration total from Redux', () => {
      useSelector.mockReturnValue({ total: 120 });

      const { result } = renderHook(() => hooks.useDurationWarning());

      act(() => {
        result.current.durationWarning.onDurationChecked(130);
      });

      expect(result.current.durationWarning.show).toEqual(true);
      expect(result.current.durationWarning.videoDuration).toEqual(120);
    });

    it('returns 0 when duration total is null', () => {
      useSelector.mockReturnValue({ total: null });

      const { result } = renderHook(() => hooks.useDurationWarning());

      act(() => {
        result.current.durationWarning.onDurationChecked(60);
      });

      expect(result.current.durationWarning.show).toEqual(false);
    });

    it('returns 0 when duration total is an invalid string', () => {
      useSelector.mockReturnValue({ total: 'invalid' });

      const { result } = renderHook(() => hooks.useDurationWarning());

      act(() => {
        result.current.durationWarning.onDurationChecked(60);
      });

      expect(result.current.durationWarning.show).toEqual(false);
    });
  });
});
