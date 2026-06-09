import { fireEvent, initializeMocks, render, screen } from '@src/testUtils';
import { getCourseSettingsApiUrl } from '@src/data/api';
import type { SelectionState } from '@src/data/types';
import { CourseOutlineProvider } from '@src/course-outline/CourseOutlineContext';
import { OutlineSidebarProvider } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { getXBlockApiUrl } from '@src/course-outline/data/api';
import userEvent from '@testing-library/user-event';
import { InfoSidebar } from './InfoSidebar';

const mockDuplicateItem = { mutate: jest.fn() };
let selectedContainerState: SelectionState | undefined;
const mockClearSelection = jest.fn();
jest.mock('@src/course-outline/outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual('@src/course-outline/outline-sidebar/OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    ...jest.requireActual('@src/course-outline/outline-sidebar/OutlineSidebarContext').useOutlineSidebarContext(),
    selectedContainerState,
    clearSelection: mockClearSelection,
    setSelectedContainerState: mockSetSelectedContainerState,
    openContainerInfoSidebar: mockOpenContainerInfoSidebar,
  }),
}));

jest.mock('@src/course-outline/data/apiHooks', () => ({
  ...jest.requireActual('@src/course-outline/data/apiHooks'),
  useCourseDetails: () => ({
    data: { title: 'Course name' },
    isLoading: false,
  }),
  useDuplicateItem: jest.fn(() => mockDuplicateItem),
}));

const courseId = '5';

const openPublishModal = jest.fn();
const openDeleteModal = jest.fn();
const openUnlinkModal = jest.fn();

const mockedNavigate = jest.fn();
const commitSectionReorder = jest.fn();
const commitSubsectionReorder = jest.fn();
const commitUnitReorder = jest.fn();
const previewSections = jest.fn();
const mockSetSelectedContainerState = jest.fn();
const mockOpenContainerInfoSidebar = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockSections: any[] = [];

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId,
    openUnlinkModal,
    getUnitUrl: jest.fn(),
  }),
}));

jest.mock('@src/course-outline/CourseOutlineContext', () => {
  // Lazy getters avoid 'Cannot access before initialization' with hoisted jest.mock
  const mock = () => ({
    sections: mockSections,
    setSections: jest.fn(),
    restoreSectionList: jest.fn(),
    commitUnitReorder,
    commitSubsectionReorder,
    commitSectionReorder,
    previewSections,
    setActionTargetSelection: jest.fn(),
    openPublishModal,
    openDeleteModal,
    duplicateSection: (...args) => mockDuplicateItem.mutate(...args),
    duplicateSubsection: (...args) => mockDuplicateItem.mutate(...args),
    duplicateUnit: (...args) => mockDuplicateItem.mutate(...args),
  });
  return {
    ...jest.requireActual('@src/course-outline/CourseOutlineContext'),
    useCourseOutlineContext: jest.fn(mock),
  };
});

jest.mock('@src/search-manager', () => ({
  useGetBlockTypes: () => ({ data: [] }),
}));

const renderComponent = () =>
  render(<InfoSidebar />, {
    extraWrapper: ({ children }) => (
      <CourseOutlineProvider>
        <OutlineSidebarProvider>
          {children}
        </OutlineSidebarProvider>
      </CourseOutlineProvider>
    ),
  });
let axiosMock;

interface SidebarMenuConfig {
  /** Level name for test descriptions: 'Section', 'Subsection', 'Unit'. */
  level: string;
  /** Default data returned by the xblock API for this level. */
  defaultData: Record<string, unknown>;
  /** selectedContainerState for this level. */
  containerState: SelectionState;
  /** The upstreamRef value for unlink/view tests. */
  upstreamRef: string;
}

/**
 * Parameterized helper that generates the 4 common sidebar menu tests
 * (delete, duplicate, unlink, view in library) for each level.
 */
function describeSidebarMenus(config: SidebarMenuConfig): void {
  const levelLower = config.level.toLowerCase();
  const renderMenu = async (data: Record<string, unknown> = config.defaultData) => {
    selectedContainerState = config.containerState;
    axiosMock.onGet(getXBlockApiUrl(config.containerState.currentId!)).reply(200, data);
    renderComponent();
    await screen.findByText(data.displayName as string);
    await screen.findByRole('button', { name: 'Item Menu' });
  };

  describe(`${config.level}Sidebar menus`, () => {
    beforeEach(() => {
      openDeleteModal.mockClear();
      mockDuplicateItem.mutate.mockClear();
    });

    it(`calls openDeleteModal when Delete is clicked in ${levelLower} menu`, async () => {
      const user = userEvent.setup();
      await renderMenu();

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const deleteBtn = await screen.findByText('Delete');
      await user.click(deleteBtn);

      expect(openDeleteModal).toHaveBeenCalled();
    });

    it(`calls duplicate when Duplicate is clicked in ${levelLower} menu`, async () => {
      const user = userEvent.setup();
      await renderMenu();

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const duplicateBtn = await screen.findByText('Duplicate');
      await user.click(duplicateBtn);

      expect(mockDuplicateItem.mutate).toHaveBeenCalled();
    });

    it(`calls openUnlinkModal when Unlink is clicked in ${levelLower} menu`, async () => {
      const user = userEvent.setup();
      const withUpstream = {
        ...config.defaultData,
        actions: { ...(config.defaultData.actions as Record<string, unknown> || {}), unlinkable: true },
        upstreamInfo: { upstreamRef: config.upstreamRef },
      };
      await renderMenu(withUpstream);

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const unlinkBtn = await screen.findByText('Unlink from Library');
      await user.click(unlinkBtn);

      expect(openUnlinkModal).toHaveBeenCalledWith(
        expect.objectContaining({
          value: withUpstream,
          sectionId: config.containerState.sectionId,
        }),
      );
    });

    it(`navigates to library when View in Library is clicked in ${levelLower} menu`, async () => {
      const user = userEvent.setup();
      const withUpstream = {
        ...config.defaultData,
        upstreamInfo: { upstreamRef: config.upstreamRef },
      };
      await renderMenu(withUpstream);

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const viewLibBtn = await screen.findByText('View in Library');
      await user.click(viewLibBtn);

      expect(mockedNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/library/'),
      );
    });
  });
}

describe('InfoSidebar component', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    openDeleteModal.mockClear();
    openUnlinkModal.mockClear();
    mockDuplicateItem.mutate.mockClear();

    mockedNavigate.mockClear();
    commitUnitReorder.mockClear();
    commitSubsectionReorder.mockClear();
    commitSectionReorder.mockClear();
    previewSections.mockClear();
    mockSetSelectedContainerState.mockClear();
    mockOpenContainerInfoSidebar.mockClear();
    mockClearSelection.mockClear();
    mockSections = [];
  });

  it('renders InfoSidebar with course info if selectedContainerState is undefined', async () => {
    renderComponent();
    expect(await screen.findByText('Course name')).toBeInTheDocument();
  });

  it('shows the settings link for the course', async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.click(await screen.findByRole('tab', { name: 'Settings' }));
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
    // The Details tab is not active by default (preview is); click it to load its content
    await user.click(screen.getByRole('tab', { name: /Details/i }));
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

  describeSidebarMenus({
    level: 'Section',
    defaultData: {
      id: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@sec1',
      displayName: 'section name',
      category: 'chapter',
      hasChanges: false,
      actions: { deletable: true, duplicable: true, draggable: false },
      upstreamInfo: null,
    },
    containerState: {
      currentId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@sec1',
      sectionId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@sec1',
    },
    upstreamRef: 'lb:org:lib:chapter:sec-id',
  });

  describeSidebarMenus({
    level: 'Subsection',
    defaultData: {
      id: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@sub1',
      displayName: 'subsection name',
      category: 'sequential',
      hasChanges: false,
      actions: { deletable: true, duplicable: true, draggable: false },
      upstreamInfo: null,
    },
    containerState: {
      currentId: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@sub1',
      subsectionId: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@sub1',
      sectionId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@ch1',
    },
    upstreamRef: 'lb:org:lib:sequential:sub-id',
  });

  describeSidebarMenus({
    level: 'Unit',
    defaultData: {
      id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@unit1',
      displayName: 'unit name',
      category: 'vertical',
      hasChanges: false,
      actions: { deletable: true, duplicable: true, draggable: false },
      upstreamInfo: null,
    },
    containerState: {
      currentId: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@unit1',
      subsectionId: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@seq1',
      sectionId: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@ch1',
    },
    upstreamRef: 'lb:org:lib:vertical:unit-id',
  });

  describe('UnitSidebar menus', () => {
    const unitId = 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@unit1';
    const seqId = 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@seq1';
    const chId = 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@ch1';

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
        subsectionId: seqId,
        sectionId: chId,
      };
      axiosMock.onGet(getXBlockApiUrl(unitId)).reply(200, data);
      renderComponent();
      await screen.findByText(data.displayName);
      await screen.findByRole('button', { name: 'Item Menu' });
    };

    it('copies location ID to clipboard when Copy Location is clicked', async () => {
      const user = userEvent.setup();
      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      });
      await renderUnitMenu();

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const copyLocationBtn = await screen.findByText('Copy Location ID');
      await user.click(copyLocationBtn);

      expect(writeText).toHaveBeenCalledWith('unit1');
    });

    describe('handleMove', () => {
      const draggableUnitData = {
        ...unitData,
        actions: { ...unitData.actions, draggable: true },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const makeMovableUnit = (id: string): any => ({
        id,
        category: 'vertical',
        actions: { draggable: true },
        childInfo: { children: [] },
      });

      const renderDraggableUnitMenu = async () => {
        mockSections = [{
          id: chId,
          childInfo: {
            children: [{
              id: seqId,
              childInfo: {
                children: [
                  makeMovableUnit('block-v1:UNIX+UX1+2025_T3+type@vertical+block@unit0'),
                  makeMovableUnit(unitId),
                  makeMovableUnit('block-v1:UNIX+UX1+2025_T3+type@vertical+block@unit2'),
                ],
              },
            }],
          },
        }];
        selectedContainerState = {
          currentId: unitId,
          subsectionId: seqId,
          sectionId: chId,
          index: 1,
        };
        axiosMock.onGet(getXBlockApiUrl(unitId)).reply(200, draggableUnitData);
        axiosMock.onGet(getXBlockApiUrl(chId)).reply(200, mockSections[0]);
        axiosMock.onGet(getXBlockApiUrl(seqId)).reply(200, mockSections[0].childInfo.children[0]);
        renderComponent();
        await screen.findByText(draggableUnitData.displayName);
        await screen.findByRole('button', { name: 'Item Menu' });
      };

      it('calls commitUnitReorder and setSelectedContainerState when Move Up is clicked', async () => {
        const user = userEvent.setup();
        await renderDraggableUnitMenu();

        const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
        fireEvent.click(menuToggle);

        const moveUpBtn = await screen.findByText('Move Up');
        await user.click(moveUpBtn);

        expect(previewSections).toHaveBeenCalled();
        expect(commitUnitReorder).toHaveBeenCalled();
        expect(mockSetSelectedContainerState).toHaveBeenCalledWith(
          expect.objectContaining({ index: 0, subsectionId: seqId, sectionId: chId }),
        );
      });

      it('calls commitUnitReorder and setSelectedContainerState when Move Down is clicked', async () => {
        const user = userEvent.setup();
        await renderDraggableUnitMenu();

        const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
        fireEvent.click(menuToggle);

        const moveDownBtn = await screen.findByText('Move Down');
        await user.click(moveDownBtn);

        expect(previewSections).toHaveBeenCalled();
        expect(commitUnitReorder).toHaveBeenCalled();
        expect(mockSetSelectedContainerState).toHaveBeenCalledWith(
          expect.objectContaining({ index: 2, subsectionId: seqId, sectionId: chId }),
        );
      });
    });

    it('hides Delete and Duplicate when subsection has upstreamRef', async () => {
      const user = userEvent.setup();
      selectedContainerState = {
        currentId: unitId,
        subsectionId: seqId,
        sectionId: chId,
      };
      axiosMock.onGet(getXBlockApiUrl(unitId)).reply(200, unitData);
      axiosMock.onGet(getXBlockApiUrl(seqId)).reply(200, {
        id: seqId,
        upstreamInfo: { upstreamRef: 'lb:org:lib:sequential:sub-id' },
      });
      renderComponent();
      await screen.findByText(unitData.displayName);
      const menuToggle = await screen.findByRole('button', { name: 'Item Menu' });
      await user.click(menuToggle);

      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
      expect(screen.queryByText('Duplicate')).not.toBeInTheDocument();
    });
  });

  describe('SubsectionSidebar menus', () => {
    const subsectionId = 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@sub1';
    const chId = 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@ch1';
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

    it('goes back to parent section with section index', async () => {
      const user = userEvent.setup();
      mockSections = [{
        id: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@ch1',
        actions: { childAddable: true },
        upstreamInfo: null,
        childInfo: { children: [] },
      }];
      await renderSubsectionMenu();

      await user.click(screen.getByRole('button', { name: /back/i }));

      expect(mockOpenContainerInfoSidebar).toHaveBeenCalledWith(
        'block-v1:UNIX+UX1+2025_T3+type@chapter+block@ch1',
        undefined,
        'block-v1:UNIX+UX1+2025_T3+type@chapter+block@ch1',
        0,
      );
    });

    it('calls openDeleteModal when Delete is clicked in subsection menu', async () => {
      const user = userEvent.setup();
      await renderSubsectionMenu();

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const deleteBtn = await screen.findByText('Delete');
      await user.click(deleteBtn);

      expect(openDeleteModal).toHaveBeenCalled();
    });

    it('calls mockDuplicateItem.mutate when Duplicate is clicked in subsection menu', async () => {
      const user = userEvent.setup();
      await renderSubsectionMenu();

      const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
      fireEvent.click(menuToggle);

      const duplicateBtn = await screen.findByText('Duplicate');
      await user.click(duplicateBtn);

      expect(mockDuplicateItem.mutate).toHaveBeenCalled();
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

    describe('handleMove', () => {
      const draggableSubsectionData = {
        ...subsectionData,
        actions: { ...subsectionData.actions, draggable: true },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const makeMovableSubsection = (id: string): any => ({
        id,
        category: 'sequential',
        actions: { draggable: true, childAddable: true },
        childInfo: { children: [] },
      });

      const renderDraggableSubsectionMenu = async () => {
        mockSections = [{
          id: chId,
          actions: { childAddable: true },
          upstreamInfo: null,
          childInfo: {
            children: [
              makeMovableSubsection('block-v1:UNIX+UX1+2025_T3+type@sequential+block@sub0'),
              makeMovableSubsection(subsectionId),
              makeMovableSubsection('block-v1:UNIX+UX1+2025_T3+type@sequential+block@sub2'),
            ],
          },
        }];
        selectedContainerState = {
          currentId: subsectionId,
          subsectionId,
          sectionId: chId,
          index: 1,
        };
        axiosMock.onGet(getXBlockApiUrl(subsectionId)).reply(200, draggableSubsectionData);
        axiosMock.onGet(getXBlockApiUrl(chId)).reply(200, mockSections[0]);
        renderComponent();
        await screen.findByText(draggableSubsectionData.displayName);
        await screen.findByRole('button', { name: 'Item Menu' });
      };

      it('calls commitSubsectionReorder and setSelectedContainerState when Move Up is clicked', async () => {
        const user = userEvent.setup();
        await renderDraggableSubsectionMenu();

        const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
        fireEvent.click(menuToggle);

        const moveUpBtn = await screen.findByText('Move Up');
        await user.click(moveUpBtn);

        expect(previewSections).toHaveBeenCalled();
        expect(commitSubsectionReorder).toHaveBeenCalled();
        expect(mockSetSelectedContainerState).toHaveBeenCalledWith(
          expect.objectContaining({ index: 0, sectionId: chId }),
        );
      });

      it('calls commitSubsectionReorder and setSelectedContainerState when Move Down is clicked', async () => {
        const user = userEvent.setup();
        await renderDraggableSubsectionMenu();

        const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
        fireEvent.click(menuToggle);

        const moveDownBtn = await screen.findByText('Move Down');
        await user.click(moveDownBtn);

        expect(previewSections).toHaveBeenCalled();
        expect(commitSubsectionReorder).toHaveBeenCalled();
        expect(mockSetSelectedContainerState).toHaveBeenCalledWith(
          expect.objectContaining({ index: 2, sectionId: chId }),
        );
      });
    });
  });

  describe('SectionSidebar menus', () => {
    const sectionId = 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@sec1';

    const sectionData = {
      id: sectionId,
      displayName: 'section name',
      category: 'chapter',
      hasChanges: false,
      actions: { deletable: true, duplicable: true, draggable: false },
      upstreamInfo: null,
    };

    describe('handleMove', () => {
      const draggableSectionData = {
        ...sectionData,
        actions: { ...sectionData.actions, draggable: true },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const makeMovableSection = (id: string): any => ({
        id,
        actions: { draggable: true },
        childInfo: { children: [] },
      });

      const renderDraggableSectionMenu = async () => {
        mockSections = [
          makeMovableSection('sec0'),
          makeMovableSection(sectionId),
          makeMovableSection('sec2'),
        ];
        selectedContainerState = {
          currentId: sectionId,
          sectionId,
          index: 1,
        };
        axiosMock.onGet(getXBlockApiUrl(sectionId)).reply(200, draggableSectionData);
        renderComponent();
        await screen.findByText(draggableSectionData.displayName);
        await screen.findByRole('button', { name: 'Item Menu' });
      };

      it('renders Move Up/Down as disabled when index is undefined', async () => {
        mockSections = [makeMovableSection(sectionId)];
        selectedContainerState = { currentId: sectionId, sectionId };
        axiosMock.onGet(getXBlockApiUrl(sectionId)).reply(200, draggableSectionData);
        renderComponent();
        await screen.findByText(draggableSectionData.displayName);

        const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
        fireEvent.click(menuToggle);

        expect(await screen.findByText('Move Up')).toBeInTheDocument();
        expect(screen.getByText('Move Down')).toBeInTheDocument();
      });

      it('calls commitSectionReorder and setSelectedContainerState when Move Up is clicked', async () => {
        const user = userEvent.setup();
        await renderDraggableSectionMenu();

        const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
        fireEvent.click(menuToggle);

        const moveUpBtn = await screen.findByText('Move Up');
        await user.click(moveUpBtn);

        expect(previewSections).toHaveBeenCalled();
        expect(commitSectionReorder).toHaveBeenCalled();
        expect(mockSetSelectedContainerState).toHaveBeenCalledWith(
          expect.objectContaining({ index: 0 }),
        );
      });

      it('calls commitSectionReorder and setSelectedContainerState when Move Down is clicked', async () => {
        const user = userEvent.setup();
        await renderDraggableSectionMenu();

        const menuToggle = screen.getByRole('button', { name: 'Item Menu' });
        fireEvent.click(menuToggle);

        const moveDownBtn = await screen.findByText('Move Down');
        await user.click(moveDownBtn);

        expect(previewSections).toHaveBeenCalled();
        expect(commitSectionReorder).toHaveBeenCalled();
        expect(mockSetSelectedContainerState).toHaveBeenCalledWith(
          expect.objectContaining({ index: 2 }),
        );
      });
    });
  });
});
