import {
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import { cloneDeep } from 'lodash';
import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { courseSectionVerticalMock } from '@src/course-unit/__mocks__';
import { getCourseSectionVerticalApiUrl } from '@src/course-unit/data/api';
import { fetchCourseSectionVerticalData } from '@src/course-unit/data/thunk';
import { executeThunk } from '@src/utils';
import { AddSidebar } from './AddSidebar';
import { UnitSidebarProvider } from './UnitSidebarContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    blockId: courseSectionVerticalMock.xblock_info.id,
    sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@19a30717eff543078a5d94ae9d6c18a5',
  }),
}));

jest.mock('@src/CourseAuthoringContext', () => ({
  ...jest.requireActual('@src/CourseAuthoringContext'),
  useCourseAuthoringContext: () => ({
    courseId: '123',
  }),
}));

jest.mock('@src/data/apiHooks', () => ({
  ...jest.requireActual('@src/data/apiHooks'),
  useWaffleFlags: () => ({
    useVideoGalleryFlow: false,
  }),
}));

jest.mock('@src/generic/hooks/context/hooks', () => ({
  useIframe: () => ({
    sendMessageToIframe: jest.fn(),
  }),
}));

jest.mock('../hooks', () => ({
  useHandleCreateNewCourseXBlock: () => () => jest.fn(),
}));

const courseId = '123';
const blockId = courseSectionVerticalMock.xblock_info.id;

const renderComponent = async (customSectionVerticalMock?: any) => {
  const mocks = initializeMocks();
  const axiosMock = mocks.axiosMock;
  const store = mocks.reduxStore;

  const mockData = customSectionVerticalMock || courseSectionVerticalMock;

  axiosMock
    .onGet(getCourseSectionVerticalApiUrl(blockId))
    .reply(200, mockData);

  // Execute the thunk to populate the Redux store
  await executeThunk(
    fetchCourseSectionVerticalData(blockId, courseId),
    store.dispatch,
  );

  return render(
    <IframeProvider>
      <CourseAuthoringProvider courseId={courseId}>
        <UnitSidebarProvider readOnly={false}>
          <AddSidebar />
        </UnitSidebarProvider>
      </CourseAuthoringProvider>
    </IframeProvider>,
  );
};

describe('AddSidebar - Add New Content', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders all block type buttons when all templates are present', async () => {
    await renderComponent();

    // Find the Add Sidebar's "Add New" tab content area
    const addNewTab = await screen.findByRole('tab', { name: /add new/i });
    expect(addNewTab).toBeInTheDocument();

    // These buttons should be in the main Add Sidebar (BlockCardButton elements for the six types)
    // We can verify by looking for them and ensuring they are clickable block buttons
    expect(await screen.findByRole('button', { name: /^Text$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Video$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Problem$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Problem Bank$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Drag.*Drop/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Open.*Response/i })).toBeInTheDocument();
  });

  it('renders only available block types when backend omits video and openassessment', async () => {
    // Simulate WGU config that removes video and openassessment from COMPONENT_TYPES
    const mockData = cloneDeep(courseSectionVerticalMock);
    mockData.component_templates = mockData.component_templates.filter(
      (t: any) => !['video', 'openassessment'].includes(t.type),
    );

    await renderComponent(mockData);

    // Should render these
    expect(await screen.findByRole('button', { name: /^Text$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Problem$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Problem Bank$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Drag.*Drop/i })).toBeInTheDocument();

    // Should NOT render video or openassessment
    expect(screen.queryByRole('button', { name: /^Video$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Open.*Response/i })).not.toBeInTheDocument();
  });

  it('renders only available block types when backend omits itembank', async () => {
    // Simulate libraries_v2_enabled() === false
    const mockData = cloneDeep(courseSectionVerticalMock);
    mockData.component_templates = mockData.component_templates.filter(
      (t: any) => t.type !== 'itembank',
    );

    await renderComponent(mockData);

    // Should render these
    expect(await screen.findByRole('button', { name: /^Text$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Video$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Problem$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Drag.*Drop/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Open.*Response/i })).toBeInTheDocument();

    // Should NOT render itembank
    expect(screen.queryByRole('button', { name: /^Problem Bank$/i })).not.toBeInTheDocument();
  });
});

export {};
