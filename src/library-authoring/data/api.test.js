// @ts-check
import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { createLibraryBlock, getCreateLibraryBlockUrl } from './api';

let axiosMock;

describe('library api calls', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create library block', async () => {
    const libraryId = 'lib:org:1';
    const url = getCreateLibraryBlockUrl(libraryId);
    axiosMock.onPost(url).reply(200);
    await createLibraryBlock({
      libraryId,
      blockType: 'html',
      definitionId: '1',
    });

    expect(axiosMock.history.post[0].url).toEqual(url);
  });
});
