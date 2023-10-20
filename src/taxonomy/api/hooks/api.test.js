import { useQuery } from '@tanstack/react-query';
import { useTaxonomyListData, exportTaxonomy } from './api';

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

describe('useTaxonomyListData', () => {
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

describe('exportTaxonomy', () => {
  const { location } = window;

  beforeAll(() => {
    delete window.location;
    window.location = {
      href: '',
    };
  });

  afterAll(() => {
    window.location = location;
  });

  it('should set window.location.href correctly', () => {
    const pk = 1;
    const format = 'json';

    exportTaxonomy(pk, format);

    expect(window.location.href).toEqual(
      'http://localhost:18010/api/content_tagging/'
      + 'v1/taxonomies/1/export/?output_format=json&download=1',
    );
  });
});
