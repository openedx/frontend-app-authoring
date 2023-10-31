import { useQuery } from '@tanstack/react-query';
import {
  useTaxonomyListDataResponse,
  useIsTaxonomyListDataLoaded,
} from './hooks';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

describe('useTaxonomyListDataResponse', () => {
  it('should return data when status is success', () => {
    useQuery.mockReturnValueOnce({ status: 'success', data: { data: 'data' } });

    const result = useTaxonomyListDataResponse();

    expect(result).toEqual({ data: 'data' });
  });

  it('should return undefined when status is not success', () => {
    useQuery.mockReturnValueOnce({ status: 'error' });

    const result = useTaxonomyListDataResponse();

    expect(result).toBeUndefined();
  });
});

describe('useIsTaxonomyListDataLoaded', () => {
  it('should return true when status is success', () => {
    useQuery.mockReturnValueOnce({ status: 'success' });

    const result = useIsTaxonomyListDataLoaded();

    expect(result).toBe(true);
  });

  it('should return false when status is not success', () => {
    useQuery.mockReturnValueOnce({ status: 'error' });

    const result = useIsTaxonomyListDataLoaded();

    expect(result).toBe(false);
  });
});

/* describe('callExportTaxonomy', () => {
  it('should trigger exportTaxonomy', () => {
    callExportTaxonomy(1, 'csv');

    expect(exportTaxonomy).toHaveBeenCalled();
  });
});
*/
