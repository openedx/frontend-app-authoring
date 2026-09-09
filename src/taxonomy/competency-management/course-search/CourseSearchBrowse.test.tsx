import {
  act,
  fireEvent,
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import { getApiBaseUrl, type Course } from '@src/studio-home/data/api';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import { buildOutlineIndex } from '@src/course-outline/__mocks__';
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

const lastRequestParams = () => axiosMock.history.get[axiosMock.history.get.length - 1].params;

describe('<CourseSearchBrowse /> and <CourseRow />', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('<CourseSearchBrowse />', () => {
    it('shows a prompt and fires no request when no competency is selected', () => {
      render(<CourseSearchBrowse activeCompetency={null} />);

      expect(screen.getByText('Select a competency to browse and associate courses.')).toBeInTheDocument();
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
      expect(axiosMock.history.get).toHaveLength(0);
    });

    it('renders course rows once the request resolves, and paginates on page-button click', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()], 2));
      render(<CourseSearchBrowse activeCompetency={activeCompetency} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(await screen.findByText('Intro to Testing')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));

      await waitFor(() => {
        expect(lastRequestParams()).toMatchObject({ page: 2 });
      });
    });

    it('renders an inline error, not the empty state, when the request fails', async () => {
      axiosMock.onGet(coursesApiUrl).reply(500);
      render(<CourseSearchBrowse activeCompetency={activeCompetency} />);

      expect(await screen.findByText('There was a problem loading courses. Please try again.'))
        .toBeInTheDocument();
      expect(screen.queryByText('You do not have access to any courses.')).not.toBeInTheDocument();
      expect(screen.queryByText('No courses match your search.')).not.toBeInTheDocument();
    });

    it('shows distinct empty-result messages for no search vs. a search value, and clears the search on demand', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([]));
      render(<CourseSearchBrowse activeCompetency={activeCompetency} />);

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

    it('debounces the search field by 400ms and resets the page back to 1', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()], 3));
      render(<CourseSearchBrowse activeCompetency={activeCompetency} />);
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

    it('sends start_date_on_or_after when a start date is picked in the range calendar, and resets the page back to 1', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()], 3));
      render(<CourseSearchBrowse activeCompetency={activeCompetency} />);
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
      expect(requestsSinceChange[0].params.start_date_on_or_after).toBeTruthy();
      expect(requestsSinceChange[0].params.start_date_on_or_before).toBeUndefined();
      expect(requestsSinceChange[0].params).toMatchObject({ page: 1 });
    });

    it('sends both start_date_on_or_after and start_date_on_or_before once an end date is also picked', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()], 3));
      render(<CourseSearchBrowse activeCompetency={activeCompetency} />);
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
      expect(requestsSinceChange[0].params.start_date_on_or_after).toBeTruthy();
      expect(requestsSinceChange[0].params.start_date_on_or_before).toBeTruthy();
    });

    it('omits start_date_on_or_after and start_date_on_or_before from the request when neither date is set', async () => {
      axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()]));
      render(<CourseSearchBrowse activeCompetency={activeCompetency} />);
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
    it('toggles expansion only via its disclosure control, and title/subtitle clicks do nothing', async () => {
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
      render(<CourseRow course={course} />);

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
