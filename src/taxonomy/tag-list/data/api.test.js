import { useQuery } from '@tanstack/react-query';
import {
  useTagListData,
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

describe('useTagListData', () => {
  it('should call useQuery with the correct parameters', () => {
    useTagListData('1', { pageIndex: 3 });

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['tagList', '1', 3],
      queryFn: expect.any(Function),
    });
  });
});
