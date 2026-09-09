import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import {
  initializeMocks,
  render,
  screen,
  userEvent,
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

  it('renders every section header, and only graded subsections as clickable rows - nothing for units', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
    render(<CourseOutlineSubtree courseId={courseId} />);

    expect(await screen.findByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Subsection 1A (graded)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Subsection 2A (graded)' })).toBeInTheDocument();

    expect(screen.queryByText('Subsection 1B (ungraded)')).not.toBeInTheDocument();
    expect(screen.queryByText('Unit 2A1')).not.toBeInTheDocument();
  });

  it(
    'renders a section header with nothing clickable underneath it when that section has no graded '
      + 'subsections, while another section in the same course does',
    async () => {
      axiosMock.onGet(outlineApiUrl).reply(200, partiallyGradedOutline);
      render(<CourseOutlineSubtree courseId={courseId} />);

      expect(await screen.findByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();

      // Section 1 has its graded subsection's clickable row, and it's the
      // only button anywhere in the tree - Section 2's ungraded subsection
      // renders no row at all.
      expect(screen.getByRole('button', { name: 'Subsection 1A (graded)' })).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(1);
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

  it('calls onSubsectionSelected with the usageKey and blockType of a clicked graded subsection', async () => {
    const user = userEvent.setup();
    const onSubsectionSelected = jest.fn();
    axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
    render(<CourseOutlineSubtree courseId={courseId} onSubsectionSelected={onSubsectionSelected} />);

    const row = await screen.findByRole('button', { name: 'Subsection 1A (graded)' });
    await user.click(row);

    expect(onSubsectionSelected).toHaveBeenCalledTimes(1);
    expect(onSubsectionSelected).toHaveBeenCalledWith({ usageKey: 'sub-1a', blockType: 'sequential' });
  });

  it('calls onSubsectionSelected when Enter or Space is pressed while a graded subsection row is focused', async () => {
    const user = userEvent.setup();
    const onSubsectionSelected = jest.fn();
    axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
    render(<CourseOutlineSubtree courseId={courseId} onSubsectionSelected={onSubsectionSelected} />);

    const row = await screen.findByRole('button', { name: 'Subsection 1A (graded)' });

    row.focus();
    await user.keyboard('{Enter}');
    expect(onSubsectionSelected).toHaveBeenCalledTimes(1);
    expect(onSubsectionSelected).toHaveBeenCalledWith({ usageKey: 'sub-1a', blockType: 'sequential' });

    onSubsectionSelected.mockClear();
    row.focus();
    await user.keyboard(' ');
    expect(onSubsectionSelected).toHaveBeenCalledTimes(1);
    expect(onSubsectionSelected).toHaveBeenCalledWith({ usageKey: 'sub-1a', blockType: 'sequential' });
  });

  it('does nothing when a section header is clicked', async () => {
    const user = userEvent.setup();
    const onSubsectionSelected = jest.fn();
    axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
    render(<CourseOutlineSubtree courseId={courseId} onSubsectionSelected={onSubsectionSelected} />);

    const header = await screen.findByText('Section 1');
    await user.click(header);

    expect(onSubsectionSelected).not.toHaveBeenCalled();
    // Structural check: the header is plain, non-interactive text - not a button.
    expect(screen.queryByRole('button', { name: 'Section 1' })).not.toBeInTheDocument();
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
