import { thunkActions } from '../../data/redux';
import { MockUseState } from '../../testUtils';

import * as hooks from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(val => ({ current: val })),
  useEffect: jest.fn(),
  useCallback: (cb, prereqs) => ({ cb, prereqs }),
}));

const mockDispatchFn = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  dispatch: mockDispatchFn,
  useDispatch: jest.fn(() => mockDispatchFn),
}));

jest.mock('../../data/redux', () => ({
  thunkActions: {
    video: {
      saveVideoData: jest.fn(),
    },
  },
}));

const state = new MockUseState(hooks);

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
      expect(hooks.errorsHook().error.duration).toEqual([
        state.stateVals[state.keys.durationErrors],
        state.setState[state.keys.durationErrors],
      ]);
      expect(hooks.errorsHook().error.handout).toEqual([
        state.stateVals[state.keys.handoutErrors],
        state.setState[state.keys.handoutErrors],
      ]);
      expect(hooks.errorsHook().error.license).toEqual([
        state.stateVals[state.keys.licenseErrors],
        state.setState[state.keys.licenseErrors],
      ]);
      expect(hooks.errorsHook().error.thumbnail).toEqual([
        state.stateVals[state.keys.thumbnailErrors],
        state.setState[state.keys.thumbnailErrors],
      ]);
      expect(hooks.errorsHook().error.transcripts).toEqual([
        state.stateVals[state.keys.transcriptsErrors],
        state.setState[state.keys.transcriptsErrors],
      ]);
      expect(hooks.errorsHook().error.videoSource).toEqual([
        state.stateVals[state.keys.videoSourceErrors],
        state.setState[state.keys.videoSourceErrors],
      ]);
    });
    describe('validateEntry', () => {
      test('validateEntry: returns true if all validation calls are true', () => {
        hook = hooks.errorsHook();
        expect(hook.validateEntry()).toEqual(true);
      });
      test('validateEntry: returns false if any validation calls are false', () => {
        state.mockVal(state.keys.durationErrors, fakeDurationError);
        hook = hooks.errorsHook();
        expect(hook.validateEntry()).toEqual(false);
      });
    });
  });
  describe('fetchVideoContent', () => {
    it('equals dispatch(thunkActions.video.saveVideoData())', () => {
      hook = hooks.fetchVideoContent()({ dispatch: mockDispatchFn });
      expect(hook).toEqual(mockDispatchFn(thunkActions.video.saveVideoData()));
    });
  });
});
