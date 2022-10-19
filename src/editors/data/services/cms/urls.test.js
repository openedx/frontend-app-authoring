import {
  returnUrl,
  unit,
  libraryV1,
  block,
  blockAncestor,
  blockStudioView,
  courseAssets,
  courseImages,
  downloadVideoTranscriptURL,
  videoTranscripts,
  downloadVideoHandoutUrl,
} from './urls';

describe('cms url methods', () => {
  const studioEndpointUrl = 'urLgoeStOstudiO';
  const blockId = 'blOckIDTeST123';
  const learningContextId = 'lEarnIngCOntextId123';
  const courseId = 'course-v1:courseId123';
  const libraryV1Id = 'library-v1:libaryId123';
  const language = 'la';
  const handout = '/aSSet@hANdoUt';
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
    it('returns the library page when given the library', () => {
      expect(returnUrl({ studioEndpointUrl, unitUrl, learningContextId: libraryV1Id }))
        .toEqual(`${studioEndpointUrl}/library/${libraryV1Id}`);
    });
    it('returns url with studioEndpointUrl and unitUrl', () => {
      expect(returnUrl({ studioEndpointUrl, unitUrl, learningContextId: courseId }))
        .toEqual(`${studioEndpointUrl}/container/${unitUrl.data.ancestors[0].id}`);
    });
    it('returns empty string if no unit url', () => {
      expect(returnUrl({ studioEndpointUrl, unitUrl: null, learningContextId: courseId }))
        .toEqual('');
    });
    it('returns the library page when given the library', () => {
      expect(libraryV1({ studioEndpointUrl, learningContextId: libraryV1Id }))
        .toEqual(`${studioEndpointUrl}/library/${libraryV1Id}`);
    });
    it('returns url with studioEndpointUrl and unitUrl', () => {
      expect(unit({ studioEndpointUrl, unitUrl }))
        .toEqual(`${studioEndpointUrl}/container/${unitUrl.data.ancestors[0].id}`);
    });
  });
  describe('block', () => {
    it('returns url with studioEndpointUrl and blockId', () => {
      expect(block({ studioEndpointUrl, blockId }))
        .toEqual(`${studioEndpointUrl}/xblock/${blockId}`);
    });
  });
  describe('blockAncestor', () => {
    it('returns url with studioEndpointUrl, blockId and ancestor query', () => {
      expect(blockAncestor({ studioEndpointUrl, blockId }))
        .toEqual(`${block({ studioEndpointUrl, blockId })}?fields=ancestorInfo`);
    });
  });
  describe('blockStudioView', () => {
    it('returns url with studioEndpointUrl, blockId and studio_view query', () => {
      expect(blockStudioView({ studioEndpointUrl, blockId }))
        .toEqual(`${block({ studioEndpointUrl, blockId })}/studio_view`);
    });
  });

  describe('courseAssets', () => {
    it('returns url with studioEndpointUrl and learningContextId', () => {
      expect(courseAssets({ studioEndpointUrl, learningContextId }))
        .toEqual(`${studioEndpointUrl}/assets/${learningContextId}/`);
    });
  });
  describe('courseImages', () => {
    it('returns url with studioEndpointUrl, learningContextId and courseAssets query', () => {
      expect(courseImages({ studioEndpointUrl, learningContextId }))
        .toEqual(`${courseAssets({ studioEndpointUrl, learningContextId })}?sort=uploadDate&direction=desc&asset_type=Images`);
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
});
