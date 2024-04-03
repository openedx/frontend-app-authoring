import { useQuery, useMutation, useQueries } from '@tanstack/react-query';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import {
  useTaxonomyTagsData,
  useContentTaxonomyTagsData,
  useContentData,
  useContentTaxonomyTagsUpdater,
} from './apiHooks';

import { updateContentTaxonomyTags } from './api';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(() => ({
    setQueryData: jest.fn(),
  })),
  useQueries: jest.fn(),
}));

jest.mock('./api', () => ({
  updateContentTaxonomyTags: jest.fn(),
}));

describe('useTaxonomyTagsData', () => {
  it('should call useQueries with the correct arguments', () => {
    const taxonomyId = 123;
    const mockData = {
      results: [
        {
          value: 'tag 1',
          externalId: null,
          childCount: 16,
          depth: 0,
          parentValue: null,
          id: 635951,
          subTagsUrl: 'http://localhost:18010/api/content_tagging/v1/taxonomies/4/tags/?parent_tag=tag%201',
        },
        {
          value: 'tag 2',
          externalId: null,
          childCount: 1,
          depth: 0,
          parentValue: null,
          id: 636992,
          subTagsUrl: 'http://localhost:18010/api/content_tagging/v1/taxonomies/4/tags/?parent_tag=tag%202',
        },
        {
          value: 'tag 3',
          externalId: null,
          childCount: 0,
          depth: 1,
          parentValue: 'tag 2',
          id: 636993,
          subTagsUrl: null,
        },
        {
          value: 'tag 4',
          externalId: null,
          childCount: 0,
          depth: 1,
          parentValue: 'tag 2',
          id: 636994,
          subTagsUrl: null,
        },
      ],
    };

    useQueries.mockReturnValue([{
      data: mockData,
      isLoading: false,
      isError: false,
      isSuccess: true,
    }]);

    const { result } = renderHook(() => useTaxonomyTagsData(taxonomyId));

    // Assert that useQueries was called with the correct arguments
    expect(useQueries).toHaveBeenCalledWith({
      queries: [
        { queryKey: ['taxonomyTags', taxonomyId, null, 1, ''], queryFn: expect.any(Function), staleTime: Infinity },
      ],
    });

    expect(result.current.hasMorePages).toEqual(false);
    // Only includes the first 2 tags because the other 2 would be
    // in the nested dropdown
    expect(result.current.tagPages).toEqual(
      {
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: [
          {
            value: 'tag 1',
            externalId: null,
            childCount: 16,
            depth: 0,
            parentValue: null,
            id: 635951,
            subTagsUrl: 'http://localhost:18010/api/content_tagging/v1/taxonomies/4/tags/?parent_tag=tag%201',
          },
          {
            value: 'tag 2',
            externalId: null,
            childCount: 1,
            depth: 0,
            parentValue: null,
            id: 636992,
            subTagsUrl: 'http://localhost:18010/api/content_tagging/v1/taxonomies/4/tags/?parent_tag=tag%202',
          },
        ],
      },
    );
  });
});

describe('useContentTaxonomyTagsData', () => {
  it('should return success response', () => {
    useQuery.mockReturnValueOnce({ isSuccess: true, data: 'data' });
    const contentId = '123';
    const result = useContentTaxonomyTagsData(contentId);

    expect(result).toEqual({ isSuccess: true, data: 'data' });
  });

  it('should return failure response', () => {
    useQuery.mockReturnValueOnce({ isSuccess: false });
    const contentId = '123';
    const result = useContentTaxonomyTagsData(contentId);

    expect(result).toEqual({ isSuccess: false });
  });
});

describe('useContentData', () => {
  it('should return success response', () => {
    useQuery.mockReturnValueOnce({ isSuccess: true, data: 'data' });
    const contentId = '123';
    const result = useContentData(contentId);

    expect(result).toEqual({ isSuccess: true, data: 'data' });
  });

  it('should return failure response', () => {
    useQuery.mockReturnValueOnce({ isSuccess: false });
    const contentId = '123';
    const result = useContentData(contentId);

    expect(result).toEqual({ isSuccess: false });
  });
});

describe('useContentTaxonomyTagsUpdater', () => {
  it('should call the update content taxonomy tags function', async () => {
    useMutation.mockReturnValueOnce({ mutate: jest.fn() });

    const contentId = 'testerContent';
    const taxonomyId = 123;
    const mutation = useContentTaxonomyTagsUpdater(contentId);
    const tagsData = [{
      taxonomy: taxonomyId,
      tags: ['tag1', 'tag2'],
    }];
    mutation.mutate({ tagsData });

    expect(useMutation).toBeCalled();

    const [config] = useMutation.mock.calls[0];
    const { mutationFn } = config;

    await act(async () => {
      await mutationFn({ tagsData });
      expect(updateContentTaxonomyTags).toBeCalledWith(contentId, tagsData);
    });
  });
});
