import { mockContentLibrary, mockGetContentLibraryV2List } from '@src/library-authoring/data/api.mocks';
import {
  initializeMocks, render, screen, waitFor,
} from '@src/testUtils';
import { userEvent } from '@testing-library/user-event';
import { LibraryDropdownFilter } from './LibraryDropdownFilter';

mockContentLibrary.applyMock();

const mockSetValue = jest.fn();
let mockValue: string[] = [];
jest.mock('@src/library-authoring/common/context/MultiLibraryContext', () => ({
  useMultiLibraryContext: () => ({
    selectedLibraries: mockValue,
    setSelectedLibraries: mockSetValue,
  }),
}));

const renderComponent = () => render(<LibraryDropdownFilter />);

describe('LibraryDropdownFilter', () => {
  beforeEach(() => {
    initializeMocks();
    mockValue = [];
  });

  it('should render the loading status', async () => {
    const user = userEvent.setup();
    mockGetContentLibraryV2List.applyMockLoading();
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button', { name: 'All libraries' });
    expect(dropdownTrigger).toBeInTheDocument();
    await user.click(dropdownTrigger);

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('should render the empty list', async () => {
    const user = userEvent.setup();
    mockGetContentLibraryV2List.applyMockNoPaginationEmpty();
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button', { name: 'All libraries' });
    expect(dropdownTrigger).toBeInTheDocument();
    await user.click(dropdownTrigger);

    expect(await screen.findByText('No libraries found!')).toBeInTheDocument();
  });

  it('should render LibraryDropdownFilter with dropdown options', async () => {
    const user = userEvent.setup();
    mockGetContentLibraryV2List.applyMockNoPagination();
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button', { name: 'All libraries' });
    expect(dropdownTrigger).toBeInTheDocument();
    await user.click(dropdownTrigger);

    const item = await screen.findByRole('checkbox', { name: 'Test Library 1' });
    expect(item).toBeInTheDocument();
    await user.click(item);
    const passedFunction = mockSetValue.mock.calls[0][0];
    expect(passedFunction([])).toEqual(['lib:SampleTaxonomyOrg1:TL1']);
  });

  it('toggle selected value', async () => {
    const user = userEvent.setup();
    mockGetContentLibraryV2List.applyMockNoPagination();
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button', { name: 'All libraries' });
    await user.click(dropdownTrigger);

    const item = await screen.findByRole('checkbox', { name: 'Test Library 1' });
    await user.click(item);
    const passedFunction = mockSetValue.mock.calls[0][0];
    // Should remove it from list if already selected, i.e., it means user unselected it.
    expect(passedFunction([
      'lib:SampleTaxonomyOrg1:TL1',
      'lib:SampleTaxonomyOrg1:TL2',
    ])).toEqual(['lib:SampleTaxonomyOrg1:TL2']);
  });

  it('should update label to library if one is selected', async () => {
    mockGetContentLibraryV2List.applyMockNoPagination();
    mockValue = ['lib:SampleTaxonomyOrg1:TL1'];
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button', { name: 'Test Library 1' });
    expect(dropdownTrigger).toBeInTheDocument();
  });

  it('should update label to n libraries if more than one but not all are selected', async () => {
    // The mock has 2 libraries (TL1, AL1). Add a third so selecting 2 is not "all selected".
    const mockApi = mockGetContentLibraryV2List.applyMockNoPagination();
    mockApi.mockResolvedValue([
      { id: 'lib:SampleTaxonomyOrg1:TL1', title: 'Test Library 1' },
      { id: 'lib:SampleTaxonomyOrg1:AL1', title: 'Test Library 2' },
      { id: 'lib:SampleTaxonomyOrg1:TL3', title: 'Test Library 3' },
    ] as any);
    mockValue = ['lib:SampleTaxonomyOrg1:TL1', 'lib:SampleTaxonomyOrg1:AL1'];
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button', { name: '2 Libraries' });
    expect(dropdownTrigger).toBeInTheDocument();
  });

  it('should reset label to "All libraries" when all libraries are selected', async () => {
    mockGetContentLibraryV2List.applyMockNoPagination();
    // Both libraries in the mock are selected — selectedLibraries.length === data.length
    mockValue = ['lib:SampleTaxonomyOrg1:TL1', 'lib:SampleTaxonomyOrg1:AL1'];
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button', { name: 'All libraries' });
    expect(dropdownTrigger).toBeInTheDocument();
  });

  it('should filter list by search', async () => {
    const user = userEvent.setup();
    const mockApi = mockGetContentLibraryV2List.applyMockNoPagination();
    renderComponent();

    const dropdownTrigger = await screen.findByRole('button', { name: 'All libraries' });
    expect(dropdownTrigger).toBeInTheDocument();
    await user.click(dropdownTrigger);

    const searchInput = await screen.findByPlaceholderText('Search Library Name');
    await user.type(searchInput, 'Test Library');

    await waitFor(() => expect(mockApi).toHaveBeenLastCalledWith({
      pagination: false,
      search: 'Test Library',
    }), { timeout: 600 });

    const clearBtn = await screen.findByRole('button', { name: 'clear search' });
    await user.click(clearBtn);

    await waitFor(() => expect(mockApi).toHaveBeenLastCalledWith({
      pagination: false,
      search: '',
    }), { timeout: 600 });
  });
});
