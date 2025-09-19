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
import { mockContentLibrary, mockGetContainerMetadata } from '../data/api.mocks';
import * as api from '../data/api';
import ContainerInfoHeader from './ContainerInfoHeader';

let axiosMock: MockAdapter;
let mockShowToast: (message: string) => void;

mockGetContainerMetadata.applyMock();
mockContentLibrary.applyMock();

const {
  libraryId: mockLibraryId,
  libraryIdReadOnly,
} = mockContentLibrary;

const { unitId: containerId } = mockGetContainerMetadata;

const render = (libraryId: string = mockLibraryId) => baseRender(<ContainerInfoHeader />, {
  extraWrapper: ({ children }) => (
    <LibraryProvider libraryId={libraryId}>
      <SidebarProvider
        initialSidebarItemInfo={{
          id: containerId,
          type: SidebarBodyItemId.ContainerInfo,
        }}
      >
        { children }
      </SidebarProvider>
    </LibraryProvider>
  ),
});

describe('<ContainerInfoHeader />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
  });

  it('should render container info Header', async () => {
    render();
    expect(await screen.findByText('Test Unit')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('should not render edit title button without permission', async () => {
    render(libraryIdReadOnly);
    expect(await screen.findByText('Test Unit')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('should update container title', async () => {
    const user = userEvent.setup();
    render();

    expect(await screen.findByText('Test Unit')).toBeInTheDocument();

    const url = api.getLibraryContainerApiUrl(containerId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const textBox = screen.getByRole('textbox', { name: /text input/i });

    await user.clear(textBox);
    await user.type(textBox, 'New Unit Title{enter}');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
    });
    expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ display_name: 'New Unit Title' }));

    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Container updated successfully.');
  });

  it('should not update container title if title is the same', async () => {
    const user = userEvent.setup();
    render();
    expect(await screen.findByText('Test Unit')).toBeInTheDocument();

    const url = api.getLibraryContainerApiUrl(containerId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const textBox = screen.getByRole('textbox', { name: /text input/i });

    await user.clear(textBox);
    await user.type(textBox, `${mockGetContainerMetadata.containerData.displayName}{enter}`);
    await user.keyboard('{Enter}');

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should not update container title if title is empty', async () => {
    const user = userEvent.setup();
    render();
    expect(await screen.findByText('Test Unit')).toBeInTheDocument();

    const url = api.getLibraryContainerApiUrl(containerId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const textBox = screen.getByRole('textbox', { name: /text input/i });

    await user.clear(textBox);
    await user.keyboard('{Enter}');

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should close edit container title on press Escape', async () => {
    const user = userEvent.setup();
    render();
    expect(await screen.findByText('Test Unit')).toBeInTheDocument();

    const url = api.getLibraryContainerApiUrl(containerId);
    axiosMock.onPatch(url).reply(200);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const textBox = screen.getByRole('textbox', { name: /text input/i });

    await user.clear(textBox);
    await user.type(textBox, 'New Unit Title');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));

    expect(textBox).not.toBeInTheDocument();
  });

  it('should show error on edit container title', async () => {
    const user = userEvent.setup();
    render();
    expect(await screen.findByText('Test Unit')).toBeInTheDocument();

    const url = api.getLibraryContainerApiUrl(containerId);
    axiosMock.onPatch(url).reply(500);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const textBox = screen.getByRole('textbox', { name: /text input/i });

    await user.clear(textBox);
    await user.type(textBox, 'New Unit Title{enter}');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
    });
    expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ display_name: 'New Unit Title' }));

    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Failed to update container.');
  });
});
