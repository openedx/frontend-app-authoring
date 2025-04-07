import { setConfig, getConfig } from '@edx/frontend-platform';

import { mockContentTaxonomyTagsData } from '../../content-tags-drawer/data/api.mocks';
import {
  initializeMocks,
  render as baseRender,
  screen,
  waitFor,
} from '../../testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import { SidebarBodyComponentId, SidebarProvider } from '../common/context/SidebarContext';
import { mockContentLibrary, mockGetContainerMetadata } from '../data/api.mocks';
import ContainerOrganize from './ContainerOrganize';

jest.mock('../../content-tags-drawer', () => ({
  ...jest.requireActual('../../content-tags-drawer'),
  ContentTagsDrawer: ({ readOnly }: { readOnly: boolean }) => (
    <div>Mocked {readOnly ? 'read-only' : 'editable'} ContentTagsDrawer</div>
  ),
}));

mockGetContainerMetadata.applyMock();
mockContentLibrary.applyMock();
mockContentTaxonomyTagsData.applyMock();

const { containerIdForTags } = mockGetContainerMetadata;

const render = (libraryId?: string) => baseRender(<ContainerOrganize />, {
  extraWrapper: ({ children }) => (
    <LibraryProvider libraryId={libraryId || mockContentLibrary.libraryId}>
      <SidebarProvider
        initialSidebarComponentInfo={{
          id: containerIdForTags,
          type: SidebarBodyComponentId.ComponentInfo,
        }}
      >
        {children}
      </SidebarProvider>
    </LibraryProvider>
  ),
});

describe('<ContainerOrganize />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test.each([
    {
      libraryId: mockContentLibrary.libraryId,
      expected: 'editable',
    },
    {
      libraryId: mockContentLibrary.libraryIdReadOnly,
      expected: 'read-only',
    },
  ])(
    'should render the tagging info as $expected',
    async ({ libraryId, expected }) => {
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
      });
      render(libraryId);
      await waitFor(() => {
        expect(screen.getByText(`Mocked ${expected} ContentTagsDrawer`)).toBeInTheDocument();
      });
    },
  );

  it('should render tag count in tagging info', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    render();
    expect(await screen.findByText('Tags (6)')).toBeInTheDocument();
  });
});
