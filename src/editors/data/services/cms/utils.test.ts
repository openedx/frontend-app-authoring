import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import * as utils from './utils';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

describe('cms service utils', () => {
  describe('get', () => {
    it('forwards arguments to authenticatedHttpClient().get', () => {
      const get = jest.fn((...args) => ({ get: args }));
      getAuthenticatedHttpClient.mockReturnValue({ get });
      const args = ['url 1', { headers: {} }] as const;
      expect(utils.get(...args)).toEqual(get(...args));
    });
  });
  describe('post', () => {
    it('forwards arguments to authenticatedHttpClient().post', () => {
      const post = jest.fn((...args) => ({ post: args }));
      getAuthenticatedHttpClient.mockReturnValue({ post });
      const args = ['url 2', { headers: {} }] as const;
      expect(utils.post(...args)).toEqual(post(...args));
    });
  });
  // describe('deleteObject', () => {
  //   it('forwards arguments to authenticatedHttpClient().delete', () => {
  //     const deleteObject = jest.fn((...args) => ({ delete: args }));
  //     getAuthenticatedHttpClient.mockReturnValue({ deleteObject });
  //     const args = ['some', 'args', 'for', 'the', 'test'];
  //     expect(utils.deleteObject(...args)).toEqual(deleteObject(...args));
  //   });
  // });
});
