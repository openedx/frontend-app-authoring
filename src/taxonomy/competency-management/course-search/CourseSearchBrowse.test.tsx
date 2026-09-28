import {
  act,
  fireEvent,
  initializeMocks,
  render,
  screen,
  waitFor,
  within,
} from '@src/testUtils';
import { getApiBaseUrl, type Course } from '@src/studio-home/data/api';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { CompetencyAssociationsProvider } from '../CompetencyAssociationsContext';
import { apiUrls as competencyManagementApiUrls } from '../data/api';
import type { CompetencyTreeNode } from '../CompetencyTree';
import CourseRow from './CourseRow';
import CourseSearchBrowse from './CourseSearchBrowse';

let axiosMock;

const coursesApiUrl = `${getApiBaseUrl()}/api/contentstore/v2/home/courses`;

const activeCompetency: CompetencyTreeNode = { id: 1, value: 'Test Competency' };

const buildCourse = (overrides: Partial<Course> = {}): Course => ({
  courseKey: 'course-v1:OrgX+CS101+2024',
  displayName: 'Intro to Testing',
  lmsLink: null,
  number: 'CS101',
  org: 'OrgX',
  rerunLink: null,
  run: '2024',
  url: '/course/course-v1:OrgX+CS101+2024',
  ...overrides,
});

const buildResponse = (courses: Course[], numPages: number = 1) => ({
  results: { courses },
  numPages,
  count: courses.length,
});

// Scoped to the courses-list endpoint specifically: with the real
// `CompetencyAssociationsProvider` now mounted too, `axiosMock.history.get`
// also holds its own (paramless) requests, so the plain "last GET" this
// helper used to mean no longer identifies a courses-list request.
const lastRequestParams = () => {
  const courseRequests = axiosMock.history.get.filter((req) => req.url === coursesApiUrl);
  return courseRequests[courseRequests.length - 1].params;
};

// `CourseSearchBrowse` mounts `CriteriaAssociationsSection`, which reads
// `CompetencyAssociationsContext` - the real provider is used here (not a
// lightly-mocked one) since `beforeEach` below already mocks its two HTTP
// requests to the empty-associations shape, which the first test asserts
// on directly.
const renderCourseSearchBrowse = () =>
  render(
    <CompetencyAssociationsProvider tagId={Number(activeCompetency.id)} competencyExternalId={null}>
      <CourseSearchBrowse activeCompetency={activeCompetency} />
    </CompetencyAssociationsProvider>,
  );

const renderCourseRow = (course: Course) =>
  render(
    <CompetencyAssociationsProvider tagId={Number(activeCompetency.id)} competencyExternalId={null}>
      <CourseRow course={course} />
    </CompetencyAssociationsProvider>,
  );

describe('<CourseSearchBrowse /> and <CourseRow />', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    // The associations section (`CriteriaAssociationsSection`/`CourseGroupList`)
    // mounts alongside the course list below it and fires its own two
    // requests - mocked here, to the empty-associations shape, so every
    // test in this file that doesn't care about the associations section
    // isn't left with it stuck in a loading/error state of its own.
    axiosMock.onGet(competencyManagementApiUrls.competencyCriteriaGroups(Number(activeCompetency.id)))
      .reply(200, { groups: [], criteria: [] });
    axiosMock.onGet(competencyManagementApiUrls.defaultCompetencyRuleProfile())
      .reply(200, {
        count: 1,
        next: null,
        previous: null,
        results: [{
          id: 1,
          scope_type: 'system_default',
          rule_type: 'grade',
          rule_payload: { op: 'gte', value: 0.7, scale: 'percent' },
          archived: false,
        }],
      });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('<CourseSearchBrowse />', () => {
    it(
      'renders the active competency\'s name in the "Demonstrate Mastery For" line, and the '
        + 'empty-associations state once the associations queries resolve',
      async () => {
        axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()]));
        renderCourseSearchBrowse();

        expect(await screen.findByText('Demonstrate Mastery For Test Competency')).toBeInTheDocument();
        expect(await screen.findByText('No content associated.')).toBeInTheDocument();
        expect(
          screen.getByText('Make content selections to associate this competency with course content.'),
        ).toBeInTheDocument();
      },
    );

    it('renders course rows once the request resolves, and paginates on page-button click', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()], 2));
      renderCourseSearchBrowse();

      // Scoped to the "Courses & Content" list itself: the associations
      // section above it (mocked in `beforeEach`) briefly shows its own
      // loading spinner too, so an unscoped `getByRole('status')` would see
      // two.
      const coursesContainer = screen.getByText('Courses & Content').closest(
        '.course-search-browse__container',
      ) as HTMLElement;
      expect(within(coursesContainer).getByRole('status')).toBeInTheDocument();
      expect(await screen.findByText('Intro to Testing')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));

      await waitFor(() => {
        expect(lastRequestParams()).toMatchObject({ page: 2 });
      });
    });

    it('renders an inline error, not the empty state, when the request fails', async () => {
      axiosMock.onGet(coursesApiUrl).reply(500);
      renderCourseSearchBrowse();

      expect(await screen.findByText('There was a problem loading courses. Please try again.'))
        .toBeInTheDocument();
      expect(screen.queryByText('You do not have access to any courses.')).not.toBeInTheDocument();
      expect(screen.queryByText('No courses match your search.')).not.toBeInTheDocument();
    });

    it('shows distinct empty-result messages for no search vs. a search value, and clears the search on demand', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([]));
      renderCourseSearchBrowse();

      expect(await screen.findByText('You do not have access to any courses.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();

      const searchBox = screen.getByRole('searchbox');
      fireEvent.change(searchBox, { target: { value: 'nonexistent' } });
      act(() => {
        jest.advanceTimersByTime(400);
      });

      expect(await screen.findByText('No courses match your search.')).toBeInTheDocument();
      expect(screen.queryByText('You do not have access to any courses.')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));

      await waitFor(() => expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe(''));
      await waitFor(() => {
        expect(lastRequestParams()).toMatchObject({ search: '' });
      });
    });

    it('shows the "no matching courses" message, not "no accessible courses", when only a date filter (no search text) narrows the results to zero', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()]));
      renderCourseSearchBrowse();
      await screen.findByText('Intro to Testing');

      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([]));
      fireEvent.click(screen.getByLabelText('Start Date'));
      const startDay = screen.getByText('10').closest('.react-datepicker__day') as HTMLElement;
      fireEvent.click(startDay);

      // No search text is active here - only the date filter - so the
      // narrowed-by-a-filter wording is the correct one, not the
      // no-filters-at-all "no accessible courses" wording.
      expect(await screen.findByText('No courses match your search.')).toBeInTheDocument();
      expect(screen.queryByText('You do not have access to any courses.')).not.toBeInTheDocument();
    });

    it('debounces the search field by 400ms and resets the page back to 1', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()], 3));
      renderCourseSearchBrowse();
      await screen.findByText('Intro to Testing');

      // Move off page 1 first, so the reset back to page 1 below is observable.
      fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
      await waitFor(() => {
        expect(lastRequestParams()).toMatchObject({ page: 2 });
      });

      const requestCountBeforeTyping = axiosMock.history.get.length;
      const searchBox = screen.getByRole('searchbox');
      fireEvent.change(searchBox, { target: { value: 'physics' } });

      act(() => {
        jest.advanceTimersByTime(399);
      });
      expect(axiosMock.history.get).toHaveLength(requestCountBeforeTyping);

      act(() => {
        jest.advanceTimersByTime(1);
      });
      await waitFor(() => {
        expect(axiosMock.history.get.length).toBeGreaterThan(requestCountBeforeTyping);
      });

      // Exactly one request should fire once the debounce settles: the
      // corrected `{ search: 'physics', page: 1 }`. An intermediate request
      // pairing the new search with the old page (e.g. `{ page: 2 }`) would
      // mean `search` and `page` were reset in separate renders instead of
      // the same state-update batch.
      const requestsSinceTyping = axiosMock.history.get.slice(requestCountBeforeTyping);
      expect(requestsSinceTyping).toHaveLength(1);
      expect(requestsSinceTyping[0].params).toMatchObject({ search: 'physics', page: 1 });
    });

    it('keeps an active search filter in the request when only the page changes', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()], 3));
      renderCourseSearchBrowse();
      await screen.findByText('Intro to Testing');

      const searchBox = screen.getByRole('searchbox');
      fireEvent.change(searchBox, { target: { value: 'physics' } });
      act(() => {
        jest.advanceTimersByTime(400);
      });
      await waitFor(() => {
        expect(lastRequestParams()).toMatchObject({ search: 'physics', page: 1 });
      });
      // The request firing (checked above) doesn't mean the response has
      // been processed and re-rendered yet - wait for the page controls
      // themselves, so the click below lands once they're actually there.
      const pageTwoButton = await screen.findByRole('button', { name: 'Page 2' });

      // Changing the page alone must not drop the still-active search filter.
      fireEvent.click(pageTwoButton);
      await waitFor(() => {
        expect(lastRequestParams()).toMatchObject({ search: 'physics', page: 2 });
      });
    });

    it('sends start_date_on_or_after when a start date is picked in the range calendar, and resets the page back to 1', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()], 3));
      renderCourseSearchBrowse();
      await screen.findByText('Intro to Testing');

      // Move off page 1 first, so the reset back to page 1 below is observable.
      fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
      await waitFor(() => {
        expect(lastRequestParams()).toMatchObject({ page: 2 });
      });

      const requestCountBeforeChange = axiosMock.history.get.length;
      // Open the range calendar and pick a single day - react-datepicker's
      // `selectsRange` fires `onChange` as `[start, null]` immediately after
      // this first click, before any second (end) day is ever picked.
      fireEvent.click(screen.getByLabelText('Start Date'));
      const startDay = screen.getByText('10').closest('.react-datepicker__day') as HTMLElement;
      fireEvent.click(startDay);

      await waitFor(() => {
        expect(axiosMock.history.get.length).toBeGreaterThan(requestCountBeforeChange);
      });

      // Exactly one request should fire: the corrected
      // `{ start_date_on_or_after: ..., page: 1 }`. An intermediate request pairing
      // the new date with the old page would mean the date and page were
      // reset in separate renders instead of the same state-update batch.
      const requestsSinceChange = axiosMock.history.get.slice(requestCountBeforeChange);
      expect(requestsSinceChange).toHaveLength(1);
      // Plain `YYYY-MM-DD`, not a full datetime - the backend's
      // `get_date_param` 400s on anything else, and only asserting
      // truthiness here previously let a full ISO datetime string through
      // unnoticed.
      expect(requestsSinceChange[0].params.start_date_on_or_after).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(requestsSinceChange[0].params.start_date_on_or_before).toBeUndefined();
      expect(requestsSinceChange[0].params).toMatchObject({ page: 1 });
    });

    it('sends both start_date_on_or_after and start_date_on_or_before once an end date is also picked', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()], 3));
      renderCourseSearchBrowse();
      await screen.findByText('Intro to Testing');

      fireEvent.click(screen.getByLabelText('Start Date'));
      const startDay = screen.getByText('10').closest('.react-datepicker__day') as HTMLElement;
      fireEvent.click(startDay);
      await waitFor(() => {
        expect(lastRequestParams().start_date_on_or_before).toBeUndefined();
      });

      const requestCountBeforeChange = axiosMock.history.get.length;
      const endDay = screen.getByText('20').closest('.react-datepicker__day') as HTMLElement;
      fireEvent.click(endDay);

      await waitFor(() => {
        expect(axiosMock.history.get.length).toBeGreaterThan(requestCountBeforeChange);
      });

      const requestsSinceChange = axiosMock.history.get.slice(requestCountBeforeChange);
      expect(requestsSinceChange).toHaveLength(1);
      expect(requestsSinceChange[0].params.start_date_on_or_after).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(requestsSinceChange[0].params.start_date_on_or_before).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('omits start_date_on_or_after and start_date_on_or_before from the request when neither date is set', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()]));
      renderCourseSearchBrowse();
      await screen.findByText('Intro to Testing');

      // The mock adapter records the params object exactly as handed to axios,
      // before axios serializes it into a query string - so the key can still
      // be present here with an `undefined` value. That's the value axios's
      // own serializer drops the key for; a value of `''` would instead be
      // sent as an empty query param, which is what these assertions rule out.
      expect(lastRequestParams().start_date_on_or_after).toBeUndefined();
      expect(lastRequestParams().start_date_on_or_before).toBeUndefined();
    });
  });

  describe('<CourseRow />', () => {
    it('toggles expansion only via its disclosure control, and title clicks do nothing', async () => {
      const course = buildCourse();
      const outlineSectionHeading = 'Section 1';
      axiosMock.onGet(getCourseOutlineIndexApiUrl(course.courseKey)).reply(
        200,
        buildOutlineIndex({
          sections: [
            {
              id: 'section-1',
              displayName: outlineSectionHeading,
              children: [
                { id: 'sub-1a', displayName: 'Subsection 1A', overrides: { graded: true } },
              ],
            },
          ],
        }),
      );
      renderCourseRow(course);

      expect(screen.queryByText(outlineSectionHeading)).not.toBeInTheDocument();

      const expandButton = screen.getByRole('button', { name: 'Expand' });
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      // Clicking the row's own title text does nothing - only the disclosure
      // control (asserted below) toggles anything.
      fireEvent.click(screen.getByText(course.displayName));
      expect(screen.queryByText(outlineSectionHeading)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Expand' })).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(expandButton);
      const collapseButton = screen.getByRole('button', { name: 'Collapse' });
      expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
      // Expanding now mounts the real CourseOutlineSubtree, which fires a real
      // outline request - wait for it to resolve and render.
      expect(await screen.findByText(outlineSectionHeading)).toBeInTheDocument();

      fireEvent.click(collapseButton);
      expect(screen.getByRole('button', { name: 'Expand' })).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText(outlineSectionHeading)).not.toBeInTheDocument();
    });
  });
});
