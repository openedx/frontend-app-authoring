import { actions } from '..';
import { keyStore } from '../../../utils';
import * as thunkActions from './video';

jest.mock('..', () => ({
  actions: {
    video: {
      load: (args) => ({ load: args }),
      updateField: (args) => ({ updateField: args }),
    },
  },
  selectors: {
    video: {
      videoId: (state) => ({ videoId: state }),
    },
  },
}));
jest.mock('./requests', () => ({
  deleteTranscript: (args) => ({ deleteTranscript: args }),
  uploadTranscript: (args) => ({ uploadTranscript: args }),
}));
const thunkActionsKeys = keyStore(thunkActions);

const mockLanguage = 'la';
const mockFile = 'soMEtRANscRipT';
const mockFilename = 'soMEtRANscRipT.srt';

const testMetadata = {
  download_track: 'dOWNlOAdTraCK',
  download_video: 'downLoaDViDEo',
  edx_video_id: 'soMEvIDEo',
  end_time: 'StOpTIMe',
  handout: 'hANdoUT',
  html5_sources: [],
  license: 'liCENse',
  show_captions: 'shOWcapTIONS',
  start_time: 'stARtTiME',
  transcripts: { la: 'test VALUE' },
};
const testState = { transcripts: { la: 'test VALUE' }, videoId: 'soMEvIDEo' };
const testUpload = { transcripts: { la: { filename: mockFilename } } };
const testReplaceUpload = {
  file: mockFile,
  language: mockLanguage,
  filename: mockFilename,
};

describe('video thunkActions', () => {
  let dispatch;
  let getState;
  let dispatchedAction;
  beforeEach(() => {
    dispatch = jest.fn((action) => ({ dispatch: action }));
    getState = jest.fn(() => ({
      app: {
        blockId: 'soMEBloCk',
        blockValue: { data: { metadata: { ...testMetadata } } },
        studioEndpointUrl: 'soMEeNDPoiNT',
      },
      video: testState,
    }));
  });
  describe('loadVideoData', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('dispatches actions.video.load', () => {
      jest.spyOn(thunkActions, thunkActionsKeys.determineVideoSource).mockReturnValue({
        videoSource: 'videOsOurce',
        videoId: 'videOiD',
        fallbackVideos: 'fALLbACKvIDeos',
      });
      jest.spyOn(thunkActions, thunkActionsKeys.parseLicense).mockReturnValue([
        'liCENSEtyPe',
        {
          by: true,
          nc: true,
          nd: true,
          sa: false,
        },
      ]);
      thunkActions.loadVideoData()(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(actions.video.load({
        videoSource: 'videOsOurce',
        videoId: 'videOiD',
        fallbackVideos: 'fALLbACKvIDeos',
        allowVideoDownloads: testMetadata.download_video,
        transcripts: testMetadata.transcripts,
        allowTranscriptDownloads: testMetadata.download_track,
        showTranscriptByDefault: testMetadata.show_captions,
        duration: {
          startTime: testMetadata.start_time,
          stopTime: testMetadata.end_time,
          total: null,
        },
        handout: testMetadata.handout,
        licenseType: 'liCENSEtyPe',
        licenseDetails: {
          attribution: true,
          noncommercial: true,
          noDerivatives: true,
          shareAlike: false,
        },
      }));
    });
  });
  describe('determineVideoSource', () => {
    const edxVideoId = 'EDxviDEoiD';
    const youtubeId = 'yOuTuBEiD';
    const html5Sources = ['htmLOne', 'hTMlTwo', 'htMLthrEE'];
    describe('when there is an edx video id, youtube id and html5 sources', () => {
      it('returns the edx video id for video source and html5 sources for fallback videos', () => {
        expect(thunkActions.determineVideoSource({
          edxVideoId,
          youtubeId,
          html5Sources,
        })).toEqual({
          videoSource: edxVideoId,
          videoId: edxVideoId,
          fallbackVideos: html5Sources,
        });
      });
    });
    describe('when there is no edx video id', () => {
      it('returns the youtube id for video source and html5 sources for fallback videos', () => {
        expect(thunkActions.determineVideoSource({
          edxVideoId: '',
          youtubeId,
          html5Sources,
        })).toEqual({
          videoSource: youtubeId,
          videoId: '',
          fallbackVideos: html5Sources,
        });
      });
    });
    describe('when there is no edx video id and no youtube id', () => {
      it('returns the first html5 source for video source and the rest for fallback videos', () => {
        expect(thunkActions.determineVideoSource({
          edxVideoId: '',
          youtubeId: '',
          html5Sources,
        })).toEqual({
          videoSource: 'htmLOne',
          videoId: '',
          fallbackVideos: ['hTMlTwo', 'htMLthrEE'],
        });
      });
      it('returns the html5 source for video source and an empty array for fallback videos', () => {
        expect(thunkActions.determineVideoSource({
          edxVideoId: '',
          youtubeId: '',
          html5Sources: ['htmlOne'],
        })).toEqual({
          videoSource: 'htmlOne',
          videoId: '',
          fallbackVideos: [],
        });
      });
    });
    describe('when there is no edx video id, no youtube id and no html5 sources', () => {
      it('returns an empty string for video source and an empty array for fallback videos', () => {
        expect(thunkActions.determineVideoSource({
          edxVideoId: '',
          youtubeId: '',
          html5Sources: [],
        })).toEqual({
          videoSource: '',
          videoId: '',
          fallbackVideos: [],
        });
      });
    });
  });
  describe('parseLicense', () => {
    let license;
    it('returns all-rights-reserved when there is no license', () => {
      expect(thunkActions.parseLicense(license)).toEqual([
        'all-rights-reserved',
        {},
      ]);
    });
    it('returns expected values for a license with no options', () => {
      license = 'sOmeLIcense';
      expect(thunkActions.parseLicense(license)).toEqual([
        license,
        {},
      ]);
    });
    it('returns expected type and options for creative commons', () => {
      license = 'creative-commons: ver=4.0 BY NC ND';
      expect(thunkActions.parseLicense(license)).toEqual([
        'creative-commons',
        {
          by: true,
          nc: true,
          nd: true,
        },
        '4.0',
      ]);
    });
  });
  describe('deleteTranscript', () => {
    beforeEach(() => {
      thunkActions.deleteTranscript({ language: mockLanguage })(dispatch, getState);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches deleteTranscript action', () => {
      expect(dispatchedAction.deleteTranscript).not.toEqual(undefined);
    });
    it('dispatches actions.video.updateField on success', () => {
      dispatch.mockClear();
      dispatchedAction.deleteTranscript.onSuccess();
      expect(dispatch).toHaveBeenCalledWith(actions.video.updateField({ transcripts: {} }));
    });
  });
  describe('uploadTranscript', () => {
    beforeEach(() => {
      thunkActions.uploadTranscript({
        language: mockLanguage,
        filename: mockFilename,
        file: mockFile,
      })(dispatch, getState);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches uploadTranscript action', () => {
      expect(dispatchedAction.uploadTranscript).not.toEqual(undefined);
    });
    it('dispatches actions.video.updateField on success', () => {
      dispatch.mockClear();
      dispatchedAction.uploadTranscript.onSuccess();
      expect(dispatch).toHaveBeenCalledWith(actions.video.updateField(testUpload));
    });
  });
  describe('replaceTranscript', () => {
    const spies = {};
    beforeEach(() => {
      spies.uploadTranscript = jest.spyOn(thunkActions, thunkActionsKeys.uploadTranscript)
        .mockReturnValueOnce(testReplaceUpload);
      thunkActions.replaceTranscript({
        newFile: mockFile,
        newFilename: mockFilename,
        language: mockLanguage,
      })(dispatch, getState, spies.uploadTranscript);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches deleteTranscript action', () => {
      expect(dispatchedAction.deleteTranscript).not.toEqual(undefined);
    });
    it('dispatches actions.video.updateField and replaceTranscript success', () => {
      dispatch.mockClear();
      dispatchedAction.deleteTranscript.onSuccess();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, actions.video.updateField({ transcripts: {} }));
      expect(dispatch).toHaveBeenNthCalledWith(2, expect.any(Function));
    });
  });
});
