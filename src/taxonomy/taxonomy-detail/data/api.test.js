import { useQuery } from '@tanstack/react-query';
import {
  useTaxonomyDetailData,
} from './api';

const mockHttpClient = {
  get: jest.fn(),
};

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(() => mockHttpClient),
}));

describe('useTaxonomyDetailData', () => {
  it('should call useQuery with the correct parameters', () => {
    useTaxonomyDetailData('1');

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['taxonomyDetail', '1'],
      queryFn: expect.any(Function),
    });
  });
});
