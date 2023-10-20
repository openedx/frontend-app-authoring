import { useQuery } from '@tanstack/react-query';
import useTaxonomyListData from './api';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

describe('taxonomy API: useTaxonomyListData', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call useQuery with the correct parameters', () => {
    useTaxonomyListData();

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['taxonomyList'],
      queryFn: expect.any(Function),
    });
  });
});
