import * as utils from '../../../utils';
import * as api from './api';
import * as urls from './urls';
import { get, post, deleteObject } from './utils';

jest.mock('../../../utils', () => {
  const camelizeMap = (obj) => ({ ...obj, camelized: true });
  return {
    ...jest.requireActual('../../../utils'),
    camelize: camelizeMap,
    camelizeKeys: (list) => list.map(camelizeMap),
  };
});

jest.mock('./urls', () => ({
  block: jest.fn().mockName('urls.block'),
  blockAncestor: jest.fn().mockName('urls.blockAncestor'),
  blockStudioView: jest.fn().mockName('urls.StudioView'),
  courseImages: jest.fn().mockName('urls.courseImages'),
  courseAssets: jest.fn().mockName('urls.courseAssets'),
  videoTranscripts: jest.fn().mockName('urls.videoTranscripts'),
}));

jest.mock('./utils', () => ({
  get: jest.fn().mockName('get'),
  post: jest.fn().mockName('post'),
  deleteObject: jest.fn().mockName('deleteObject'),
}));

const { camelize } = utils;

const { apiMethods } = api;

const blockId = 'coursev1:2uX@4345432';
const learningContextId = 'demo2uX';
const studioEndpointUrl = 'hortus.coa';
const title = 'remember this needs to go into metadata to save';

describe('cms api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
        expect(get).toHaveBeenCalledWith(urls.blockAncestor({ studioEndpointUrl, blockId }));
      });
    });

    describe('fetchStudioView', () => {
      it('should call get with url.blockStudioView', () => {
        apiMethods.fetchStudioView({ blockId, studioEndpointUrl });
        expect(get).toHaveBeenCalledWith(urls.blockStudioView({ studioEndpointUrl, blockId }));
      });
    });

    describe('fetchImages', () => {
      it('should call get with url.courseImages', () => {
        apiMethods.fetchImages({ learningContextId, studioEndpointUrl });
        expect(get).toHaveBeenCalledWith(urls.courseImages({ studioEndpointUrl, learningContextId }));
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
          thumbnail: 'THUmbNaIL',
          transcripts: 'traNScRiPts',
          allowTranscriptDownloads: 'aLloWTRaNScriPtdoWnlOADS',
          duration: {
            startTime: 'StArTTime',
            stopTime: 'sToPTiME',
          },
          showTranscriptByDefault: 'ShOWtrANscriPTBYDeFAulT',
          handout: 'HAnDOuT',
          licenseType: 'LiCeNsETYpe',
          licenseDetails: 'liCENSeDetAIls',
        };
        const html5Sources = 'hTML5souRCES';
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
            edx_video_id: edxVideoId,
            html5_sources: html5Sources,
            youtube_id_1_0: youtubeId,
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

    describe('uploadImage', () => {
      const image = { photo: 'dAta' };
      it('should call post with urls.courseAssets and imgdata', () => {
        const mockFormdata = new FormData();
        mockFormdata.append('file', image);
        apiMethods.uploadImage({
          learningContextId,
          studioEndpointUrl,
          image,
        });
        expect(post).toHaveBeenCalledWith(
          urls.videoTranscripts({ studioEndpointUrl, learningContextId }),
          mockFormdata,
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
        { id: ids[3], other: 'DATA' },
      ];
      const oldLoadImage = api.loadImage;
      api.loadImage = (imageData) => ({ loadImage: imageData });
      const out = api.loadImages(testData);
      expect(out).toEqual({
        [ids[0]]: api.loadImage(camelize(testData[0])),
        [ids[1]]: api.loadImage(camelize(testData[1])),
        [ids[2]]: api.loadImage(camelize(testData[2])),
        [ids[3]]: api.loadImage(camelize(testData[3])),
      });
      api.loadImage = oldLoadImage;
    });
  });
  describe('videoTranscripts', () => {
    const language = 'la';
    const videoId = 'sOmeVIDeoiD';
    describe('uploadTranscript', () => {
      const transcript = { transcript: 'dAta' };
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
  });
  describe('processVideoIds', () => {
    const edxVideoId = 'eDXviDEoid';
    const youtubeId = 'yOuTuBeID';
    const html5Sources = [
      'sOuRce1',
      'sourCE2',
    ];
    afterEach(() => {
      jest.restoreAllMocks();
    });
    describe('if the videoSource is an edx video id', () => {
      beforeEach(() => {
        jest.spyOn(api, 'isEdxVideo').mockReturnValue(true);
        jest.spyOn(api, 'parseYoutubeId').mockReturnValue(null);
      });
      it('returns edxVideoId when there are no fallbackVideos', () => {
        expect(api.processVideoIds({
          videoSource: edxVideoId,
          fallbackVideos: [],
        })).toEqual({
          edxVideoId,
          html5Sources: [],
          youtubeId: '',
        });
      });
      it('returns edxVideoId and html5Sources when there are fallbackVideos', () => {
        expect(api.processVideoIds({
          videoSource: edxVideoId,
          fallbackVideos: html5Sources,
        })).toEqual({
          edxVideoId,
          html5Sources,
          youtubeId: '',
        });
      });
    });
    describe('if the videoSource is a youtube url', () => {
      beforeEach(() => {
        jest.spyOn(api, 'isEdxVideo').mockReturnValue(false);
        jest.spyOn(api, 'parseYoutubeId').mockReturnValue(youtubeId);
      });
      it('returns youtubeId when there are no fallbackVideos', () => {
        expect(api.processVideoIds({
          videoSource: edxVideoId,
          fallbackVideos: [],
        })).toEqual({
          edxVideoId: '',
          html5Sources: [],
          youtubeId,
        });
      });
      it('returns youtubeId and html5Sources when there are fallbackVideos', () => {
        expect(api.processVideoIds({
          videoSource: edxVideoId,
          fallbackVideos: html5Sources,
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
          videoSource: html5Sources[0],
          fallbackVideos: [],
        })).toEqual({
          edxVideoId: '',
          html5Sources: [html5Sources[0]],
          youtubeId: '',
        });
      });
      it('returns html5Sources when there are fallbackVideos', () => {
        expect(api.processVideoIds({
          videoSource: html5Sources[0],
          fallbackVideos: [html5Sources[1]],
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
  // TODO FOR LICENSE
  describe('processLicense', () => {});
});
