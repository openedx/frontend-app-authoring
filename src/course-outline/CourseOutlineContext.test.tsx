import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import { buildTestOutline } from './__mocks__';
import { getCourseOutlineIndexApiUrl } from './data';
import {
  CourseOutlineProvider,
  useCourseOutlineContext,
} from './CourseOutlineContext';
const courseId = 'course-v1:edX+DemoX+Demo_Course';

const outlineFixture = buildTestOutline({
  overrides: {
    courseStructure: { displayName: 'Demonstration Course' },
  },
});

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
  const { courseName, isLoadingDenied } = useCourseOutlineContext();

  if (isLoadingDenied) {
    return <div>denied</div>;
  }

  return <div>{courseName}</div>;
};

const ProbeSections = () => {
  const { sections } = useCourseOutlineContext();
  return <div data-testid="sections-count">{sections.length}</div>;
};

const renderComponent = () =>
  render(
    <CourseOutlineProvider>
      <Probe />
    </CourseOutlineProvider>,
  );

const renderSectionsComponent = () =>
  render(
    <CourseOutlineProvider>
      <ProbeSections />
    </CourseOutlineProvider>,
  );

describe('CourseOutlineProvider outline index query sync', () => {
  let axiosMock;

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('fetches outline index with React Query and syncs redux facade state', async () => {
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(200, outlineFixture);

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
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(200, outlineFixture);

    renderSectionsComponent();

    // ProbeSections renders sections.length. Once query succeeds the value should be non-zero.
    await waitFor(() => {
      expect(screen.getByTestId('sections-count').textContent).toBe(
        String((outlineFixture.courseStructure as any).childInfo.children.length),
      );
    });

    // Redux sectionsList is still the initial empty state at this point
    // (Effect B hasn't synced yet or is batched — but sections derivation
    //  from React Query data should already be correct).
  });
});
