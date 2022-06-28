import * as utils from '../../../utils';
import * as api from './api';
import * as urls from './urls';
import { get, post } from './utils';

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
}));

jest.mock('./utils', () => ({
  get: jest.fn().mockName('get'),
  post: jest.fn().mockName('post'),
}));

const { camelize } = utils;

const { apiMethods } = api;

const blockId = 'coursev1:2uX@4345432';
const content = 'Im baby palo santo ugh celiac fashion axe. La croix lo-fi venmo whatever. Beard man braid migas single-origin coffee forage ramps.';
const learningContextId = 'demo2uX';
const studioEndpointUrl = 'hortus.coa';
const title = 'remember this needs to go into metadata to save';

describe('cms api', () => {
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
        expect(apiMethods.normalizeContent({
          blockId,
          blockType: 'html',
          content,
          learningContextId,
          title,
        })).toEqual({
          category: 'html',
          couseKey: learningContextId,
          data: content,
          has_changes: true,
          id: blockId,
          metadata: { display_name: title },
        });
      });
      test('throw error for invalid blockType', () => {
        expect(() => { apiMethods.normalizeContent({ blockType: 'somethingINVALID' }); })
          .toThrow(TypeError);
      });
    });

    describe('saveBlock', () => {
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
          urls.courseAssets({ studioEndpointUrl, learningContextId }),
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
});
