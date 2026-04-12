import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { SidebarFilters } from './SidebarFilters';

const mockUseSearchContext = jest.fn();
const mockSetSelectedCollections = jest.fn();
let mockSelectedCollections: string[] = [];

jest.mock('@src/search-manager', () => ({
  ...jest.requireActual('@src/search-manager'),
  useSearchContext: () => mockUseSearchContext(),
  SearchKeywordsField: () => <input aria-label="Search" />,
  FilterByBlockType: () => <div>FilterByBlockType</div>,
  FilterByTags: () => <div>FilterByTags</div>,
  ClearFiltersButton: ({ onClear, canClear }: any) => (
    <button type="button" onClick={onClear} disabled={!canClear}>Clear filters</button>
  ),
}));

jest.mock('@src/library-authoring/common/context/MultiLibraryContext', () => ({
  useMultiLibraryContext: () => ({
    selectedCollections: mockSelectedCollections,
    setSelectedCollections: mockSetSelectedCollections,
  }),
}));

jest.mock('./LibraryDropdownFilter', () => ({
  LibraryDropdownFilter: () => <div>LibraryDropdownFilter</div>,
}));

jest.mock('./CollectionDropdownFilter', () => ({
  CollectionDropdownFilter: () => <div>CollectionDropdownFilter</div>,
}));

const renderComponent = (onlyOneType = false) => render(<SidebarFilters onlyOneType={onlyOneType} />);

describe('<SidebarFilters />', () => {
  beforeEach(() => {
    initializeMocks();
    mockSelectedCollections = [];
    mockSetSelectedCollections.mockReset();
    mockUseSearchContext.mockReturnValue({ totalHits: 0 });
  });

  it('shows singular "Content Block" when totalHits is 1', () => {
    mockUseSearchContext.mockReturnValue({ totalHits: 1 });
    renderComponent();
    expect(screen.getByText('Showing 1 Content Block')).toBeInTheDocument();
  });

  it('shows plural "Content Blocks" when totalHits is 0', () => {
    mockUseSearchContext.mockReturnValue({ totalHits: 0 });
    renderComponent();
    expect(screen.getByText('Showing 0 Content Blocks')).toBeInTheDocument();
  });

  it('shows plural "Content Blocks" when totalHits is more than 1', () => {
    mockUseSearchContext.mockReturnValue({ totalHits: 5 });
    renderComponent();
    expect(screen.getByText('Showing 5 Content Blocks')).toBeInTheDocument();
  });

  it('does not show extra filters panel before toggling', () => {
    renderComponent();
    expect(screen.queryByText('FilterByBlockType')).not.toBeInTheDocument();
    expect(screen.queryByText('FilterByTags')).not.toBeInTheDocument();
  });

  it('shows extra filters panel after clicking the toggle button', async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.click(screen.getByRole('button', { name: 'See more' }));
    expect(screen.getByText('FilterByTags')).toBeInTheDocument();
    expect(screen.getByText('CollectionDropdownFilter')).toBeInTheDocument();
  });

  it('shows FilterByBlockType when onlyOneType is false', async () => {
    const user = userEvent.setup();
    renderComponent(false);
    await user.click(screen.getByRole('button', { name: 'See more' }));
    expect(screen.getByText('FilterByBlockType')).toBeInTheDocument();
  });

  it('hides FilterByBlockType when onlyOneType is true', async () => {
    const user = userEvent.setup();
    renderComponent(true);
    await user.click(screen.getByRole('button', { name: 'See more' }));
    expect(screen.queryByText('FilterByBlockType')).not.toBeInTheDocument();
  });

  it('calls setSelectedCollections with [] when Clear filters is clicked', async () => {
    const user = userEvent.setup();
    mockSelectedCollections = ['col-1'];
    renderComponent();
    await user.click(screen.getByRole('button', { name: 'See more' }));
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(mockSetSelectedCollections).toHaveBeenCalledWith([]);
  });
});