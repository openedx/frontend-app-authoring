import { initializeMocks, render, screen } from '@src/testUtils';
import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';
import { executeThunk } from '@src/utils';
import { getCourseSectionVerticalApiUrl } from '@src/course-unit/data/api';
import { fetchCourseSectionVerticalData } from '@src/course-unit/data/thunk';
import { courseSectionVerticalMock } from '@src/course-unit/__mocks__';
import { UnitSidebarProvider } from '../UnitSidebarContext';
import { UnitInfoSidebar } from './UnitInfoSidebar';

jest.mock('@src/content-tags-drawer', () => ({
  ContentTagsSnippet: jest.fn(() => <div data-testid="content-tags-snippet" />),
}));

jest.mock('@src/generic/hooks/context/hooks', () => ({
  useIframe: () => ({ sendMessageToIframe: jest.fn() }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ blockId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@abc' }),
}));

const blockId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@abc';
let axiosMock;
let store;

const renderComponent = () => render(
  <IframeProvider>
    <UnitSidebarProvider readOnly={false}>
      <UnitInfoSidebar />
    </UnitSidebarProvider>
  </IframeProvider>,
);

describe('<UnitInfoSidebar />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    store = mocks.reduxStore;
  });

  it('shows PublishControls when isVertical is true (category=vertical)', async () => {
    // courseSectionVerticalMock already has xblock_info.category = 'vertical'
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

    renderComponent();

    // PublishControls should be rendered for vertical units
    expect(await screen.findByText('Draft (unpublished changes)')).toBeInTheDocument();

    // Section title should use the vertical-specific label
    expect(screen.getByText('Unit Content Summary')).toBeInTheDocument();
    expect(screen.queryByText('Content Summary')).not.toBeInTheDocument();
  });

  it('hides PublishControls when isVertical is false (non-vertical category)', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: { ...courseSectionVerticalMock.xblock_info, category: 'split_test' },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

    renderComponent();

    // PublishControls should NOT be rendered for non-vertical categories
    expect(await screen.findByText('Content Summary')).toBeInTheDocument();
    expect(screen.queryByText('Unit Content Summary')).not.toBeInTheDocument();
    expect(screen.queryByText('Draft (unpublished changes)')).not.toBeInTheDocument();
  });
});