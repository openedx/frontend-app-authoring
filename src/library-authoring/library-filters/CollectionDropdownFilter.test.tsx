import { mockContentLibrary } from '@src/library-authoring/data/api.mocks';
import { useGetContentHits } from '@src/search-manager';
import {
  initializeMocks, render, screen,
} from '@src/testUtils';
import { userEvent } from '@testing-library/user-event';
import { CollectionDropdownFilter } from './CollectionDropdownFilter';

mockContentLibrary.applyMock();

let mockLibsValue: string[] = [];
const mockCollectionsSetValue = jest.fn();
let mockCollectionsValue: string[] = [];
jest.mock('@src/library-authoring/common/context/MultiLibraryContext', () => ({
  useMultiLibraryContext: () => ({
    selectedLibraries: mockLibsValue,
    setSelectedLibraries: () => {},
    selectedCollections: mockCollectionsValue,
    setSelectedCollections: mockCollectionsSetValue,
  }),
}));
// Mock the useGetBlockTypes hook
jest.mock('@src/search-manager', () => ({
  useGetBlockTypes: jest.fn().mockReturnValue({ isPending: true, data: null }),
  useGetContentHits: jest.fn().mockReturnValue({ isPending: true, data: null }),
}));

const renderComponent = () => render(<CollectionDropdownFilter />);

describe('CollectionDropdownFilter', () => {
  beforeEach(() => {
    initializeMocks();
    mockLibsValue = ['some'];
  });

  it('should be disabled if no library is selected', async () => {
    mockLibsValue = [];
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button');
    expect(dropdownTrigger).toBeDisabled();
  });

  it('should be disabled if more than one library is selected', async () => {
    mockLibsValue = ['some', 'another'];
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button');
    expect(dropdownTrigger).toBeDisabled();
  });

  it('should render the loading status', async () => {
    const user = userEvent.setup();
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button');
    expect(dropdownTrigger).toBeInTheDocument();
    await user.click(dropdownTrigger);

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('should render the empty list', async () => {
    const user = userEvent.setup();
    (useGetContentHits as jest.Mock).mockReturnValue({
      isPending: false,
      data: {
        hits: [],
        estimatedTotalHits: 0,
      },
    });
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button');
    expect(dropdownTrigger).toBeInTheDocument();
    await user.click(dropdownTrigger);

    expect(await screen.findByText('No collections found!')).toBeInTheDocument();
  });

  it('should render CollectionDropdownFilter with dropdown options', async () => {
    const user = userEvent.setup();
    (useGetContentHits as jest.Mock).mockReturnValue({
      isPending: false,
      data: {
        hits: [{
          display_name: 'Test collection',
          block_id: 'test-collection',
        },
        {
          display_name: 'Sample Taxonomy Course',
          block_id: 'sample-taxonomy-course',
        }],
        estimatedTotalHits: 0,
      },
    });
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button');
    expect(dropdownTrigger).toBeInTheDocument();
    await user.click(dropdownTrigger);

    const item = await screen.findByRole('checkbox', { name: 'Test collection' });
    expect(item).toBeInTheDocument();
    await user.click(item);
    const passedFunction = mockCollectionsSetValue.mock.calls[0][0];
    expect(passedFunction([])).toEqual(['test-collection']);
  });

  it('toggle selected value', async () => {
    const user = userEvent.setup();
    (useGetContentHits as jest.Mock).mockReturnValue({
      isPending: false,
      data: {
        hits: [{
          display_name: 'Test collection',
          block_id: 'test-collection',
        },
        {
          display_name: 'Sample Taxonomy Course',
          block_id: 'sample-taxonomy-course',
        }],
        estimatedTotalHits: 0,
      },
    });
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button');
    await user.click(dropdownTrigger);

    const item = await screen.findByRole('checkbox', { name: 'Test collection' });
    await user.click(item);
    const passedFunction = mockCollectionsSetValue.mock.calls[0][0];
    // Should remove it from list if already selected, i.e., it means user unselected it.
    expect(passedFunction([
      'test-collection',
      'sample-taxonomy-course',
    ])).toEqual(['sample-taxonomy-course']);
  });

  it('should update label to collection if one is selected', async () => {
    mockCollectionsValue = ['sample-taxonomy-course'];
    (useGetContentHits as jest.Mock).mockReturnValue({
      isPending: false,
      data: {
        hits: [{
          display_name: 'Test collection',
          block_id: 'test-collection',
        },
        {
          display_name: 'Sample Taxonomy Course',
          block_id: 'sample-taxonomy-course',
        }],
        estimatedTotalHits: 0,
      },
    });
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button', { name: 'Sample Taxonomy Course' });
    expect(dropdownTrigger).toBeInTheDocument();
  });

  it('should update label to n collections if more than one is selected', async () => {
    mockCollectionsValue = ['test-collection', 'sample-taxonomy-course'];
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button', { name: '2 Collections' });
    expect(dropdownTrigger).toBeInTheDocument();
  });

  it('should filter list by search', async () => {
    const user = userEvent.setup();
    (useGetContentHits as jest.Mock).mockReturnValue({
      isPending: false,
      data: {
        hits: [{
          display_name: 'Test collection',
          block_id: 'test-collection',
        },
        {
          display_name: 'Sample Taxonomy Course',
          block_id: 'sample-taxonomy-course',
        }],
        estimatedTotalHits: 0,
      },
    });
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button');
    expect(dropdownTrigger).toBeInTheDocument();
    await user.click(dropdownTrigger);

    expect(await screen.findByText('Sample Taxonomy Course')).toBeInTheDocument();
    const searchInput = await screen.findByPlaceholderText('Search Collection Name');
    await user.type(searchInput, 'Test');
    expect(screen.queryByText('Sample Taxonomy Course')).not.toBeInTheDocument();

    const clearBtn = await screen.findByRole('button', { name: 'clear search' });
    await user.click(clearBtn);
    expect(await screen.findByText('Sample Taxonomy Course')).toBeInTheDocument();
  });
});
