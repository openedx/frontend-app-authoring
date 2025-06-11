import MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';
import {
  render, screen, waitFor, initializeMocks,
} from '../../testUtils';

import { LibraryProvider } from '../common/context/LibraryContext';
import CreateContainerModal from './CreateContainerModal';
import AddContent from '../add-content/AddContent';
import { getLibraryCollectionItemsApiUrl, getLibraryContainerChildrenApiUrl } from '../data/api';

let axiosMock: MockAdapter;
const mockNavigateTo = jest.fn();
let mockShowToast: any;

const mockUseLibraryRoutes = jest.fn().mockReturnValue({
  navigateTo: mockNavigateTo,
  insideCollection: true,
  insideSection: false,
  insideSubsection: false,
});

jest.mock('../routes', () => ({
  useLibraryRoutes: () => mockUseLibraryRoutes(),
}));

const mockLibraryData = {
  id: 'test-library',
  title: 'Test Library',
  description: 'A test library',
  version: 1,
  type: 'complex',
  license: '',
  canEditLibrary: true,
  hasUnpublishedChanges: false,
  hasUnpublishedDeletes: false,
  numBlocks: 0,
  lastPublished: null,
  created: '2024-01-01T00:00:00Z',
  updated: '2024-01-01T00:00:00Z',
  publishedBy: null,
  lastDraftCreated: null,
  lastDraftCreatedBy: null,
  readOnly: false,
  allowLti: false,
  allowPublicLearning: false,
  allowPublicRead: false,
  libraryBlockTypes: [],
  learningPackage: null,
};

const mockBlockTypesData = [
  { blockType: 'html', displayName: 'Text' },
  { blockType: 'problem', displayName: 'Problem' },
  { blockType: 'video', displayName: 'Video' },
];

const renderWithLibraryProvider = (libraryId: string, options: {
  collectionId?: string;
  containerId?: string;
  path?: string;
  params?: Record<string, string>;
} = {}) => {
  const {
    collectionId, containerId, path, params,
  } = options;

  axiosMock.onGet(`/api/libraries/v2/${libraryId}/`).reply(200, mockLibraryData);
  axiosMock.onGet(`/api/libraries/v2/${libraryId}/block_types/`).reply(200, mockBlockTypesData);

  return render(
    <LibraryProvider libraryId={libraryId}>
      <AddContent />
      <CreateContainerModal />
    </LibraryProvider>,
    {
      path: path || '/library/:libraryId',
      params: {
        libraryId,
        ...(collectionId && { collectionId }),
        ...(containerId && { containerId }),
        ...params,
      },
    },
  );
};

describe('CreateContainerModal container linking', () => {
  beforeEach(() => {
    ({ axiosMock, mockShowToast } = initializeMocks());

    mockUseLibraryRoutes.mockReturnValue({
      navigateTo: mockNavigateTo,
      insideCollection: true,
      insideSection: false,
      insideSubsection: false,
    });
  });

  it('links container to collection when inside a collection', async () => {
    axiosMock.onPost(/\/api\/libraries\/.*\/containers/).reply(200, {
      id: 'lct:org:libId:collection:1',
      displayName: 'Test Container',
    });

    const collectionItemsUrl = getLibraryCollectionItemsApiUrl('test-library', 'test-collection');
    axiosMock.onPatch(collectionItemsUrl).reply(200);

    renderWithLibraryProvider('test-library', {
      collectionId: 'test-collection',
      path: '/library/:libraryId/collection/:collectionId',
    });

    const sectionButtons = await screen.findAllByRole('button', { name: /section/i });
    const sectionButton = sectionButtons[0];
    await userEvent.click(sectionButton);

    await waitFor(() => {
      expect(screen.getByText('New Section')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Name your section');
    await userEvent.type(nameInput, 'Test Container');

    const createButton = screen.getByRole('button', { name: /create/i });
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });
    expect(axiosMock.history.post[0].url).toMatch(/\/api\/libraries\/.*\/containers/);
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      can_stand_alone: false,
      container_type: 'section',
      display_name: 'Test Container',
    });

    expect(axiosMock.history.patch).toHaveLength(1);
    expect(axiosMock.history.patch[0].url).toBe(collectionItemsUrl);
    expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
      usage_keys: ['lct:org:libId:collection:1'],
    });

    expect(mockNavigateTo).toHaveBeenCalledWith({ containerId: 'lct:org:libId:collection:1' });
    expect(mockShowToast).toHaveBeenCalled();
  });

  it('links container to section when inside a section', async () => {
    axiosMock.onPost(/\/api\/libraries\/.*\/containers/).reply(200, {
      id: 'lct:org:libId:section:1',
      displayName: 'Test Container',
    });

    const containerChildrenUrl = getLibraryContainerChildrenApiUrl('lct:org:lib:unit:test-container', false);
    axiosMock.onPost(containerChildrenUrl).reply(200);

    mockUseLibraryRoutes.mockReturnValue({
      navigateTo: mockNavigateTo,
      insideCollection: false,
      insideSection: true,
      insideSubsection: false,
    });

    renderWithLibraryProvider('test-library', {
      containerId: 'lct:org:lib:unit:test-container',
      path: '/library/:libraryId/section/:containerId',
    });

    const subsectionButton = await screen.findByRole('button', { name: /subsection/i });
    await userEvent.click(subsectionButton);

    await waitFor(() => {
      expect(screen.getByText('New Subsection')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Name your subsection');
    await userEvent.type(nameInput, 'Test Container');

    const createButton = screen.getByRole('button', { name: /create/i });
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(axiosMock.history.post[0].url).toMatch(/\/api\/libraries\/.*\/containers/);
    });
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      can_stand_alone: false,
      container_type: 'subsection',
      display_name: 'Test Container',
    });

    expect(axiosMock.history.post[1].url).toBe(containerChildrenUrl);
    expect(JSON.parse(axiosMock.history.post[1].data)).toEqual({
      usage_keys: ['lct:org:libId:section:1'],
    });

    expect(mockNavigateTo).toHaveBeenCalledWith({ containerId: 'lct:org:libId:section:1' });
    expect(mockShowToast).toHaveBeenCalled();
  });

  it('handles linking error gracefully', async () => {
    axiosMock.onPost(/\/api\/libraries\/.*\/containers/).reply(200, {
      id: 'new-container-id',
      displayName: 'Test Container',
    });

    const collectionItemsUrl = getLibraryCollectionItemsApiUrl('test-library', 'test-collection');
    axiosMock.onPatch(collectionItemsUrl).reply(500);

    renderWithLibraryProvider('test-library', {
      collectionId: 'test-collection',
      path: '/library/:libraryId/collection/:collectionId',
    });

    const sectionButtons = await screen.findAllByRole('button', { name: /section/i });
    const sectionButton = sectionButtons[0];
    await userEvent.click(sectionButton);

    await waitFor(() => {
      expect(screen.getByText('New Section')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Name your section');
    await userEvent.type(nameInput, 'Test Container');

    const createButton = screen.getByRole('button', { name: /create/i });
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.stringMatching(/error/i));
    });
  });
});
