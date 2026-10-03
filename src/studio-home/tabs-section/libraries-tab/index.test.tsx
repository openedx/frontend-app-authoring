import { initializeMocks, render, screen, waitFor } from '@src/testUtils';
import { getStudioHomeApiUrl } from '@src/studio-home/data/api';
import { LibrariesList } from '.';

describe('legacy library list native response handling', () => {
  it.each([{}, { libraries: null }, { libraries: [] }])('renders a safe empty count for %j', async (response) => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(`${getStudioHomeApiUrl()}/libraries`).reply(200, response);
    render(<LibrariesList hideMigationAlert migrationFilter={[]} setMigrationFilter={jest.fn()} />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.getByText(/0 of 0/)).toBeInTheDocument();
    expect(axiosMock.history.get).toHaveLength(1);
  });

  it('retains the error state for a failed request', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(`${getStudioHomeApiUrl()}/libraries`).reply(500);
    render(<LibrariesList hideMigationAlert migrationFilter={[]} setMigrationFilter={jest.fn()} />);
    expect(await screen.findByText(/unable|error|failed/i)).toBeInTheDocument();
    expect(screen.queryByText(/0 of 0/)).not.toBeInTheDocument();
  });
});
