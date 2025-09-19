import { setConfig, getConfig } from '@edx/frontend-platform';

import { mockContentTaxonomyTagsData } from '../../content-tags-drawer/data/api.mocks';
import {
  initializeMocks,
  render as baseRender,
  screen,
  waitFor,
} from '../../testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import { SidebarActions, SidebarBodyItemId, SidebarProvider } from '../common/context/SidebarContext';
import { mockContentLibrary, mockLibraryBlockMetadata } from '../data/api.mocks';
import ComponentManagement from './ComponentManagement';

jest.mock('../../content-tags-drawer', () => ({
  ...jest.requireActual('../../content-tags-drawer'),
  ContentTagsDrawer: ({ readOnly }: { readOnly: boolean }) => (
    <div>Mocked {readOnly ? 'read-only' : 'editable'} ContentTagsDrawer</div>
  ),
}));

const mockSearchParam = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useSearchParams: () => [
    { getAll: (paramName: string) => mockSearchParam(paramName) },
    () => {},
  ],
}));

mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();
mockContentTaxonomyTagsData.applyMock();

/*
 * Utility to get the inner text of an element safely.
 */
const getInnerText = (element: Element | null): string => {
  if (!element) {
    return '';
  }
  return (element.textContent ?? '')
    .split('\n')
    .filter((text) => text && !/^\s+$/.test(text))
    .map((text) => text.trim())
    .join(' ');
};

const matchInnerText = (nodeName: string, textToMatch: string) => (_: string, element: Element | null) => !!element
    && element.nodeName === nodeName
    && getInnerText(element) === textToMatch;

const render = (usageKey: string, libraryId?: string) => baseRender(<ComponentManagement />, {
  extraWrapper: ({ children }) => (
    <LibraryProvider libraryId={libraryId || mockContentLibrary.libraryId}>
      <SidebarProvider
        initialSidebarItemInfo={{
          id: usageKey,
          type: SidebarBodyItemId.ComponentInfo,
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
    mockSearchParam.mockResolvedValue([undefined, () => {}]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render draft status', async () => {
    render(mockLibraryBlockMetadata.usageKeyNeverPublished);
    expect(await screen.findByText('Draft')).toBeInTheDocument();
    expect(await screen.findByText('(Never Published)')).toBeInTheDocument();
    expect(
      screen.getByText(
        matchInnerText('SPAN', 'Draft saved on June 20, 2024 at 13:54.'),
      ),
    ).toBeInTheDocument();
  });

  it('should render published status', async () => {
    render(mockLibraryBlockMetadata.usageKeyPublished);
    expect(await screen.findByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(
      screen.getByText(matchInnerText('SPAN', 'Last published on June 22, 2024 at 00:00 by Luke.')),
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
        expect(
          screen.getByText(`Mocked ${expected} ContentTagsDrawer`),
        ).toBeInTheDocument();
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

  it('should open collection section when sidebarAction = JumpToManageCollections', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    mockSearchParam.mockReturnValue([SidebarActions.JumpToManageCollections]);
    render(mockLibraryBlockMetadata.usageKeyWithCollections);
    expect(await screen.findByText('Collections (1)')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Manage tags' }),
    ).not.toBeInTheDocument();
    const tagsSection = await screen.findByRole('button', { name: 'Tags (0)' });
    expect(tagsSection).toHaveAttribute('aria-expanded', 'false');
    const collectionsSection = await screen.findByRole('button', {
      name: 'Collections (1)',
    });
    expect(collectionsSection).toHaveAttribute('aria-expanded', 'true');
  });

  it('should open tags section when sidebarAction = JumpToManageTags', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    mockSearchParam.mockReturnValue([SidebarActions.JumpToManageTags]);
    render(mockLibraryBlockMetadata.usageKeyForTags);
    expect(await screen.findByText('Collections (0)')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Manage tags' }),
    ).not.toBeInTheDocument();
    const tagsSection = await screen.findByRole('button', { name: 'Tags (6)' });
    expect(tagsSection).toHaveAttribute('aria-expanded', 'true');
    const collectionsSection = await screen.findByRole('button', {
      name: 'Collections (0)',
    });
    expect(collectionsSection).toHaveAttribute('aria-expanded', 'false');
  });
});
