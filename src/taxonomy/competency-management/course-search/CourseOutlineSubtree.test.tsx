import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import {
  initializeMocks,
  render,
  screen,
  userEvent,
  within,
} from '@src/testUtils';
import CourseOutlineSubtree from './CourseOutlineSubtree';

let axiosMock;

const courseId = 'course-v1:OrgX+CS101+2024';
const outlineApiUrl = getCourseOutlineIndexApiUrl(courseId);

const mixedOutline = buildOutlineIndex({
  sections: [
    {
      id: 'section-1',
      displayName: 'Section 1',
      children: [
        { id: 'sub-1a', displayName: 'Subsection 1A (graded)', overrides: { graded: true } },
        { id: 'sub-1b', displayName: 'Subsection 1B (ungraded)', overrides: { graded: false } },
      ],
    },
    {
      id: 'section-2',
      displayName: 'Section 2',
      children: [
        {
          id: 'sub-2a',
          displayName: 'Subsection 2A (graded)',
          overrides: { graded: true },
          children: [
            { id: 'unit-2a1', displayName: 'Unit 2A1' },
          ],
        },
      ],
    },
  ],
});

const partiallyGradedOutline = buildOutlineIndex({
  sections: [
    {
      id: 'section-1',
      displayName: 'Section 1',
      children: [
        { id: 'sub-1a', displayName: 'Subsection 1A (graded)', overrides: { graded: true } },
      ],
    },
    {
      id: 'section-2',
      displayName: 'Section 2',
      children: [
        { id: 'sub-2a', displayName: 'Subsection 2A (ungraded)', overrides: { graded: false } },
      ],
    },
  ],
});

const allUngradedOutline = buildOutlineIndex({
  sections: [
    {
      id: 'section-1',
      displayName: 'Section 1',
      children: [
        { id: 'sub-1a', displayName: 'Subsection 1A', overrides: { graded: false } },
      ],
    },
    { id: 'section-2', displayName: 'Section 2' },
  ],
});

const noSubsectionsOutline = buildOutlineIndex([]);

describe('<CourseOutlineSubtree />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('renders a loading state while the outline request is pending', () => {
    axiosMock.onGet(outlineApiUrl).reply(() => new Promise(() => {}));
    render(<CourseOutlineSubtree courseId={courseId} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders a scoped inline error, not the panel-level error, when the outline request fails', async () => {
    axiosMock.onGet(outlineApiUrl).reply(500);
    render(<CourseOutlineSubtree courseId={courseId} />);

    const error = await screen.findByText('There was a problem loading this course\'s outline.');
    expect(error).toBeInTheDocument();
    expect(error).toHaveAttribute('role', 'alert');
  });

  it(
    'shows a disclosure icon for a section with graded subsections, starting collapsed, and reveals only '
      + 'graded subsections (nothing for units) once expanded',
    async () => {
      const user = userEvent.setup();
      axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
      render(<CourseOutlineSubtree courseId={courseId} />);

      expect(await screen.findByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();

      // Both sections have a graded subsection, so both start collapsed:
      // neither's subsections are in the DOM until expanded.
      const expandButtons = screen.getAllByRole('button', { name: 'Expand' });
      expect(expandButtons).toHaveLength(2);
      expect(screen.queryByText('Subsection 1A (graded)')).not.toBeInTheDocument();
      expect(screen.queryByText('Subsection 2A (graded)')).not.toBeInTheDocument();

      await user.click(expandButtons[0]);
      await user.click(screen.getByRole('button', { name: 'Expand' }));

      expect(screen.getByRole('button', { name: 'Subsection 1A (graded)' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Subsection 2A (graded)' })).toBeInTheDocument();

      expect(screen.queryByText('Subsection 1B (ungraded)')).not.toBeInTheDocument();
      expect(screen.queryByText('Unit 2A1')).not.toBeInTheDocument();
    },
  );

  it(
    'shows a disclosure icon only for the section with a graded subsection, while the section with none gets '
      + 'no icon and never renders anything underneath it',
    async () => {
      const user = userEvent.setup();
      axiosMock.onGet(outlineApiUrl).reply(200, partiallyGradedOutline);
      render(<CourseOutlineSubtree courseId={courseId} />);

      expect(await screen.findByText('Section 1')).toBeInTheDocument();
      const section2Header = screen.getByText('Section 2');

      // Only Section 1 (which has a graded subsection) gets a disclosure
      // icon - it's the only button anywhere in the tree before expanding.
      expect(screen.getAllByRole('button', { name: 'Expand' })).toHaveLength(1);
      expect(within(section2Header.closest('.course-search-browse__group')!).queryByRole('button'))
        .not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Expand' }));

      // Expanding Section 1 reveals only its own graded subsection row -
      // Section 2's ungraded subsection never renders a row at all.
      expect(screen.getByRole('button', { name: 'Subsection 1A (graded)' })).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(2); // the collapse icon + the subsection row
      expect(screen.queryByText('Subsection 2A (ungraded)')).not.toBeInTheDocument();
    },
  );

  it(
    'renders the whole-course no-gradeable-subsections message, with no section list, when every '
      + 'subsection is ungraded',
    async () => {
      axiosMock.onGet(outlineApiUrl).reply(200, allUngradedOutline);
      render(<CourseOutlineSubtree courseId={courseId} />);

      expect(await screen.findByText('This course has no gradeable subsections.')).toBeInTheDocument();
      expect(screen.queryByText('Section 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Section 2')).not.toBeInTheDocument();
    },
  );

  it('renders the whole-course no-gradeable-subsections message when there are no subsections at all', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, noSubsectionsOutline);
    render(<CourseOutlineSubtree courseId={courseId} />);

    expect(await screen.findByText('This course has no gradeable subsections.')).toBeInTheDocument();
  });

  it('does nothing when a section with no graded subsections is clicked', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(outlineApiUrl).reply(200, partiallyGradedOutline);
    render(<CourseOutlineSubtree courseId={courseId} />);

    const header = await screen.findByText('Section 2');
    await user.click(header);

    // Structural check: Section 2 (no graded subsections) is plain,
    // non-interactive text - not a button, and clicking it renders nothing.
    expect(screen.queryByRole('button', { name: 'Section 2' })).not.toBeInTheDocument();
    expect(screen.queryByText('Subsection 2A (ungraded)')).not.toBeInTheDocument();
  });

  it(
    'reuses cached data on collapse/re-expand: unmounting and remounting the same course fires only '
      + 'one request in total',
    async () => {
      axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
      const { unmount } = render(<CourseOutlineSubtree courseId={courseId} />);

      await screen.findByText('Section 1');
      expect(axiosMock.history.get).toHaveLength(1);

      // Simulate the parent CourseRow collapsing (unmount) then re-expanding
      // (remount) the same course while still within the query cache's normal
      // staleTime. With `refetchOnMount: false`, this must serve the cached
      // data without firing a second request.
      unmount();
      render(<CourseOutlineSubtree courseId={courseId} />);

      await screen.findByText('Section 1');
      expect(axiosMock.history.get).toHaveLength(1);
    },
  );
});
