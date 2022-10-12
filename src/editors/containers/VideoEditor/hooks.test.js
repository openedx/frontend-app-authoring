import { MockUseState } from '../../../testUtils';

import * as module from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
}));

const state = new MockUseState(module);

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

    const fakeDurationError = {
      field1: 'field1msg',
      field2: 'field2msg',
    };
    test('error: state values', () => {
      expect(module.errorsHook().error.duration).toEqual([
        state.stateVals[state.keys.durationErrors],
        state.setState[state.keys.durationErrors],
      ]);
      expect(module.errorsHook().error.handout).toEqual([
        state.stateVals[state.keys.handoutErrors],
        state.setState[state.keys.handoutErrors],
      ]);
      expect(module.errorsHook().error.license).toEqual([
        state.stateVals[state.keys.licenseErrors],
        state.setState[state.keys.licenseErrors],
      ]);
      expect(module.errorsHook().error.thumbnail).toEqual([
        state.stateVals[state.keys.thumbnailErrors],
        state.setState[state.keys.thumbnailErrors],
      ]);
      expect(module.errorsHook().error.transcripts).toEqual([
        state.stateVals[state.keys.transcriptsErrors],
        state.setState[state.keys.transcriptsErrors],
      ]);
      expect(module.errorsHook().error.videoSource).toEqual([
        state.stateVals[state.keys.videoSourceErrors],
        state.setState[state.keys.videoSourceErrors],
      ]);
    });
    describe('validateEntry', () => {
      test('validateEntry: returns true if all validation calls are true', () => {
        hook = module.errorsHook();
        expect(hook.validateEntry()).toEqual(true);
      });
      test('validateEntry: returns false if any validation calls are false', () => {
        state.mockVal(state.keys.durationErrors, fakeDurationError);
        hook = module.errorsHook();
        expect(hook.validateEntry()).toEqual(false);
      });
    });
  });
});
