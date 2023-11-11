import {
  useTagListDataStatus,
  useTagListDataResponse,
} from './selectors';
import {
  useTagListData,
} from './api';

jest.mock('./api', () => ({
  useTagListData: jest.fn(),
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

    useTagListData.mockReturnValueOnce(status);

    const result = useTagListDataStatus(0, {});

    expect(result).toEqual(status);
  });
});

describe('useTagListDataResponse', () => {
  it('should return data when status is success', () => {
    useTagListData.mockReturnValueOnce({ isSuccess: true, data: 'data' });

    const result = useTagListDataResponse(0, {});

    expect(result).toEqual('data');
  });

  it('should return undefined when status is not success', () => {
    useTagListData.mockReturnValueOnce({ isSuccess: false });

    const result = useTagListDataResponse(0, {});

    expect(result).toBeUndefined();
  });
});
