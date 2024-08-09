import { actions } from '..';
import keyStore from '../../../utils/keyStore';
import * as thunkActions from './video';

jest.mock('../video', () => ({
  ...jest.requireActual('../video'),
  actions: {
    load: (args) => ({ load: args }),
    updateField: (args) => ({ updateField: args }),
  },
  selectors: {
    videoId: (state) => ({ videoId: state }),
    videoSettings: (state) => ({ videoSettings: state }),
    getTranscriptDownloadUrl: (state) => ({ getTranscriptDownloadUrl: state }),
  },
}));
jest.mock('../app', () => ({
  ...jest.requireActual('../app'),
  selectors: {
    courseDetails: (state) => ({ courseDetails: state }),
    videos: (state) => ({ videos: state.app.videos }),
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
  checkTranscriptsForImport: (args) => ({ checkTranscriptsForImport: args }),
  importTranscript: (args) => ({ importTranscript: args }),
  fetchVideoFeatures: (args) => ({ fetchVideoFeatures: args }),
  uploadVideo: (args) => ({ uploadVideo: args }),
}));

jest.mock('../../../utils', () => ({
  ...jest.requireActual('../../../utils'),
  removeItemOnce: (args) => (args),
}));

jest.mock('../../services/cms/api', () => ({
  parseYoutubeId: (args) => (args),
}));

const thunkActionsKeys = keyStore(thunkActions);

const mockLanguage = 'en';
const mockFile = 'soMEtRANscRipT';
const mockFilename = 'soMEtRANscRipT.srt';
const mockThumbnail = 'sOMefILE';
const mockThumbnailResponse = { data: { image_url: 'soMEimAGEUrL' } };
const thumbnailUrl = 'soMEimAGEUrL';
const mockAllowTranscriptImport = { data: { command: 'import' } };
const mockVideoFeatures = {
  data: {
    allowThumbnailUpload: 'soMEbOolEAn',
    videoSharingEnabled: 'soMEbOolEAn',
  },
};
const mockSelectedVideoId = 'ThisIsAVideoId';
const mockSelectedVideoUrl = 'ThisIsAYoutubeUrl';

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
const videoSharingData = {
  video_sharing_doc_url: 'SomEUrL.Com',
  video_sharing_options: 'OpTIOns',
};
const testState = {
  transcripts: ['la'],
  thumbnail: 'sOMefILE',
  originalThumbnail: null,
  videoId: 'soMEvIDEo',
};
const testVideosState = {
  edx_video_id: mockSelectedVideoId,
  thumbnail: 'thumbnail',
  course_video_image_url: 'course_video_image_url',
  duration: 60,
  transcripts: ['es'],
  transcript_urls: { es: 'url' },
};
const testUpload = { transcripts: ['la', 'en'] };
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
        blockValue: { data: { metadata: { ...testMetadata }, ...videoSharingData } },
        studioEndpointUrl: 'soMEeNDPoiNT',
        courseDetails: { data: { license: null } },
        studioView: { data: { html: 'sOMeHTml' } },
      },
      video: testState,
    }));
  });
  describe('loadVideoData', () => {
    let dispatchedLoad;
    let dispatchedAction1;
    let dispatchedAction2;
    beforeEach(() => {
      jest.spyOn(thunkActions, thunkActionsKeys.determineVideoSources).mockReturnValue({
        videoUrl: 'videOsOurce',
        videoId: 'videOiD',
        fallbackVideos: 'fALLbACKvIDeos',
      });
      jest.spyOn(thunkActions, thunkActionsKeys.parseVideoSharingSetting).mockReturnValue({
        level: 'course',
        value: true,
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
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('dispatches fetchVideoFeatures action', () => {
      thunkActions.loadVideoData()(dispatch, getState);
      [
        [dispatchedLoad],
        [dispatchedAction1],
        [dispatchedAction2],
      ] = dispatch.mock.calls;
      expect(dispatchedLoad).not.toEqual(undefined);
      expect(dispatchedAction1.fetchVideoFeatures).not.toEqual(undefined);
    });
    it('dispatches checkTranscriptsForImport action', () => {
      thunkActions.loadVideoData()(dispatch, getState);
      [
        [dispatchedLoad],
        [dispatchedAction1],
        [dispatchedAction2],
      ] = dispatch.mock.calls;
      expect(dispatchedLoad).not.toEqual(undefined);
      expect(dispatchedAction2.checkTranscriptsForImport).not.toEqual(undefined);
    });
    it('dispatches actions.video.load', () => {
      thunkActions.loadVideoData()(dispatch, getState);
      [
        [dispatchedLoad],
        [dispatchedAction1],
        [dispatchedAction2],
      ] = dispatch.mock.calls;
      expect(dispatchedLoad.load).toEqual({
        videoSource: 'videOsOurce',
        videoId: 'videOiD',
        fallbackVideos: 'fALLbACKvIDeos',
        allowVideoDownloads: testMetadata.download_video,
        allowVideoSharing: {
          level: 'course',
          value: true,
        },
        videoSharingLearnMoreLink: videoSharingData.video_sharing_doc_url,
        videoSharingEnableForCourse: videoSharingData.video_sharing_enabled,
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
    it('dispatches actions.video.load with selectedVideoId', () => {
      getState = jest.fn(() => ({
        app: {
          blockId: 'soMEBloCk',
          studioEndpointUrl: 'soMEeNDPoiNT',
          blockValue: { data: { metadata: {} } },
          courseDetails: { data: { license: null } },
          studioView: { data: { html: 'sOMeHTml' } },
          videos: testVideosState,
        },
      }));
      thunkActions.loadVideoData(mockSelectedVideoId, null)(dispatch, getState);
      [
        [dispatchedLoad],
        [dispatchedAction1],
        [dispatchedAction2],
      ] = dispatch.mock.calls;
      expect(dispatchedLoad.load).toEqual({
        videoSource: 'videOsOurce',
        videoId: 'videOiD',
        fallbackVideos: 'fALLbACKvIDeos',
        allowVideoDownloads: undefined,
        transcripts: testVideosState.transcripts,
        selectedVideoTranscriptUrls: testVideosState.transcript_urls,
        allowTranscriptDownloads: undefined,
        allowVideoSharing: {
          level: 'course',
          value: true,
        },
        showTranscriptByDefault: undefined,
        duration: {
          startTime: testMetadata.start_time,
          stopTime: 0,
          total: testVideosState.duration,
        },
        handout: undefined,
        licenseType: 'liCENSEtyPe',
        licenseDetails: {
          attribution: true,
          noncommercial: true,
          noDerivatives: true,
          shareAlike: false,
        },
        videoSharingEnabledForCourse: undefined,
        videoSharingLearnMoreLink: undefined,
        courseLicenseType: 'liCENSEtyPe',
        courseLicenseDetails: {
          attribution: true,
          noncommercial: true,
          noDerivatives: true,
          shareAlike: false,
        },
        thumbnail: testVideosState.course_video_image_url,
      });
    });
    it('dispatches actions.video.load with different selectedVideoId', () => {
      getState = jest.fn(() => ({
        app: {
          blockId: 'lb:soMEBloCk',
          studioEndpointUrl: 'soMEeNDPoiNT',
          blockValue: { data: { metadata: {} } },
          courseDetails: { data: { license: null } },
          studioView: { data: { content: 'sOMeHTml' } },
          videos: testVideosState,
        },
      }));
      thunkActions.loadVideoData('ThisIsAVideoId2', null)(dispatch, getState);
      [
        [dispatchedLoad],
        [dispatchedAction1],
        [dispatchedAction2],
      ] = dispatch.mock.calls;
      expect(dispatchedLoad.load).toEqual({
        videoSource: 'videOsOurce',
        videoId: 'videOiD',
        fallbackVideos: 'fALLbACKvIDeos',
        allowVideoDownloads: undefined,
        transcripts: testMetadata.transcripts,
        selectedVideoTranscriptUrls: testMetadata.transcript_urls,
        allowTranscriptDownloads: undefined,
        allowVideoSharing: {
          level: 'course',
          value: true,
        },
        showTranscriptByDefault: undefined,
        duration: {
          startTime: testMetadata.start_time,
          stopTime: 0,
          total: 0,
        },
        handout: undefined,
        licenseType: 'liCENSEtyPe',
        licenseDetails: {
          attribution: true,
          noncommercial: true,
          noDerivatives: true,
          shareAlike: false,
        },
        videoSharingEnabledForCourse: undefined,
        videoSharingLearnMoreLink: undefined,
        courseLicenseType: 'liCENSEtyPe',
        courseLicenseDetails: {
          attribution: true,
          noncommercial: true,
          noDerivatives: true,
          shareAlike: false,
        },
        thumbnail: undefined,
      });
    });
    it('dispatches actions.video.load with selectedVideoUrl', () => {
      thunkActions.loadVideoData(null, mockSelectedVideoUrl)(dispatch, getState);
      [
        [dispatchedLoad],
        [dispatchedAction1],
        [dispatchedAction2],
      ] = dispatch.mock.calls;
      expect(dispatchedLoad.load).toEqual({
        videoSource: mockSelectedVideoUrl,
        videoId: 'videOiD',
        fallbackVideos: 'fALLbACKvIDeos',
        allowVideoDownloads: testMetadata.download_video,
        transcripts: testMetadata.transcripts,
        allowTranscriptDownloads: testMetadata.download_track,
        showTranscriptByDefault: testMetadata.show_captions,
        duration: {
          startTime: testMetadata.start_time,
          stopTime: testMetadata.end_time,
          total: 0,
        },
        allowVideoSharing: {
          level: 'course',
          value: true,
        },
        handout: testMetadata.handout,
        licenseType: 'liCENSEtyPe',
        licenseDetails: {
          attribution: true,
          noncommercial: true,
          noDerivatives: true,
          shareAlike: false,
        },
        selectedVideoTranscriptUrls: undefined,
        videoSharingEnabledForCourse: undefined,
        videoSharingLearnMoreLink: 'SomEUrL.Com',
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
      thunkActions.loadVideoData()(dispatch, getState);
      [
        [dispatchedLoad],
        [dispatchedAction1],
        [dispatchedAction2],
      ] = dispatch.mock.calls;
      dispatch.mockClear();
      dispatchedAction1.fetchVideoFeatures.onSuccess(mockVideoFeatures);
      expect(dispatch).toHaveBeenCalledWith(actions.video.updateField({
        allowThumbnailUpload: mockVideoFeatures.data.allowThumbnailUpload,
        videoSharingEnabledForAll: mockVideoFeatures.data.videoSharingEnabled,
      }));
      dispatch.mockClear();
      dispatchedAction2.checkTranscriptsForImport.onSuccess(mockAllowTranscriptImport);
      expect(dispatch).toHaveBeenCalledWith(actions.video.updateField({
        allowTranscriptImport: true,
      }));
    });
  });
  describe('determineVideoSources', () => {
    const edxVideoId = 'EDxviDEoiD';
    const youtubeId = 'yOuTuBEiD';
    const youtubeUrl = `https://youtu.be/${youtubeId}`;
    const html5Sources = ['htmLOne', 'hTMlTwo', 'htMLthrEE'];
    describe('when edx id, youtube id and source values are null', () => {
      it('returns empty strings for ids and an empty array for sources', () => {
        expect(thunkActions.determineVideoSources({
          edxVideoId: null,
          youtubeId: null,
          html5Sources: null,
        })).toEqual({
          videoUrl: '',
          videoId: '',
          fallbackVideos: [],
        });
      });
    });
    describe('when there is an edx video id, youtube id and html5 sources', () => {
      it('returns all three with the youtube id wrapped in url', () => {
        expect(thunkActions.determineVideoSources({
          edxVideoId,
          youtubeId,
          html5Sources,
        })).toEqual({
          videoUrl: youtubeUrl,
          videoId: edxVideoId,
          fallbackVideos: html5Sources,
        });
      });
    });
    describe('when there is only an edx video id', () => {
      it('returns the edx video id for video source', () => {
        expect(thunkActions.determineVideoSources({
          edxVideoId,
          youtubeId: '',
          html5Sources: '',
        })).toEqual({
          videoUrl: '',
          videoId: edxVideoId,
          fallbackVideos: [],
        });
      });
    });
    describe('when there is no edx video id', () => {
      it('returns the youtube url for video source and html5 sources for fallback videos', () => {
        expect(thunkActions.determineVideoSources({
          edxVideoId: '',
          youtubeId,
          html5Sources,
        })).toEqual({
          videoUrl: youtubeUrl,
          videoId: '',
          fallbackVideos: html5Sources,
        });
      });
    });
    describe('when there is no edx video id and no youtube id', () => {
      it('returns the first html5 source for video url and the rest for fallback videos', () => {
        expect(thunkActions.determineVideoSources({
          edxVideoId: '',
          youtubeId: '',
          html5Sources,
        })).toEqual({
          videoUrl: 'htmLOne',
          videoId: '',
          fallbackVideos: ['hTMlTwo', 'htMLthrEE'],
        });
      });
      it('returns the html5 source for video source and an array with 2 empty values for fallback videos', () => {
        expect(thunkActions.determineVideoSources({
          edxVideoId: '',
          youtubeId: '',
          html5Sources: ['htmlOne'],
        })).toEqual({
          videoUrl: 'htmlOne',
          videoId: '',
          fallbackVideos: [],
        });
      });
    });
    describe('when there is no edx video id, no youtube id and no html5 sources', () => {
      it('returns an empty string for video source and an array with 2 empty values for fallback videos', () => {
        expect(thunkActions.determineVideoSources({
          edxVideoId: '',
          youtubeId: '',
          html5Sources: [],
        })).toEqual({
          videoUrl: '',
          videoId: '',
          fallbackVideos: [],
        });
      });
    });
  });
  describe('parseTranscripts', () => {
    const testStudioViewDataWithTranscripts = 'de descarga debajo del video.&#34;, &#34;value&#34;: &#34;&#34;, &#34;type&#34;: &#34;Generic&#34;, &#34;options&#34;: []}, &#34;transcripts&#34;: {&#34;explicitly_set&#34;: false, &#34;default_value&#34;: {}, &#34;field_name&#34;: &#34;transcripts&#34;, &#34;display_name&#34;: &#34;Idiomas de transcripci\\u00f3n&#34;, &#34;help&#34;: &#34;A\\u00f1ada transcripciones en diferentes idiomas. Haga clic a continuaci\\u00f3n para especificar un idioma y subir un archivo .srt de transcripci\\u00f3n para dicho idioma.&#34;, &#34;value&#34;: {&#34;aa&#34;: &#34;non_existent_dummy_file_name&#34;, &#34;ab&#34;: &#34;non_existent_dummy_file_name&#34;, &#34;ba&#34;: &#34;non_existent_dummy_file_name&#34;, &#34;en&#34;: &#34;external video-en.txt&#34;}, &#34;type&#34;: &#34;VideoTranslations&#34;, &#34;options&#34;: [], &#34;custom&#34;: true, &#34;languages&#34;: [{&#34;label&#34;: &#34;Abkhazian&#34;, &#34;code&#34;: &#34;ab&#34;}], &#34;urlRoot&#34;: &#34;/xblock/block-v1:GalileoX+XS_Mate001+3T2022+type@video+block@20bc09f5522d430f8e43c2bc377b348c/handler/studio_transcript/translation&#34;}, &#34;youtube_id_0_75&#34;: {';
    const testStudioViewData = 'de descarga debajo del video.&#34;, &#34;value&#34;: &#34;&#34;, &#34;type&#34;: &#34;Generic&#34;, &#34;options&#34;: []}, &#34;transcripts&#34;: {&#34;explicitly_set&#34;: false, &#34;default_value&#34;: {}, &#34;field_name&#34;: &#34;transcripts&#34;, &#34;display_name&#34;: &#34;Idiomas de transcripci\\u00f3n&#34;, &#34;help&#34;: &#34;A\\u00f1ada transcripciones en diferentes idiomas. Haga clic a continuaci\\u00f3n para especificar un idioma y subir un archivo .srt de transcripci\\u00f3n para dicho idioma.&#34;, &#34;value&#34;: {}, &#34;type&#34;: &#34;VideoTranslations&#34;, &#34;options&#34;: [], &#34;custom&#34;: true, &#34;languages&#34;: [{&#34;label&#34;: &#34;Abkhazian&#34;, &#34;code&#34;: &#34;ab&#34;}], &#34;urlRoot&#34;: &#34;/xblock/block-v1:GalileoX+XS_Mate001+3T2022+type@video+block@20bc09f5522d430f8e43c2bc377b348c/handler/studio_transcript/translation&#34;}, &#34;youtube_id_0_75&#34;: {';
    const testBadStudioViewData = 'tHiSiSaBAdDaTa';
    it('returns an array of languages given a JSON string', () => {
      expect(thunkActions.parseTranscripts({
        transcriptsData: testStudioViewDataWithTranscripts,
      })).toEqual(['aa', 'ab', 'ba', 'en']);
    });
    it('returns an empty array when there are no transcripts', () => {
      expect(thunkActions.parseTranscripts({
        transcriptsData: testStudioViewData,
      })).toEqual([]);
    });
    it('returns an empty array given an unparsable JSON string', () => {
      expect(thunkActions.parseTranscripts({
        transcriptsData: testBadStudioViewData,
      })).toEqual([]);
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
  describe('parseVideoShareSetting', () => {
    describe('has no course setting or block setting for video sharing', () => {
      it('should return an object with level equal to block and value equal to null', () => {
        const videoSharingSetting = thunkActions.parseVideoSharingSetting({
          courseSetting: null,
          blockSetting: null,
        });
        expect(videoSharingSetting).toEqual({ level: 'block', value: null });
      });
    });
    describe('has no course setting and block setting defined for video sharing', () => {
      it('should return an object with level equal to block and value equal to true', () => {
        const videoSharingSetting = thunkActions.parseVideoSharingSetting({
          courseSetting: null,
          blockSetting: true,
        });
        expect(videoSharingSetting).toEqual({ level: 'block', value: true });
      });
    });
    describe('has course setting defined for video sharing', () => {
      describe('course setting equals all-on', () => {
        it('should return an object with level equal to course and value equal to true', () => {
          const videoSharingSetting = thunkActions.parseVideoSharingSetting({
            courseSetting: 'all-on',
            blockSetting: true,
          });
          expect(videoSharingSetting).toEqual({ level: 'course', value: true });
        });
      });
      describe('course setting equals all-off', () => {
        it('should return an object with level equal to course and value equal to false', () => {
          const videoSharingSetting = thunkActions.parseVideoSharingSetting({
            courseSetting: 'all-off',
            blockSetting: true,
          });
          expect(videoSharingSetting).toEqual({ level: 'course', value: false });
        });
      });
      describe('course setting equals per-video', () => {
        it('should return an object with level equal to block and value equal to block setting', () => {
          const videoSharingSetting = thunkActions.parseVideoSharingSetting({
            courseSetting: 'per-video',
            blockSetting: false,
          });
          expect(videoSharingSetting).toEqual({ level: 'block', value: false });
        });
      });
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
  describe('uploadThumbnail - emptyCanvas', () => {
    beforeEach(() => {
      thunkActions.uploadThumbnail({ thumbnail: mockThumbnail, emptyCanvas: true })(dispatch, getState);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches uploadThumbnail action', () => {
      expect(dispatchedAction.uploadThumbnail).not.toEqual(undefined);
    });
  });
  describe('importTranscript', () => {
    beforeEach(() => {
      thunkActions.importTranscript()(dispatch, getState);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches uploadTranscript action', () => {
      expect(dispatchedAction.importTranscript).not.toEqual(undefined);
    });
    it('dispatches actions.video.updateField on success', () => {
      dispatch.mockClear();
      dispatchedAction.importTranscript.onSuccess();
      expect(dispatch).toHaveBeenCalledWith(actions.video.updateField(testUpload));
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

describe('uploadVideo', () => {
  let dispatch;
  let setLoadSpinner;
  let postUploadRedirect;
  let dispatchedAction;
  const fileData = new FormData();
  fileData.append('file', new File(['content1'], 'file1.mp4', { type: 'video/mp4' }));
  const supportedFiles = [fileData];

  beforeEach(() => {
    dispatch = jest.fn((action) => ({ dispatch: action }));
    setLoadSpinner = jest.fn();
    postUploadRedirect = jest.fn();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('dispatch uploadVideo action with right data', async () => {
    const data = {
      files: [
        { file_name: 'file1.mp4', content_type: 'video/mp4' },
      ],
    };

    thunkActions.uploadVideo({ supportedFiles, setLoadSpinner, postUploadRedirect })(dispatch);
    [[dispatchedAction]] = dispatch.mock.calls;
    expect(dispatchedAction.uploadVideo).not.toEqual(undefined);
    expect(setLoadSpinner).toHaveBeenCalled();
    expect(dispatchedAction.uploadVideo.data).toEqual(data);
  });

  it('should call fetch with correct arguments for each file', async () => {
    const mockResponseData = { success: true };
    const mockFetchResponse = Promise.resolve({ data: mockResponseData, ok: true });
    global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);
    const response = {
      files: [
        { file_name: 'file1.mp4', upload_url: 'http://example.com/put_video1' },
      ],
    };
    const mockRequestResponse = { data: response };
    thunkActions.uploadVideo({ supportedFiles, setLoadSpinner, postUploadRedirect })(dispatch);
    [[dispatchedAction]] = dispatch.mock.calls;

    dispatchedAction.uploadVideo.onSuccess(mockRequestResponse);

    expect(fetch).toHaveBeenCalledTimes(1);
    response.files.forEach(({ upload_url: uploadUrl }, index) => {
      expect(fetch.mock.calls[index][0]).toEqual(uploadUrl);
    });
    supportedFiles.forEach((file, index) => {
      const fileDataTest = file.get('file');
      expect(fetch.mock.calls[index][1].body).toBe(fileDataTest);
    });
  });

  it('should log an error if file object is not found in supportedFiles array', () => {
    const mockResponseData = { success: true };
    const mockFetchResponse = Promise.resolve({ data: mockResponseData });
    global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);
    const response = {
      files: [
        { file_name: 'file2.gif', upload_url: 'http://example.com/put_video2' },
      ],
    };
    const mockRequestResponse = { data: response };
    const spyConsoleError = jest.spyOn(console, 'error');

    thunkActions.uploadVideo({ supportedFiles, setLoadSpinner, postUploadRedirect })(dispatch);
    dispatchedAction.uploadVideo.onSuccess(mockRequestResponse);
    expect(spyConsoleError).toHaveBeenCalledWith('Could not find file object with name "file2.gif" in supportedFiles array.');
  });
});
