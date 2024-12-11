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
import { SidebarBodyComponentId, SidebarProvider } from '../common/context/SidebarContext';
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
        initialSidebarComponentInfo={{
          id: collectionId,
          type: SidebarBodyComponentId.CollectionInfo,
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

    expect(screen.getByRole('button', { name: /edit collection title/i })).toBeInTheDocument();
  });

  it('should not render edit title button without permission', async () => {
    render(libraryIdReadOnly);
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /edit collection title/i })).not.toBeInTheDocument();
  });

  it('should update collection title', async () => {
    render();

    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(mockLibraryId, collectionId);
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
    render();
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(mockLibraryId, collectionId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit collection title/i }));

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    userEvent.clear(textBox);
    userEvent.type(textBox, `${mockGetCollectionMetadata.collectionData.title}{enter}`);

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should not update collection title if title is empty', async () => {
    render();
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(mockLibraryId, collectionId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit collection title/i }));

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    userEvent.clear(textBox);
    userEvent.type(textBox, '{enter}');

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should close edit collection title on press Escape', async () => {
    render();
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(mockLibraryId, collectionId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit collection title/i }));

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    userEvent.clear(textBox);
    userEvent.type(textBox, 'New Collection Title{esc}');

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should show error on edit collection title', async () => {
    render();
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(mockLibraryId, collectionId);
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
