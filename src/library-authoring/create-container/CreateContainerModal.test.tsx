import userEvent from '@testing-library/user-event';
import {
  render, screen, waitFor, initializeMocks,
} from '../../testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import CreateContainerModal from './CreateContainerModal';
import AddContent from '../add-content/AddContent';
import { mockContentLibrary, mockBlockTypesMetadata } from '../data/api.mocks';
import { getLibraryContainerApiUrl, getLibraryContainersApiUrl } from '../data/api';

const { libraryId } = mockContentLibrary;

const newSectionId = 'lct:org:lib:section:new-section';

describe('CreateContainerModal container linking', () => {
  let axiosMock;
  let mockShowToast;

  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
    jest.clearAllMocks();
    mockContentLibrary.applyMock();
    mockBlockTypesMetadata.applyMock();
    axiosMock.onPost(getLibraryContainersApiUrl(libraryId)).reply(200, {
      id: newSectionId,
      containerType: 'section',
      displayName: 'Test Container',
      publishedDisplayName: 'Test Container',
      created: '2024-09-19T10:00:00Z',
      createdBy: 'test_author',
      lastPublished: null,
      publishedBy: null,
      lastDraftCreated: null,
      lastDraftCreatedBy: null,
      modified: '2024-09-20T11:00:00Z',
      hasUnpublishedChanges: true,
      collections: [],
      tagsCount: 0,
    });
  });

  function renderWithProvider(content, options) {
    const { containerId, routeType = 'library' } = options || {};
    const paths = {
      library: '/library/:libraryId',
      section: '/library/:libraryId/section/:containerId',
      subsection: '/library/:libraryId/subsection/:containerId',
      collection: '/library/:libraryId/collection/:collectionId',
    };

    const params = { libraryId, ...containerId && { containerId } };

    return render(content, {
      path: paths[routeType],
      params,
      extraWrapper: ({ children: wrappedChildren }) => (
        <LibraryProvider libraryId={libraryId}>
          {wrappedChildren}
        </LibraryProvider>
      ),
    });
  }

  it('links container to collection when inside a collection', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <>
        <AddContent />
        <CreateContainerModal />
      </>,
      {},
    );
    // Disambiguate: select the "Section" button by exact match
    const sectionButton = await screen.findByRole('button', { name: /^Section$/ });
    await user.click(sectionButton);
    const nameInput = await screen.findByLabelText(/name your section/i);
    await user.type(nameInput, 'Test Section');
    const createButton = await screen.findByRole('button', { name: /create/i });
    await user.click(createButton);
    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });
    expect(axiosMock.history.post[0].url).toMatch(/\/api\/libraries\/.*\/containers/);
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      can_stand_alone: true,
      container_type: 'section',
      display_name: 'Test Section',
    });
  });

  it('links container to section when inside a section', async () => {
    const user = userEvent.setup();
    axiosMock.onPost(getLibraryContainerApiUrl(newSectionId)).reply(200, {
      id: newSectionId,
      containerType: 'section',
      displayName: 'Test Container',
      publishedDisplayName: 'Test Container',
      created: '2024-09-19T10:00:00Z',
    });
    renderWithProvider(
      <>
        <AddContent />
        <CreateContainerModal />
      </>,
      { containerId: newSectionId, routeType: 'section' },
    );

    const subsectionButton = await screen.findByRole('button', { name: /New subsection/i });
    await user.click(subsectionButton);
    const nameInput = await screen.findByLabelText(/name your subsection/i);
    await user.type(nameInput, 'Test Subsection');
    const createButton = await screen.findByRole('button', { name: /create/i });
    await user.click(createButton);
    await waitFor(() => {
      expect(axiosMock.history.post[0].url).toMatch(/\/api\/libraries\/.*\/containers/);
    });
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      can_stand_alone: false,
      container_type: 'subsection',
      display_name: 'Test Subsection',
    });
  });

  it('handles linking error gracefully', async () => {
    const user = userEvent.setup();
    axiosMock.onPost(getLibraryContainersApiUrl(libraryId)).reply(500);
    renderWithProvider(
      <>
        <AddContent />
        <CreateContainerModal />
      </>,
      {},
    );
    // Disambiguate: select the "Section" button by exact match
    const sectionButton = await screen.findByRole('button', { name: /^Section$/ });
    await user.click(sectionButton);
    const nameInput = await screen.findByLabelText(/name your section/i);
    await user.type(nameInput, 'Test Section');
    const createButton = await screen.findByRole('button', { name: /create/i });
    await user.click(createButton);
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.stringMatching(/error/i));
    });
  });
});
