import { initializeMocks, render, screen, waitFor } from '@src/testUtils';
import { getContentLibraryV2ListApiUrl } from '@src/library-authoring/data/api';
import LibrariesV2List from '.';

describe('v2 library list native response handling', () => {
  it.each([{}, { results: null, count: 0 }, { results: [], count: 0 }])(
    'renders safely without library results (%j)',
    async (response) => {
      const { axiosMock } = initializeMocks();
      axiosMock.onGet(getContentLibraryV2ListApiUrl()).reply(200, response);
      render(<LibrariesV2List />);
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
      expect(screen.getByText(/0 of 0/)).toBeInTheDocument();
      expect(axiosMock.history.get).toHaveLength(1);
    },
  );

  it('renders a populated native response', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(getContentLibraryV2ListApiUrl()).reply(200, {
      count: 1,
      num_pages: 1,
      current_page: 1,
      start: 0,
      results: [{ id: 'lib:Test:Demo', org: 'Test', slug: 'Demo', title: 'Healthy Library' }],
    });
    render(<LibrariesV2List />);
    expect(await screen.findByText('Healthy Library')).toBeInTheDocument();
    expect(screen.getByText(/1 of 1/)).toBeInTheDocument();
  });

  it('retains the error state for a failed request', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(getContentLibraryV2ListApiUrl()).reply(500);
    render(<LibrariesV2List />);
    expect(await screen.findByText(/unable|error|failed/i)).toBeInTheDocument();
    expect(screen.queryByText(/0 of 0/)).not.toBeInTheDocument();
  });
});
