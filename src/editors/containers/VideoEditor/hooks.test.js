import { MockUseState } from '../../../testUtils';

import { keyStore } from '../../utils';
import * as module from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
}));

const state = new MockUseState(module);
const moduleKeys = keyStore(module);

let hook;

describe('VideoEditorHooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('state hooks', () => {
    state.testGetter(state.keys.durationErrors);
    state.testGetter(state.keys.handoutErrors);
    state.testGetter(state.keys.licenseErrors);
    state.testGetter(state.keys.thumbnailErrors);
    state.testGetter(state.keys.transcriptsErrors);
    state.testGetter(state.keys.videoSourceErrors);
  });

  describe('errors hook', () => {
    beforeEach(() => {
      state.mock();
    });
    afterEach(() => {
      state.restore();
    });

    const mockTrue = () => true;
    const mockFalse = () => false;
    test('error: state values', () => {
      expect(module.errorsHook().error).toEqual({
        duration: state.stateVals[state.keys.durationErrors],
        handout: state.stateVals[state.keys.handoutErrors],
        license: state.stateVals[state.keys.licenseErrors],
        thumbnail: state.stateVals[state.keys.thumbnailErrors],
        transcripts: state.stateVals[state.keys.transcriptsErrors],
        videoSource: state.stateVals[state.keys.videoSourceErrors],
      });
    });
    describe('validateEntry', () => {
      beforeEach(() => {
        hook = module.errorsHook();
      });
      test('validateEntry: returns true if all validation calls are true', () => {
        jest.spyOn(module, moduleKeys.validateDuration).mockImplementationOnce(mockTrue);
        jest.spyOn(module, moduleKeys.validateHandout).mockImplementationOnce(mockTrue);
        jest.spyOn(module, moduleKeys.validateLicense).mockImplementationOnce(mockTrue);
        jest.spyOn(module, moduleKeys.validateThumbnail).mockImplementationOnce(mockTrue);
        jest.spyOn(module, moduleKeys.validateTranscripts).mockImplementationOnce(mockTrue);
        jest.spyOn(module, moduleKeys.validateVideoSource).mockImplementationOnce(mockTrue);
        expect(hook.validateEntry()).toEqual(true);
      });
      test('validateEntry: returns false if any validation calls are false', () => {
        jest.spyOn(module, moduleKeys.validateDuration).mockImplementationOnce(mockFalse);
        jest.spyOn(module, moduleKeys.validateHandout).mockImplementationOnce(mockTrue);
        jest.spyOn(module, moduleKeys.validateLicense).mockImplementationOnce(mockTrue);
        jest.spyOn(module, moduleKeys.validateThumbnail).mockImplementationOnce(mockTrue);
        jest.spyOn(module, moduleKeys.validateTranscripts).mockImplementationOnce(mockTrue);
        jest.spyOn(module, moduleKeys.validateVideoSource).mockImplementationOnce(mockTrue);
        expect(hook.validateEntry()).toEqual(false);
      });
    });
  });
});
