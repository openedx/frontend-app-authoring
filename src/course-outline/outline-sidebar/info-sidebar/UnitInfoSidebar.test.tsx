import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { UnitSidebar } from './UnitInfoSidebar';

// Mocks
jest.mock('@src/course-outline/data/apiHooks', () => ({
  useCourseItemData: jest.fn(),
  courseOutlineQueryKeys: { courseItemId: (id: string) => ['courseItem', id] },
}));

jest.mock('../OutlineSidebarContext', () => ({
  useOutlineSidebarContext: jest.fn(),
}));

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: jest.fn(),
}));

jest.mock('./PublishButon', () => ({ PublishButon: ({ onClick }: any) => <button type="button" onClick={onClick}>Publish</button> }));
jest.mock('./InfoSection', () => ({ InfoSection: ({ itemId }: any) => <div>InfoSection:{itemId}</div> }));
jest.mock('@src/course-unit/unit-sidebar/unit-info/GenericUnitInfoSettings', () => ({ GenericUnitInfoSettings: () => <div>GenericUnitInfoSettings</div> }));
jest.mock('@src/generic/block-type-utils', () => ({ getItemIcon: () => () => null }));
jest.mock('@src/course-unit/xblock-container-iframe', () => function XBlockIframe() {
  return <div>XBlockIframe</div>;
});
jest.mock('@src/generic/hooks/context/iFrameContext', () => ({ IframeProvider: ({ children }: any) => <div>{children}</div> }));

const apiHooks = jest.requireMock('@src/course-outline/data/apiHooks') as any;
const outlineContext = jest.requireMock('../OutlineSidebarContext') as any;
const authoring = jest.requireMock('@src/CourseAuthoringContext') as any;

describe('UnitSidebar', () => {
  beforeEach(() => {
    initializeMocks();
    outlineContext.useOutlineSidebarContext.mockReturnValue({ selectedContainerState: { sectionId: 's1', subsectionId: 'ss1' }, clearSelection: jest.fn() });
    authoring.useCourseAuthoringContext.mockReturnValue({ openPublishModal: jest.fn(), getUnitUrl: (id: string) => `/unit/${id}`, courseId: '5' });
  });

  it('renders title and info tab by default', () => {
    apiHooks.useCourseItemData.mockReturnValue({
      data: {
        displayName: 'Unit 1', hasChanges: false, category: 'vertical', id: 'unit-1',
      },
      isPending: false,
    });
    render(<UnitSidebar unitId="unit-1" />);
    expect(screen.getByText('Unit 1')).toBeInTheDocument();
    expect(screen.getByText('InfoSection:unit-1')).toBeInTheDocument();
  });

  it('shows publish button and triggers openPublishModal when unit has changes', async () => {
    const user = userEvent.setup();
    const openPublishModal = jest.fn();
    authoring.useCourseAuthoringContext.mockReturnValue({ openPublishModal, getUnitUrl: (id: string) => `/unit/${id}`, courseId: '5' });
    apiHooks.useCourseItemData.mockReturnValue({
      data: {
        displayName: 'Unit 2', hasChanges: true, category: 'vertical', id: 'unit-2',
      },
      isPending: false,
    });

    render(<UnitSidebar unitId="unit-2" />);
    expect(screen.getByText('Publish')).toBeInTheDocument();
    await user.click(screen.getByText('Publish'));
    expect(openPublishModal).toHaveBeenCalledWith({ value: expect.any(Object), sectionId: 's1', subsectionId: 'ss1' });
  });

  it('switches to preview tab and shows iframe', async () => {
    const user = userEvent.setup();
    apiHooks.useCourseItemData.mockReturnValue({
      data: {
        displayName: 'Unit 3', hasChanges: false, category: 'vertical', id: 'unit-3',
      },
      isPending: false,
    });
    render(<UnitSidebar unitId="unit-3" />);
    await user.click(screen.getByRole('tab', { name: /Preview/i }));
    expect(screen.getByText('XBlockIframe')).toBeInTheDocument();
  });

  it('shows settings tab content when selected', async () => {
    const user = userEvent.setup();
    apiHooks.useCourseItemData.mockReturnValue({
      data: {
        displayName: 'Unit 4', hasChanges: false, category: 'vertical', id: 'unit-4', visibilityState: undefined, discussionEnabled: false, userPartitionInfo: null,
      },
      isPending: false,
    });
    render(<UnitSidebar unitId="unit-4" />);
    await user.click(screen.getByRole('tab', { name: /Settings/i }));
    expect(screen.getByText('GenericUnitInfoSettings')).toBeInTheDocument();
  });
});
