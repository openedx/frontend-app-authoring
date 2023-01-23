import { dispatch } from 'react-redux';
import { actions } from '../../../../../../data/redux';
import * as hooks from './hooks';

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

describe('VideoEditorHandout hooks', () => {
  let hook;

  describe('sourceHooks', () => {
    const e = { target: { value: 'soMEvALuE' } };
    beforeEach(() => {
      hook = hooks.sourceHooks({ dispatch });
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
    });
    describe('updateVideoId', () => {
      it('dispatches updateField action with new videoId', () => {
        hook.updateVideoId(e);
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
});
