import { useQuery, useMutation } from '@tanstack/react-query';
import { act } from '@testing-library/react';
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
  useQueryClient: jest.fn(),
}));

jest.mock('./api', () => ({
  updateContentTaxonomyTags: jest.fn(),
}));

describe('useTaxonomyTagsData', () => {
  it('should return success response', () => {
    useQuery.mockReturnValueOnce({ isSuccess: true, data: 'data' });
    const taxonomyId = 123;
    const result = useTaxonomyTagsData(taxonomyId);

    expect(result).toEqual({ isSuccess: true, data: 'data' });
  });

  it('should return failure response', () => {
    useQuery.mockReturnValueOnce({ isSuccess: false });
    const taxonomyId = 123;
    const result = useTaxonomyTagsData(taxonomyId);

    expect(result).toEqual({ isSuccess: false });
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
    const mutation = useContentTaxonomyTagsUpdater(contentId, taxonomyId);
    mutation.mutate({ tags: ['tag1', 'tag2'] });

    expect(useMutation).toBeCalled();

    const [config] = useMutation.mock.calls[0];
    const { mutationFn } = config;

    await act(async () => {
      const tags = ['tag1', 'tag2'];
      await mutationFn({ tags });
      expect(updateContentTaxonomyTags).toBeCalledWith(contentId, taxonomyId, tags);
    });
  });
});
