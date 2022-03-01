import {
  fetchBlockById, fetchByUnitId, normalizeContent, saveBlock,
} from './api';
import * as urls from './urls';
import { get, post } from './utils';

jest.mock('./urls', () => ({
  block: jest.fn().mockName('urls.block'),
  blockAncestor: jest.fn().mockName('urls.blockAncestor'),
}));

jest.mock('./utils', () => ({
  get: jest.fn().mockName('get'),
  post: jest.fn().mockName('post'),
}));

const blockId = 'coursev1:2uX@4345432';
const content = 'Im baby palo santo ugh celiac fashion axe. La croix lo-fi venmo whatever. Beard man braid migas single-origin coffee forage ramps.';
const courseId = 'demo2uX';
const studioEndpointUrl = 'hortus.coa';
const title = 'remember this needs to go into metadata to save';

describe('cms api', () => {
  describe('fetchBlockId', () => {
    it('should call get with url.blocks', () => {
      fetchBlockById({ blockId, studioEndpointUrl });
      expect(get).toHaveBeenCalledWith(urls.block({ blockId, studioEndpointUrl }));
    });
  });

  describe('fetchByUnitId', () => {
    it('should call get with url.blockAncestor', () => {
      fetchByUnitId({ blockId, studioEndpointUrl });
      expect(get).toHaveBeenCalledWith(urls.blockAncestor({ studioEndpointUrl, blockId }));
    });
  });

  describe('normalizeContent', () => {
    test('return value for blockType: html', () => {
      expect(normalizeContent({
        blockId,
        blockType: 'html',
        content,
        courseId,
        title,
      })).toEqual({
        category: 'html',
        couseKey: courseId,
        data: content,
        has_changes: true,
        id: blockId,
        metadata: { display_name: title },
      });
    });
    test('throw error for invalid blockType', () => {
      expect(() => { normalizeContent({ blockType: 'somethingINVALID' }); })
        .toThrow(TypeError);
    });
  });

  describe('saveBlock', () => {
    it('should call post with urls.block and normalizeContent', () => {
      saveBlock({
        blockId,
        blockType: 'html',
        content,
        courseId,
        studioEndpointUrl,
        title,
      });
      expect(post).toHaveBeenCalledWith(
        urls.block({ studioEndpointUrl }),
        normalizeContent({
          blockType: 'html',
          content,
          blockId,
          courseId,
          title,
        }),
      );
    });
  });
});
