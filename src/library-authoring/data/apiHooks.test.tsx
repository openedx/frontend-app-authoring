import React from 'react';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import {
  getCommitLibraryChangesUrl,
  getCreateLibraryBlockUrl,
  getLibraryCollectionItemsApiUrl,
  getLibraryCollectionsApiUrl,
  getLibraryCollectionApiUrl,
  getBlockTypesMetaDataUrl,
  getLibraryContainerApiUrl,
  getLibraryContainerRestoreApiUrl,
  getLibraryContainerChildrenApiUrl,
  getLibraryContainerPublishApiUrl,
} from './api';
import {
  useCommitLibraryChanges,
  useCreateLibraryBlock,
  useCreateLibraryCollection,
  useRevertLibraryChanges,
  useAddItemsToCollection,
  useCollection,
  useBlockTypesMetadata,
  useContainer,
  useDeleteContainer,
  useRestoreContainer,
  useContainerChildren,
  useAddComponentsToContainer,
  useUpdateContainerChildren,
  useRemoveContainerChildren,
  usePublishContainer,
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
    const url = getLibraryCollectionItemsApiUrl(libraryId, collectionId);
    axiosMock.onPatch(url).reply(200);
    const { result } = renderHook(() => useAddItemsToCollection(libraryId, collectionId), { wrapper });
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

  it('should get block types metadata', async () => {
    const libraryId = 'lib:org:1';
    const url = getBlockTypesMetaDataUrl(libraryId);

    axiosMock.onGet(url).reply(200, { 'test-data': 'test-value' });
    const { result } = renderHook(() => useBlockTypesMetadata(libraryId), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(result.current.data).toEqual({ testData: 'test-value' });
    expect(axiosMock.history.get[0].url).toEqual(url);
  });

  it('should get container metadata', async () => {
    const containerId = 'lct:lib:org:unit:unit1';
    const url = getLibraryContainerApiUrl(containerId);

    axiosMock.onGet(url).reply(200, { 'test-data': 'test-value' });
    const { result } = renderHook(() => useContainer(containerId), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(result.current.data).toEqual({ testData: 'test-value' });
    expect(axiosMock.history.get[0].url).toEqual(url);
  });

  it('should delete a container', async () => {
    const containerId = 'lct:org:lib:unit:unit1';
    const url = getLibraryContainerApiUrl(containerId);

    axiosMock.onDelete(url).reply(200);
    const { result } = renderHook(() => useDeleteContainer(containerId), { wrapper });
    await result.current.mutateAsync();
    await waitFor(() => {
      expect(axiosMock.history.delete[0].url).toEqual(url);
    });
  });

  it('should restore a container', async () => {
    const containerId = 'lct:org:lib:unit:unit1';
    const url = getLibraryContainerRestoreApiUrl(containerId);

    axiosMock.onPost(url).reply(200);
    const { result } = renderHook(() => useRestoreContainer(containerId), { wrapper });
    await result.current.mutateAsync();
    await waitFor(() => {
      expect(axiosMock.history.post[0].url).toEqual(url);
    });
  });

  it('should get container children', async () => {
    const containerId = 'lct:lib:org:unit:unit1';
    const url = getLibraryContainerChildrenApiUrl(containerId);

    axiosMock.onGet(url).reply(200, [
      {
        id: 'lb:org1:Demo_course:html:text',
        block_type: 'html',
        display_name: 'text block',
        last_published: null,
        published_by: null,
        last_draft_created: null,
        last_draft_created_by: null,
        has_unpublished_changes: false,
        created: null,
        modified: null,
        tags_count: 0,
        collections: ['col1', 'col2'],
      },
      {
        id: 'lb:org1:Demo_course:video:video1',
        block_type: 'video',
        display_name: 'video block',
        last_published: null,
        published_by: null,
        last_draft_created: null,
        last_draft_created_by: null,
        has_unpublished_changes: false,
        created: null,
        modified: null,
        tags_count: 0,
        collections: ['col2'],
      },
    ]);
    const { result } = renderHook(() => useContainerChildren(containerId), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(result.current.data).toEqual([
      {
        id: 'lb:org1:Demo_course:html:text',
        blockType: 'html',
        displayName: 'text block',
        lastPublished: null,
        publishedBy: null,
        lastDraftCreated: null,
        lastDraftCreatedBy: null,
        hasUnpublishedChanges: false,
        created: null,
        modified: null,
        tagsCount: 0,
        collections: ['col1', 'col2'],
      },
      {
        id: 'lb:org1:Demo_course:video:video1',
        blockType: 'video',
        displayName: 'video block',
        lastPublished: null,
        publishedBy: null,
        lastDraftCreated: null,
        lastDraftCreatedBy: null,
        hasUnpublishedChanges: false,
        created: null,
        modified: null,
        tagsCount: 0,
        collections: ['col2'],
      },
    ]);
    expect(axiosMock.history.get[0].url).toEqual(url);
  });

  it('should add components to container', async () => {
    const componentId = 'lb:org:lib:html:1';
    const containerId = 'lct:org:lib:unit:1';

    const url = getLibraryContainerChildrenApiUrl(containerId);

    axiosMock.onPost(url).reply(200);
    const { result } = renderHook(() => useAddComponentsToContainer(containerId), { wrapper });
    await result.current.mutateAsync([componentId]);

    expect(axiosMock.history.post[0].url).toEqual(url);
  });

  it('should update container children', async () => {
    const containerId = 'lct:org:lib:unit:unit-1';
    const url = getLibraryContainerChildrenApiUrl(containerId);

    axiosMock.onPatch(url).reply(200);
    const { result } = renderHook(() => useUpdateContainerChildren(containerId), { wrapper });
    await result.current.mutateAsync([]);
    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
    });
  });

  it('should not attempt request if containerId is not defined', async () => {
    const { result } = renderHook(() => useUpdateContainerChildren(), { wrapper });
    await result.current.mutateAsync([]);
    await waitFor(() => {
      expect(axiosMock.history.patch.length).toEqual(0);
    });
  });

  it('should remove container children', async () => {
    const containerId = 'lct:org:lib1';
    const url = getLibraryContainerChildrenApiUrl(containerId);

    axiosMock.onDelete(url).reply(200);
    const { result } = renderHook(() => useRemoveContainerChildren(containerId), { wrapper });
    await result.current.mutateAsync([]);
    await waitFor(() => {
      expect(axiosMock.history.delete[0].url).toEqual(url);
    });
  });

  it('should not attempt request if containerId is not defined in remove children from container', async () => {
    const { result } = renderHook(() => useRemoveContainerChildren(), { wrapper });
    await result.current.mutateAsync([]);
    await waitFor(() => {
      expect(axiosMock.history.patch.length).toEqual(0);
    });
  });

  describe('publishContainer', () => {
    it('should publish a container', async () => {
      const containerId = 'lct:org:lib:unit:1';
      const url = getLibraryContainerPublishApiUrl(containerId);
      axiosMock.onPost(url).reply(200);
      const { result } = renderHook(() => usePublishContainer(containerId), { wrapper });
      await result.current.mutateAsync();

      expect(axiosMock.history.post[0].url).toEqual(url);
    });
  });
});
