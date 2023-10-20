import { useQuery, useMutation } from '@tanstack/react-query';
import { useTaxonomyListData, useExportTaxonomy } from './api';
import { downloadDataAsFile } from '../../../utils';

const mockHttpClient = {
  get: jest.fn(),
};

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(() => mockHttpClient),
}));

jest.mock('../../../utils', () => ({
  downloadDataAsFile: jest.fn(),
}));

describe('taxonomy API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('useTaxonomyListData should call useQuery with the correct parameters', () => {
    useTaxonomyListData();

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['taxonomyList'],
      queryFn: expect.any(Function),
    });
  });

  it('useExportTaxonomy should export data correctly', async () => {
    useMutation.mockImplementation((exportFunc) => exportFunc);

    const mockResponseJson = {
      headers: {
        'content-type': 'application/json',
      },
      data: { tags: 'tags' },
    };
    const mockResponseCsv = {
      headers: {
        'content-type': 'text',
      },
      data: 'This is a CSV',
    };

    const exportTaxonomy = useExportTaxonomy();

    mockHttpClient.get.mockResolvedValue(mockResponseJson);
    await exportTaxonomy({ pk: 1, format: 'json', name: 'testFile' });

    expect(downloadDataAsFile).toHaveBeenCalledWith(
      JSON.stringify(mockResponseJson.data, null, 2),
      'application/json',
      'testFile.json',
    );

    mockHttpClient.get.mockResolvedValue(mockResponseCsv);
    await exportTaxonomy({ pk: 1, format: 'csv', name: 'testFile' });
    expect(downloadDataAsFile).toHaveBeenCalledWith(
      mockResponseCsv.data,
      'text',
      'testFile.csv',
    );
  });
});
