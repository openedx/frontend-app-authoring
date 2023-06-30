import * as hooks from './hooks';
import { MockUseState } from '../../../testUtils';

const state = new MockUseState(hooks);
const setLoading = jest.fn();
const setErrorMessage = jest.fn();
const uploadVideo = jest.fn();

describe('Video Upload Editor hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('state hooks', () => {
    state.testGetter(state.keys.loading);
    state.testGetter(state.keys.errorMessage);
    state.testGetter(state.keys.textInputValue);
  });
  describe('using state', () => {
    beforeEach(() => { state.mock(); });
    afterEach(() => { state.restore(); });

    describe('Hooks for Video Upload', () => {
      beforeEach(() => {
        hooks.uploadEditor();
        hooks.uploader();
      });
      it('initialize state with correct values', () => {
        expect(state.stateVals.loading).toEqual(false);
        expect(state.stateVals.errorMessage).toEqual(null);
        expect(state.stateVals.textInputValue).toEqual('');
      });
    });
  });
  describe('File Validation', () => {
    it('Checks with valid MIME type', () => {
      const file = new File(['(⌐□_□)'], 'video.mp4', { type: 'video/mp4' });
      const validator = hooks.fileValidator(setLoading, setErrorMessage, uploadVideo);
      validator(file);
      expect(uploadVideo).toHaveBeenCalled();
      expect(setErrorMessage).not.toHaveBeenCalled();
    });
    it('Checks with invalid MIME type', () => {
      const file = new File(['(⌐□_□)'], 'video.gif', { type: 'video/mp4' });
      const validator = hooks.fileValidator(setLoading, setErrorMessage, uploadVideo);
      validator(file);
      expect(uploadVideo).not.toHaveBeenCalled();
      expect(setErrorMessage).toHaveBeenCalled();
    });
  });
});
