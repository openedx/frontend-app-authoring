import { courseOutlineIndexMock } from '@src/course-outline/__mocks__';
import {
  initializeMocks, render, screen, waitFor,
} from '@src/testUtils';
import { userEvent } from '@testing-library/user-event';
import mockResult from '@src/library-authoring/__mocks__/library-search.json';
import { mockContentSearchConfig } from '@src/search-manager/data/api.mock';
import {
  mockContentLibrary,
  mockGetCollectionMetadata,
  mockGetContainerMetadata,
  mockGetContentLibraryV2List,
  mockLibraryBlockMetadata,
} from '@src/library-authoring/data/api.mocks';
import {
  type OutlineFlow,
  OutlineSidebarProvider,
} from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import fetchMock from 'fetch-mock-jest';
import type { ContainerType } from '@src/generic/key-utils';
import { AddSidebar } from './AddSidebar';

const handleAddSection = { mutateAsync: jest.fn() };
const handleAddSubsection = { mutateAsync: jest.fn() };
const handleAddUnit = { mutateAsync: jest.fn() };
const handleAddAndOpenUnit = { mutateAsync: jest.fn() };
mockContentSearchConfig.applyMock();
mockContentLibrary.applyMock();
mockGetCollectionMetadata.applyMock();
mockGetContentLibraryV2List.applyMock();
mockLibraryBlockMetadata.applyMock();
mockGetContainerMetadata.applyMock();

const searchEndpoint = 'http://mock.meilisearch.local/multi-search';
const setCurrentSelection = jest.fn();
jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 5,
    courseUsageKey: 'course-usage-key',
    courseDetails: { name: 'Test course' },
    handleAddSection,
    handleAddSubsection,
    handleAddUnit,
    handleAddAndOpenUnit,
    setCurrentSelection,
  }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockReturnValue(courseOutlineIndexMock.courseStructure.childInfo.children),
}));

jest.mock('@src/studio-home/hooks', () => ({
  useStudioHome: () => ({
    isLoadingPage: false,
    isFailedLoadingPage: false,
    librariesV2Enabled: true,
  }),
}));

let currentFlow: OutlineFlow | null = null;
jest.mock('../outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual('../outline-sidebar/OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    ...jest.requireActual('../outline-sidebar/OutlineSidebarContext').useOutlineSidebarContext(),
    currentFlow,
  }),
}));

const renderComponent = () => render(<AddSidebar />, { extraWrapper: OutlineSidebarProvider });
const searchResult = {
  ...mockResult,
  results: [
    {
      ...mockResult.results[0],
      hits: mockResult.results[0].hits.slice(16, 19),
    },
    {
      ...mockResult.results[1],
    },
  ],
};

describe('AddSidebar component', () => {
  beforeEach(() => {
    initializeMocks();
    // The Meilisearch client-side API uses fetch, not Axios.
    fetchMock.mockReset();
    fetchMock.post(searchEndpoint, (_url, req) => {
      const requestData = JSON.parse((req.body ?? '') as string);
      const query = requestData?.queries[0]?.q ?? '';
      // We have to replace the query (search keywords) in the mock results with the actual query,
      // because otherwise Instantsearch will update the UI and change the query,
      // leading to unexpected results in the test cases.
      const newMockResult = { ...searchResult };
      newMockResult.results[0].query = query;
      // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
      // eslint-disable-next-line no-underscore-dangle, no-param-reassign
      newMockResult.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
      return newMockResult;
    });
  });

  it('renders the AddSidebar component without any errors', async () => {
    const user = userEvent.setup();
    renderComponent();
    // Check add new tab content
    expect(await screen.findByRole('button', { name: 'Section' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Subsection' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Unit' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Add New' })).toBeInTheDocument();
    const existingTab = await screen.findByRole('tab', { name: 'Add Existing' });
    expect(existingTab).toBeInTheDocument();

    // Check existing tab content
    await user.click(existingTab);
    expect(await screen.findByRole('button', { name: 'All libraries' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'See more' })).toBeInTheDocument();
    expect(await screen.findByRole('search')).toBeInTheDocument();
  });

  it('show hide extra filters', async () => {
    const user = userEvent.setup();
    renderComponent();
    const existingTab = await screen.findByRole('tab', { name: 'Add Existing' });
    expect(existingTab).toBeInTheDocument();
    await user.click(existingTab);
    const toggleBtn = await screen.findByRole('button', { name: 'See more' });
    expect(toggleBtn).toBeInTheDocument();
    // hidden by default
    expect(screen.queryByRole('button', { name: 'Type' })).not.toBeInTheDocument();
    // show when clicked
    await user.click(toggleBtn);
    expect(await screen.findByRole('button', { name: 'Type' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Tags' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Collections filter' })).toBeInTheDocument();
  });

  it('calls appropriate handlers on new button click', async () => {
    const user = userEvent.setup();
    const sectionList = courseOutlineIndexMock.courseStructure.childInfo.children;
    const lastSection = sectionList[3];
    const lastSubsection = lastSection.childInfo.children[0];
    renderComponent();

    // Validate handler for adding section, subsection and unit
    const section = await screen.findByRole('button', { name: 'Section' });
    const subsection = await screen.findByRole('button', { name: 'Subsection' });
    const unit = await screen.findByRole('button', { name: 'Unit' });
    await user.click(section);
    expect(handleAddSection.mutateAsync).toHaveBeenCalledWith({
      type: 'chapter',
      parentLocator: 'course-usage-key',
      displayName: 'Section',
    });
    await user.click(subsection);
    expect(handleAddSubsection.mutateAsync).toHaveBeenCalledWith({
      type: 'sequential',
      parentLocator: lastSection.id,
      displayName: 'Subsection',
    });
    await user.click(unit);
    expect(handleAddUnit.mutateAsync).toHaveBeenCalledWith({
      type: 'vertical',
      parentLocator: lastSubsection.id,
      displayName: 'Unit',
    });
  });

  it('calls appropriate handlers on existing button click', async () => {
    const user = userEvent.setup();
    const sectionList = courseOutlineIndexMock.courseStructure.childInfo.children;
    const lastSection = sectionList[3];
    const lastSubsection = lastSection.childInfo.children[0];
    renderComponent();
    // Check existing tab content
    await user.click(await screen.findByRole('tab', { name: 'Add Existing' }));

    // Validate handler for adding section, subsection and unit
    const addBtns = await screen.findAllByRole('button', { name: 'Add' });
    // first one is unit as per mock
    await user.click(addBtns[0]);
    expect(handleAddAndOpenUnit.mutateAsync).toHaveBeenCalledWith({
      type: 'library_v2',
      category: 'vertical',
      parentLocator: lastSubsection.id,
      libraryContentKey: searchResult.results[0].hits[0].usage_key,
    });
    // second one is subsection as per mock
    await user.click(addBtns[1]);
    expect(handleAddSubsection.mutateAsync).toHaveBeenCalledWith({
      type: 'library_v2',
      category: 'sequential',
      parentLocator: lastSection.id,
      libraryContentKey: searchResult.results[0].hits[1].usage_key,
    });
    // third one is section as per mock
    await user.click(addBtns[2]);
    expect(handleAddSection.mutateAsync).toHaveBeenCalledWith({
      type: 'library_v2',
      category: 'chapter',
      parentLocator: 'course-usage-key',
      libraryContentKey: searchResult.results[0].hits[2].usage_key,
    });
  });

  ['section', 'subsection', 'unit'].forEach((category) => {
    it(`shows appropriate existing and new content based on ${category} use button click`, async () => {
      const user = userEvent.setup();
      const sectionList = courseOutlineIndexMock.courseStructure.childInfo.children;
      const firstSection = sectionList[0];
      const firstSubsection = firstSection.childInfo.children[0];
      currentFlow = {
        flowType: category as ContainerType,
        parentLocator: category === 'subsection' ? firstSection.id : firstSubsection.id,
        grandParentLocator: category === 'unit' ? firstSection.id : undefined,
      };
      renderComponent();
      // Check existing tab content is rendered by default
      await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
      expect(fetchMock).toHaveLastFetched((_url, req) => {
        const requestData = JSON.parse((req.body ?? '') as string);
        const requestedFilter = requestData?.queries[0].filter;
        return requestedFilter?.[2] === `block_type IN ["${category}"]`;
      });

      await user.click(await screen.findByRole('tab', { name: 'Add New' }));
      // Only category button should be visible
      const section = screen.queryByRole('button', { name: 'Section' });
      const subsection = screen.queryByRole('button', { name: 'Subsection' });
      const unit = screen.queryByRole('button', { name: 'Unit' });
      switch (category) {
        case 'section':
          expect(section).toBeInTheDocument();
          expect(subsection).not.toBeInTheDocument();
          expect(unit).not.toBeInTheDocument();
          break;
        case 'subsection':
          expect(section).not.toBeInTheDocument();
          expect(subsection).toBeInTheDocument();
          expect(unit).not.toBeInTheDocument();
          break;
        default:
          expect(section).not.toBeInTheDocument();
          expect(subsection).not.toBeInTheDocument();
          expect(unit).toBeInTheDocument();
          break;
      }
    });
  });
});
