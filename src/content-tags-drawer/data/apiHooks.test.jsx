import { useQuery } from '@tanstack/react-query';
import {
  useTaxonomyTagsDataResponse,
  useIsTaxonomyTagsDataLoaded,
  useContentTaxonomyTagsDataResponse,
  useIsContentTaxonomyTagsDataLoaded,
  useContentDataResponse,
  useIsContentDataLoaded,
} from './apiHooks';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

describe('useTaxonomyTagsDataResponse', () => {
  it('should return data when status is success', () => {
    useQuery.mockReturnValueOnce({ status: 'success', data: { data: 'data' } });
    const taxonomyId = '123';
    const result = useTaxonomyTagsDataResponse(taxonomyId);

    expect(result).toEqual({ data: 'data' });
  });

  it('should return undefined when status is not success', () => {
    useQuery.mockReturnValueOnce({ status: 'error' });
    const taxonomyId = '123';
    const result = useTaxonomyTagsDataResponse(taxonomyId);

    expect(result).toBeUndefined();
  });
});

describe('useIsTaxonomyTagsDataLoaded', () => {
  it('should return true when status is success', () => {
    useQuery.mockReturnValueOnce({ status: 'success' });
    const taxonomyId = '123';
    const result = useIsTaxonomyTagsDataLoaded(taxonomyId);

    expect(result).toBe(true);
  });

  it('should return false when status is not success', () => {
    useQuery.mockReturnValueOnce({ status: 'error' });
    const taxonomyId = '123';
    const result = useIsTaxonomyTagsDataLoaded(taxonomyId);

    expect(result).toBe(false);
  });
});

describe('useContentTaxonomyTagsDataResponse', () => {
  it('should return data when status is success', () => {
    useQuery.mockReturnValueOnce({ status: 'success', data: { data: 'data' } });
    const contentId = '123';
    const result = useContentTaxonomyTagsDataResponse(contentId);

    expect(result).toEqual({ data: 'data' });
  });

  it('should return undefined when status is not success', () => {
    useQuery.mockReturnValueOnce({ status: 'error' });
    const contentId = '123';
    const result = useContentTaxonomyTagsDataResponse(contentId);

    expect(result).toBeUndefined();
  });
});

describe('useIsContentTaxonomyTagsDataLoaded', () => {
  it('should return true when status is success', () => {
    useQuery.mockReturnValueOnce({ status: 'success' });
    const contentId = '123';
    const result = useIsContentTaxonomyTagsDataLoaded(contentId);

    expect(result).toBe(true);
  });

  it('should return false when status is not success', () => {
    useQuery.mockReturnValueOnce({ status: 'error' });
    const contentId = '123';
    const result = useIsContentTaxonomyTagsDataLoaded(contentId);

    expect(result).toBe(false);
  });
});

describe('useContentDataResponse', () => {
  it('should return data when status is success', () => {
    useQuery.mockReturnValueOnce({ status: 'success', data: { data: 'data' } });
    const contentId = '123';
    const result = useContentDataResponse(contentId);

    expect(result).toEqual({ data: 'data' });
  });

  it('should return undefined when status is not success', () => {
    useQuery.mockReturnValueOnce({ status: 'error' });
    const contentId = '123';
    const result = useContentDataResponse(contentId);

    expect(result).toBeUndefined();
  });
});

describe('useIsContentDataLoaded', () => {
  it('should return true when status is success', () => {
    useQuery.mockReturnValueOnce({ status: 'success' });
    const contentId = '123';
    const result = useIsContentDataLoaded(contentId);

    expect(result).toBe(true);
  });

  it('should return false when status is not success', () => {
    useQuery.mockReturnValueOnce({ status: 'error' });
    const contentId = '123';
    const result = useIsContentDataLoaded(contentId);

    expect(result).toBe(false);
  });
});
