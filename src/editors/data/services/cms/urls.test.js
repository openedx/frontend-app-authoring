import {
  unit,
  block,
  blockAncestor,
  courseAssets,
  courseImages,
} from './urls';

describe('cms url methods', () => {
  const studioEndpointUrl = 'urLgoeStOstudiO';
  const blockId = 'blOckIDTeST123';
  const courseId = 'coUrseiD321';
  describe('unit', () => {
    const unitUrl = {
      data: {
        ancestors: [
          {
            id: 'unItUrlTEST',
          },
        ],
      },
    };
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
  describe('courseAssets', () => {
    it('returns url with studioEndpointUrl and courseId', () => {
      expect(courseAssets({ studioEndpointUrl, courseId }))
        .toEqual(`${studioEndpointUrl}/assets/${courseId}/`);
    });
  });
  describe('courseImages', () => {
    it('returns url with studioEndpointUrl, courseId and courseAssets query', () => {
      expect(courseImages({ studioEndpointUrl, courseId }))
        .toEqual(`${courseAssets({ studioEndpointUrl, courseId })}?sort=uploadDate&direction=desc&asset_type=Images`);
    });
  });
});
