import { mockContentSearchConfig, mockSearchResult } from '../../search-manager/data/api.mock';
import {
  initializeMocks,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '../../testUtils';
import mockResult from '../__mocks__/library-search.json';
import mockCollectionResult from '../__mocks__/collection-search.json';
import {
  mockContentLibrary,
  mockGetCollectionMetadata,
  mockGetContentLibraryV2List,
  mockLibraryBlockMetadata,
} from '../data/api.mocks';

import { ComponentPicker } from './ComponentPicker';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/evilguy',
    search: {
      variant: 'published',
    },
  }),
}));
jest.mock('../../studio-home/hooks', () => ({
  useStudioHome: () => ({
    isLoadingPage: false,
    isFailedLoadingPage: false,
    librariesV2Enabled: true,
  }),
}));
mockContentLibrary.applyMock();
mockContentSearchConfig.applyMock();
mockGetCollectionMetadata.applyMock();
mockGetContentLibraryV2List.applyMock();
mockLibraryBlockMetadata.applyMock();

let postMessageSpy: jest.SpyInstance;

describe('<ComponentPicker />', () => {
  beforeEach(() => {
    initializeMocks();
    postMessageSpy = jest.spyOn(window.parent, 'postMessage');

    mockSearchResult({ ...mockResult });
  });

  it('should pick component using the component card button', async () => {
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    // Wait for the content library to load
    await screen.findByText(/Change Library/i);
    await waitFor(() => {
      expect(screen.getByText('Test Library 1')).toBeInTheDocument();
      expect(screen.queryAllByText('Introduction to Testing')[0]).toBeInTheDocument();
    });

    // Click the add component from the component card
    fireEvent.click(screen.queryAllByRole('button', { name: 'Add' })[0]);

    expect(postMessageSpy).toHaveBeenCalledWith({
      usageKey: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
      type: 'pickerComponentSelected',
      category: 'html',
    }, '*');
  });

  it('should pick component using the component sidebar', async () => {
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    // Wait for the content library to load
    await screen.findByText(/Change Library/i);
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();

    // Click on the component card to open the sidebar
    fireEvent.click(screen.queryAllByText('Introduction to Testing')[0]);

    const sidebar = await screen.findByTestId('library-sidebar');

    // Click the add component from the component sidebar
    fireEvent.click(within(sidebar).getByRole('button', { name: 'Add to Course' }));

    expect(postMessageSpy).toHaveBeenCalledWith({
      usageKey: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
      type: 'pickerComponentSelected',
      category: 'html',
    }, '*');
  });

  it('should pick component inside a collection using the card', async () => {
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    // Wait for the content library to load
    await screen.findByText(/Change Library/i);
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();

    // Click on the collection card to open the sidebar
    fireEvent.click(screen.queryAllByText('Collection 1')[0]);

    const sidebar = await screen.findByTestId('library-sidebar');

    // Mock the collection search result
    mockSearchResult(mockCollectionResult);

    // Click the add component from the component card
    fireEvent.click(within(sidebar).getByRole('button', { name: 'Open' }));

    // Wait for the collection  to load
    await screen.findByText(/Back to Library/i);
    await screen.findByText('Introduction to Testing');

    // Click the add component from the component card
    fireEvent.click(screen.queryAllByRole('button', { name: 'Add' })[0]);

    expect(postMessageSpy).toHaveBeenCalledWith({
      usageKey: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
      type: 'pickerComponentSelected',
      category: 'html',
    }, '*');
  });

  it('should pick component inside a collection using the sidebar', async () => {
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    // Wait for the content library to load
    await screen.findByText(/Change Library/i);
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();

    // Click on the collection card to open the sidebar
    fireEvent.click(screen.queryAllByText('Collection 1')[0]);

    const sidebar = await screen.findByTestId('library-sidebar');

    // Mock the collection search result
    mockSearchResult(mockCollectionResult);

    // Click the add component from the component card
    fireEvent.click(within(sidebar).getByRole('button', { name: 'Open' }));

    // Wait for the collection  to load
    await screen.findByText(/Back to Library/i);
    await screen.findByText('Introduction to Testing');

    // Click on the collection card to open the sidebar
    fireEvent.click(screen.getByText('Introduction to Testing'));

    const collectionSidebar = await screen.findByTestId('library-sidebar');

    // Click the add component from the collection sidebar
    fireEvent.click(within(collectionSidebar).getByRole('button', { name: 'Add to Course' }));

    expect(postMessageSpy).toHaveBeenCalledWith({
      usageKey: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
      type: 'pickerComponentSelected',
      category: 'html',
    }, '*');
  });

  it('should return to library selection', async () => {
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    // Wait for the content library to load
    await screen.findByText(/Change Library/i);
    fireEvent.click(screen.getByText(/Change Library/i));

    await screen.findByText('Select which Library would you like to reference components from.');
  });

  it('should pick multiple components using the component card button', async () => {
    const onChange = jest.fn();
    render(<ComponentPicker componentPickerMode="multiple" onChangeComponentSelection={onChange} />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    // Wait for the content library to load
    await screen.findByText(/Change Library/i);
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();

    // Select the first component
    fireEvent.click(screen.queryAllByRole('button', { name: 'Select' })[0]);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([
      {
        usageKey: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
        blockType: 'html',
      },
    ]));

    onChange.mockClear();

    // Select another component
    fireEvent.click(screen.queryAllByRole('button', { name: 'Select' })[1]);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([
      {
        usageKey: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
        blockType: 'html',
      },
      {
        blockType: 'html',
        usageKey: 'lb:Axim:TEST:html:73a22298-bcd9-4f4c-ae34-0bc2b0612480',
      },
    ]));

    onChange.mockClear();

    // Deselect the first component
    fireEvent.click(screen.queryAllByRole('button', { name: 'Select' })[0]);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([
      {
        blockType: 'html',
        usageKey: 'lb:Axim:TEST:html:73a22298-bcd9-4f4c-ae34-0bc2b0612480',
      },
    ]));
  });

  it('should pick multilpe components using the component sidebar', async () => {
    const onChange = jest.fn();
    render(<ComponentPicker componentPickerMode="multiple" onChangeComponentSelection={onChange} />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    // Wait for the content library to load
    await screen.findByText(/Change Library/i);
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();

    // Click on the component card to open the sidebar
    fireEvent.click(screen.queryAllByText('Introduction to Testing')[0]);

    const sidebar = await screen.findByTestId('library-sidebar');

    // Click the select component from the component sidebar
    fireEvent.click(within(sidebar).getByRole('button', { name: 'Select' }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith([
      {
        usageKey: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
        blockType: 'html',
      },
    ]));

    onChange.mockClear();

    // Click to deselect component from the component sidebar
    fireEvent.click(within(sidebar).getByRole('button', { name: 'Select' }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith([]));
  });

  it('should display an alert banner when showOnlyPublished is true', async () => {
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    // Wait for the content library to load
    await screen.findByText(/Only published content is visible and available for reuse./i);
  });
});
