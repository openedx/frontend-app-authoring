import queryString from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import * as utils from './utils';

jest.mock('query-string', () => ({
  stringifyUrl: jest.fn((url, options) => ({ url, options })),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

describe('lms service utils', () => {
  describe('get', () => {
    it('forwards arguments to authenticatedHttpClient().get', () => {
      const get = jest.fn((...args) => ({ get: args }));
      getAuthenticatedHttpClient.mockReturnValue({ get });
      const args = ['some', 'args', 'for', 'the', 'test'];
      expect(utils.get(...args)).toEqual(get(...args));
    });
  });
  describe('post', () => {
    it('forwards arguments to authenticatedHttpClient().post', () => {
      const post = jest.fn((...args) => ({ post: args }));
      getAuthenticatedHttpClient.mockReturnValue({ post });
      const args = ['some', 'args', 'for', 'the', 'test'];
      expect(utils.post(...args)).toEqual(post(...args));
    });
  });
  describe('stringifyUrl', () => {
    it('forwards url and query to stringifyUrl with options to skip null and ""', () => {
      const url = 'here.com';
      const query = { some: 'set', of: 'queryParams' };
      const options = { skipNull: true, skipEmptyString: true };
      expect(utils.stringifyUrl(url, query)).toEqual(
        queryString.stringifyUrl({ url, query }, options),
      );
    });
  });
});
