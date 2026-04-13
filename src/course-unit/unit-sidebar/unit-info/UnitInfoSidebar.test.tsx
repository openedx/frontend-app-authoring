import { fireEvent, initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';
import { getXBlockApiUrl } from '@src/course-outline/data/api';
import { useParams } from 'react-router-dom';
import { UnitSidebarProvider } from '../UnitSidebarContext';
import { UnitInfoSidebar } from './UnitInfoSidebar';

const subsectionId = 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@seq1';
const sectionId = 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@sec1';
const unitId = 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@unit1';

const unitData = {
  id: unitId,
  displayName: 'Unit Name',
  category: 'vertical',
  hasChanges: false,
  published: true,
  visibilityState: 'live',
  discussionEnabled: false,
  userPartitionInfo: {
    selectablePartitions: [],
    selectedPartitionIndex: -1,
    selectedGroups: [],
  },
  actions: {
    deletable: true, duplicable: true, draggable: false, childAddable: false,
  },
  upstreamInfo: null,
  ancestorInfo: {
    ancestors: [
      { id: subsectionId, category: 'sequential' },
      { id: sectionId, category: 'chapter' },
    ],
  },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@src/course-unit/data/selectors', () => ({
  ...jest.requireActual('@src/course-unit/data/selectors'),
  getCourseUnitData: jest.fn(),
  getCourseVerticalChildren: jest.fn(),
}));

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 'course-v1:UNIX+UX1+2025_T3',
  }),
}));

jest.mock('@src/course-unit/data/thunk', () => ({
  editCourseUnitVisibilityAndData: jest.fn(() => ({ type: 'mock' })),
  fetchCourseSectionVerticalData: jest.fn(() => ({ type: 'mock' })),
}));

jest.mock('@src/generic/unlink-modal', () => ({
  UnlinkModal: () => null,
  useUnlinkDownstream: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('@src/course-outline/data/apiHooks', () => ({
  ...jest.requireActual('@src/course-outline/data/apiHooks'),
  useDeleteCourseItem: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('@src/content-tags-drawer', () => ({
  ContentTagsSnippet: ({ contentId }: any) => <div>ContentTags:{contentId}</div>,
}));

jest.mock('@src/generic/block-type-utils', () => ({
  ...jest.requireActual('@src/generic/block-type-utils'),
  ComponentCountSnippet: ({ componentData }: any) => <div>ComponentCount: {JSON.stringify(componentData)}</div>,
  getItemIcon: () => () => null,
}));

jest.mock('@src/generic/configure-modal/UnitTab', () => ({
  AccessEditComponent: () => null,
  DiscussionEditComponent: () => null,
}));

jest.mock('./PublishControls', () => ({ __esModule: true, default: () => <div>PublishControls</div> }));

jest.mock('@src/course-unit/unit-sidebar/unit-info/GenericUnitInfoSettings', () => ({
  __esModule: true,
  GenericUnitInfoSettings: () => <div>GenericUnitInfoSettings</div>,
}));

jest.mock('../UnitSidebarContext', () => ({
  ...jest.requireActual('../UnitSidebarContext'),
  useUnitSidebarContext: jest.fn(),
}));

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const selectors = jest.requireMock('@src/course-unit/data/selectors') as any;
const unitSidebarContext = jest.requireMock('../UnitSidebarContext') as any;

const renderComponent = () => render(
  <IframeProvider>
    <UnitSidebarProvider readOnly={false}>
      <UnitInfoSidebar />
    </UnitSidebarProvider>
  </IframeProvider>,
  {
    path: '/course/:courseId',
    params: { courseId: 'course-v1:UNIX+UX1+2025_T3' },
  },
);

describe('<UnitInfoSidebar /> - rendering', () => {
  let axiosMock: any;

  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;

    mockUseParams.mockReturnValue({ blockId: unitId } as any);

    selectors.getCourseUnitData.mockReturnValue({
      ...unitData,
      displayName: 'Unit title',
      visibilityState: undefined,
      discussionEnabled: false,
      userPartitionInfo: null,
    });

    selectors.getCourseVerticalChildren.mockReturnValue({
      children: [
        { blockType: 'html' }, { blockType: 'problem' }, { blockType: 'html' },
      ],
    });

    axiosMock.onGet(getXBlockApiUrl(unitId)).reply(200, unitData);
    axiosMock.onGet(getXBlockApiUrl(subsectionId)).reply(200, { id: subsectionId, upstreamInfo: null });
  });

  it('renders title and details components and sets default tab', () => {
    const setCurrentTabKey = jest.fn();
    unitSidebarContext.useUnitSidebarContext.mockReturnValue({
      currentTabKey: 'details', setCurrentTabKey, isVertical: true,
    });

    renderComponent();

    expect(screen.getByText('Unit title')).toBeInTheDocument();
    expect(screen.getByText(/ComponentCount/)).toBeInTheDocument();
    expect(screen.getByText(`ContentTags:${unitId}`)).toBeInTheDocument();
    expect(setCurrentTabKey).toHaveBeenCalledWith('details');
  });

  it('renders settings tab content when active', () => {
    const setCurrentTabKey = jest.fn();
    unitSidebarContext.useUnitSidebarContext.mockReturnValue({
      currentTabKey: 'settings', setCurrentTabKey, isVertical: true,
    });

    renderComponent();

    expect(screen.getByText('GenericUnitInfoSettings')).toBeInTheDocument();
  });
});

describe('<UnitInfoSidebar /> - menu behavior', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let axiosMock: any;

  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;

    mockUseParams.mockReturnValue({ blockId: unitId } as any);
    selectors.getCourseUnitData.mockReturnValue(unitData);
    selectors.getCourseVerticalChildren.mockReturnValue({ children: [], isLoading: false });
    unitSidebarContext.useUnitSidebarContext.mockReturnValue({
      currentTabKey: 'details', setCurrentTabKey: jest.fn(), isVertical: true,
    });

    // InfoSidebarMenu calls useCourseItemData(itemId) internally and returns null if undefined.
    // Always mock the unit endpoint so the menu button renders.
    axiosMock.onGet(getXBlockApiUrl(unitId)).reply(200, unitData);
  });

  it('shows Delete when subsection has no upstreamRef', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getXBlockApiUrl(subsectionId)).reply(200, {
      id: subsectionId,
      upstreamInfo: null,
    });
    renderComponent();

    await screen.findByText(unitData.displayName);
    const menuToggle = await screen.findByRole('button', { name: 'Item Menu' });
    await user.click(menuToggle);

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('hides Delete when subsection has upstreamRef', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getXBlockApiUrl(subsectionId)).reply(200, {
      id: subsectionId,
      upstreamInfo: { upstreamRef: 'lb:org:lib:sequential:sub-id' },
    });
    renderComponent();

    await screen.findByText(unitData.displayName);
    const menuToggle = await screen.findByRole('button', { name: 'Item Menu' });
    await user.click(menuToggle);

    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('shows Delete when subsection data is not yet loaded', async () => {
    // No subsection mock — useCourseItemData returns undefined, so actions stay unmodified
    renderComponent();

    await screen.findByText(unitData.displayName);
    const menuToggle = await screen.findByRole('button', { name: 'Item Menu' });
    fireEvent.click(menuToggle);

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
