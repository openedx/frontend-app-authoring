import { actions } from '..';
import keyStore from '../../../utils/keyStore';
import * as thunkActions from './video';

jest.mock('..', () => ({
  actions: {
    video: {
      load: (args) => ({ load: args }),
      updateField: (args) => ({ updateField: args }),
    },
  },
  selectors: {
    app: {
      courseDetails: (state) => ({ courseDetails: state }),
    },
    video: {
      videoId: (state) => ({ videoId: state }),
      videoSettings: (state) => ({ videoSettings: state }),
      getTranscriptDownloadUrl: (state) => ({ getTranscriptDownloadUrl: state }),
    },
  },
}));
jest.mock('./requests', () => ({
  uploadAsset: (args) => ({ uploadAsset: args }),
  allowThumbnailUpload: (args) => ({ allowThumbnailUpload: args }),
  uploadThumbnail: (args) => ({ uploadThumbnail: args }),
  deleteTranscript: (args) => ({ deleteTranscript: args }),
  uploadTranscript: (args) => ({ uploadTranscript: args }),
  getTranscriptFile: (args) => ({ getTranscriptFile: args }),
  updateTranscriptLanguage: (args) => ({ updateTranscriptLanguage: args }),
}));

jest.mock('../../../utils', () => ({
  removeItemOnce: (args) => (args),
}));

const thunkActionsKeys = keyStore(thunkActions);

const mockLanguage = 'na';
const mockFile = 'soMEtRANscRipT';
const mockFilename = 'soMEtRANscRipT.srt';
const mockThumbnail = 'sOMefILE';
const mockThumbnailResponse = { data: { image_url: 'soMEimAGEUrL' } };
const thumbnailUrl = 'soMEimAGEUrL';
const mockAllowThumbnailUpload = { data: { allowThumbnailUpload: 'soMEbOolEAn' } };

const testMetadata = {
  download_track: 'dOWNlOAdTraCK',
  download_video: 'downLoaDViDEo',
  edx_video_id: 'soMEvIDEo',
  end_time: 0,
  handout: 'hANdoUT',
  html5_sources: [],
  license: 'liCENse',
  show_captions: 'shOWcapTIONS',
  start_time: 0,
  transcripts: ['do', 're', 'mi'],
  thumbnail: 'thuMBNaIl',
};
const testState = {
  transcripts: ['la'],
  thumbnail: 'sOMefILE',
  originalThumbnail: null,
  videoId: 'soMEvIDEo',
};
const testUpload = { transcripts: ['la', 'na'] };
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
        courseDetails: { data: { license: null } },
        studioView: { data: { html: 'sOMeHTml' } },
      },
      video: testState,
    }));
  });
  describe('loadVideoData', () => {
    let dispatchedLoad;
    beforeEach(() => {
      jest.spyOn(thunkActions, thunkActionsKeys.determineVideoSource).mockReturnValue({
        videoSource: 'videOsOurce',
        videoId: 'videOiD',
        fallbackVideos: 'fALLbACKvIDeos',
        videoType: 'viDEOtyPE',
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
      jest.spyOn(thunkActions, thunkActionsKeys.parseTranscripts).mockReturnValue(
        testMetadata.transcripts,
      );
      thunkActions.loadVideoData()(dispatch, getState);
      [[dispatchedLoad], [dispatchedAction]] = dispatch.mock.calls;
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('dispatches allowThumbnailUpload action', () => {
      expect(dispatchedLoad).not.toEqual(undefined);
      expect(dispatchedAction.allowThumbnailUpload).not.toEqual(undefined);
    });
    it('dispatches actions.video.load', () => {
      expect(dispatchedLoad.load).toEqual({
        videoSource: 'videOsOurce',
        videoId: 'videOiD',
        fallbackVideos: 'fALLbACKvIDeos',
        videoType: 'viDEOtyPE',
        allowVideoDownloads: testMetadata.download_video,
        transcripts: testMetadata.transcripts,
        allowTranscriptDownloads: testMetadata.download_track,
        showTranscriptByDefault: testMetadata.show_captions,
        duration: {
          startTime: testMetadata.start_time,
          stopTime: testMetadata.end_time,
          total: 0,
        },
        handout: testMetadata.handout,
        licenseType: 'liCENSEtyPe',
        licenseDetails: {
          attribution: true,
          noncommercial: true,
          noDerivatives: true,
          shareAlike: false,
        },
        courseLicenseType: 'liCENSEtyPe',
        courseLicenseDetails: {
          attribution: true,
          noncommercial: true,
          noDerivatives: true,
          shareAlike: false,
        },
        thumbnail: testMetadata.thumbnail,
      });
    });
    it('dispatches actions.video.updateField on success', () => {
      dispatch.mockClear();
      dispatchedAction.allowThumbnailUpload.onSuccess(mockAllowThumbnailUpload);
      expect(dispatch).toHaveBeenCalledWith(actions.video.updateField({
        allowThumbnailUpload: mockAllowThumbnailUpload.data.allowThumbnailUpload,
      }));
    });
  });
  describe('determineVideoSource', () => {
    const edxVideoId = 'EDxviDEoiD';
    const youtubeId = 'yOuTuBEiD';
    const youtubeUrl = `https://youtu.be/${youtubeId}`;
    const html5Sources = ['htmLOne', 'hTMlTwo', 'htMLthrEE'];
    describe('when there is an edx video id, youtube id and html5 sources', () => {
      it('returns the youtube id for video source and html5 sources for fallback videos', () => {
        expect(thunkActions.determineVideoSource({
          edxVideoId,
          youtubeId,
          html5Sources,
        })).toEqual({
          videoSource: youtubeUrl,
          videoId: edxVideoId,
          videoType: 'youtube',
          fallbackVideos: html5Sources,
        });
      });
    });
    describe('when there is an edx video id', () => {
      it('returns the edx video id for video source', () => {
        expect(thunkActions.determineVideoSource({
          edxVideoId,
          youtubeId: '',
          html5Sources: '',
        })).toEqual({
          videoSource: edxVideoId,
          videoId: edxVideoId,
          videoType: 'edxVideo',
          fallbackVideos: ['', ''],
        });
      });
    });
    describe('when there is no edx video id', () => {
      it('returns the youtube url for video source and html5 sources for fallback videos', () => {
        expect(thunkActions.determineVideoSource({
          edxVideoId: '',
          youtubeId,
          html5Sources,
        })).toEqual({
          videoSource: youtubeUrl,
          videoId: '',
          videoType: 'youtube',
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
          videoType: 'html5source',
          fallbackVideos: ['hTMlTwo', 'htMLthrEE'],
        });
      });
      it('returns the html5 source for video source and an array with 2 empty values for fallback videos', () => {
        expect(thunkActions.determineVideoSource({
          edxVideoId: '',
          youtubeId: '',
          html5Sources: ['htmlOne'],
        })).toEqual({
          videoSource: 'htmlOne',
          videoId: '',
          fallbackVideos: ['', ''],
          videoType: 'html5source',
        });
      });
    });
    describe('when there is no edx video id, no youtube id and no html5 sources', () => {
      it('returns an empty string for video source and an array with 2 empty values for fallback videos', () => {
        expect(thunkActions.determineVideoSource({
          edxVideoId: '',
          youtubeId: '',
          html5Sources: [],
        })).toEqual({
          videoSource: '',
          videoId: '',
          fallbackVideos: ['', ''],
          videoType: '',
        });
      });
    });
  });
  describe('parseLicense', () => {
    const emptyLicenseData = null;
    const noLicense = 'sOMeHTml data-metadata &#34;license&#34; &#34;value&#34;= null, &#34;type&#34;';
    it('returns expected values for a license with no course license', () => {
      expect(thunkActions.parseLicense({
        licenseData: emptyLicenseData,
        level: 'sOMElevEL',
      })).toEqual([
        null,
        {},
      ]);
    });
    it('returns expected values for a license with no block license', () => {
      expect(thunkActions.parseLicense({
        licenseData: noLicense,
        level: 'block',
      })).toEqual([
        null,
        {},
      ]);
    });
    it('returns expected values for a license with all rights reserved', () => {
      const license = 'sOMeHTml data-metadata &#34;license&#34; &#34;value&#34;: &#34;all-rights-reserved&#34;, &#34;type&#34;';
      expect(thunkActions.parseLicense({
        licenseData: license,
        level: 'block',
      })).toEqual([
        'all-rights-reserved',
        {},
      ]);
    });
    it('returns expected type and options for creative commons', () => {
      const license = 'sOMeHTml data-metadata &#34;license&#34; &#34;value&#34;: &#34;creative-commons: ver=4.0 BY NC ND&#34;, &#34;type&#34;';
      expect(thunkActions.parseLicense({
        licenseData: license,
        level: 'block',
      })).toEqual([
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
  describe('uploadHandout', () => {
    beforeEach(() => {
      thunkActions.uploadHandout({ file: mockFilename })(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches uploadAsset action', () => {
      expect(dispatchedAction.uploadAsset).not.toBe(undefined);
    });
    test('passes file as image prop', () => {
      expect(dispatchedAction.uploadAsset.asset).toEqual(mockFilename);
    });
    test('onSuccess: calls setSelection with camelized response.data.asset', () => {
      const handout = mockFilename;
      dispatchedAction.uploadAsset.onSuccess({ data: { asset: { url: mockFilename } } });
      expect(dispatch).toHaveBeenCalledWith(actions.video.updateField({ handout }));
    });
  });
  describe('uploadThumbnail', () => {
    beforeEach(() => {
      thunkActions.uploadThumbnail({ thumbnail: mockThumbnail })(dispatch, getState);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches uploadThumbnail action', () => {
      expect(dispatchedAction.uploadThumbnail).not.toEqual(undefined);
    });
    it('dispatches actions.video.updateField on success', () => {
      dispatch.mockClear();
      dispatchedAction.uploadThumbnail.onSuccess(mockThumbnailResponse);
      expect(dispatch).toHaveBeenCalledWith(
        actions.video.updateField({
          thumbnail: thumbnailUrl,
        }),
      );
    });
  });
  describe('deleteTranscript', () => {
    beforeEach(() => {
      thunkActions.deleteTranscript({ language: 'la' })(dispatch, getState);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches deleteTranscript action', () => {
      expect(dispatchedAction.deleteTranscript).not.toEqual(undefined);
    });
    it('dispatches actions.video.updateField on success', () => {
      dispatch.mockClear();
      dispatchedAction.deleteTranscript.onSuccess();
      expect(dispatch).toHaveBeenCalledWith(actions.video.updateField({ transcripts: [] }));
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
  describe('updateTranscriptLanguage', () => {
    beforeEach(() => {
      thunkActions.updateTranscriptLanguage({
        newLanguageCode: mockLanguage,
        languageBeforeChange: `${mockLanguage}i`,
      })(dispatch, getState);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches uploadTranscript action', () => {
      expect(dispatchedAction.getTranscriptFile).not.toEqual(undefined);
    });
    it('dispatches actions.video.updateField on success', () => {
      dispatch.mockClear();
      dispatchedAction.getTranscriptFile.onSuccess({ data: 'sOme StRinG Data' });
      expect(dispatch).toHaveBeenCalled();
    });
  });
  describe('replaceTranscript', () => {
    const spies = {};
    beforeEach(() => {
      spies.uploadTranscript = jest.spyOn(thunkActions, 'uploadTranscript')
        .mockReturnValue(testReplaceUpload).mockName('uploadTranscript');
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
      expect(dispatch).toHaveBeenCalled();
    });
  });
});
