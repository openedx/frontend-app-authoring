import { useQuery } from '@tanstack/react-query';
import {
  useTagListDataStatus,
  useTagListDataResponse,
} from './apiHooks';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

describe('useTagListDataStatus', () => {
  it('should return status values', () => {
    const status = {
      error: undefined,
      isError: false,
      isFetched: true,
      isLoading: true,
      isSuccess: true,
    };

    useQuery.mockReturnValueOnce(status);

    const result = useTagListDataStatus(0, {});

    expect(result).toEqual(status);
  });
});

describe('useTagListDataResponse', () => {
  it('should return data when status is success', () => {
    useQuery.mockReturnValueOnce({ isSuccess: true, data: 'data' });

    const result = useTagListDataResponse(0, {});

    expect(result).toEqual('data');
  });

  it('should return undefined when status is not success', () => {
    useQuery.mockReturnValueOnce({ isSuccess: false });

    const result = useTagListDataResponse(0, {});

    expect(result).toBeUndefined();
  });
});
