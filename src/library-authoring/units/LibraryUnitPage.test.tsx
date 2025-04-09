import userEvent from '@testing-library/user-event';
import {
  initializeMocks,
  render,
  screen,
  waitFor,
  within,
} from '../../testUtils';
import {
  mockContentLibrary,
  mockXBlockFields,
  mockGetContainerMetadata,
  mockGetContainerChildren,
  mockLibraryBlockMetadata,
} from '../data/api.mocks';
import { mockContentSearchConfig, mockGetBlockTypes } from '../../search-manager/data/api.mock';
import { mockClipboardEmpty } from '../../generic/data/api.mock';
import LibraryLayout from '../LibraryLayout';

const path = '/library/:libraryId/*';
const libraryTitle = mockContentLibrary.libraryData.title;

mockClipboardEmpty.applyMock();
mockGetContainerMetadata.applyMock();
mockGetContainerChildren.applyMock();
mockContentSearchConfig.applyMock();
mockGetBlockTypes.applyMock();
mockContentLibrary.applyMock();
mockXBlockFields.applyMock();
mockLibraryBlockMetadata.applyMock();

describe('<LibraryUnitPage />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  const renderLibraryUnitPage = (unitId?: string, libraryId?: string) => {
    const libId = libraryId || mockContentLibrary.libraryId;
    const uId = unitId || mockGetContainerMetadata.containerId;
    render(<LibraryLayout />, {
      path,
      routerProps: {
        initialEntries: [`/library/${libId}/unit/${uId}`],
      },
    });
  };

  it('shows the spinner before the query is complete', async () => {
    // This mock will never return data about the collection (it loads forever):
    renderLibraryUnitPage(mockGetContainerMetadata.containerIdLoading);
    const spinner = screen.getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows an error component if no unit returned', async () => {
    // This mock will simulate incorrect unit id
    renderLibraryUnitPage(mockGetContainerMetadata.containerIdError);
    const errorMessage = 'Not found';
    expect(await screen.findByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('shows unit data', async () => {
    renderLibraryUnitPage();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    // Unit title
    expect((await screen.findAllByText(mockGetContainerMetadata.containerData.displayName))[0]).toBeInTheDocument();
    // unit info button
    expect(await screen.findByRole('button', { name: 'Unit Info' })).toBeInTheDocument();
    expect((await screen.findAllByRole('button', { name: 'Drag to reorder' })).length).toEqual(3);
    // check all children components are rendered.
    expect(await screen.findByText('text block 0')).toBeInTheDocument();
    expect(await screen.findByText('text block 1')).toBeInTheDocument();
    expect(await screen.findByText('text block 2')).toBeInTheDocument();
    // 3 preview iframes
    expect((await screen.findAllByTestId('block-preview')).length).toEqual(3);
  });

  it('should open and close the unit sidebar', async () => {
    renderLibraryUnitPage();

    // sidebar should be visible by default
    const sidebar = await screen.findByTestId('library-sidebar');

    const { findByText } = within(sidebar);

    // The mock data for the sidebar has a title of "Test Unit"
    expect(await findByText('Test Unit')).toBeInTheDocument();

    // should close if open
    userEvent.click(await screen.findByText('Unit Info'));
    await waitFor(() => expect(screen.queryByTestId('library-sidebar')).not.toBeInTheDocument());

    // Open again
    userEvent.click(await screen.findByText('Unit Info'));
    expect(await screen.findByTestId('library-sidebar')).toBeInTheDocument();
  });

  it('should open and component sidebar on component selection', async () => {
    renderLibraryUnitPage();

    const component = await screen.findByText('text block 0');
    userEvent.click(component);
    const sidebar = await screen.findByTestId('library-sidebar');

    const { findByRole, findByText } = within(sidebar);

    // The mock data for the sidebar has a title of "text block 0"
    expect(await findByText('text block 0')).toBeInTheDocument();

    const closeButton = await findByRole('button', { name: /close/i });
    userEvent.click(closeButton);
    await waitFor(() => expect(screen.queryByTestId('library-sidebar')).not.toBeInTheDocument());
  });
});
