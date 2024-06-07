// @ts-check
import React from 'react';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { getCreateLibraryBlockUrl } from './api';
import { useCreateLibraryBlock } from './apiHook';

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
});
