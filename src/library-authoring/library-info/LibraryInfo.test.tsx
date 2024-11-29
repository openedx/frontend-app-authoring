import type MockAdapter from 'axios-mock-adapter';

import {
  fireEvent,
  render as baseRender,
  screen,
  waitFor,
  initializeMocks,
} from '../../testUtils';
import { mockContentLibrary } from '../data/api.mocks';
import { getCommitLibraryChangesUrl } from '../data/api';
import { LibraryProvider } from '../common/context/LibraryContext';
import LibraryInfo from './LibraryInfo';

const {
  libraryId: mockLibraryId,
  libraryIdReadOnly,
  libraryDraftWithoutUser,
  libraryNoDraftDate,
  libraryNoDraftNoCrateDate,
  libraryUnpublishedChanges,
  libraryPublished,
  libraryPublishedWithoutUser,
  libraryDraftWithoutChanges,
  libraryData,
} = mockContentLibrary;

const render = (libraryId: string = mockLibraryId) => baseRender(<LibraryInfo />, {
  extraWrapper: ({ children }) => <LibraryProvider libraryId={libraryId}>{ children }</LibraryProvider>,
});

let axiosMock: MockAdapter;
let mockShowToast: (message: string) => void;

mockContentLibrary.applyMock();

describe('<LibraryInfo />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render Library info sidebar', async () => {
    render();

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('(Never Published)')).toBeInTheDocument();
    expect(screen.getByText('July 22, 2024')).toBeInTheDocument();
    expect(screen.getByText('staff')).toBeInTheDocument();
    expect(screen.getByText('July 20, 2024')).toBeInTheDocument();
    expect(screen.getByText('June 26, 2024')).toBeInTheDocument();
  });

  it('should render Library info in draft state without user', async () => {
    render(libraryDraftWithoutUser);

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('(Never Published)')).toBeInTheDocument();
    expect(screen.getByText('July 22, 2024')).toBeInTheDocument();
    expect(screen.queryByText('staff')).not.toBeInTheDocument();
  });

  it('should render Library creation date if last draft created date is null', async () => {
    render(libraryNoDraftDate);

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('(Never Published)')).toBeInTheDocument();
    expect(screen.getAllByText('June 26, 2024')[0]).toBeInTheDocument();
    expect(screen.getAllByText('June 26, 2024')[1]).toBeInTheDocument();
  });

  it('should render library info in draft state without date', async () => {
    render(libraryNoDraftNoCrateDate);

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('(Never Published)')).toBeInTheDocument();
  });

  it('should render library info with unpublished changes', async () => {
    render(libraryUnpublishedChanges);

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.queryByText('(Never Published)')).not.toBeInTheDocument();
    expect(screen.getByText('July 22, 2024')).toBeInTheDocument();
    expect(screen.getByText('staff')).toBeInTheDocument();
  });

  it('should render published library info sidebar', async () => {
    render(libraryPublished);

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('July 26, 2024')).toBeInTheDocument();
    expect(screen.getByText('staff')).toBeInTheDocument();
  });

  it('should render published library info without user', async () => {
    render(libraryPublishedWithoutUser);

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('July 26, 2024')).toBeInTheDocument();
    expect(screen.queryByText('staff')).not.toBeInTheDocument();
  });

  it('should publish library', async () => {
    const url = getCommitLibraryChangesUrl(libraryData.id);
    axiosMock.onPost(url).reply(200);
    render();

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    const publishButton = screen.getByRole('button', { name: /publish/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(axiosMock.history.post[0].url).toEqual(url);
      expect(mockShowToast).toHaveBeenCalledWith('Library published successfully');
    });
  });

  it('should show error on publish library', async () => {
    const url = getCommitLibraryChangesUrl(libraryData.id);
    axiosMock.onPost(url).reply(500);
    render();

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    const publishButton = screen.getByRole('button', { name: /publish/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(axiosMock.history.post[0].url).toEqual(url);
      expect(mockShowToast).toHaveBeenCalledWith('There was an error publishing the library.');
    });
  });

  it('should discard changes', async () => {
    const url = getCommitLibraryChangesUrl(libraryData.id);
    axiosMock.onDelete(url).reply(200);
    render();

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    const discardButton = screen.getByRole('button', { name: /discard changes/i });
    fireEvent.click(discardButton);
    const confirmBtn = screen.getByRole('button', { name: /discard/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(axiosMock.history.delete[0].url).toEqual(url);
      expect(mockShowToast).toHaveBeenCalledWith('Library changes reverted successfully');
    });
  });

  it('should show error on discard changes', async () => {
    const url = getCommitLibraryChangesUrl(libraryData.id);
    axiosMock.onDelete(url).reply(500);
    render();

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    const discardButton = screen.getByRole('button', { name: /discard changes/i });
    fireEvent.click(discardButton);
    const confirmBtn = screen.getByRole('button', { name: /discard/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(axiosMock.history.delete[0].url).toEqual(url);
      expect(mockShowToast).toHaveBeenCalledWith('There was an error reverting changes in the library.');
    });
  });

  it('discard changes btn should be disabled for new libraries', async () => {
    render(libraryDraftWithoutChanges);

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    const discardButton = screen.getByRole('button', { name: /discard changes/i });
    expect(discardButton).toBeDisabled();
  });

  it('discard changes btn should be enabled for new libraries if components are added', async () => {
    render();

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    const discardButton = screen.getByRole('button', { name: /discard changes/i });
    expect(discardButton).not.toBeDisabled();
  });

  it('should render library info in read-only mode', async () => {
    render(libraryIdReadOnly);

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /publish/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /discard changes/i })).not.toBeInTheDocument();
  });

  it('publish and discard changes btns should be enabled for new libraries if components are added', async () => {
    render(libraryUnpublishedChanges);

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    const publishButton = screen.getByRole('button', { name: /publish/i });
    const discardButton = screen.getByRole('button', { name: /discard changes/i });

    expect(publishButton).not.toBeDisabled();
    expect(discardButton).not.toBeDisabled();
  });

  it('publish and discard changes btns should be absent for users who cannot edit the library', async () => {
    render(libraryIdReadOnly);

    expect(await screen.findByText(libraryData.org)).toBeInTheDocument();

    const publishButton = screen.queryByRole('button', { name: /publish/i });
    const discardButton = screen.queryByRole('button', { name: /discard changes/i });

    expect(publishButton).not.toBeInTheDocument();
    expect(discardButton).not.toBeInTheDocument();
  });
});
