import { useEffect } from 'react';
import fetchMock from 'fetch-mock-jest';
import { initializeMocks, render } from '@src/testUtils';
import studioHomeMock from '@src/studio-home/__mocks__/studioHomeMock';
import {
  mockContentLibrary,
} from './data/api.mocks';
import { LibraryLayout } from '.';
import { ContentType, useLibraryRoutes } from './routes';
import mockResult from './__mocks__/library-search.json';
import { getStudioHomeApiUrl } from '../studio-home/data/api';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('./common/context/LibraryContext', () => ({
  ...jest.requireActual('./common/context/LibraryContext'),
  useLibraryContext: () => ({
    setComponentId: jest.fn(),
    setUnitId: jest.fn(),
    setCollectionId: jest.fn(),
  }),
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
          selectedItemId: 'lb:org:lib:cmpt',
        },
        path: '/lb:org:lib:cmpt',
      },
    },
    {
      label: 'from All Content tab > selected Component, select a different Component',
      origin: {
        path: '/lb:org:lib:cmpt1',
        params: {
          selectedItemId: 'lb:org:lib:cmpt1',
        },
      },
      destination: {
        params: {
          selectedItemId: 'lb:org:lib:cmpt2',
        },
        path: '/lb:org:lib:cmpt2',
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
          selectedItemId: 'clctnId',
        },
        path: '/clctnId',
      },
    },
    {
      label: 'from All Content tab, select a Unit',
      origin: {
        path: '',
        params: {},
      },
      destination: {
        params: {
          selectedItemId: 'lct:org:lib:unit:unitId',
        },
        path: '/lct:org:lib:unit:unitId',
      },
    },
    {
      label: 'from All Content tab > selected unit, navigate to unit page',
      origin: {
        path: '/lct:org:lib:unit:unitId',
        params: {
          selectedItemId: 'lct:org:lib:unit:unitId',
        },
      },
      destination: {
        params: {
          containerId: 'lct:org:lib:unit:unitId',
        },
        path: '/unit/lct:org:lib:unit:unitId',
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
        path: '/collection/clctnId',
      },
    },
    {
      label: 'from All Content > Collection, select a different Collection',
      origin: {
        params: {
          selectedItemId: 'clctnId',
        },
        path: '/clctnId',
      },
      destination: {
        params: {
          selectedItemId: 'clctnId2',
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
      label: 'from All Content tab > select a Component, navigate to Component page',
      origin: {
        path: '/lb:org:lib:cmpt',
        params: {
          selectedItemId: 'lb:org:lib:cmpt',
        },
      },
      destination: {
        path: '/components/lb:org:lib:cmpt', // Should keep the selected component
        params: {
          contentType: ContentType.components,
          selectedItemId: 'lb:org:lib:cmpt',
        },
      },
    },
    {
      label: 'navigate from Components tab to Collections tab',
      origin: {
        path: '/components',
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
      label: 'from Components tab, select a Component',
      origin: {
        path: '/components',
        params: {},
      },
      destination: {
        params: {
          selectedItemId: 'lb:org:lib:cmpt',
        },
        path: '/components/lb:org:lib:cmpt',
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
      label: 'navigate From All Content tab with component selected, to Collection tab',
      origin: {
        params: {
          selectedItemId: 'lb:org:lib:component',
        },
        path: '/lb:org:lib:component',
      },
      destination: {
        params: {
          contentType: ContentType.collections,
          selectedItemId: 'lb:org:lib:component',
        },
        path: '/collections', // Should ignore the selected component
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
          selectedItemId: 'clctnId',
        },
        path: '/collections/clctnId',
      },
    },
    {
      label: 'from Collections tab > selected Collection, navigate to the Collection page',
      origin: {
        params: {
          selectedItemId: 'clctnId',
        },
        path: '/clctnId',
      },
      destination: {
        params: {
          collectionId: 'clctnId',
        },
        path: '/collection/clctnId',
      },
    },
    {
      label: 'from Collections > selected Collection, select a different Collection',
      origin: {
        params: {
          collectionId: 'clctnId',
        },
        path: '/collection/clctnId',
      },
      destination: {
        params: {
          collectionId: 'clctnId2',
        },
        path: '/collection/clctnId2',
      },
    },
    // "Units" tab
    {
      label: 'navigate from All Content tab to Units',
      origin: {
        path: '',
        params: {},
      },
      destination: {
        path: '/units',
        params: {
          contentType: ContentType.units,
        },
      },
    },
    {
      label: 'from Unit tab, select a Unit',
      origin: {
        path: '/units',
        params: {},
      },
      destination: {
        params: {
          selectedItemId: 'unitId',
        },
        path: '/units/unitId',
      },
    },
    {
      label: 'navigate from Units tab to All Content tab',
      origin: {
        path: '/units',
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
      label: 'navigate From All Content tab with component selected, to Units tab',
      origin: {
        path: '/lb:org:lib:component',
        params: {
          selectedItemId: 'lb:org:lib:component',
        },
      },
      destination: {
        params: {
          contentType: ContentType.units,
          selectedItemId: 'lb:org:lib:component',
        },
        path: '/units', // Should ignore the selected component
      },
    },
    // "Sections" tab
    {
      label: 'navigate from All Content tab to Sections tab',
      origin: {
        path: '',
        params: {},
      },
      destination: {
        path: '/sections',
        params: {
          contentType: ContentType.sections,
        },
      },
    },
    {
      label: 'from Sections tab, select a Section',
      origin: {
        path: '/sections',
        params: {},
      },
      destination: {
        params: {
          selectedItemId: 'sectionId',
        },
        path: '/sections/sectionId',
      },
    },
    {
      label: 'navigate from Sections tab to All Content tab',
      origin: {
        path: '/sections',
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
      label: 'navigate From All Content tab with component selected, to Sections tab',
      origin: {
        path: '/lb:org:lib:component',
        params: {
          selectedItemId: 'lb:org:lib:component',
        },
      },
      destination: {
        params: {
          contentType: ContentType.sections,
          selectedItemId: 'lb:org:lib:component',
        },
        path: '/sections', // Should ignore the selected component
      },
    },
    // "Subsections" tab
    {
      label: 'navigate from All Content tab to Subsections tab',
      origin: {
        path: '',
        params: {},
      },
      destination: {
        path: '/subsections',
        params: {
          contentType: ContentType.subsections,
        },
      },
    },
    {
      label: 'from Sections tab, select a Subsection',
      origin: {
        path: '/subsections',
        params: {},
      },
      destination: {
        params: {
          selectedItemId: 'subsectionId',
        },
        path: '/subsections/subsectionId',
      },
    },
    {
      label: 'navigate from Subsections tab to All Content tab',
      origin: {
        path: '/subsections',
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
      label: 'navigate From All Content tab with component selected, to Subsections tab',
      origin: {
        path: '/lb:org:lib:component',
        params: {
          selectedItemId: 'lb:org:lib:component',
        },
      },
      destination: {
        path: '/subsections', // Should ignore the selected component
        params: {
          contentType: ContentType.subsections,
          selectedItemId: 'lb:org:lib:component',
        },
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
          containerId: '',
          collectionId: '',
          selectedItemId: '',
          ...origin.params,
        },
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: `/library/${mockContentLibrary.libraryId}${destination.path}`,
        search: '',
      });
    },
  );
});
