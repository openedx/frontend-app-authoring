import { courseOutlineIndexMock } from '@src/course-outline/__mocks__';
import { initializeMocks, render, screen } from '@src/testUtils';
import { userEvent } from '@testing-library/user-event';
import mockResult from '@src/library-authoring/__mocks__/library-search.json';
import { mockContentSearchConfig, mockSearchResult } from '@src/search-manager/data/api.mock';
import {
  mockContentLibrary,
  mockGetCollectionMetadata,
  mockGetContainerMetadata,
  mockGetContentLibraryV2List,
  mockLibraryBlockMetadata,
} from '@src/library-authoring/data/api.mocks';
import { AddSidebar } from './AddSidebar';

const handleNewSectionSubmit = jest.fn();
const handleNewSubsectionSubmit = jest.fn();
const handleNewUnitSubmit = jest.fn();
const handleAddSectionFromLibrary = { mutateAsync: jest.fn() };
const handleAddSubsectionFromLibrary = { mutateAsync: jest.fn() };
const handleAddUnitFromLibrary = { mutateAsync: jest.fn() };
mockContentSearchConfig.applyMock();
mockContentLibrary.applyMock();
mockGetCollectionMetadata.applyMock();
mockGetContentLibraryV2List.applyMock();
mockLibraryBlockMetadata.applyMock();
mockGetContainerMetadata.applyMock();

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 5,
    courseUsageKey: 'course-usage-key',
    courseDetails: { name: 'Test course' },
    handleNewSubsectionSubmit,
    handleNewUnitSubmit,
    handleNewSectionSubmit,
    handleAddSectionFromLibrary,
    handleAddSubsectionFromLibrary,
    handleAddUnitFromLibrary,
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

const renderComponent = () => render(<AddSidebar />);
const searchResult = {
  ...mockResult,
  results: [
    {
      ...mockResult.results[0],
      hits: [
        ...mockResult.results[0].hits.slice(16, 19),
      ],
    },
    {
      ...mockResult.results[1],
    },
  ],
};

describe('AddSidebar component', () => {
  beforeEach(() => {
    initializeMocks();
    mockSearchResult({
      ...searchResult,
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
    expect(await screen.findByTitle('Sort search results')).toBeInTheDocument();
  });

  it('calls appropriate handlers on new button click', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Validate handler for adding section, subsection and unit
    const section = await screen.findByRole('button', { name: 'Section' });
    const subsection = await screen.findByRole('button', { name: 'Subsection' });
    const unit = await screen.findByRole('button', { name: 'Unit' });
    await user.click(section);
    expect(handleNewSectionSubmit).toHaveBeenCalled();
    await user.click(subsection);
    expect(handleNewSubsectionSubmit).toHaveBeenCalled();
    await user.click(unit);
    expect(handleNewUnitSubmit).toHaveBeenCalled();
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
    expect(handleAddUnitFromLibrary.mutateAsync).toHaveBeenCalledWith({
      type: 'library_v2',
      category: 'vertical',
      parentLocator: lastSubsection.id,
      libraryContentKey: searchResult.results[0].hits[0].usage_key,
    });
    // second one is subsection as per mock
    await user.click(addBtns[1]);
    expect(handleAddSubsectionFromLibrary.mutateAsync).toHaveBeenCalledWith({
      type: 'library_v2',
      category: 'sequential',
      parentLocator: lastSection.id,
      libraryContentKey: searchResult.results[0].hits[1].usage_key,
    });
    // third one is section as per mock
    await user.click(addBtns[2]);
    expect(handleAddSectionFromLibrary.mutateAsync).toHaveBeenCalledWith({
      type: 'library_v2',
      category: 'chapter',
      parentLocator: 'course-usage-key',
      libraryContentKey: searchResult.results[0].hits[2].usage_key,
    });
  });
});
