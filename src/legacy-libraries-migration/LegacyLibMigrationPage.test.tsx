import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';

import { LegacyLibMigrationPage } from './LegacyLibMigrationPage';

const path = '/libraries-v1/migrate/*';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderPage = () => (
  render(<LegacyLibMigrationPage />, { path })
);

describe('<LegacyLibMigrationPage />', () => {
  beforeEach(() => {
    initializeMocks();
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

    // TODO select library destination
  });
});
