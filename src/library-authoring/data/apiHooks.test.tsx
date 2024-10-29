import React from 'react';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import {
  getCommitLibraryChangesUrl,
  getCreateLibraryBlockUrl,
  getLibraryCollectionComponentApiUrl,
  getLibraryCollectionsApiUrl,
  getLibraryCollectionApiUrl,
} from './api';
import {
  useCommitLibraryChanges,
  useCreateLibraryBlock,
  useCreateLibraryCollection,
  useRevertLibraryChanges,
  useAddComponentsToCollection,
  useCollection,
} from './apiHooks';

let axiosMock;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('library api hooks', () => {
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

  it('should create library block', async () => {
    const libraryId = 'lib:org:1';
    const url = getCreateLibraryBlockUrl(libraryId);
    axiosMock.onPost(url).reply(200);
    const { result } = renderHook(() => useCreateLibraryBlock(), { wrapper });
    await result.current.mutateAsync({
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
    const { result } = renderHook(() => useCommitLibraryChanges(), { wrapper });
    await result.current.mutateAsync(libraryId);

    expect(axiosMock.history.post[0].url).toEqual(url);
  });

  it('should revert library changes', async () => {
    const libraryId = 'lib:org:1';
    const url = getCommitLibraryChangesUrl(libraryId);
    axiosMock.onDelete(url).reply(200);
    const { result } = renderHook(() => useRevertLibraryChanges(), { wrapper });
    await result.current.mutateAsync(libraryId);

    expect(axiosMock.history.delete[0].url).toEqual(url);
  });

  it('should create collection', async () => {
    const libraryId = 'lib:org:1';
    const url = getLibraryCollectionsApiUrl(libraryId);
    axiosMock.onPost(url).reply(200);

    const { result } = renderHook(() => useCreateLibraryCollection(libraryId), { wrapper });
    await result.current.mutateAsync({
      title: 'This is a test',
      description: 'This is only a test',
    });

    expect(axiosMock.history.post[0].url).toEqual(url);
  });

  it('should add components to collection', async () => {
    const libraryId = 'lib:org:1';
    const collectionId = 'my-first-collection';
    const url = getLibraryCollectionComponentApiUrl(libraryId, collectionId);
    axiosMock.onPatch(url).reply(200);
    const { result } = renderHook(() => useAddComponentsToCollection(libraryId, collectionId), { wrapper });
    await result.current.mutateAsync(['some-usage-key']);

    expect(axiosMock.history.patch[0].url).toEqual(url);
  });

  it('should get collection metadata', async () => {
    const libraryId = 'lib:org:1';
    const collectionId = 'my-first-collection';
    const url = getLibraryCollectionApiUrl(libraryId, collectionId);

    axiosMock.onGet(url).reply(200, { 'test-data': 'test-value' });
    const { result } = renderHook(() => useCollection(libraryId, collectionId), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(result.current.data).toEqual({ testData: 'test-value' });
    expect(axiosMock.history.get[0].url).toEqual(url);
  });
});
