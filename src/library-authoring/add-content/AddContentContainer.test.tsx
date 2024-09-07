import {
  fireEvent,
  render,
  waitFor,
  initializeMocks,
} from '../../testUtils';
import { mockContentLibrary } from '../data/api.mocks';
import { getCreateLibraryBlockUrl, getLibraryPasteClipboardUrl } from '../data/api';
import { mockClipboardEmpty, mockClipboardHtml } from '../../generic/data/api.mock';
import AddContentContainer from './AddContentContainer';

const { libraryId } = mockContentLibrary;
const renderOpts = { path: '/library/:libraryId/*', params: { libraryId } };

const clipboardBroadcastChannelMock = {
  postMessage: jest.fn(),
  close: jest.fn(),
};

(global as any).BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);

describe('<AddContentContainer />', () => {
  it('should render content buttons', () => {
    initializeMocks();
    mockClipboardEmpty.applyMock();
    const doc = render(<AddContentContainer />);
    expect(doc.getByRole('button', { name: /collection/i })).toBeInTheDocument();
    expect(doc.getByRole('button', { name: /text/i })).toBeInTheDocument();
    expect(doc.getByRole('button', { name: /problem/i })).toBeInTheDocument();
    expect(doc.getByRole('button', { name: /open reponse/i })).toBeInTheDocument();
    expect(doc.getByRole('button', { name: /drag drop/i })).toBeInTheDocument();
    expect(doc.getByRole('button', { name: /video/i })).toBeInTheDocument();
    expect(doc.getByRole('button', { name: /advanced \/ other/i })).toBeInTheDocument();
    expect(doc.queryByRole('button', { name: /copy from clipboard/i })).not.toBeInTheDocument();
  });

  it('should create a content', async () => {
    const { axiosMock } = initializeMocks();
    mockClipboardEmpty.applyMock();
    const url = getCreateLibraryBlockUrl(libraryId);
    axiosMock.onPost(url).reply(200);

    const doc = render(<AddContentContainer />, renderOpts);

    const textButton = doc.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(url));
  });

  it('should render paste button if clipboard contains pastable xblock', async () => {
    initializeMocks();
    // Simulate having an HTML block in the clipboard:
    const getClipboardSpy = mockClipboardHtml.applyMock();
    const doc = render(<AddContentContainer />, renderOpts);
    expect(getClipboardSpy).toHaveBeenCalled(); // Hmm, this is getting called three times! Refactor to use react-query.
    await waitFor(() => expect(doc.queryByRole('button', { name: /paste from clipboard/i })).toBeInTheDocument());
  });

  it('should paste content', async () => {
    const { axiosMock } = initializeMocks();
    // Simulate having an HTML block in the clipboard:
    const getClipboardSpy = mockClipboardHtml.applyMock();

    const pasteUrl = getLibraryPasteClipboardUrl(libraryId);
    axiosMock.onPost(pasteUrl).reply(200);

    const doc = render(<AddContentContainer />, renderOpts);

    expect(getClipboardSpy).toHaveBeenCalled(); // Hmm, this is getting called four times! Refactor to use react-query.

    await waitFor(() => expect(doc.queryByRole('button', { name: /paste from clipboard/i })).toBeInTheDocument());
    const pasteButton = doc.getByRole('button', { name: /paste from clipboard/i });
    fireEvent.click(pasteButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(pasteUrl));
  });

  it('should handle failure to paste content', async () => {
    const { axiosMock } = initializeMocks();
    // Simulate having an HTML block in the clipboard:
    mockClipboardHtml.applyMock();

    const pasteUrl = getLibraryPasteClipboardUrl(libraryId);
    axiosMock.onPost(pasteUrl).reply(400);

    const doc = render(<AddContentContainer />, renderOpts);

    await waitFor(() => expect(doc.queryByRole('button', { name: /paste from clipboard/i })).toBeInTheDocument());
    const pasteButton = doc.getByRole('button', { name: /paste from clipboard/i });
    fireEvent.click(pasteButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(pasteUrl));

    // TODO: check that an actual error message is shown?!
  });
});
