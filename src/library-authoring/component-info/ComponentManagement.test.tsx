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
import { mockContentLibrary, mockLibraryBlockMetadata } from '../data/api.mocks';
import ComponentManagement from './ComponentManagement';

jest.mock('../../content-tags-drawer', () => ({
  ContentTagsDrawer: ({ readOnly }: { readOnly: boolean }) => (
    <div>Mocked {readOnly ? 'read-only' : 'editable'} ContentTagsDrawer</div>
  ),
}));

mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();
mockContentTaxonomyTagsData.applyMock();

/*
 * This function is used to get the inner text of an element.
 * https://stackoverflow.com/questions/47902335/innertext-is-undefined-in-jest-test
 */
const getInnerText = (element: Element) => element?.textContent
  ?.split('\n')
  .filter((text) => text && !text.match(/^\s+$/))
  .map((text) => text.trim())
  .join(' ');

const matchInnerText = (nodeName: string, textToMatch: string) => (_: string, element: Element) => (
  element.nodeName === nodeName && getInnerText(element) === textToMatch
);

const render = (usageKey: string, libraryId?: string) => baseRender(<ComponentManagement />, {
  extraWrapper: ({ children }) => (
    <LibraryProvider libraryId={libraryId || mockContentLibrary.libraryId}>
      <SidebarProvider
        initialSidebarComponentInfo={{
          id: usageKey,
          type: SidebarBodyComponentId.ComponentInfo,
        }}
      >
        {children}
      </SidebarProvider>
    </LibraryProvider>
  ),
});

describe('<ComponentManagement />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should render draft status', async () => {
    render(mockLibraryBlockMetadata.usageKeyNeverPublished);
    expect(await screen.findByText('Draft')).toBeInTheDocument();
    expect(await screen.findByText('(Never Published)')).toBeInTheDocument();
    expect(screen.getByText(matchInnerText('SPAN', 'Draft saved on June 20, 2024 at 13:54.'))).toBeInTheDocument();
  });

  it('should render published status', async () => {
    render(mockLibraryBlockMetadata.usageKeyPublished);
    expect(await screen.findByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(
      screen.getByText(matchInnerText('SPAN', 'Last published on June 21, 2024 at 24:00 by Luke.')),
    ).toBeInTheDocument();
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
      render(mockLibraryBlockMetadata.usageKeyForTags, libraryId);
      await waitFor(() => {
        expect(screen.getByText(`Mocked ${expected} ContentTagsDrawer`)).toBeInTheDocument();
      });
    },
  );

  it('should not render draft status', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'false',
    });
    render(mockLibraryBlockMetadata.usageKeyNeverPublished);
    expect(await screen.findByText('Draft')).toBeInTheDocument();
    expect(screen.queryByText('Tags')).not.toBeInTheDocument();
  });

  it('should render tag count in tagging info', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    render(mockLibraryBlockMetadata.usageKeyForTags);
    expect(await screen.findByText('Tags (6)')).toBeInTheDocument();
  });

  it('should render collection count in collection info section', async () => {
    render(mockLibraryBlockMetadata.usageKeyWithCollections);
    expect(await screen.findByText('Collections (1)')).toBeInTheDocument();
  });
});
