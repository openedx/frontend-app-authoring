import {
  initializeMocks,
  render as baseRender,
  screen,
} from '@src/testUtils';
import { mockContentSearchConfig } from '@src/search-manager/data/api.mock';

import { mockContentLibrary, mockGetComponentHierarchy, mockLibraryBlockMetadata } from '../data/api.mocks';
import { ComponentUsageTab } from './ComponentUsageTab';
import { LibraryProvider } from '../common/context/LibraryContext';
import { SidebarBodyItemId, SidebarProvider } from '../common/context/SidebarContext';

mockContentSearchConfig.applyMock();
mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();
mockGetComponentHierarchy.applyMock();

const {
  libraryId,
} = mockContentLibrary;

const render = (usageKey: string) => baseRender(<ComponentUsageTab />, {
  path: `/library/${libraryId}/components/${usageKey}`,
  params: { libraryId, selectedItemId: usageKey },
  extraWrapper: ({ children }) => (
    <LibraryProvider libraryId={libraryId}>
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

describe('<ComponentUsageTab />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should render the component usage loading', async () => {
    render(mockLibraryBlockMetadata.usageKeyThatNeverLoads);
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('should render the component usage', async () => {
    render(mockLibraryBlockMetadata.usageKeyPublished);

    expect(await screen.findByText('text block 0')).toBeInTheDocument();
    expect(await screen.getByText('4 Units')).toBeInTheDocument();
    expect(await screen.getByText('3 Subsections')).toBeInTheDocument();
    expect(await screen.getByText('2 Sections')).toBeInTheDocument();
  });
});
