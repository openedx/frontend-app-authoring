import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  commitLibraryChanges,
  createCollection,
  createLibraryBlock,
  getCommitLibraryChangesUrl,
  getCreateLibraryBlockUrl,
  getLibraryCollectionsApiUrl,
  revertLibraryChanges,
} from './api';

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
    axiosMock.restore();
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

  it('should commit library changes', async () => {
    const libraryId = 'lib:org:1';
    const url = getCommitLibraryChangesUrl(libraryId);
    axiosMock.onPost(url).reply(200);

    await commitLibraryChanges(libraryId);

    expect(axiosMock.history.post[0].url).toEqual(url);
  });

  it('should revert library changes', async () => {
    const libraryId = 'lib:org:1';
    const url = getCommitLibraryChangesUrl(libraryId);
    axiosMock.onDelete(url).reply(200);

    await revertLibraryChanges(libraryId);

    expect(axiosMock.history.delete[0].url).toEqual(url);
  });

  it('should create collection', async () => {
    const libraryId = 'lib:org:1';
    const url = getLibraryCollectionsApiUrl(libraryId);

    axiosMock.onPost(url).reply(200);

    await createCollection({
      title: 'This is a test',
      description: 'This is only a test',
    }, libraryId);

    expect(axiosMock.history.post[0].url).toEqual(url);
  });
});
