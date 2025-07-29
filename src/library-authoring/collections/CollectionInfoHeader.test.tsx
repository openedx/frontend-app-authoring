import type MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';

import {
  initializeMocks,
  fireEvent,
  render as baseRender,
  screen,
  waitFor,
} from '../../testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import { SidebarBodyItemId, SidebarProvider } from '../common/context/SidebarContext';
import { mockContentLibrary, mockGetCollectionMetadata } from '../data/api.mocks';
import * as api from '../data/api';
import CollectionInfoHeader from './CollectionInfoHeader';

let axiosMock: MockAdapter;
let mockShowToast: (message: string) => void;

mockGetCollectionMetadata.applyMock();
mockContentLibrary.applyMock();

const {
  libraryId: mockLibraryId,
  libraryIdReadOnly,
} = mockContentLibrary;

const { collectionId } = mockGetCollectionMetadata;

const render = (libraryId: string = mockLibraryId) => baseRender(<CollectionInfoHeader />, {
  extraWrapper: ({ children }) => (
    <LibraryProvider libraryId={libraryId}>
      <SidebarProvider
        initialSidebarItemInfo={{
          id: collectionId,
          type: SidebarBodyItemId.CollectionInfo,
        }}
      >
        { children }
      </SidebarProvider>
    </LibraryProvider>
  ),
});

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
    render();
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('should not render edit title button without permission', async () => {
    render(libraryIdReadOnly);
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('should update collection title', async () => {
    const user = userEvent.setup();
    render();

    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(mockLibraryId, collectionId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const textBox = screen.getByRole('textbox', { name: /text input/i });

    await user.clear(textBox);
    await user.type(textBox, 'New Collection Title{enter}');

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
      expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ title: 'New Collection Title' }));
    });

    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Collection updated successfully.');
  });

  it('should not update collection title if title is the same', async () => {
    const user = userEvent.setup();
    render();
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(mockLibraryId, collectionId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const textBox = screen.getByRole('textbox', { name: /text input/i });

    await user.clear(textBox);
    await user.type(textBox, `${mockGetCollectionMetadata.collectionData.title}{enter}`);

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should not update collection title if title is empty', async () => {
    const user = userEvent.setup();
    render();
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(mockLibraryId, collectionId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const textBox = screen.getByRole('textbox', { name: /text input/i });

    await user.clear(textBox);
    await user.type(textBox, '{enter}');

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should close edit collection title on press Escape', async () => {
    const user = userEvent.setup();
    render();
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(mockLibraryId, collectionId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const textBox = screen.getByRole('textbox', { name: /text input/i });

    await user.clear(textBox);
    await user.type(textBox, 'New Collection Title');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should show error on edit collection title', async () => {
    const user = userEvent.setup();
    render();
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(mockLibraryId, collectionId);
    axiosMock.onPatch(url).reply(500);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const textBox = screen.getByRole('textbox', { name: /text input/i });

    await user.clear(textBox);
    await user.type(textBox, 'New Collection Title');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
      expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ title: 'New Collection Title' }));
    });

    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Failed to update collection.');
  });
});
