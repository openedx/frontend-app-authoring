import type MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';

import {
  initializeMocks,
  render,
  screen,
  waitFor,
  within,
} from '@src/testUtils';
import studioHomeMock from '@src/studio-home/__mocks__/studioHomeMock';
import { mockGetContentLibraryV2List } from '@src/library-authoring/data/api.mocks';
import { mockGetStudioHomeLibraries } from '@src/studio-home/data/api.mocks';
import { getContentLibraryV2CreateApiUrl } from '@src/library-authoring/create-library/data/api';
import { getStudioHomeApiUrl } from '@src/studio-home/data/api';

import { LegacyLibMigrationPage } from './LegacyLibMigrationPage';
import { bulkMigrateLegacyLibrariesUrl } from './data/api';

const path = '/libraries-v1/migrate/*';
let axiosMock: MockAdapter;
let mockShowToast;

mockGetStudioHomeLibraries.applyMock();
mockGetContentLibraryV2List.applyMock();

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@src/generic/data/apiHooks', () => ({
  ...jest.requireActual('@src/generic/data/apiHooks'),
  useOrganizationListData: () => ({
    data: ['org1', 'org2', 'org3', 'org4', 'org5'],
    isLoading: false,
  }),
}));

const renderPage = () => (
  render(<LegacyLibMigrationPage />, { path })
);

describe('<LegacyLibMigrationPage />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
  });

  it('should render legacy library migration page', async () => {
    renderPage();
    // Should render the title
    expect(await screen.findByText('Migrate Legacy Libraries')).toBeInTheDocument();
    // Should render the Migration Steps Viewer
    expect(screen.getByText('Select Legacy Libraries')).toBeInTheDocument();
    expect(screen.getByText('Select Destination')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should cancel the migration', async () => {
    renderPage();
    expect(await screen.findByText('Migrate Legacy Libraries')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    cancelButton.click();

    // Should show exit confirmation modal
    expect(await screen.findByText('Exit Migration?')).toBeInTheDocument();

    // Close exit confirmation modal
    const continueButton = screen.getByRole('button', { name: /continue migrating/i });
    continueButton.click();
    expect(mockNavigate).not.toHaveBeenCalled();

    cancelButton.click();

    // Should navigate to legacy libraries tab on studio home
    expect(await screen.findByText('Exit Migration?')).toBeInTheDocument();
    const exitButton = screen.getByRole('button', { name: /exit/i });
    exitButton.click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/libraries-v1');
    });
  });

  it('should select legacy libraries', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByText('Migrate Legacy Libraries')).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /next/i });
    // The next button is disabled
    expect(nextButton).toBeDisabled();

    // The filter is Unmigrated by default
    const filterButton = await screen.findByRole('button', { name: /unmigrated/i });
    expect(filterButton).toBeInTheDocument();

    // Clear filter to show all
    await user.click(filterButton);
    const clearButton = await screen.findByRole('button', { name: /clear filter/i });
    await user.click(clearButton);

    expect(await screen.findByText('MBA')).toBeInTheDocument();
    expect(await screen.findByText('Legacy library 1')).toBeInTheDocument();
    expect(await screen.findByText('MBA 1')).toBeInTheDocument();

    const library1 = screen.getByRole('checkbox', { name: 'MBA' });
    const library2 = screen.getByRole('checkbox', { name: /legacy library 1 imported library/i });

    expect(library1).not.toBeChecked();
    expect(library2).not.toBeChecked();

    library1.click();

    expect(library1).toBeChecked();
    expect(library2).not.toBeChecked();
    expect(nextButton).not.toBeDisabled();

    library2.click();
    expect(library1).toBeChecked();
    expect(library2).toBeChecked();
    expect(nextButton).not.toBeDisabled();

    library2.click();
    expect(library1).toBeChecked();
    expect(library2).not.toBeChecked();
    expect(nextButton).not.toBeDisabled();
  });

  it('should select all legacy libraries', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByText('Migrate Legacy Libraries')).toBeInTheDocument();

    // The filter is Unmigrated by default
    const filterButton = await screen.findByRole('button', { name: /unmigrated/i });
    expect(filterButton).toBeInTheDocument();

    // Clear filter to show all
    await user.click(filterButton);
    const clearButton = await screen.findByRole('button', { name: /clear filter/i });
    await user.click(clearButton);

    const selectAll = screen.getByRole('checkbox', { name: /select all/i });
    await user.click(selectAll);

    const library1 = screen.getByRole('checkbox', { name: 'MBA' });
    const library2 = screen.getByRole('checkbox', { name: /legacy library 1 imported library/i });
    const library3 = screen.getByRole('checkbox', { name: 'MBA 1' });

    expect(library1).toBeChecked();
    expect(library2).toBeChecked();
    expect(library3).toBeChecked();

    await user.click(selectAll);
    expect(library1).not.toBeChecked();
    expect(library2).not.toBeChecked();
    expect(library3).not.toBeChecked();
  });

  it('should back to select legacy libraries', async () => {
    const user = userEvent.setup();
    renderPage();
    // The filter is Unmigrated by default
    const filterButton = await screen.findByRole('button', { name: /unmigrated/i });
    expect(filterButton).toBeInTheDocument();

    // Clear filter to show all
    await user.click(filterButton);
    const clearButton = await screen.findByRole('button', { name: /clear filter/i });
    await user.click(clearButton);

    expect(await screen.findByText('MBA')).toBeInTheDocument();
    expect(await screen.findByText('Legacy library 1')).toBeInTheDocument();
    expect(await screen.findByText('MBA 1')).toBeInTheDocument();

    const legacyLibrary = screen.getByRole('checkbox', { name: 'MBA' });
    legacyLibrary.click();

    const nextButton = screen.getByRole('button', { name: /next/i });
    nextButton.click();

    // Should show alert of SelectDestinationView
    expect(await screen.findByText(/you selected will be migrated to this new library/i)).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: /back/i });
    backButton.click();

    // The selected legacy library remains checked
    expect(legacyLibrary).toBeChecked();

    // The filter remains the same
    expect(await screen.findByText('MBA')).toBeInTheDocument();
    expect(await screen.findByText('Legacy library 1')).toBeInTheDocument();
    expect(await screen.findByText('MBA 1')).toBeInTheDocument();
  });

  it('should select a library destination', async () => {
    renderPage();
    expect(await screen.findByText('Migrate Legacy Libraries')).toBeInTheDocument();
    expect(await screen.findByText('MBA')).toBeInTheDocument();

    const legacyLibrary = screen.getByRole('checkbox', { name: 'MBA' });
    legacyLibrary.click();

    const nextButton = screen.getByRole('button', { name: /next/i });
    nextButton.click();

    // Should show alert of SelectDestinationView
    expect(await screen.findByText(/you selected will be migrated to this new library/i)).toBeInTheDocument();

    // The next button is disabled
    expect(nextButton).toBeDisabled();

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    const radioButton = screen.getByRole('radio', { name: /test library 1/i });
    radioButton.click();

    expect(radioButton).toBeChecked();
    expect(nextButton).not.toBeDisabled();
  });

  it('should back to select library destination', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByText('Migrate Legacy Libraries')).toBeInTheDocument();
    expect(await screen.findByText('MBA')).toBeInTheDocument();

    const legacyLibrary = screen.getByRole('checkbox', { name: 'MBA' });
    await user.click(legacyLibrary);

    const nextButton = await screen.findByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Should show alert of SelectDestinationView
    expect(await screen.findByText(/you selected will be migrated to this new library/i)).toBeInTheDocument();
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    const radioButton = screen.getByRole('radio', { name: /test library 1/i });
    await user.click(radioButton);

    await user.click(nextButton);
    const alert = await screen.findByRole('alert');
    expect(await within(alert).findByText(
      /All content from the 1 legacy library you selected will be migrated to/i,
    )).toBeInTheDocument();
    expect(await within(alert).findByText(
      /test library 1/i,
    )).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: /back/i });
    backButton.click();

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    // The selected v2 library remains checked
    expect(radioButton).toBeChecked();
  });

  it('should open the create new library modal', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
      id: 'lib:SampleTaxonomyOrg1:TL1',
    });

    renderPage();
    expect(await screen.findByText('Migrate Legacy Libraries')).toBeInTheDocument();
    expect(await screen.findByText('MBA')).toBeInTheDocument();

    const legacyLibrary = screen.getByRole('checkbox', { name: 'MBA' });
    legacyLibrary.click();

    const nextButton = screen.getByRole('button', { name: /next/i });
    nextButton.click();

    // Should show alert of SelectDestinationView
    expect(await screen.findByText(/you selected will be migrated to this new library/i)).toBeInTheDocument();

    const createButton = await screen.findByRole('button', { name: /create new library/i });
    expect(createButton).toBeInTheDocument();
    createButton.click();

    // Should open the create library modal
    expect(await screen.findByText('Create new library')).toBeInTheDocument();

    // Cancel and close the create library modal
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    cancelButton.click();
    await waitFor(() => {
      expect(screen.queryByText('Create new library')).not.toBeInTheDocument();
    });

    // Open the modal again and create a new library
    createButton.click();
    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    await user.click(titleInput);
    await user.type(titleInput, 'Test Library Name');

    const orgInput = await screen.findByRole('combobox', { name: /organization/i });
    await user.click(orgInput);
    await user.type(orgInput, 'org1');
    await user.tab();

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    await user.click(slugInput);
    await user.type(slugInput, 'test_library_slug');

    const confirmButton = await screen.findByRole('button', { name: 'Create' });
    confirmButton.click();
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });
    expect(axiosMock.history.post[0].data).toBe(
      '{"description":"","title":"Test Library Name","org":"org1","slug":"test_library_slug"}',
    );

    // The library should be checked
    expect(screen.getByRole('radio', { name: /test library 1/i })).toBeChecked();
  });

  it('should confirm migration', async () => {
    const user = userEvent.setup();
    axiosMock.onPost(bulkMigrateLegacyLibrariesUrl()).reply(200);
    renderPage();
    expect(await screen.findByText('Migrate Legacy Libraries')).toBeInTheDocument();
    expect(await screen.findByText('MBA')).toBeInTheDocument();

    // The filter is 'unmigrated' by default.
    // Clear the filter to select all libraries
    const filterButton = screen.getByRole('button', { name: /unmigrated/i });
    await user.click(filterButton);
    const clearButton = await screen.findByRole('button', { name: /clear filter/i });
    await user.click(clearButton);

    const legacyLibrary1 = screen.getByRole('checkbox', { name: 'MBA' });
    const legacyLibrary2 = screen.getByRole('checkbox', { name: /legacy library 1 imported library/i });
    const legacyLibrary3 = screen.getByRole('checkbox', { name: 'MBA 1' });

    legacyLibrary1.click();
    legacyLibrary2.click();
    legacyLibrary3.click();

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Should show alert of SelectDestinationView
    expect(await screen.findByText(/you selected will be migrated to this new library/i)).toBeInTheDocument();
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    const radioButton = screen.getByRole('radio', { name: /test library 1/i });
    await user.click(radioButton);

    await user.click(nextButton);

    // Should show alert of ConfirmationView
    const alert = await screen.findByRole('alert');
    expect(await within(alert).findByText(
      /All content from the 3 legacy libraries you selected will be migrated to/i,
    )).toBeInTheDocument();
    expect(await within(alert).findByText(
      /test library 1/i,
    )).toBeInTheDocument();
    expect(screen.getByText('MBA')).toBeInTheDocument();
    expect(screen.getByText('Legacy library 1')).toBeInTheDocument();
    expect(screen.getByText('MBA 1')).toBeInTheDocument();
    expect(screen.getByText(
      /Previously migrated library. Any problem bank links were already moved will be migrated to/i,
    )).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    confirmButton.click();

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });
    expect(axiosMock.history.post[0].data).toBe(
      '{"sources":["library-v1:MBA+123","library-v1:UNIX+LG1","library-v1:MBA+1234"],"target":"lib:SampleTaxonomyOrg1:TL1","create_collections":true,"repeat_handling_strategy":"fork"}',
    );
    expect(mockShowToast).toHaveBeenCalledWith('3 legacy libraries are being migrated.');
  });

  it('should show error when confirm migration', async () => {
    const user = userEvent.setup();
    axiosMock.onPost(bulkMigrateLegacyLibrariesUrl()).reply(400);
    renderPage();
    expect(await screen.findByText('Migrate Legacy Libraries')).toBeInTheDocument();
    expect(await screen.findByText('MBA')).toBeInTheDocument();

    // The filter is 'unmigrated' by default.
    // Clear the filter to select all libraries
    const filterButton = screen.getByRole('button', { name: /unmigrated/i });
    await user.click(filterButton);
    const clearButton = await screen.findByRole('button', { name: /clear filter/i });
    await user.click(clearButton);

    const legacyLibrary1 = screen.getByRole('checkbox', { name: 'MBA' });
    const legacyLibrary2 = screen.getByRole('checkbox', { name: /legacy library 1 imported library/i });
    const legacyLibrary3 = screen.getByRole('checkbox', { name: 'MBA 1' });

    legacyLibrary1.click();
    legacyLibrary2.click();
    legacyLibrary3.click();

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Should show alert of SelectDestinationView
    expect(await screen.findByText(/you selected will be migrated to this new library/i)).toBeInTheDocument();
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    const radioButton = screen.getByRole('radio', { name: /test library 1/i });
    await user.click(radioButton);

    await user.click(nextButton);

    // Should show alert of ConfirmationView
    const alert = await screen.findByRole('alert');
    expect(await within(alert).findByText(
      /All content from the 3 legacy libraries you selected will be migrated to /i,
      { exact: false },
    )).toBeInTheDocument();
    expect(await within(alert).findByText(
      /test library 1/i,
      { exact: false },
    )).toBeInTheDocument();
    expect(screen.getByText('MBA')).toBeInTheDocument();
    expect(screen.getByText('Legacy library 1')).toBeInTheDocument();
    expect(screen.getByText('MBA 1')).toBeInTheDocument();
    expect(screen.getByText(
      /Previously migrated library. Any problem bank links were already moved will be migrated to/i,
    )).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    confirmButton.click();

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });
    expect(axiosMock.history.post[0].data).toBe(
      '{"sources":["library-v1:MBA+123","library-v1:UNIX+LG1","library-v1:MBA+1234"],"target":"lib:SampleTaxonomyOrg1:TL1","create_collections":true,"repeat_handling_strategy":"fork"}',
    );
    expect(mockShowToast).toHaveBeenCalledWith('Legacy libraries migration have failed');
  });

  it('should show help sidebar', async () => {
    renderPage();
    expect(await screen.findByText('Help & Support')).toBeInTheDocument();
    expect(screen.getByText('What’s different in the new Content Libraries experience?')).toBeInTheDocument();
    expect(screen.getByText('What happens when I migrate my Legacy Libraries?')).toBeInTheDocument();
    expect(screen.getByText('How do I migrate my Legacy Libraries?')).toBeInTheDocument();
  });
});
