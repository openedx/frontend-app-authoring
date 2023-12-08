import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import MockAdapter from 'axios-mock-adapter';

import { taxonomyImportMock } from '../__mocks__';

import {
  getTaxonomyImportNewApiUrl,
  getTagsImportApiUrl,
  getTagsPlanImportApiUrl,
  importNewTaxonomy,
  planImportTags,
  useImportTags,
} from './api';

let axiosMock;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({
    ...jest.requireActual('@tanstack/react-query').useQueryClient(),
    invalidateQueries: mockInvalidateQueries,
  }),
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

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
    axiosMock.onPost(getTaxonomyImportNewApiUrl()).reply(201, taxonomyImportMock);
    const result = await importNewTaxonomy('Taxonomy name', 'Taxonomy description');

    expect(axiosMock.history.post[0].url).toEqual(getTaxonomyImportNewApiUrl());
    expect(result).toEqual(taxonomyImportMock);
  });

  it('should call import tags', async () => {
    axiosMock.onPut(getTagsImportApiUrl(1)).reply(200);
    const { result } = renderHook(() => useImportTags(), { wrapper });

    await result.current.mutateAsync({ taxonomyId: 1 });
    expect(axiosMock.history.put[0].url).toEqual(getTagsImportApiUrl(1));
  });

  it('should call plan import tags', async () => {
    axiosMock.onPut(getTagsPlanImportApiUrl(1)).reply(200, { plan: 'plan' });
    await planImportTags(1);
    expect(axiosMock.history.put[0].url).toEqual(getTagsPlanImportApiUrl(1));
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['tagList', 1],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['taxonomyDetail', 1],
    });
  });

  it('should handle errors in plan import tags', async () => {
    axiosMock.onPut(getTagsPlanImportApiUrl(1)).reply(400, { error: 'test error' });
    expect(planImportTags(1)).rejects.toEqual(Error('test error'));
    expect(axiosMock.history.put[0].url).toEqual(getTagsPlanImportApiUrl(1));
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
