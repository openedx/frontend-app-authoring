import {
  returnUrl,
  unit,
  libraryV1,
  block,
  blockAncestor,
  blockStudioView,
  courseAssets,
  thumbnailUpload,
  downloadVideoTranscriptURL,
  videoTranscripts,
  downloadVideoHandoutUrl,
  courseDetailsUrl,
  checkTranscriptsForImport,
  replaceTranscript,
  courseAdvanceSettings,
  mediaTranscriptURL,
  videoFeatures,
  courseVideos,
} from './urls';

describe('cms url methods', () => {
  const studioEndpointUrl = 'urLgoeStOstudiO';
  const blockId = 'block-v1-blOckIDTeST123';
  const v2BlockId = 'lb:blOckIDTeST123';
  const learningContextId = 'lEarnIngCOntextId123';
  const libraryLearningContextId = 'library-v1:libaryId123';
  const courseId = 'course-v1:courseId123';
  const libraryV1Id = 'lib-block-v1:libaryId123';
  const libraryV2Id = 'lib:libaryId123';
  const language = 'la';
  const handout = '/aSSet@hANdoUt';
  const videoId = '123-SOmeVidEOid-213';
  const parameters = 'SomEParAMEterS';

  describe('return to learning context urls', () => {
    const unitUrl = {
      data: {
        ancestors: [
          {
            id: 'unItUrlTEST',
          },
        ],
      },
    };
    it('returns the library page when given the v1 library', () => {
      expect(returnUrl({
        studioEndpointUrl, unitUrl, learningContextId: libraryLearningContextId, blockId: libraryV1Id,
      }))
        .toEqual(`${studioEndpointUrl}/library/${libraryLearningContextId}`);
    });
    // it('throws error when given the v2 library', () => {
    //   expect(() => { returnUrl({ studioEndpointUrl, unitUrl, learningContextId: libraryV2Id }); })
    //     .toThrow('Return url not available (or needed) for V2 libraries');
    // });
    it('returns empty url when given the v2 library', () => {
      expect(returnUrl({
        studioEndpointUrl, unitUrl, learningContextId: libraryV2Id, blockId: libraryV2Id,
      })).toEqual('');
    });
    it('returnUrl function should return url with studioEndpointUrl, unitUrl, and blockId', () => {
      expect(returnUrl({
        studioEndpointUrl, unitUrl, learningContextId: courseId, blockId,
      }))
        .toEqual(`${studioEndpointUrl}/container/${unitUrl.data.ancestors[0].id}#${blockId}`);
    });
    it('returns blank url for v2 block', () => {
      expect(returnUrl({
        studioEndpointUrl, unitUrl, learningContextId: courseId, blockId: v2BlockId,
      }))
        .toEqual('');
    });
    it('throws error if no unit url', () => {
      expect(returnUrl({
        studioEndpointUrl, unitUrl: null, learningContextId: courseId, blockId,
      }))
        .toEqual('');
    });
    it('returns the library page when given the library', () => {
      expect(libraryV1({ studioEndpointUrl, learningContextId: libraryV1Id }))
        .toEqual(`${studioEndpointUrl}/library/${libraryV1Id}`);
    });
    it('unit function should return url with studioEndpointUrl, unitUrl, and blockId', () => {
      expect(unit({ studioEndpointUrl, unitUrl, blockId }))
        .toEqual(`${studioEndpointUrl}/container/${unitUrl.data.ancestors[0].id}#${blockId}`);
    });
  });
  describe('block', () => {
    it('returns v1 url with studioEndpointUrl and blockId', () => {
      expect(block({ studioEndpointUrl, blockId }))
        .toEqual(`${studioEndpointUrl}/xblock/${blockId}`);
    });
    it('returns v2 url with studioEndpointUrl and v2BlockId', () => {
      expect(block({ studioEndpointUrl, blockId: v2BlockId }))
        .toEqual(`${studioEndpointUrl}/api/xblock/v2/xblocks/${v2BlockId}/fields/`);
    });
  });
  describe('blockAncestor', () => {
    it('returns url with studioEndpointUrl, blockId and ancestor query', () => {
      expect(blockAncestor({ studioEndpointUrl, blockId }))
        .toEqual(`${block({ studioEndpointUrl, blockId })}?fields=ancestorInfo`);
    });
    it('throws error with studioEndpointUrl, v2 blockId and ancestor query', () => {
      expect(() => { blockAncestor({ studioEndpointUrl, blockId: v2BlockId }); })
        .toThrow('Block ancestor not available (and not needed) for V2 blocks');
    });
  });
  describe('blockStudioView', () => {
    it('returns v1 url with studioEndpointUrl, blockId and studio_view query', () => {
      expect(blockStudioView({ studioEndpointUrl, blockId }))
        .toEqual(`${block({ studioEndpointUrl, blockId })}/studio_view`);
    });
    it('returns v2 url with studioEndpointUrl, v2 blockId and studio_view query', () => {
      expect(blockStudioView({ studioEndpointUrl, blockId: v2BlockId }))
        .toEqual(`${studioEndpointUrl}/api/xblock/v2/xblocks/${v2BlockId}/view/studio_view/`);
    });
  });

  describe('courseAssets', () => {
    it('returns url with studioEndpointUrl and learningContextId', () => {
      expect(courseAssets({ studioEndpointUrl, learningContextId }))
        .toEqual(`${studioEndpointUrl}/assets/${learningContextId}/`);
    });
  });
  describe('thumbnailUpload', () => {
    it('returns url with studioEndpointUrl, learningContextId, and videoId', () => {
      expect(thumbnailUpload({ studioEndpointUrl, learningContextId, videoId }))
        .toEqual(`${studioEndpointUrl}/video_images/${learningContextId}/${videoId}`);
    });
  });
  describe('videoTranscripts', () => {
    it('returns url with studioEndpointUrl and blockId', () => {
      expect(videoTranscripts({ studioEndpointUrl, blockId }))
        .toEqual(`${block({ studioEndpointUrl, blockId })}/handler/studio_transcript/translation`);
    });
  });
  describe('downloadVideoTranscriptURL', () => {
    it('returns url with studioEndpointUrl, blockId and language query', () => {
      expect(downloadVideoTranscriptURL({ studioEndpointUrl, blockId, language }))
        .toEqual(`${videoTranscripts({ studioEndpointUrl, blockId })}?language_code=${language}`);
    });
  });
  describe('downloadVideoHandoutUrl', () => {
    it('returns url with studioEndpointUrl and handout', () => {
      expect(downloadVideoHandoutUrl({ studioEndpointUrl, handout }))
        .toEqual(`${studioEndpointUrl}${handout}`);
    });
  });
  describe('courseDetailsUrl', () => {
    it('returns url with studioEndpointUrl and courseKey', () => {
      expect(courseDetailsUrl({ studioEndpointUrl, learningContextId }))
        .toEqual(`${studioEndpointUrl}/settings/details/${learningContextId}`);
    });
  });
  describe('checkTranscriptsForImport', () => {
    it('returns url with studioEndpointUrl and parameters', () => {
      expect(checkTranscriptsForImport({ studioEndpointUrl, parameters }))
        .toEqual(`${studioEndpointUrl}/transcripts/check?data=${parameters}`);
    });
  });
  describe('replaceTranscript', () => {
    it('returns url with studioEndpointUrl and parameters', () => {
      expect(replaceTranscript({ studioEndpointUrl, parameters }))
        .toEqual(`${studioEndpointUrl}/transcripts/replace?data=${parameters}`);
    });
  });
  describe('courseAdvanceSettings', () => {
    it('returns url with studioEndpointUrl and learningContextId', () => {
      expect(courseAdvanceSettings({ studioEndpointUrl, learningContextId }))
        .toEqual(`${studioEndpointUrl}/api/contentstore/v0/advanced_settings/${learningContextId}`);
    });
  });
  describe('videoFeatures', () => {
    it('returns url with studioEndpointUrl and learningContextId', () => {
      expect(videoFeatures({ studioEndpointUrl }))
        .toEqual(`${studioEndpointUrl}/video_features/`);
    });
  });
  describe('courseVideos', () => {
    it('returns url with studioEndpointUrl and learningContextId', () => {
      expect(courseVideos({ studioEndpointUrl, learningContextId }))
        .toEqual(`${studioEndpointUrl}/videos/${learningContextId}`);
    });
  });
  describe('mediaTranscriptURL', () => {
    it('returns url with studioEndpointUrl', () => {
      const transcriptUrl = 'this-is-a-transcript';
      expect(mediaTranscriptURL({ studioEndpointUrl, transcriptUrl }))
        .toEqual(`${studioEndpointUrl}${transcriptUrl}`);
    });
  });
});
