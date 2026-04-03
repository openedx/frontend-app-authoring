import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';
import { initializeMocks, render, screen } from '@src/testUtils';
import { useParams } from 'react-router-dom';
import { UnitInfoSidebar } from './UnitInfoSidebar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('@src/course-unit/data/selectors', () => ({
  getCourseUnitData: jest.fn(),
  getCourseVerticalChildren: jest.fn(),
}));

jest.mock('./PublishControls', () => ({ __esModule: true, default: () => <div>PublishControls</div> }));
jest.mock('@src/generic/block-type-utils', () => ({
  ...jest.requireActual('@src/generic/block-type-utils'),
  ComponentCountSnippet: ({ componentData }: any) => <div>ComponentCount: {JSON.stringify(componentData)}</div>,
  getItemIcon: () => () => null,
}));
jest.mock('@src/content-tags-drawer', () => ({ ContentTagsSnippet: ({ contentId }: any) => <div>ContentTags:{contentId}</div> }));
jest.mock('@src/course-unit/unit-sidebar/unit-info/GenericUnitInfoSettings', () => ({
  __esModule: true,
  GenericUnitInfoSettings: () => <div>GenericUnitInfoSettings</div>,
}));

jest.mock('../UnitSidebarContext', () => ({ useUnitSidebarContext: jest.fn() }));

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const selectors = jest.requireMock('@src/course-unit/data/selectors') as any;
const unitSidebarContext = jest.requireMock('../UnitSidebarContext') as any;

const renderComponent = () => {
  render(
    <IframeProvider>
      <UnitInfoSidebar />
    </IframeProvider>,
  );
};

describe('UnitInfoSidebar', () => {
  beforeEach(() => {
    initializeMocks();
    mockUseParams.mockReturnValue({ blockId: 'block-1' } as any);

    selectors.getCourseUnitData.mockReturnValue({
      displayName: 'Unit title',
      id: 'block-1',
      visibilityState: undefined,
      discussionEnabled: false,
      userPartitionInfo: null,
    });

    selectors.getCourseVerticalChildren.mockReturnValue({
      children: [
        { blockType: 'html' }, { blockType: 'problem' }, { blockType: 'html' },
      ],
    });
  });

  it('renders title and details components and sets default tab', () => {
    const setCurrentTabKey = jest.fn();
    unitSidebarContext.useUnitSidebarContext.mockReturnValue({ currentTabKey: 'details', setCurrentTabKey });

    renderComponent();

    expect(screen.getByText('Unit title')).toBeInTheDocument();
    expect(screen.getByText(/ComponentCount/)).toBeInTheDocument();
    expect(screen.getByText('ContentTags:block-1')).toBeInTheDocument();
    // effect should set default tab to details
    expect(setCurrentTabKey).toHaveBeenCalledWith('details');
  });

  it('renders settings tab content when active', () => {
    const setCurrentTabKey = jest.fn();
    unitSidebarContext.useUnitSidebarContext.mockReturnValue({ currentTabKey: 'settings', setCurrentTabKey });

    renderComponent();

    expect(screen.getByText('GenericUnitInfoSettings')).toBeInTheDocument();
  });
});
