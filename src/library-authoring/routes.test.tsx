import { useEffect } from 'react';
import fetchMock from 'fetch-mock-jest';
import {
  mockContentLibrary,
} from './data/api.mocks';
import { LibraryLayout } from '.';
import { ContentType, useLibraryRoutes } from './routes';
import mockResult from './__mocks__/library-search.json';
import { initializeMocks, render } from '../testUtils';
import { studioHomeMock } from '../studio-home/__mocks__';
import { getStudioHomeApiUrl } from '../studio-home/data/api';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

mockContentLibrary.applyMock();

const searchEndpoint = 'http://mock.meilisearch.local/multi-search';
describe('Library Authoring routes', () => {
  beforeEach(async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);

    // The Meilisearch client-side API uses fetch, not Axios.
    fetchMock.mockReset();
    fetchMock.post(searchEndpoint, (_url, req) => {
      const requestData = JSON.parse(req.body?.toString() ?? '');
      const query = requestData?.queries[0]?.q ?? '';
      // We have to replace the query (search keywords) in the mock results with the actual query,
      // because otherwise Instantsearch will update the UI and change the query,
      // leading to unexpected results in the test cases.
      const newMockResult = { ...mockResult };
      newMockResult.results[0].query = query;
      // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
      // eslint-disable-next-line no-underscore-dangle, no-param-reassign
      newMockResult.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
      return newMockResult;
    });
  });

  test.each([
    // "All Content" tab
    {
      label: 'navigate from All Content tab to Components tab',
      origin: {
        path: '',
        params: {},
      },
      destination: {
        path: '/components',
        params: {
          contentType: ContentType.components,
        },
      },
    },
    {
      label: 'navigate from All Content tab to Collections tab',
      origin: {
        path: '',
        params: {},
      },
      destination: {
        params: {
          contentType: ContentType.collections,
        },
        path: '/collections',
      },
    },
    {
      label: 'from All Content tab, select a Component',
      origin: {
        path: '',
        params: {},
      },
      destination: {
        params: {
          componentId: 'cmptId',
        },
        path: '/component/cmptId',
      },
    },
    {
      label: 'from All Content tab > selected Component, select a different Component',
      origin: {
        path: '',
        params: {},
      },
      destination: {
        params: {
          componentId: 'cmptId2',
        },
        path: '/component/cmptId2',
      },
    },
    {
      label: 'from All Content tab, select a Collection',
      origin: {
        path: '',
        params: {},
      },
      destination: {
        params: {
          collectionId: 'clctnId',
        },
        path: '/clctnId',
      },
    },
    {
      label: 'navigate from All Content > selected Collection to the Collection page',
      origin: {
        params: {
          collectionId: 'clctnId',
        },
        path: '/clctnId',
      },
      destination: {
        params: {
          collectionId: 'clctnId',
        },
        /*
         * Note: the MemoryRouter used by testUtils breaks this, but should be:
         * path: '/collection/clctnId',
         */
        path: '/clctnId',
      },
    },
    {
      label: 'from All Content > Collection, select a different Collection',
      origin: {
        params: {
          collectionId: 'clctnId',
        },
        path: '/clctnId',
      },
      destination: {
        params: {
          collectionId: 'clctnId2',
        },
        path: '/clctnId2',
      },
    },
    // "Components" tab
    {
      label: 'navigate from Components tab to All Content tab',
      origin: {
        path: '/components',
        params: {},
      },
      destination: {
        path: '',
        params: {
          contentType: ContentType.home,
        },
      },
    },
    {
      label: 'navigate from Components tab to Collections tab',
      origin: {
        label: 'Components tab',
        path: '/components',
        params: {},
      },
      destination: {
        label: 'Collections tab',
        params: {
          contentType: ContentType.collections,
        },
        path: '/collections',
      },
    },
    {
      label: 'from Components tab, select a Component',
      origin: {
        path: '/components',
        params: {},
      },
      destination: {
        params: {
          componentId: 'cmptId',
        },
        path: '/components/cmptId',
      },
    },
    // "Collections" tab
    {
      label: 'navigate from Collections tab to All Content tab',
      origin: {
        path: '/collections',
        params: {},
      },
      destination: {
        path: '',
        params: {
          contentType: ContentType.home,
        },
      },
    },
    {
      label: 'navigate from Collections tab to Components tab',
      origin: {
        path: '/collections',
        params: {},
      },
      destination: {
        path: '/components',
        params: {
          contentType: ContentType.components,
        },
      },
    },
    {
      label: 'from Collections tab, select a Collection',
      origin: {
        path: '/collections',
        params: {},
      },
      destination: {
        params: {
          collectionId: 'clctnId',
        },
        path: '/collections/clctnId',
      },
    },
    {
      label: 'from Collections tab > selected Collection, navigate to the Collection page',
      origin: {
        params: {
          collectionId: 'clctnId',
        },
        path: '/collections/clctnId',
      },
      destination: {
        params: {
          collectionId: 'clctnId',
        },
        /*
         * Note: the MemoryRouter used by testUtils breaks this, but should be:
         * path: '/collection/clctnId',
         */
        path: '/collections/clctnId',
      },
    },
    {
      label: 'from Collections > selected Collection, select a different Collection',
      origin: {
        params: {
          collectionId: 'clctnId',
        },
        path: '/collections/clctnId',
      },
      destination: {
        params: {
          collectionId: 'clctnId2',
        },
        path: '/collections/clctnId2',
      },
    },
  ])(
    '$label',
    async ({ origin, destination }) => {
      const LibraryRouterTest = () => {
        /*
         * Note: we'd also like to test the insideComponent etc. flags returned here,
         * but the MemoryRouter used by testUtils makes this impossible.
         */
        const { navigateTo } = useLibraryRoutes();
        useEffect(() => navigateTo(destination.params), [destination.params]);
        return <LibraryLayout />;
      };

      render(<LibraryRouterTest />, {
        path: `/library/:libraryId${origin.path}/*`,
        params: {
          libraryId: mockContentLibrary.libraryId,
          collectionId: '',
          ...origin.params,
        },
      });

      expect(mockNavigate).toBeCalledWith({
        pathname: `/library/${mockContentLibrary.libraryId}${destination.path}`,
        search: '',
      });
    },
  );
});
