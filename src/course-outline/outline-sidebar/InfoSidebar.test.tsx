import { InfoSidebar } from './InfoSidebar'
import { initializeMocks, render, screen } from '@src/testUtils'
import { SelectionState } from '@src/data/types';
import { OutlineSidebarProvider } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { getXBlockApiUrl } from '@src/course-outline/data/api';
import userEvent from '@testing-library/user-event';

let selectedContainerState: SelectionState | undefined = undefined;
jest.mock('../outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual('../outline-sidebar/OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    ...jest.requireActual('../outline-sidebar/OutlineSidebarContext').useOutlineSidebarContext(),
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

const openPublishModal = jest.fn();
jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 5,
    setCurrentSelection: jest.fn(),
    openPublishModal,
    getUnitUrl: jest.fn(),
  }),
}));

jest.mock('@src/search-manager', () => ({
  useGetBlockTypes: () => ({ data: [] }),
}));

const renderComponent = () => render(<InfoSidebar />, { extraWrapper: OutlineSidebarProvider});
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

  it('renders InfoSidebar with section info', async () => {
    const user = userEvent.setup();
    selectedContainerState = {
      currentId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@123'
    }
    const data = {
      id: selectedContainerState.currentId,
      displayName: 'section name',
      category: 'chapter',
      hasChanges: true,
    }
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
      sectionId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@123'
    }
    const data = {
      id: selectedContainerState.currentId,
      displayName: 'subsection name',
      category: 'sequential',
      hasChanges: true,
    }
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
      sectionId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@123'
    }
    const data = {
      id: selectedContainerState.currentId,
      displayName: 'unit name',
      category: 'vertical',
      hasChanges: true,
    }
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
