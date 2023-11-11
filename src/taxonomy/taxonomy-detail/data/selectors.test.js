import {
  useTaxonomyDetailData,
} from './api';
import {
  useTaxonomyDetailDataStatus,
  useTaxonomyDetailDataResponse,
} from './selectors';

jest.mock('./api', () => ({
  __esModule: true,
  useTaxonomyDetailData: jest.fn(),
}));

describe('useTaxonomyDetailDataStatus', () => {
  it('should return status values', () => {
    const status = {
      isError: false,
      error: undefined,
      isFetched: true,
      isSuccess: true,
    };

    useTaxonomyDetailData.mockReturnValueOnce(status);

    const result = useTaxonomyDetailDataStatus(0);

    expect(result).toEqual(status);
  });
});

describe('useTaxonomyDetailDataResponse', () => {
  it('should return data when status is success', () => {
    useTaxonomyDetailData.mockReturnValueOnce({ isSuccess: true, data: 'data' });

    const result = useTaxonomyDetailDataResponse();

    expect(result).toEqual('data');
  });

  it('should return undefined when status is not success', () => {
    useTaxonomyDetailData.mockReturnValueOnce({ isSuccess: false });

    const result = useTaxonomyDetailDataResponse();

    expect(result).toBeUndefined();
  });
});
