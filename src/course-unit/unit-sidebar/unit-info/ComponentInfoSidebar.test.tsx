import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { getXBlockApiUrl } from '@src/course-outline/data/api';
import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';
import { UnitSidebarProvider } from '../UnitSidebarContext';
import { ComponentInfoSidebar } from './ComponentInfoSidebar';
import * as UnitSidebarContextModule from '../UnitSidebarContext';

const componentId = 'block-v1:UNIX+UX1+2025_T3+type@problem+block@comp1';
const unitId = 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@unit1';
const sectionId = 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@sec1';

const baseUnitData = {
  id: unitId,
  displayName: 'Unit Name',
  upstreamInfo: null,
  ancestorInfo: {
    ancestors: [
      { id: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@seq1', category: 'sequential' },
      { id: sectionId, category: 'chapter' },
    ],
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockUnitData: any = baseUnitData;

const componentData = {
  id: componentId,
  displayName: 'Component Name',
  category: 'problem',
  actions: {
    deletable: true,
    duplicable: true,
    draggable: true,
    childAddable: false,
  },
  upstreamInfo: null,
};

jest.mock('@src/course-unit/data/selectors', () => ({
  ...jest.requireActual('@src/course-unit/data/selectors'),
  getCourseUnitData: () => mockUnitData,
  getMovedXBlockParams: () => ({ isSuccess: false, sourceLocator: null }),
}));

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 'course-v1:UNIX+UX1+2025_T3',
  }),
}));

jest.mock('@src/generic/unlink-modal', () => ({
  UnlinkModal: () => null,
  useUnlinkDownstream: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('@src/generic/clipboard', () => ({
  useClipboard: () => ({ copyToClipboard: jest.fn() }),
}));

jest.mock('@src/content-tags-drawer', () => ({
  ContentTagsSnippet: () => null,
}));

jest.mock('@src/generic/library-reference-card/LibraryReferenceCard', () => ({
  LibraryReferenceCard: () => null,
}));

jest.mock('@src/course-unit/data/thunk', () => ({
  deleteUnitItemQuery: jest.fn(() => ({ type: 'mock' })),
  duplicateUnitItemQuery: jest.fn(() => ({ type: 'mock' })),
  fetchCourseVerticalChildrenData: jest.fn(() => ({ type: 'mock' })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const mockSidebarContext = {
  selectedComponentId: componentId,
  setCurrentPageKey: jest.fn(),
  currentPageKey: 'info' as const,
  currentTabKey: undefined,
  setCurrentTabKey: jest.fn(),
  setSelectedComponentId: jest.fn(),
  isOpen: true,
  open: jest.fn(),
  toggle: jest.fn(),
  readOnly: false,
};

const renderComponent = () =>
  render(
    <IframeProvider>
      <UnitSidebarProvider readOnly={false}>
        <ComponentInfoSidebar />
      </UnitSidebarProvider>
    </IframeProvider>,
    {
      path: '/course/:courseId',
      params: { courseId: 'course-v1:UNIX+UX1+2025_T3' },
    },
  );

describe('<ComponentInfoSidebar />', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let axiosMock: any;

  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockUnitData = baseUnitData;
    jest
      .spyOn(UnitSidebarContextModule, 'useUnitSidebarContext')
      .mockReturnValue(mockSidebarContext);
  });

  it('renders Loading when component data is not yet available', () => {
    // No axios mock for componentId — useCourseItemData returns undefined
    renderComponent();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows Delete and Duplicate when unit has no upstreamRef', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getXBlockApiUrl(componentId)).reply(200, componentData);
    renderComponent();

    await screen.findByText(componentData.displayName);
    const menuToggle = await screen.findByRole('button', { name: 'Item Menu' });
    await user.click(menuToggle);

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
  });

  it('hides Delete and Duplicate when unit has upstreamRef', async () => {
    const user = userEvent.setup();
    mockUnitData = { ...baseUnitData, upstreamInfo: { upstreamRef: 'lb:org:lib:vertical:unit-id' } };
    axiosMock.onGet(getXBlockApiUrl(componentId)).reply(200, componentData);
    renderComponent();

    await screen.findByText(componentData.displayName);
    const menuToggle = await screen.findByRole('button', { name: 'Item Menu' });
    await user.click(menuToggle);

    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(screen.queryByText('Duplicate')).not.toBeInTheDocument();
  });
});
