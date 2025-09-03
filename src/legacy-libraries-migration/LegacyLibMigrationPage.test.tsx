import type MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';

import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import studioHomeMock from '@src/studio-home/__mocks__/studioHomeMock';
import { mockGetContentLibraryV2List } from '@src/library-authoring/data/api.mocks';
import { getContentLibraryV2CreateApiUrl } from '@src/library-authoring/create-library/data/api';
import { getStudioHomeApiUrl } from '@src/studio-home/data/api';

import { LegacyLibMigrationPage } from './LegacyLibMigrationPage';

const path = '/libraries-v1/migrate/*';
let axiosMock: MockAdapter;

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
    axiosMock = initializeMocks().axiosMock;
  });

  it('should render legacy library migration page', async () => {
    renderPage();
    // Should render the title
    expect(await screen.findByText('Migrate Legacy Libraries')).toBeInTheDocument();
    // Should render the Migration Steps Viewer
    expect(screen.getByText(/select legacy libraries/i)).toBeInTheDocument();
    expect(screen.getByText(/select destination/i)).toBeInTheDocument();
    expect(screen.getByText(/confirm/i)).toBeInTheDocument();
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

  it('should select a library destination', async () => {
    renderPage();
    expect(await screen.findByText('Migrate Legacy Libraries')).toBeInTheDocument();

    // TODO Missing select legacy libraries
    const nextButton = screen.getByRole('button', { name: /next/i });
    nextButton.click();

    // Should show alert of SelectDestinationView
    expect(await screen.findByText(/any legacy libraries that are used/i)).toBeInTheDocument();

    // The next button is disabled
    expect(nextButton).toBeDisabled();

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    const radioButton = screen.getByRole('radio', { name: /test library 1/i });
    radioButton.click();

    expect(radioButton).toBeChecked();
    expect(nextButton).not.toBeDisabled();
  });

  it('should open the create new library modal', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
      id: 'library-id',
    });

    renderPage();
    expect(await screen.findByText('Migrate Legacy Libraries')).toBeInTheDocument();

    // TODO Missing select legacy libraries
    const nextButton = screen.getByRole('button', { name: /next/i });
    nextButton.click();

    // Should show alert of SelectDestinationView
    expect(await screen.findByText(/any legacy libraries that are used/i)).toBeInTheDocument();

    const createButton = screen.getByRole('button', { name: /create new library/i });
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
  });
});
