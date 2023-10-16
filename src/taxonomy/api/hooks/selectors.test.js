import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded } from './selectors';
import useTaxonomyListData from './api';

jest.mock('./api', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useTaxonomyListDataResponse', () => {
  it('should return data when status is success', () => {
    useTaxonomyListData.mockReturnValueOnce({ status: 'success', data: { data: 'data' } });

    const result = useTaxonomyListDataResponse();

    expect(result).toEqual('data');
  });

  it('should return undefined when status is not success', () => {
    useTaxonomyListData.mockReturnValueOnce({ status: 'error' });

    const result = useTaxonomyListDataResponse();

    expect(result).toBeUndefined();
  });
});

describe('useIsTaxonomyListDataLoaded', () => {
  it('should return true when status is success', () => {
    useTaxonomyListData.mockReturnValueOnce({ status: 'success' });

    const result = useIsTaxonomyListDataLoaded();

    expect(result).toBe(true);
  });

  it('should return false when status is not success', () => {
    useTaxonomyListData.mockReturnValueOnce({ status: 'error' });

    const result = useIsTaxonomyListDataLoaded();

    expect(result).toBe(false);
  });
});
