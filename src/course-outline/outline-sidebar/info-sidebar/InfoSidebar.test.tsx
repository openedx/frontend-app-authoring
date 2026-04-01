import { initializeMocks, render, screen } from '@src/testUtils';
import { getCourseSettingsApiUrl } from '@src/data/api';
import type { SelectionState } from '@src/data/types';
import { OutlineSidebarProvider } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { getXBlockApiUrl } from '@src/course-outline/data/api';
import userEvent from '@testing-library/user-event';
import { InfoSidebar } from './InfoSidebar';

let selectedContainerState: SelectionState | undefined;
jest.mock('@src/course-outline/outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual('@src/course-outline/outline-sidebar/OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    ...jest.requireActual('@src/course-outline/outline-sidebar/OutlineSidebarContext').useOutlineSidebarContext(),
    selectedContainerState,
  }),
}));

jest.mock('@src/course-outline/data/apiHooks', () => ({
  ...jest.requireActual('@src/course-outline/data/apiHooks'),
  useCourseDetails: () => ({
    data: { title: 'Course name' },
    isLoading: false,
  }),
}));

const courseId = '5';

const openPublishModal = jest.fn();
jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId,
    setCurrentSelection: jest.fn(),
    openPublishModal,
    getUnitUrl: jest.fn(),
  }),
}));

jest.mock('@src/search-manager', () => ({
  useGetBlockTypes: () => ({ data: [] }),
}));

const renderComponent = () => render(<InfoSidebar />, { extraWrapper: OutlineSidebarProvider });
let axiosMock;

describe('InfoSidebar component', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
  });

  it('renders InfoSidebar with course info if selectedContainerState is undefined', async () => {
    renderComponent();
    expect(await screen.findByText('Course name')).toBeInTheDocument();
  });

  it('shows the settings link for the course', async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.click((await screen.findByRole('tab', { name: 'Settings' })));
    const links = await screen.findAllByRole('link');
    expect(links).toHaveLength(5);
    expect(links[0]).toHaveTextContent('Schedule & details');
    expect(links[1]).toHaveTextContent('Grading');
    expect(links[2]).toHaveTextContent('Course team');
    expect(links[3]).toHaveTextContent('Group configurations');
    expect(links[4]).toHaveTextContent('Advanced settings');
  });

  it('shows the proctored exam settings link for the course if it exists', async () => {
    const user = userEvent.setup();
    const courseSettingsData = {
      mfeProctoredExamSettingsUrl: 'https://example.com/proctored-exam-settings',
    };
    axiosMock
      .onGet(getCourseSettingsApiUrl(courseId))
      .reply(200, courseSettingsData);
    renderComponent();
    await user.click(await screen.findByRole('tab', { name: 'Settings' }));
    expect(await screen.findByRole('link', { name: 'Proctored exam settings' })).toBeInTheDocument();
  });

  it('renders InfoSidebar with section info', async () => {
    const user = userEvent.setup();
    selectedContainerState = {
      currentId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@123',
    };
    const data = {
      id: selectedContainerState.currentId,
      displayName: 'section name',
      category: 'chapter',
      hasChanges: true,
    };
    axiosMock
      .onGet(getXBlockApiUrl(selectedContainerState.currentId))
      .reply(200, data);
    renderComponent();
    expect(await screen.findByText('section name')).toBeInTheDocument();
    expect(await screen.findByText('Section Content Summary')).toBeInTheDocument();
    const btn = await screen.findByRole('button', { name: 'Publish Changes (Draft)' });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(openPublishModal).toHaveBeenCalledWith({
      value: data,
      sectionId: data.id,
    });
  });

  it('renders InfoSidebar with subsection info', async () => {
    const user = userEvent.setup();
    selectedContainerState = {
      currentId: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@123',
      sectionId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@123',
    };
    const data = {
      id: selectedContainerState.currentId,
      displayName: 'subsection name',
      category: 'sequential',
      hasChanges: true,
    };
    axiosMock
      .onGet(getXBlockApiUrl(selectedContainerState.currentId))
      .reply(200, data);
    renderComponent();
    expect(await screen.findByText('subsection name')).toBeInTheDocument();
    expect(await screen.findByText('Subsection Content Summary')).toBeInTheDocument();
    const btn = await screen.findByRole('button', { name: 'Publish Changes (Draft)' });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(openPublishModal).toHaveBeenCalledWith({
      value: data,
      sectionId: selectedContainerState.sectionId,
    });
  });

  it('renders InfoSidebar with unit info', async () => {
    const user = userEvent.setup();
    selectedContainerState = {
      currentId: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@123',
      subsectionId: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@123',
      sectionId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@123',
    };
    const data = {
      id: selectedContainerState.currentId,
      displayName: 'unit name',
      category: 'vertical',
      hasChanges: true,
    };
    axiosMock
      .onGet(getXBlockApiUrl(selectedContainerState.currentId))
      .reply(200, data);
    renderComponent();
    expect(await screen.findByText('unit name')).toBeInTheDocument();
    expect(await screen.findByText('Unit Content Summary')).toBeInTheDocument();
    const btn = await screen.findByRole('button', { name: 'Publish Changes (Draft)' });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(openPublishModal).toHaveBeenCalledWith({
      value: data,
      subsectionId: selectedContainerState.subsectionId,
      sectionId: selectedContainerState.sectionId,
    });
  });
});
