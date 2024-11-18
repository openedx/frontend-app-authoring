import * as api from './api';
import * as urls from './urls';
import {
  get, post, put, deleteObject,
} from './utils';

jest.mock('./urls', () => ({
  block: jest.fn().mockReturnValue('urls.block'),
  blockAncestor: jest.fn().mockReturnValue('urls.blockAncestor'),
  blockStudioView: jest.fn().mockReturnValue('urls.StudioView'),
  courseAssets: jest.fn().mockReturnValue('urls.courseAssets'),
  libraryAssets: jest.fn().mockReturnValue('urls.libraryAssets'),
  videoTranscripts: jest.fn().mockReturnValue('urls.videoTranscripts'),
  allowThumbnailUpload: jest.fn().mockReturnValue('urls.allowThumbnailUpload'),
  thumbnailUpload: jest.fn().mockReturnValue('urls.thumbnailUpload'),
  checkTranscriptsForImport: jest.fn().mockReturnValue('urls.checkTranscriptsForImport'),
  courseDetailsUrl: jest.fn().mockReturnValue('urls.courseDetailsUrl'),
  courseAdvanceSettings: jest.fn().mockReturnValue('urls.courseAdvanceSettings'),
  replaceTranscript: jest.fn().mockReturnValue('urls.replaceTranscript'),
  videoFeatures: jest.fn().mockReturnValue('urls.videoFeatures'),
  courseVideos: jest.fn()
    .mockName('urls.courseVideos')
    .mockImplementation(
      ({ studioEndpointUrl, learningContextId }) => `${studioEndpointUrl}/some_video_upload_url/${learningContextId}`,
    ),
}));

jest.mock('./utils', () => ({
  get: jest.fn().mockName('get'),
  post: jest.fn().mockName('post'),
  put: jest.fn().mockName('put'),
  deleteObject: jest.fn().mockName('deleteObject'),
}));

const { apiMethods } = api;

const blockId = 'block-v1-coursev1:2uX@4345432';
let learningContextId;
const studioEndpointUrl = 'hortus.coa';
const title = 'remember this needs to go into metadata to save';

describe('cms api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    learningContextId = 'demo2uX';
  });
  describe('apiMethods', () => {
    describe('fetchBlockId', () => {
      it('should call get with url.blocks', () => {
        apiMethods.fetchBlockById({ blockId, studioEndpointUrl });
        expect(get).toHaveBeenCalledWith(urls.block({ blockId, studioEndpointUrl }));
      });
    });

    describe('fetchByUnitId', () => {
      it('should call get with url.blockAncestor', () => {
        apiMethods.fetchByUnitId({ blockId, studioEndpointUrl });
        expect(get).toHaveBeenCalledWith(urls.blockAncestor({ studioEndpointUrl, blockId }), {});
      });

      describe('when called in different contexts', () => {
        // To mock env variables, you need to use dynamic imports for the tested methods
        // and then reset the env variables afterwards.
        const OLD_ENV = process.env;

        beforeEach(() => {
          jest.resetModules();
          process.env = { ...OLD_ENV };
        });

        afterEach(() => {
          process.env = OLD_ENV;
        });

        it('should call get with normal accept header for prod', async () => {
          process.env.NODE_ENV = 'production';
          process.env.MFE_NAME = 'frontend-app-course-authoring';
          // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
          const { apiMethods } = await import('./api');
          // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
          const utils = await import('./utils');
          const getSpy = jest.spyOn(utils, 'get');
          apiMethods.fetchByUnitId({ blockId, studioEndpointUrl });
          expect(getSpy).toHaveBeenCalledWith(urls.blockAncestor({ studioEndpointUrl, blockId }), {});
        });

        it('should call get with normal accept header for course-authoring', async () => {
          process.env.NODE_ENV = 'development';
          process.env.MFE_NAME = 'frontend-app-course-authoring';
          // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
          const { apiMethods } = await import('./api');
          // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
          const utils = await import('./utils');
          const getSpy = jest.spyOn(utils, 'get');
          apiMethods.fetchByUnitId({ blockId, studioEndpointUrl });
          expect(getSpy).toHaveBeenCalledWith(urls.blockAncestor({ studioEndpointUrl, blockId }), {});
        });
      });
    });

    describe('fetchStudioView', () => {
      it('should call get with url.blockStudioView', () => {
        apiMethods.fetchStudioView({ blockId, studioEndpointUrl });
        expect(get).toHaveBeenCalledWith(urls.blockStudioView({ studioEndpointUrl, blockId }));
      });
    });

    describe('fetchCourseImages', () => {
      it('should call get with url.courseAssets', () => {
        apiMethods.fetchCourseImages({
          learningContextId, studioEndpointUrl, pageNumber: 0,
        });
        const params = {
          asset_type: 'Images',
          page: 0,
        };
        expect(get).toHaveBeenCalledWith(
          urls.courseAssets({ studioEndpointUrl, learningContextId }),
          { params },
        );
      });
    });
    describe('fetchLibraryImages', () => {
      it('should call get with urls.libraryAssets for library V2', () => {
        apiMethods.fetchLibraryImages({
          blockId,
        });
        expect(get).toHaveBeenCalledWith(
          urls.libraryAssets({ blockId }),
        );
      });
    });

    describe('fetchCourseDetails', () => {
      it('should call get with url.courseDetailsUrl', () => {
        apiMethods.fetchCourseDetails({ learningContextId, studioEndpointUrl });
        expect(get).toHaveBeenCalledWith(urls.courseDetailsUrl({ studioEndpointUrl, learningContextId }));
      });
    });

    describe('fetchVideos', () => {
      it('should call get with url.courseVideos', () => {
        apiMethods.fetchVideos({ learningContextId, studioEndpointUrl });
        expect(get).toHaveBeenCalledWith(urls.courseVideos({ studioEndpointUrl, learningContextId }));
      });
    });

    describe('fetchAdvancedSettings', () => {
      it('should call get with url.courseAdvanceSettings', () => {
        apiMethods.fetchAdvancedSettings({ learningContextId, studioEndpointUrl });
        expect(get).toHaveBeenCalledWith(urls.courseAdvanceSettings({ studioEndpointUrl, learningContextId }));
      });
    });

    describe('normalizeContent', () => {
      test('return value for blockType: html', () => {
        const content = 'Im baby palo santo ugh celiac fashion axe. La croix lo-fi venmo whatever. Beard man braid migas single-origin coffee forage ramps.';
        expect(apiMethods.normalizeContent({
          blockId,
          blockType: 'html',
          content,
          learningContextId,
          title,
        })).toEqual({
          category: 'html',
          courseKey: learningContextId,
          data: content,
          has_changes: true,
          id: blockId,
          metadata: { display_name: title },
        });
      });
      test('return value for blockType: video', () => {
        const content = {
          videoSource: 'viDeOSouRCE',
          fallbackVideos: 'FalLBacKVidEOs',
          allowVideoDownloads: 'alLOwViDeodownLOads',
          allowVideoSharing: {
            level: 'sOMeStRInG',
            value: 'alloWviDeOshArinG',
          },
          thumbnail: 'THUmbNaIL',
          transcripts: 'traNScRiPts',
          allowTranscriptDownloads: 'aLloWTRaNScriPtdoWnlOADS',
          duration: {
            startTime: '00:00:00',
            stopTime: '00:00:00',
          },
          showTranscriptByDefault: 'ShOWtrANscriPTBYDeFAulT',
          handout: 'HAnDOuT',
          licenseType: 'LiCeNsETYpe',
          licenseDetails: 'liCENSeDetAIls',
        };
        const html5Sources = ['hTML5souRCES'];
        const edxVideoId = 'eDXviDEOid';
        const youtubeId = 'yOUtUBeid';
        const license = 'LiCEnsE';
        jest.spyOn(api, 'processVideoIds').mockReturnValue({
          html5Sources,
          edxVideoId,
          youtubeId,
        });
        jest.spyOn(api, 'processLicense').mockReturnValue(license);
        expect(apiMethods.normalizeContent({
          blockId,
          blockType: 'video',
          content,
          learningContextId,
          title,
        })).toEqual({
          category: 'video',
          courseKey: learningContextId,
          display_name: title,
          id: blockId,
          metadata: {
            display_name: title,
            download_video: content.allowVideoDownloads,
            public_access: content.allowVideoSharing.value,
            edx_video_id: edxVideoId,
            html5_sources: html5Sources,
            youtube_id_1_0: youtubeId,
            thumbnail: content.thumbnail,
            download_track: content.allowTranscriptDownloads,
            track: '',
            show_captions: content.showTranscriptByDefault,
            handout: content.handout,
            start_time: content.duration.startTime,
            end_time: content.duration.stopTime,
            license,
          },
        });
        jest.restoreAllMocks();
      });
      test('throw error for invalid blockType', () => {
        // @ts-expect-error because we're not passing 'blockId' or other parameters
        expect(() => { apiMethods.normalizeContent({ blockType: 'somethingINVALID' }); })
          .toThrow(TypeError);
      });
    });

    describe('saveBlock', () => {
      const content = 'Im baby palo santo ugh celiac fashion axe. La croix lo-fi venmo whatever. Beard man braid migas single-origin coffee forage ramps.';
      it('should call post with urls.block and normalizeContent', () => {
        apiMethods.saveBlock({
          blockId,
          blockType: 'html',
          content,
          learningContextId,
          studioEndpointUrl,
          title,
        });
        expect(post).toHaveBeenCalledWith(
          urls.block({ studioEndpointUrl }),
          apiMethods.normalizeContent({
            blockType: 'html',
            content,
            blockId,
            learningContextId,
            title,
          }),
        );
      });
    });

    describe('uploadAsset', () => {
      const img = new Blob(['data'], { type: 'image/jpeg' });
      const filename = 'image.jpg';
      const asset = new File([img], filename, { type: 'image/jpeg' });
      const mockFormdata = new FormData();
      mockFormdata.append('file', asset);
      it('should call post with urls.courseAssets and imgdata', () => {
        apiMethods.uploadAsset({
          blockId,
          learningContextId,
          studioEndpointUrl,
          asset,
        });
        expect(post).toHaveBeenCalledWith(
          urls.courseAssets({ studioEndpointUrl, learningContextId }),
          mockFormdata,
        );
      });
      it('should call post with urls.libraryAssets and imgdata', () => {
        learningContextId = 'lib:demo2uX';
        mockFormdata.append('content', asset);
        apiMethods.uploadAsset({
          blockId,
          learningContextId,
          studioEndpointUrl,
          asset,
        });
        expect(put).toHaveBeenCalledWith(
          `${urls.libraryAssets({ blockId, assetName: asset.name })}`,
          mockFormdata,
        );
      });
    });

    describe('uploadVideo', () => {
      it('should call post with urls.courseVideos and data', () => {
        const data = { files: [{ file_name: 'video.mp4', content_type: 'mp4' }] };

        apiMethods.uploadVideo({ data, studioEndpointUrl, learningContextId });

        expect(urls.courseVideos).toHaveBeenCalledWith({ studioEndpointUrl, learningContextId });
        expect(post).toHaveBeenCalledWith(
          urls.courseVideos({ studioEndpointUrl, learningContextId }),
          data,
        );
      });
    });
  });
  describe('loadImage', () => {
    it('loads incoming image data, replacing the dateAdded with a date field', () => {
      const [date, time] = ['Jan 20, 2022', '9:30 PM'];
      const imageData = { some: 'image data', dateAdded: `${date} at ${time}` };
      expect(api.loadImage(imageData)).toEqual({
        ...imageData,
        dateAdded: new Date(`${date} ${time}`).getTime(),
      });
    });
  });
  describe('loadImages', () => {
    it('loads a list of images into an object by id, using loadImage to translate', () => {
      const ids = ['id0', 'Id1', 'ID2', 'iD3'];
      const testData = [
        { id: ids[0], some: 'data' },
        { id: ids[1], other: 'data' },
        { id: ids[2], some: 'DATA' },
        { id: ids[3], other_data: 'DATA' },
      ];
      const spy = jest.spyOn(api, 'loadImage').mockImplementation((imageData) => ({ loadImage: imageData }));
      const out = api.loadImages(testData);
      expect(out).toEqual({
        [ids[0]]: api.loadImage(testData[0]),
        [ids[1]]: api.loadImage(testData[1]),
        [ids[2]]: api.loadImage(testData[2]),
        [ids[3]]: api.loadImage({ id: ids[3], otherData: 'DATA' }), // Verify its 'other_data' key was camelized
      });
      spy.mockClear();
    });
  });
  describe('uploadThumbnail', () => {
    describe('uploadThumbnail', () => {
      const thumbnail = 'dAta';
      const videoId = 'sOmeVIDeoiD';
      it('should call post with urls.thumbnailUpload and thumbnail data', () => {
        const mockFormdata = new FormData();
        mockFormdata.append('file', thumbnail);
        apiMethods.uploadThumbnail({
          studioEndpointUrl,
          learningContextId,
          videoId,
          thumbnail,
        });
        expect(post).toHaveBeenCalledWith(
          urls.thumbnailUpload({ studioEndpointUrl, learningContextId, videoId }),
          mockFormdata,
        );
      });
    });
  });
  describe('videoTranscripts', () => {
    const language = 'la';
    const videoId = 'sOmeVIDeoiD';
    const youTubeId = 'SOMeyoutUBeid';
    describe('checkTranscriptsForImport', () => {
      const getJSON = `{"locator":"${blockId}","videos":[{"mode":"youtube","video":"${youTubeId}","type":"youtube"},{"mode":"edx_video_id","type":"edx_video_id","video":"${videoId}"}]}`;
      it('should call get with url.checkTranscriptsForImport', () => {
        apiMethods.checkTranscriptsForImport({
          studioEndpointUrl,
          blockId,
          videoId,
          youTubeId,
        });
        expect(get).toHaveBeenCalledWith(urls.checkTranscriptsForImport({
          studioEndpointUrl,
          parameters: encodeURIComponent(getJSON),
        }));
      });
    });
    describe('importTranscript', () => {
      const getJSON = `{"locator":"${blockId}","videos":[{"mode":"youtube","video":"${youTubeId}","type":"youtube"}]}`;
      it('should call get with url.replaceTranscript', () => {
        apiMethods.importTranscript({ studioEndpointUrl, blockId, youTubeId });
        expect(get).toHaveBeenCalledWith(urls.replaceTranscript({
          studioEndpointUrl,
          parameters: encodeURIComponent(getJSON),
        }));
      });
    });
    describe('uploadTranscript', () => {
      const transcript = new Blob(['dAta']);
      it('should call post with urls.videoTranscripts and transcript data', () => {
        const mockFormdata = new FormData();
        mockFormdata.append('file', transcript);
        mockFormdata.append('edx_video_id', videoId);
        mockFormdata.append('language_code', language);
        mockFormdata.append('new_language_code', language);
        apiMethods.uploadTranscript({
          blockId,
          studioEndpointUrl,
          transcript,
          videoId,
          language,
        });
        expect(post).toHaveBeenCalledWith(
          urls.videoTranscripts({ studioEndpointUrl, blockId }),
          mockFormdata,
        );
      });
    });
    describe('transcript delete', () => {
      it('should call deleteObject with urls.videoTranscripts and transcript data', () => {
        const mockDeleteJSON = { data: { lang: language, edx_video_id: videoId } };
        apiMethods.deleteTranscript({
          blockId,
          studioEndpointUrl,
          videoId,
          language,
        });
        expect(deleteObject).toHaveBeenCalledWith(
          urls.videoTranscripts({ studioEndpointUrl, blockId }),
          mockDeleteJSON,
        );
      });
    });
    describe('transcript get', () => {
      it('should call get with urls.videoTranscripts and transcript data', () => {
        const mockJSON = { data: { lang: language, edx_video_id: videoId } };
        apiMethods.getTranscript({
          blockId,
          studioEndpointUrl,
          videoId,
          language,
        });
        expect(get).toHaveBeenCalledWith(
          `${urls.videoTranscripts({ studioEndpointUrl, blockId })}?language_code=${language}`,
          mockJSON,
        );
      });
    });
  });
  describe('processVideoIds', () => {
    const edxVideoId = 'eDXviDEoid';
    const youtubeId = 'yOuTuBeUrL';
    const youtubeUrl = `https://youtu.be/${youtubeId}`;
    const html5Sources = [
      'sOuRce1',
      'sourCE2',
    ];
    afterEach(() => {
      jest.restoreAllMocks();
    });
    describe('if there is a video id', () => {
      beforeEach(() => {
        jest.spyOn(api, 'isEdxVideo').mockReturnValue(true);
        jest.spyOn(api, 'parseYoutubeId').mockReturnValue(youtubeId);
      });
      it('returns edxVideoId when there are no fallbackVideos', () => {
        expect(api.processVideoIds({
          videoUrl: '',
          fallbackVideos: [],
          videoId: edxVideoId,
        })).toEqual({
          edxVideoId,
          html5Sources: [],
          youtubeId: '',
        });
      });
      it('returns edxVideoId and html5Sources when there are fallbackVideos', () => {
        expect(api.processVideoIds({
          videoUrl: youtubeUrl,
          fallbackVideos: html5Sources,
          videoId: edxVideoId,
        })).toEqual({
          edxVideoId,
          html5Sources,
          youtubeId,
        });
      });
    });
    describe('if there is a youtube url', () => {
      beforeEach(() => {
        jest.spyOn(api, 'isEdxVideo').mockReturnValue(false);
        jest.spyOn(api, 'parseYoutubeId').mockReturnValue(youtubeId);
      });
      it('returns youtubeId when there are no fallbackVideos', () => {
        expect(api.processVideoIds({
          videoUrl: youtubeUrl,
          fallbackVideos: [],
          videoId: '',
        })).toEqual({
          edxVideoId: '',
          html5Sources: [],
          youtubeId,
        });
      });
      it('returns youtubeId and html5Sources when there are fallbackVideos', () => {
        expect(api.processVideoIds({
          videoUrl: youtubeUrl,
          fallbackVideos: html5Sources,
          videoId: '',
        })).toEqual({
          edxVideoId: '',
          html5Sources,
          youtubeId,
        });
      });
    });
    describe('if the videoSource is an html5 source', () => {
      beforeEach(() => {
        jest.spyOn(api, 'isEdxVideo').mockReturnValue(false);
        jest.spyOn(api, 'parseYoutubeId').mockReturnValue(null);
      });
      it('returns html5Sources when there are no fallbackVideos', () => {
        expect(api.processVideoIds({
          videoUrl: html5Sources[0],
          fallbackVideos: [],
          videoId: '',
        })).toEqual({
          edxVideoId: '',
          html5Sources: [html5Sources[0]],
          youtubeId: '',
        });
      });
      it('returns html5Sources when there are fallbackVideos', () => {
        expect(api.processVideoIds({
          videoUrl: html5Sources[0],
          fallbackVideos: [html5Sources[1]],
          videoId: '',
        })).toEqual({
          edxVideoId: '',
          html5Sources,
          youtubeId: '',
        });
      });
    });
  });
  describe('isEdxVideo', () => {
    it('returns true if id is in uuid4 format', () => {
      const id = 'c2afd8c8-3329-4dfc-95be-4ee6d986c3e5';
      expect(api.isEdxVideo(id)).toEqual(true);
    });
    it('returns false if id is not in uuid4 format', () => {
      const id = 'someB-ad-Id';
      expect(api.isEdxVideo(id)).toEqual(false);
    });
  });
  describe('parseYoutubeId', () => {
    it('returns the youtube id in an url', () => {
      const id = '3_yD_cEKoCk';
      const testURLs = [
        'https://www.youtube.com/watch?v=3_yD_cEKoCk&feature=featured',
        'https://www.youtube.com/watch?v=3_yD_cEKoCk',
        'http://www.youtube.com/watch?v=3_yD_cEKoCk',
        '//www.youtube.com/watch?v=3_yD_cEKoCk',
        'www.youtube.com/watch?v=3_yD_cEKoCk',
        'https://youtube.com/watch?v=3_yD_cEKoCk',
        'http://youtube.com/watch?v=3_yD_cEKoCk',
        '//youtube.com/watch?v=3_yD_cEKoCk',
        'youtube.com/watch?v=3_yD_cEKoCk',
        'https://m.youtube.com/watch?v=3_yD_cEKoCk',
        'http://m.youtube.com/watch?v=3_yD_cEKoCk',
        '//m.youtube.com/watch?v=3_yD_cEKoCk',
        'm.youtube.com/watch?v=3_yD_cEKoCk',
        'https://www.youtube.com/v/3_yD_cEKoCk?fs=1&hl=en_US',
        'http://www.youtube.com/v/3_yD_cEKoCk?fs=1&hl=en_US',
        '//www.youtube.com/v/3_yD_cEKoCk?fs=1&hl=en_US',
        'www.youtube.com/v/3_yD_cEKoCk?fs=1&hl=en_US',
        'youtube.com/v/3_yD_cEKoCk?fs=1&hl=en_US',
        'https://www.youtube.com/embed/3_yD_cEKoCk?autoplay=1',
        'https://www.youtube.com/embed/3_yD_cEKoCk',
        'http://www.youtube.com/embed/3_yD_cEKoCk',
        '//www.youtube.com/embed/3_yD_cEKoCk',
        'www.youtube.com/embed/3_yD_cEKoCk',
        'https://youtube.com/embed/3_yD_cEKoCk',
        'http://youtube.com/embed/3_yD_cEKoCk',
        '//youtube.com/embed/3_yD_cEKoCk',
        'youtube.com/embed/3_yD_cEKoCk',
        'https://youtu.be/3_yD_cEKoCk?t=120',
        'https://youtu.be/3_yD_cEKoCk',
        'http://youtu.be/3_yD_cEKoCk',
        '//youtu.be/3_yD_cEKoCk',
        'youtu.be/3_yD_cEKoCk',
      ];
      testURLs.forEach((url) => {
        expect(api.parseYoutubeId(url)).toEqual(id);
      });
    });
    it('returns null if the url is not a youtube url', () => {
      const badURL = 'https://someothersite.com/3_yD_cEKoCk';
      expect(api.parseYoutubeId(badURL)).toEqual(null);
    });
  });
  describe('processLicense', () => {
    it('returns empty string when licenseType is empty or not a valid licnese type', () => {
      expect(api.processLicense('', {})).toEqual('');
      expect(api.processLicense('LiCeNsETYpe', {})).toEqual('');
    });
    it('returns empty string when licenseType equals creative commons', () => {
      const licenseType = 'creative-commons';
      const licenseDetails = {
        attribution: true,
        noncommercial: false,
        noDerivatives: true,
        shareAlike: false,
      };
      expect(api.processLicense(licenseType, licenseDetails)).toEqual('creative-commons: ver=4.0 BY ND');
    });
    it('returns empty string when licenseType equals creative commons', () => {
      const licenseType = 'all-rights-reserved';
      const licenseDetails = {};
      expect(api.processLicense(licenseType, licenseDetails)).toEqual('all-rights-reserved');
    });
  });
  describe('fetchVideoFeatures', () => {
    it('should call get with url.videoFeatures', () => {
      const args = { studioEndpointUrl };
      apiMethods.fetchVideoFeatures({ ...args });
      expect(get).toHaveBeenCalledWith(urls.videoFeatures({ ...args }));
    });
  });
});
