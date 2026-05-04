import { RequestStatus } from '@src/data/constants';
import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import { courseOutlineIndexMock } from './__mocks__';
import { getCourseOutlineIndexApiUrl } from './data/api';
import { CourseOutlineProvider } from './CourseOutlineContext';
import {
  CourseOutlineStateProvider,
  useCourseOutlineState,
} from './CourseOutlineStateContext';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

jest.mock('@src/CourseAuthoringContext', () => ({
  ...jest.requireActual('@src/CourseAuthoringContext'),
  useCourseAuthoringContext: () => ({
    courseId,
    openUnitPage: jest.fn(),
  }),
}));

const Probe = () => {
  const { courseName, isLoadingDenied } = useCourseOutlineState();

  if (isLoadingDenied) {
    return <div>denied</div>;
  }

  return <div>{courseName}</div>;
};

const renderComponent = () => render(
  <CourseOutlineProvider>
    <CourseOutlineStateProvider>
      <Probe />
    </CourseOutlineStateProvider>
  </CourseOutlineProvider>,
);

describe('CourseOutlineProvider outline index query sync', () => {
  let axiosMock;
  let store;

  beforeEach(() => {
    ({ axiosMock, reduxStore: store } = initializeMocks());
  });

  it('fetches outline index with React Query and syncs redux facade state', async () => {
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(200, courseOutlineIndexMock);

    renderComponent();

    expect(await screen.findByText('Demonstration Course')).toBeInTheDocument();

    await waitFor(() => {
      expect(store.getState().courseOutline.loadingStatus.outlineIndexLoadingStatus).toBe(RequestStatus.SUCCESSFUL);
    });
    expect(store.getState().courseOutline.outlineIndexData.courseStructure.displayName).toBe(
      courseOutlineIndexMock.courseStructure.displayName,
    );
    expect(store.getState().courseOutline.sectionsList).toHaveLength(
      courseOutlineIndexMock.courseStructure.childInfo.children.length,
    );
  });

  it('maps 403 responses to denied loading state', async () => {
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(403, {});

    renderComponent();

    expect(await screen.findByText('denied')).toBeInTheDocument();

    await waitFor(() => {
      expect(store.getState().courseOutline.loadingStatus.outlineIndexLoadingStatus).toBe(RequestStatus.DENIED);
    });
    expect(store.getState().courseOutline.errors.outlineIndexApi).toBeNull();
  });
});
