import { dispatch } from 'react-redux';
import { actions } from '../../../../../../data/redux';
import * as hooks from './hooks';

jest.mock('react-redux', () => {
  const dispatchFn = jest.fn();
  return {
    ...jest.requireActual('react-redux'),
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
  describe('updateVideoType', () => {
    const sourceEdxVideo = {
      onBlur: jest.fn(),
      local: '06b1503a-7df4-4e72-b970-326e02dbcbe4',
    };
    const sourceYouTube = {
      onBlur: jest.fn(),
      local: 'youtu.be',
    };
    const sourceHtml5Source = {
      onBlur: jest.fn(),
      local: 'sOMEranDomfILe.mp4',
    };
    const mockState = {
      videoId: '',
      videoType: '',
      allowVideoDownloads: false,
      thumbnail: null,
      transcripts: [],
      allowTranscriptDownloads: false,
      showTranscriptByDefault: false,
      duration: {
        startTime: '00:00:00',
        stopTime: '00:00:00',
        total: '00:00:00',
      },
      licenseType: null,
    };
    it('returns dispatches updateField action with default state and edxVideo Id', () => {
      hooks.updateVideoType({ dispatch })({ e: { target: { value: sourceEdxVideo.local } }, source: sourceEdxVideo });
      expect(dispatch).toHaveBeenCalledWith(
        actions.video.updateField({
          ...mockState,
          videoId: sourceEdxVideo.local,
          videoType: 'edxVideo',
        }),
      );
    });
    it('returns dispatches updateField action with default state and YouTube video', () => {
      hooks.updateVideoType({ dispatch })({
        e: { target: { value: sourceYouTube.local } },
        source: sourceYouTube,
      });
      expect(dispatch).toHaveBeenCalledWith(
        actions.video.updateField({
          ...mockState,
          videoId: sourceYouTube.local,
        }),
      );
    });
    it('returns dispatches updateField action with default state and html5source video', () => {
      hooks.updateVideoType({ dispatch })({
        e: { target: { value: sourceHtml5Source.local } },
        source: sourceHtml5Source,
      });
      expect(dispatch).toHaveBeenCalledWith(
        actions.video.updateField({
          ...mockState,
          videoId: sourceHtml5Source.local,
        }),
      );
    });
  });

  describe('deleteFallbackVideo', () => {
    const videoUrl = 'sOmERAndoMuRl1';
    const fallbackVideos = ['sOmERAndoMuRl1', 'sOmERAndoMuRl2', 'sOmERAndoMuRl1', ''];
    const updatedFallbackVideos = ['sOmERAndoMuRl2', 'sOmERAndoMuRl1', ''];
    it('returns dispatches updateField action with updatedFallbackVideos', () => {
      hooks.deleteFallbackVideo({ fallbackVideos, dispatch })(videoUrl);
      expect(dispatch).toHaveBeenCalledWith(
        actions.video.updateField({
          fallbackVideos: updatedFallbackVideos,
        }),
      );
    });
  });
});
