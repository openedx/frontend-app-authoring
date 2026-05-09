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
import { useCourseOutline } from './hooks.jsx';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

jest.mock('@src/CourseAuthoringContext', () => ({
  ...jest.requireActual('@src/CourseAuthoringContext'),
  useCourseAuthoringContext: () => ({
    courseId,
    openUnitPage: jest.fn(),
  }),
}));

jest.mock('./outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual('./outline-sidebar/OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    selectedContainerState: undefined,
    clearSelection: jest.fn(),
    isCurrentFlowOn: undefined,
    currentFlow: undefined,
    startCurrentFlow: jest.fn(),
  }),
}));

const Probe = () => {
  const { courseName, isLoadingDenied } = useCourseOutlineState();

  if (isLoadingDenied) {
    return <div>denied</div>;
  }

  return <div>{courseName}</div>;
};

// Probe that exercises the useCourseOutline hook (hooks.jsx) to verify it does
// not crash when outlineIndexData is undefined during initial load or
// course navigation.
const OutlineCrashGuard = () => {
  useCourseOutline({ courseId });
  return <div data-testid="crash-guard">ok</div>;
};

const ProbeSections = () => {
  const { sections } = useCourseOutlineState();
  return <div data-testid="sections-count">{sections.length}</div>;
};

const renderComponent = () => render(
  <CourseOutlineStateProvider>
    <CourseOutlineProvider>
      <Probe />
    </CourseOutlineProvider>
  </CourseOutlineStateProvider>,
);

const renderSectionsComponent = () => render(
  <CourseOutlineStateProvider>
    <CourseOutlineProvider>
      <ProbeSections />
    </CourseOutlineProvider>
  </CourseOutlineStateProvider>,
);

describe('CourseOutlineProvider outline index query sync', () => {
  let axiosMock;

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('fetches outline index with React Query and syncs redux facade state', async () => {
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(200, courseOutlineIndexMock);

    renderComponent();

    expect(await screen.findByText('Demonstration Course')).toBeInTheDocument();
  });

  it('maps 403 responses to denied loading state', async () => {
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(403, {});

    renderComponent();

    expect(await screen.findByText('denied')).toBeInTheDocument();
  });

  it('derives sections from React Query data while Redux is still empty (page refresh scenario)', async () => {
    // Simulate page refresh: Redux starts empty (no pre-loaded data),
    // React Query fetches and returns valid children.
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(200, courseOutlineIndexMock);

    renderSectionsComponent();

    // ProbeSections renders sections.length. Once query succeeds the value should be non-zero.
    await waitFor(() => {
      expect(screen.getByTestId('sections-count').textContent).toBe(
        String(courseOutlineIndexMock.courseStructure.childInfo.children.length),
      );
    });

    // Redux sectionsList is still the initial empty state at this point
    // (Effect B hasn't synced yet or is batched — but sections derivation
    //  from React Query data should already be correct).
  });

  it('useCourseOutline does not crash when outlineIndexData is undefined (initial load)', async () => {
    // No API mock = query stays loading with no data.
    // Redux starts empty (outlineIndexData: {}), so reduxDataMatchesCourse
    // is false. effectiveOutlineIndexData is undefined. The hook must
    // survive this without crashing on destructuring reindexLink etc.
    render(
      <CourseOutlineStateProvider>
        <CourseOutlineProvider>
          <OutlineCrashGuard />
        </CourseOutlineProvider>
      </CourseOutlineStateProvider>,
    );

    expect(screen.getByTestId('crash-guard')).toHaveTextContent('ok');
  });
});
