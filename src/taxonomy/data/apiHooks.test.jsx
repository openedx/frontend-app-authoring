import { useQuery, useMutation } from '@tanstack/react-query';
import { act } from '@testing-library/react';

import {
  useTaxonomyListDataResponse,
  useIsTaxonomyListDataLoaded,
  useDeleteTaxonomy,
  useTaxonomyDetailDataStatus,
  useTaxonomyDetailDataResponse,
} from './apiHooks';
import { deleteTaxonomy } from './api';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('./api', () => ({
  deleteTaxonomy: jest.fn(),
}));

/*
 * TODO: We can refactor this test: Mock the API response using axiosMock.
 * Ref: https://github.com/openedx/frontend-app-course-authoring/pull/684#issuecomment-1847694090
 */
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

describe('useDeleteTaxonomy', () => {
  it('should call the delete function', async () => {
    useMutation.mockReturnValueOnce({ mutate: jest.fn() });

    const mutation = useDeleteTaxonomy();
    mutation();

    expect(useMutation).toBeCalled();

    const [config] = useMutation.mock.calls[0];
    const { mutationFn } = config;

    await act(async () => {
      await mutationFn({ pk: 1 });
      expect(deleteTaxonomy).toBeCalledWith(1);
    });
  });
});

describe('useTaxonomyDetailDataStatus', () => {
  it('should return status values', () => {
    const status = {
      isError: false,
      error: undefined,
      isFetched: true,
      isSuccess: true,
    };

    useQuery.mockReturnValueOnce(status);

    const result = useTaxonomyDetailDataStatus(0);

    expect(result).toEqual(status);
  });
});

describe('useTaxonomyDetailDataResponse', () => {
  it('should return data when status is success', () => {
    useQuery.mockReturnValueOnce({ isSuccess: true, data: 'data' });

    const result = useTaxonomyDetailDataResponse();

    expect(result).toEqual('data');
  });

  it('should return undefined when status is not success', () => {
    useQuery.mockReturnValueOnce({ isSuccess: false });

    const result = useTaxonomyDetailDataResponse();

    expect(result).toBeUndefined();
  });
});
