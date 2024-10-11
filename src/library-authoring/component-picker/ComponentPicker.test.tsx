import type MockAdapter from 'axios-mock-adapter';

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
import { getXBlockBaseApiUrl } from '../data/api';

import { ComponentPicker } from './ComponentPicker';

mockContentLibrary.applyMock();
mockContentSearchConfig.applyMock();
mockGetCollectionMetadata.applyMock();
mockGetContentLibraryV2List.applyMock();
mockLibraryBlockMetadata.applyMock();

let axiosMock: MockAdapter;
let mockShowToast: (message: string) => void;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => {
    const [params] = [new URLSearchParams({
      parentLocator: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical1',
    })];
    return [
      params,
    ];
  },
}));

describe('<ComponentPicker />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
    axiosMock.onPost(getXBlockBaseApiUrl()).reply(200, {});

    mockSearchResult(mockResult);
  });

  it('should pick component using the component card button', async () => {
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    fireEvent.click(screen.getByText('Next'));

    // Wait for the content library to load
    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();

    // Click the add component from the component card
    fireEvent.click(screen.queryAllByRole('button', { name: 'Add' })[0]);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(getXBlockBaseApiUrl());
      expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
        parent_locator: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical1',
        library_content_key: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
      }));
    });
  });

  it('should show toast if error on api call from the component card button', async () => {
    axiosMock.onPost(getXBlockBaseApiUrl()).reply(500, {});
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    fireEvent.click(screen.getByText('Next'));

    // Wait for the content library to load
    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();

    // Click the add component from the component card
    fireEvent.click(screen.queryAllByRole('button', { name: 'Add' })[0]);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(getXBlockBaseApiUrl());
      expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
        parent_locator: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical1',
        library_content_key: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
      }));
      expect(mockShowToast).toHaveBeenCalledWith('Failed to add component to course');
    });
  });

  it('should pick component using the component sidebar', async () => {
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    fireEvent.click(screen.getByText('Next'));

    // Wait for the content library to load
    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();

    // Click on the component card to open the sidebar
    fireEvent.click(screen.queryAllByText('Introduction to Testing')[0]);

    const sidebar = await screen.findByTestId('library-sidebar');

    // Click the add component from the component sidebar
    fireEvent.click(within(sidebar).getByRole('button', { name: 'Add to Course' }));

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(getXBlockBaseApiUrl());
      expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
        parent_locator: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical1',
        library_content_key: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
      }));
    });
  });

  it('should show toast if error on api call from the component sidebar button', async () => {
    axiosMock.onPost(getXBlockBaseApiUrl()).reply(500, {});
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    fireEvent.click(screen.getByText('Next'));

    // Wait for the content library to load
    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();

    // Click on the component card to open the sidebar
    fireEvent.click(screen.queryAllByText('Introduction to Testing')[0]);

    const sidebar = await screen.findByTestId('library-sidebar');

    // Click the add component from the component sidebar
    fireEvent.click(within(sidebar).getByRole('button', { name: 'Add to Course' }));

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(getXBlockBaseApiUrl());
      expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
        parent_locator: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical1',
        library_content_key: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
      }));
      expect(mockShowToast).toHaveBeenCalledWith('Failed to add component to course');
    });
  });

  it('should pick component inside a collection using the card', async () => {
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    fireEvent.click(screen.getByText('Next'));

    // Wait for the content library to load
    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();

    // Click on the collection card to open the sidebar
    fireEvent.click(screen.queryAllByText('Collection 1')[0]);

    const sidebar = await screen.findByTestId('library-sidebar');

    // Mock the collection search result
    mockSearchResult(mockCollectionResult);

    // Click the add component from the component card
    fireEvent.click(within(sidebar).getByRole('button', { name: 'Open' }));

    // Wait for the collection  to load
    await screen.findByText(/← Change Library/i);
    await screen.findByText('Introduction to Testing');

    // Click the add component from the component card
    fireEvent.click(screen.queryAllByRole('button', { name: 'Add' })[0]);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(getXBlockBaseApiUrl());
      expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
        parent_locator: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical1',
        library_content_key: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
      }));
    });
  });

  it('should pick component inside a collection using the sidebar', async () => {
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    fireEvent.click(screen.getByText('Next'));

    // Wait for the content library to load
    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();

    // Click on the collection card to open the sidebar
    fireEvent.click(screen.queryAllByText('Collection 1')[0]);

    const sidebar = await screen.findByTestId('library-sidebar');

    // Mock the collection search result
    mockSearchResult(mockCollectionResult);

    // Click the add component from the component card
    fireEvent.click(within(sidebar).getByRole('button', { name: 'Open' }));

    // Wait for the collection  to load
    await screen.findByText(/← Change Library/i);
    await screen.findByText('Introduction to Testing');

    // Click on the collection card to open the sidebar
    fireEvent.click(screen.getByText('Introduction to Testing'));

    const collectionSidebar = await screen.findByTestId('library-sidebar');

    // Click the add component from the collection sidebar
    fireEvent.click(within(collectionSidebar).getByRole('button', { name: 'Add to Course' }));

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(getXBlockBaseApiUrl());
      expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
        parent_locator: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical1',
        library_content_key: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
      }));
    });
  });
});
