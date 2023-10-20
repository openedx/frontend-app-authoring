import {
  useTaxonomyListDataResponse,
  useIsTaxonomyListDataLoaded,
  useExportTaxonomyMutation,
} from './selectors';
import { useTaxonomyListData, useExportTaxonomy } from './api';

jest.mock('./api', () => ({
  __esModule: true,
  useTaxonomyListData: jest.fn(),
  useExportTaxonomy: jest.fn(),
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

describe('useExportTaxonomyMutation', () => {
  it('should trigger useExportTaxonomy', () => {
    useExportTaxonomyMutation();

    expect(useExportTaxonomy).toHaveBeenCalled();
  });
});
