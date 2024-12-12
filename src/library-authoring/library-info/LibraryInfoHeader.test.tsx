import type MockAdapter from 'axios-mock-adapter';

import {
  fireEvent,
  render as baseRender,
  screen,
  waitFor,
  initializeMocks,
} from '../../testUtils';
import { mockContentLibrary } from '../data/api.mocks';
import { getContentLibraryApiUrl } from '../data/api';
import { LibraryProvider } from '../common/context/LibraryContext';
import LibraryInfoHeader from './LibraryInfoHeader';

const { libraryId: mockLibraryId, libraryIdReadOnly, libraryData } = mockContentLibrary;

const render = (libraryId: string = mockLibraryId) => baseRender(<LibraryInfoHeader />, {
  extraWrapper: ({ children }) => <LibraryProvider libraryId={libraryId}>{ children }</LibraryProvider>,
});

let axiosMock: MockAdapter;
let mockShowToast: (message: string) => void;

mockContentLibrary.applyMock();

describe('<LibraryInfoHeader />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
  });

  it('should render Library info Header', async () => {
    render();

    expect(await screen.findByText(libraryData.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit library name/i })).toBeInTheDocument();
  });

  it('should not render edit title button without permission', async () => {
    render(libraryIdReadOnly);

    expect(await screen.findByText(libraryData.title)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit library name/i })).not.toBeInTheDocument();
  });

  it('should edit library title', async () => {
    const url = getContentLibraryApiUrl(libraryData.id);
    axiosMock.onPatch(url).reply(200);
    render();

    expect(await screen.findByText(libraryData.title)).toBeInTheDocument();

    const editTitleButton = screen.getByRole('button', { name: /edit library name/i });
    fireEvent.click(editTitleButton);

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    fireEvent.change(textBox, { target: { value: 'New Library Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(textBox).not.toBeInTheDocument();

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
      expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ title: 'New Library Title' }));
      expect(mockShowToast).toHaveBeenCalledWith('Library updated successfully');
    });
  });

  it('should close edit library title on press Escape', async () => {
    const url = getContentLibraryApiUrl(libraryData.id);
    axiosMock.onPatch(url).reply(200);
    render();

    expect(await screen.findByText(libraryData.title)).toBeInTheDocument();

    const editTitleButton = screen.getByRole('button', { name: /edit library name/i });
    fireEvent.click(editTitleButton);

    const textBox = screen.getByRole('textbox', { name: /title input/i });
    fireEvent.keyDown(textBox, { key: 'Escape', code: 'Escape', charCode: 27 });

    expect(textBox).not.toBeInTheDocument();

    await waitFor(() => {
      expect(axiosMock.history.patch.length).toEqual(0);
    });
  });

  it('should show error on edit library tittle', async () => {
    const url = getContentLibraryApiUrl(libraryData.id);
    axiosMock.onPatch(url).reply(500);
    render();

    expect(await screen.findByText(libraryData.title)).toBeInTheDocument();

    const editTitleButton = screen.getByRole('button', { name: /edit library name/i });
    fireEvent.click(editTitleButton);

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    fireEvent.change(textBox, { target: { value: 'New Library Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(textBox).not.toBeInTheDocument();

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
      expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ title: 'New Library Title' }));
      expect(mockShowToast).toHaveBeenCalledWith('There was an error updating the library');
    });
  });
});
