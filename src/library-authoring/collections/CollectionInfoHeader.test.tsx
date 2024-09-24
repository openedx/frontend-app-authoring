import type MockAdapter from 'axios-mock-adapter';

import { mockCollectionHit } from '../../search-manager/data/api.mock';
import {
  initializeMocks,
  fireEvent,
  render,
  screen,
  waitFor,
} from '../../testUtils';
import { mockContentLibrary } from '../data/api.mocks';
import * as api from '../data/api';
import CollectionInfoHeader from './CollectionInfoHeader';

let axiosMock: MockAdapter;
let mockShowToast: (message: string) => void;

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
    render(<CollectionInfoHeader library={library} collection={mockCollectionHit} />);

    expect(screen.getByText(mockCollectionHit.displayName)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit collection title/i })).toBeInTheDocument();
  });

  it('should not render edit title button without permission', async () => {
    const readOnlyLibrary = await mockContentLibrary(mockContentLibrary.libraryIdReadOnly);
    render(<CollectionInfoHeader library={readOnlyLibrary} collection={mockCollectionHit} />);
    expect(screen.queryByRole('button', { name: /edit collection title/i })).not.toBeInTheDocument();
  });

  it('should update collection title', async () => {
    const library = await mockContentLibrary(mockContentLibrary.libraryId);
    render(<CollectionInfoHeader library={library} collection={mockCollectionHit} />);
    const url = api.getLibraryCollectionApiUrl(library.id, mockCollectionHit.blockId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit collection title/i }));

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    fireEvent.change(textBox, { target: { value: 'New Collection Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
      expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ title: 'New Collection Title' }));
    });

    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Collection updated successfully.');
  });

  it('should close edit collection title on press Escape', async () => {
    const library = await mockContentLibrary(mockContentLibrary.libraryId);
    render(<CollectionInfoHeader library={library} collection={mockCollectionHit} />);
    const url = api.getLibraryCollectionApiUrl(library.id, mockCollectionHit.blockId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit collection title/i }));

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    fireEvent.change(textBox, { target: { value: 'New Collection Title' } });
    fireEvent.keyDown(textBox, { key: 'Escape', code: 'Escape', charCode: 27 });

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should show error on edit collection tittle', async () => {
    const library = await mockContentLibrary(mockContentLibrary.libraryId);
    render(<CollectionInfoHeader library={library} collection={mockCollectionHit} />);
    const url = api.getLibraryCollectionApiUrl(library.id, mockCollectionHit.blockId);
    axiosMock.onPatch(url).reply(500);

    fireEvent.click(screen.getByRole('button', { name: /edit collection title/i }));

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    fireEvent.change(textBox, { target: { value: 'New Collection Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
      expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ title: 'New Collection Title' }));
    });

    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Failed to update collection.');
  });
});
