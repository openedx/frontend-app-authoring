import { dispatch } from 'react-redux';
import { actions } from '../../../../../../data/redux';
import { MockUseState } from '../../../../../../testUtils';
import * as requests from '../../../../../../data/redux/thunkActions/requests';
import * as hooks from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(val => ({ current: val })),
  useEffect: jest.fn(),
  useCallback: (cb, prereqs) => ({ cb, prereqs }),
}));

jest.mock('react-redux', () => {
  const dispatchFn = jest.fn();
  return {
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn(),
    dispatch: dispatchFn,
    useDispatch: jest.fn(() => dispatchFn),
  };
});

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn(),
    },
  },
}));

jest.mock('../../../../../../data/redux/thunkActions/requests', () => ({
  checkTranscriptsForImport: jest.fn(),
}));

const state = new MockUseState(hooks);

const youtubeId = 'yOuTuBEiD';
const youtubeUrl = `https://youtu.be/${youtubeId}`;

describe('VideoEditorHandout hooks', () => {
  let hook;
  describe('state hooks', () => {
    state.testGetter(state.keys.showVideoIdChangeAlert);
  });
  describe('sourceHooks', () => {
    const e = { target: { value: 'soMEvALuE' } };
    beforeEach(() => {
      hook = hooks.sourceHooks({
        dispatch,
        previousVideoId: 'soMEvALuE',
        setAlert: jest.fn(),
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    describe('updateVideoURL', () => {
      it('dispatches updateField action with new videoSource', () => {
        hook.updateVideoURL(e);
        expect(dispatch).toHaveBeenCalledWith(
          actions.video.updateField({
            videoSource: e.target.value,
          }),
        );
      });
      it('dispatches checkTranscriptsForImport request with new YouTube videoSource', () => {
        e.target.value = youtubeUrl;
        hook.updateVideoURL(e, 'video-id');
        expect(requests.checkTranscriptsForImport).toHaveBeenCalledWith({
          videoId: 'video-id',
          youTubeId: youtubeId,
          onSuccess: expect.anything(),
        });
      });
      it('dispatches updateField video action when checkTranscriptsForImport onSuccess command is import', () => {
        e.target.value = youtubeUrl;
        hook.updateVideoURL(e, 'video-id');

        const { onSuccess } = requests.checkTranscriptsForImport.mock.calls[0][0];
        onSuccess({ data: { command: 'import' } });

        expect(actions.video.updateField).toHaveBeenCalledWith({
          allowTranscriptImport: true,
        });
      });
      it('does not dispatch updateField video action when checkTranscriptsForImport onSuccess command is not import', () => {
        e.target.value = youtubeUrl;
        hook.updateVideoURL(e, 'video-id');

        const { onSuccess } = requests.checkTranscriptsForImport.mock.calls[0][0];
        onSuccess({ data: { command: 'anything else' } });

        expect(actions.video.updateField).not.toHaveBeenCalledWith({
          allowTranscriptImport: true,
        });
      });
    });
    describe('updateVideoId', () => {
      it('dispatches updateField action with new videoId', () => {
        hook.updateVideoId({ target: { value: 'newVideoId' } });
        expect(dispatch).toHaveBeenCalledWith(
          actions.video.updateField({
            videoId: e.target.value,
          }),
        );
      });
      it('dispatches updateField action with empty string', () => {
        hook.updateVideoId({ target: { value: '' } });
        expect(dispatch).toHaveBeenCalledWith(
          actions.video.updateField({
            videoId: e.target.value,
          }),
        );
      });
      it('dispatches updateField action with previousVideoId', () => {
        hook.updateVideoId({ target: { value: 'soMEvALuE' } });
        expect(dispatch).toHaveBeenCalledWith(
          actions.video.updateField({
            videoId: e.target.value,
          }),
        );
      });
    });
  });

  describe('fallbackHooks', () => {
    const videoUrl = 'sOmERAndoMuRl1';
    const fallbackVideos = ['sOmERAndoMuRl1', 'sOmERAndoMuRl2', 'sOmERAndoMuRl1', ''];
    beforeEach(() => {
      hook = hooks.fallbackHooks({ fallbackVideos, dispatch });
    });
    describe('addFallbackVideo', () => {
      it('dispatches updateField action with updated array appended by a new empty element', () => {
        hook.addFallbackVideo();
        expect(dispatch).toHaveBeenCalledWith(
          actions.video.updateField({
            fallbackVideos: [...fallbackVideos, ''],
          }),
        );
      });
    });
    describe('deleteFallbackVideo', () => {
      it('dispatches updateField action with updated array with videoUrl removed', () => {
        const updatedFallbackVideos = ['sOmERAndoMuRl2', 'sOmERAndoMuRl1', ''];
        hook.deleteFallbackVideo(videoUrl);
        expect(dispatch).toHaveBeenCalledWith(
          actions.video.updateField({
            fallbackVideos: updatedFallbackVideos,
          }),
        );
      });
    });
  });
  describe('videoIdChangeAlert', () => {
    beforeEach(() => {
      state.mock();
    });
    afterEach(() => {
      state.restore();
    });
    test('showVideoIdChangeAlert: state values', () => {
      expect(hooks.videoIdChangeAlert().videoIdChangeAlert.show).toEqual(false);
    });
    test('showVideoIdChangeAlert setters: set', () => {
      hooks.videoIdChangeAlert().videoIdChangeAlert.set();
      expect(state.setState[state.keys.showVideoIdChangeAlert]).toHaveBeenCalledWith(true);
    });
    test('showVideoIdChangeAlert setters: dismiss', () => {
      hooks.videoIdChangeAlert().videoIdChangeAlert.dismiss();
      expect(state.setState[state.keys.showVideoIdChangeAlert]).toHaveBeenCalledWith(false);
    });
  });
});
