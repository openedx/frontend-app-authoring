import { useQuery } from '@tanstack/react-query';
import useUnitTagsCount from './apiHooks';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('./api', () => ({
  getTagsCount: jest.fn(),
}));

describe('useUnitTagsCount', () => {
  it('should return success response', () => {
    useQuery.mockReturnValueOnce({ isSuccess: true, data: 'data' });
    const pattern = '123';
    const result = useUnitTagsCount(pattern);

    expect(result).toEqual({ isSuccess: true, data: 'data' });
  });

  it('should return failure response', () => {
    useQuery.mockReturnValueOnce({ isSuccess: false });
    const pattern = '123';
    const result = useUnitTagsCount(pattern);

    expect(result).toEqual({ isSuccess: false });
  });
});
