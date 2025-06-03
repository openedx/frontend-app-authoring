import * as hooks from './hooks';
import * as appHooks from '../../hooks';
import { thunkActions } from '../../data/redux';

jest.mock('../../data/store', () => ({
  __esModule: true,
  default: {},
}));

const mockState = {
  app: {
    learningContextId: 'course-v1:id',
    blockId: 'block-v1:id',
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(selector => selector(mockState)),
}));

jest.mock('../../hooks', () => ({
  navigateTo: jest.fn(),
}));

jest.mock('../../data/redux', () => ({
  thunkActions: {
    video: {
      uploadVideo: jest.fn(),
    },
  },
  selectors: {
    app: {
      learningContextId: jest.fn(state => state.app.learningContextId),
      blockId: jest.fn(state => state.app.blockId),
    },
  },
}));

describe('hooks module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('postUploadRedirect', () => {
    it('returns a function that navigates to the correct URL', () => {
      const storeState = {
        app: {
          learningContextId: 'course-v1:test',
          blockId: 'block-123',
        },
      };
      const redirectFn = hooks.postUploadRedirect(storeState);
      redirectFn('test-video-url');

      expect(appHooks.navigateTo).toHaveBeenCalledWith(
        '/course/course-v1:test/editor/video/block-123?selectedVideoUrl=test-video-url',
      );
    });

    it('uses custom uploadType in URL if provided', () => {
      const storeState = {
        app: {
          learningContextId: 'course-v1:test',
          blockId: 'block-123',
        },
      };
      const redirectFn = hooks.postUploadRedirect(storeState, 'customType');
      redirectFn('test-video-url');

      expect(appHooks.navigateTo).toHaveBeenCalledWith(
        '/course/course-v1:test/editor/video/block-123?customType=test-video-url',
      );
    });
  });

  describe('useUploadVideo', () => {
    it('dispatches uploadVideo thunk with correct parameters', async () => {
      const dispatch = jest.fn();
      const supportedFiles = ['file1.mp4'];
      const setLoadSpinner = jest.fn();
      const postUploadRedirectFunction = jest.fn();

      await hooks.useUploadVideo({
        dispatch,
        supportedFiles,
        setLoadSpinner,
        postUploadRedirectFunction,
      });

      expect(thunkActions.video.uploadVideo).toHaveBeenCalledWith({
        supportedFiles,
        setLoadSpinner,
        postUploadRedirectFunction,
      });
      expect(dispatch).toHaveBeenCalled();
    });
  });

  describe('useHistoryGoBack', () => {
    it('returns a function that calls window.history.back', () => {
      window.history.back = jest.fn();
      const goBack = hooks.useHistoryGoBack();
      goBack();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
