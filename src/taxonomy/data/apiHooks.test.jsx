// @ts-check
import React from 'react'; // Required to use JSX syntax without type errors

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import MockAdapter from 'axios-mock-adapter';

import { apiUrls } from './api';

import {
  useCreateTag,
  useImportPlan,
  useImportTags,
  useImportNewTaxonomy,
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
    <IntlProvider locale="en">
      {children}
    </IntlProvider>
  </QueryClientProvider>
);

const emptyFile = new File([], 'empty.csv');

describe('import taxonomy api calls', () => {
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

  it('should call import new taxonomy', async () => {
    const mockResult = {
      id: 8,
      name: 'Taxonomy name',
      exportId: 'taxonomy_export_id',
      description: 'Taxonomy description',
    };
    axiosMock.onPost(apiUrls.createTaxonomyFromImport()).reply(201, mockResult);
    const { result } = renderHook(() => useImportNewTaxonomy(), { wrapper });
    const mutateResult = await result.current.mutateAsync({
      name: 'Taxonomy name',
      description: 'Taxonomy description',
      file: emptyFile,
    });

    expect(axiosMock.history.post[0].url).toEqual(apiUrls.createTaxonomyFromImport());
    expect(mutateResult).toEqual(mockResult);
  });

  it('should call import tags', async () => {
    const taxonomy = { id: 1, name: 'taxonomy name' };
    axiosMock.onPut(apiUrls.tagsImport(1)).reply(200, taxonomy);
    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const mockSetQueryData = jest.spyOn(queryClient, 'setQueryData');

    const { result } = renderHook(() => useImportTags(), { wrapper });

    await result.current.mutateAsync({ taxonomyId: 1, file: emptyFile });
    expect(axiosMock.history.put[0].url).toEqual(apiUrls.tagsImport(1));
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['taxonomies', 'taxonomy', 1, 'tags'] });
    expect(mockSetQueryData).toHaveBeenCalledWith(['taxonomies', 'taxonomy', 1, 'metadata'], taxonomy);
  });

  it('should call plan import tags', async () => {
    axiosMock.onPut(apiUrls.tagsPlanImport(1)).reply(200, { plan: 'some plan' });
    const { result } = renderHook(() => useImportPlan(1, emptyFile), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(axiosMock.history.put[0].url).toEqual(apiUrls.tagsPlanImport(1));
    expect(result.current.data).toEqual('some plan');
  });

  it('should handle errors in plan import tags', async () => {
    axiosMock.onPut(apiUrls.tagsPlanImport(1)).reply(400, { error: 'test error' });
    const { result } = renderHook(() => useImportPlan(1, emptyFile), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
    });
    expect(result.current.error).toEqual(Error('test error'));
    expect(axiosMock.history.put[0].url).toEqual(apiUrls.tagsPlanImport(1));
  });

  it('should surface tag errors', async () => {
    const duplicateMessage = 'Tag with value \'ab\' already exists for taxonomy.';
    axiosMock.onPost(apiUrls.createTag(1)).reply(400, [duplicateMessage]);
    const { result } = renderHook(() => useCreateTag(1), { wrapper });

    try {
      await result.current.mutateAsync({ value: 'ab' });
      // expect: if code reaches this line, the test should fail because an error should have been thrown
      expect('This line should not be reached').toBe(false);
    } catch (error) {
      // we check the response data, not the error message, because of how react-query surfaces errors from axios
      // @ts-ignore
      expect(error.response.data).toEqual([duplicateMessage]);
    }
  });
});
