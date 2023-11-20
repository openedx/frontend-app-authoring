import { useQuery } from '@tanstack/react-query';
import {
  useTaxonomyDetailDataStatus,
  useTaxonomyDetailDataResponse,
} from './apiHooks';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

describe('useTaxonomyDetailDataStatus', () => {
  it('should return status values', () => {
    const status = {
      isError: false,
      error: undefined,
      isFetched: true,
      isSuccess: true,
    };

    useQuery.mockReturnValueOnce(status);

    const result = useTaxonomyDetailDataStatus(0);

    expect(result).toEqual(status);
  });
});

describe('useTaxonomyDetailDataResponse', () => {
  it('should return data when status is success', () => {
    useQuery.mockReturnValueOnce({ isSuccess: true, data: 'data' });

    const result = useTaxonomyDetailDataResponse();

    expect(result).toEqual('data');
  });

  it('should return undefined when status is not success', () => {
    useQuery.mockReturnValueOnce({ isSuccess: false });

    const result = useTaxonomyDetailDataResponse();

    expect(result).toBeUndefined();
  });
});
