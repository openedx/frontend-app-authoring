import type MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';

import {
  initializeMocks,
  fireEvent,
  render,
  screen,
  waitFor,
} from '../../testUtils';
import { mockContentLibrary, mockGetCollectionMetadata } from '../data/api.mocks';
import * as api from '../data/api';
import CollectionInfoHeader from './CollectionInfoHeader';

let axiosMock: MockAdapter;
let mockShowToast: (message: string) => void;

mockGetCollectionMetadata.applyMock();

const { collectionId } = mockGetCollectionMetadata;

describe('<CollectionInfoHeader />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
  });

  it('should render Collection info Header', async () => {
    const library = await mockContentLibrary(mockContentLibrary.libraryId);
    render(<CollectionInfoHeader library={library} collectionId={collectionId} />);
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /edit collection title/i })).toBeInTheDocument();
  });

  it('should not render edit title button without permission', async () => {
    const readOnlyLibrary = await mockContentLibrary(mockContentLibrary.libraryIdReadOnly);
    render(<CollectionInfoHeader library={readOnlyLibrary} collectionId={collectionId} />);
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /edit collection title/i })).not.toBeInTheDocument();
  });

  it('should update collection title', async () => {
    const library = await mockContentLibrary(mockContentLibrary.libraryId);
    render(<CollectionInfoHeader library={library} collectionId={collectionId} />);
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(library.id, collectionId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit collection title/i }));

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    userEvent.clear(textBox);
    userEvent.type(textBox, 'New Collection Title{enter}');

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
      expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ title: 'New Collection Title' }));
    });

    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Collection updated successfully.');
  });

  it('should not update collection title if title is the same', async () => {
    const library = await mockContentLibrary(mockContentLibrary.libraryId);
    render(<CollectionInfoHeader library={library} collectionId={collectionId} />);
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(library.id, collectionId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit collection title/i }));

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    userEvent.clear(textBox);
    userEvent.type(textBox, `${mockGetCollectionMetadata.collectionData.title}{enter}`);

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should not update collection title if title is empty', async () => {
    const library = await mockContentLibrary(mockContentLibrary.libraryId);
    render(<CollectionInfoHeader library={library} collectionId={collectionId} />);
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(library.id, collectionId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit collection title/i }));

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    userEvent.clear(textBox);
    userEvent.type(textBox, '{enter}');

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should close edit collection title on press Escape', async () => {
    const library = await mockContentLibrary(mockContentLibrary.libraryId);
    render(<CollectionInfoHeader library={library} collectionId={collectionId} />);
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(library.id, collectionId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit collection title/i }));

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    userEvent.clear(textBox);
    userEvent.type(textBox, 'New Collection Title{esc}');

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should show error on edit collection title', async () => {
    const library = await mockContentLibrary(mockContentLibrary.libraryId);
    render(<CollectionInfoHeader library={library} collectionId={collectionId} />);
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(library.id, collectionId);
    axiosMock.onPatch(url).reply(500);

    fireEvent.click(screen.getByRole('button', { name: /edit collection title/i }));

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    userEvent.clear(textBox);
    userEvent.type(textBox, 'New Collection Title{enter}');

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
      expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ title: 'New Collection Title' }));
    });

    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Failed to update collection.');
  });
});
