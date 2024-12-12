import type MockAdapter from 'axios-mock-adapter';

import {
  fireEvent,
  render as baseRender,
  screen,
  waitFor,
  initializeMocks,
} from '../../testUtils';
import { mockContentLibrary } from '../data/api.mocks';
import { getXBlockFieldsVersionApiUrl, getXBlockFieldsApiUrl } from '../data/api';
import { LibraryProvider } from '../common/context/LibraryContext';
import { SidebarBodyComponentId, SidebarProvider } from '../common/context/SidebarContext';
import ComponentInfoHeader from './ComponentInfoHeader';

const { libraryId: mockLibraryId, libraryIdReadOnly } = mockContentLibrary;

const usageKey = 'lb:org1:library:html:a1fa8bdd-dc67-4976-9bf5-0ea75a9bca3d';
const xBlockFields = {
  display_name: 'Test HTML Block',
  metadata: {
    display_name: 'Test HTML Block',
  },
};

const render = (libraryId: string = mockLibraryId) => baseRender(<ComponentInfoHeader />, {
  extraWrapper: ({ children }) => (
    <LibraryProvider libraryId={libraryId}>
      <SidebarProvider
        initialSidebarComponentInfo={{
          id: usageKey,
          type: SidebarBodyComponentId.ComponentInfo,
        }}
      >
        {children}
      </SidebarProvider>
    </LibraryProvider>
  ),
});

let axiosMock: MockAdapter;
let mockShowToast: (message: string) => void;

mockContentLibrary.applyMock();

describe('<ComponentInfoHeader />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    axiosMock.onGet(getXBlockFieldsVersionApiUrl(usageKey, 'draft')).reply(200, xBlockFields);
    mockShowToast = mocks.mockShowToast;
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
  });

  it('should render component info Header', async () => {
    render();

    expect(await screen.findByText('Test HTML Block')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /edit component name/i })).toBeInTheDocument();
  });

  it('should not render edit title button without permission', async () => {
    render(libraryIdReadOnly);

    expect(await screen.findByText('Test HTML Block')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /edit component name/i })).not.toBeInTheDocument();
  });

  it('should edit component title', async () => {
    const url = getXBlockFieldsApiUrl(usageKey);
    axiosMock.onPost(url).reply(200);
    render();

    expect(await screen.findByText('Test HTML Block')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /edit component name/i }));

    const textBox = screen.getByRole('textbox', { name: /display name input/i });

    fireEvent.change(textBox, { target: { value: 'New component name' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(textBox).not.toBeInTheDocument();

    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
      expect(axiosMock.history.post[0].url).toEqual(url);
      expect(axiosMock.history.post[0].data).toStrictEqual(JSON.stringify({
        metadata: { display_name: 'New component name' },
      }));
      expect(mockShowToast).toHaveBeenCalledWith('Component updated successfully.');
    });
  });

  it('should close edit library title on press Escape', async () => {
    const url = getXBlockFieldsVersionApiUrl(usageKey, 'draft');
    axiosMock.onPost(url).reply(200);
    render();

    expect(await screen.findByText('Test HTML Block')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /edit component name/i }));

    const textBox = screen.getByRole('textbox', { name: /display name input/i });

    fireEvent.change(textBox, { target: { value: 'New component name' } });
    fireEvent.keyDown(textBox, { key: 'Escape', code: 'Escape', charCode: 27 });

    expect(textBox).not.toBeInTheDocument();

    await waitFor(() => expect(axiosMock.history.post.length).toEqual(0));
  });

  it('should show error on edit library tittle', async () => {
    const url = getXBlockFieldsApiUrl(usageKey);
    axiosMock.onPatch(url).reply(500);
    render();

    expect(await screen.findByText('Test HTML Block')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /edit component name/i }));

    const textBox = screen.getByRole('textbox', { name: /display name input/i });

    fireEvent.change(textBox, { target: { value: 'New component name' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
      expect(axiosMock.history.post[0].url).toEqual(url);
      expect(axiosMock.history.post[0].data).toStrictEqual(JSON.stringify({
        metadata: { display_name: 'New component name' },
      }));

      expect(mockShowToast).toHaveBeenCalledWith('There was an error updating the component.');
    });
  });
});
