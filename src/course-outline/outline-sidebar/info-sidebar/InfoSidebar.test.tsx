import { fireEvent, initializeMocks, render, screen } from '@src/testUtils';
import { SelectionState } from '@src/data/types';
import { OutlineSidebarProvider } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { getXBlockApiUrl } from '@src/course-outline/data/api';
import userEvent from '@testing-library/user-event';
import { getDownstreamApiUrl } from '@src/generic/unlink-modal/data/api';
import { InfoSidebar } from './InfoSidebar';

let selectedContainerState: SelectionState | undefined;
jest.mock('@src/course-outline/outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual('@src/course-outline/outline-sidebar/OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    ...jest.requireActual('@src/course-outline/outline-sidebar/OutlineSidebarContext').useOutlineSidebarContext(),
    selectedContainerState,
    clearSelection: jest.fn(),
    setSelectedContainerState: jest.fn(),
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
const openDeleteModal = jest.fn();
const openUnlinkModal = jest.fn();
const handleDuplicateSectionSubmit = jest.fn();
const handleDuplicateUnitSubmit = jest.fn();
const handleDuplicateSubsectionSubmit = jest.fn();
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 5,
    setCurrentSelection: jest.fn(),
    openPublishModal,
    openDeleteModal,
    openUnlinkModal,
    handleDuplicateUnitSubmit,
    getUnitUrl: jest.fn(),
    sections: [],
    updateUnitOrderByIndex: jest.fn(),
    handleDuplicateSectionSubmit,
    updateSectionOrderByIndex: jest.fn(),
    handleDuplicateSubsectionSubmit,
    updateSubsectionOrderByIndex: jest.fn(),
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
    openDeleteModal.mockClear();
    openUnlinkModal.mockClear();
    handleDuplicateSectionSubmit.mockClear();
    handleDuplicateUnitSubmit.mockClear();
    handleDuplicateSubsectionSubmit.mockClear();
    mockedNavigate.mockClear();
  });

  it('renders InfoSidebar with course info if selectedContainerState is undefined', async () => {
    renderComponent();
    expect(await screen.findByText('Course name')).toBeInTheDocument();
  });

  it('renders InfoSidebar with section info', async () => {
    const user = userEvent.setup();
    selectedContainerState = {
      currentId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@123',
      sectionId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@123',
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
      subsectionId: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@123',
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

  describe('UnitSidebar menus', () => {
    const unitId = 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@unit1';
    const upstreamRef = 'lb:org:lib:vertical:unit-id';

    const unitData = {
      id: unitId,
      displayName: 'unit name',
      category: 'vertical',
      hasChanges: false,
      actions: { deletable: true, duplicable: true, draggable: false },
      upstreamInfo: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderUnitMenu = async (data: any = unitData) => {
      selectedContainerState = {
        currentId: unitId,
        subsectionId: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@seq1',
        sectionId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@ch1',
      };
      axiosMock.onGet(getXBlockApiUrl(unitId)).reply(200, data);
      renderComponent();
      await screen.findByText(data.displayName);
      await screen.findByRole('button', { name: 'Item Menu' });
    };

    it('calls openDeleteModal when Delete is clicked in unit menu', async () => {
      const user = userEvent.setup();
      await renderUnitMenu();

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const deleteBtn = await screen.findByText('Delete');
      await user.click(deleteBtn);

      expect(openDeleteModal).toHaveBeenCalled();
    });

    it('calls handleDuplicateUnitSubmit when Duplicate is clicked in unit menu', async () => {
      const user = userEvent.setup();
      await renderUnitMenu();

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const duplicateBtn = await screen.findByText('Duplicate');
      await user.click(duplicateBtn);

      expect(handleDuplicateUnitSubmit).toHaveBeenCalled();
    });

    it('calls openUnlinkModal when Unlink is clicked in unit menu', async () => {
      const user = userEvent.setup();
      const unitWithUpstream = {
        ...unitData,
        actions: { ...unitData.actions, unlinkable: true },
        upstreamInfo: { upstreamRef },
      };
      await renderUnitMenu(unitWithUpstream);

      axiosMock.onDelete(getDownstreamApiUrl(unitId)).reply(200, {});

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const unlinkBtn = await screen.findByText('Unlink from Library');
      await user.click(unlinkBtn);

      expect(openUnlinkModal).toHaveBeenCalledWith(expect.objectContaining({
        value: unitWithUpstream,
        sectionId: selectedContainerState?.sectionId,
        subsectionId: selectedContainerState?.subsectionId,
      }));
    });

    it('navigates to library when View in Library is clicked in unit menu', async () => {
      const user = userEvent.setup();
      const unitWithUpstream = {
        ...unitData,
        upstreamInfo: { upstreamRef },
      };
      await renderUnitMenu(unitWithUpstream);

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const viewLibBtn = await screen.findByText('View in Library');
      await user.click(viewLibBtn);

      expect(mockedNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/library/'),
      );
    });
  });

  describe('SubsectionSidebar menus', () => {
    const subsectionId = 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@sub1';
    const upstreamRef = 'lb:org:lib:sequential:sub-id';

    const subsectionData = {
      id: subsectionId,
      displayName: 'subsection name',
      category: 'sequential',
      hasChanges: false,
      actions: { deletable: true, duplicable: true, draggable: false },
      upstreamInfo: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderSubsectionMenu = async (data: any = subsectionData) => {
      selectedContainerState = {
        currentId: subsectionId,
        subsectionId,
        sectionId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@ch1',
      };
      axiosMock.onGet(getXBlockApiUrl(subsectionId)).reply(200, data);
      renderComponent();
      await screen.findByText(data.displayName);
      await screen.findByRole('button', { name: 'Item Menu' });
    };

    it('calls openDeleteModal when Delete is clicked in subsection menu', async () => {
      const user = userEvent.setup();
      await renderSubsectionMenu();

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const deleteBtn = await screen.findByText('Delete');
      await user.click(deleteBtn);

      expect(openDeleteModal).toHaveBeenCalled();
    });

    it('calls handleDuplicateSubsectionSubmit when Duplicate is clicked in subsection menu', async () => {
      const user = userEvent.setup();
      await renderSubsectionMenu();

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const duplicateBtn = await screen.findByText('Duplicate');
      await user.click(duplicateBtn);

      expect(handleDuplicateSubsectionSubmit).toHaveBeenCalled();
    });

    it('calls openUnlinkModal when Unlink is clicked in subsection menu', async () => {
      const user = userEvent.setup();
      const subsectionWithUpstream = {
        ...subsectionData,
        actions: { ...subsectionData.actions, unlinkable: true },
        upstreamInfo: { upstreamRef },
      };
      await renderSubsectionMenu(subsectionWithUpstream);

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const unlinkBtn = await screen.findByText('Unlink from Library');
      await user.click(unlinkBtn);

      expect(openUnlinkModal).toHaveBeenCalledWith(expect.objectContaining({
        value: subsectionWithUpstream,
        sectionId: selectedContainerState?.sectionId,
      }));
    });

    it('navigates to library when View in Library is clicked in subsection menu', async () => {
      const user = userEvent.setup();
      const subsectionWithUpstream = {
        ...subsectionData,
        upstreamInfo: { upstreamRef },
      };
      await renderSubsectionMenu(subsectionWithUpstream);

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const viewLibBtn = await screen.findByText('View in Library');
      await user.click(viewLibBtn);

      expect(mockedNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/library/'),
      );
    });
  });

  describe('SectionSidebar menus', () => {
    const sectionId = 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@sec1';
    const upstreamRef = 'lb:org:lib:chapter:sec-id';

    const sectionData = {
      id: sectionId,
      displayName: 'section name',
      category: 'chapter',
      hasChanges: false,
      actions: { deletable: true, duplicable: true, draggable: false },
      upstreamInfo: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderSectionMenu = async (data: any = sectionData) => {
      selectedContainerState = {
        currentId: sectionId,
        sectionId,
      };
      axiosMock.onGet(getXBlockApiUrl(sectionId)).reply(200, data);
      renderComponent();
      await screen.findByText(data.displayName);
      await screen.findByRole('button', { name: 'Item Menu' });
    };

    it('calls openDeleteModal when Delete is clicked in section menu', async () => {
      const user = userEvent.setup();
      await renderSectionMenu();

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const deleteBtn = await screen.findByText('Delete');
      await user.click(deleteBtn);

      expect(openDeleteModal).toHaveBeenCalled();
    });

    it('calls handleDuplicateSectionSubmit when Duplicate is clicked in section menu', async () => {
      const user = userEvent.setup();
      await renderSectionMenu();

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const duplicateBtn = await screen.findByText('Duplicate');
      await user.click(duplicateBtn);

      expect(handleDuplicateSectionSubmit).toHaveBeenCalled();
    });

    it('calls openUnlinkModal when Unlink is clicked in section menu', async () => {
      const user = userEvent.setup();
      const sectionWithUpstream = {
        ...sectionData,
        actions: { ...sectionData.actions, unlinkable: true },
        upstreamInfo: { upstreamRef },
      };
      await renderSectionMenu(sectionWithUpstream);

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const unlinkBtn = await screen.findByText('Unlink from Library');
      await user.click(unlinkBtn);

      expect(openUnlinkModal).toHaveBeenCalledWith(expect.objectContaining({
        value: sectionWithUpstream,
        sectionId,
      }));
    });

    it('navigates to library when View in Library is clicked in section menu', async () => {
      const user = userEvent.setup();
      const sectionWithUpstream = {
        ...sectionData,
        upstreamInfo: { upstreamRef },
      };
      await renderSectionMenu(sectionWithUpstream);

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const viewLibBtn = await screen.findByText('View in Library');
      await user.click(viewLibBtn);

      expect(mockedNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/library/'),
      );
    });
  });
});