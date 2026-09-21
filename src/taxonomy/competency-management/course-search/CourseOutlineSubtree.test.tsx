import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import {
  initializeMocks,
  render,
  screen,
  userEvent,
  within,
} from '@src/testUtils';
import { buildMockCompetencyAssociationsContextValue, MockCompetencyAssociationsProvider } from '../testHelpers';
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
        // `usageKey: undefined` mirrors the real `course_index` response,
        // captured directly against a live devstack: a block object there
        // only ever carries `id`, never `usage_key`. Left this way (rather
        // than `buildOutlineIndex`'s own default of `id === usageKey`) so
        // the association tests below only pass if `SubsectionRow` actually
        // reads `.id`, not the never-populated `.usageKey`.
        { id: 'sub-1a', displayName: 'Subsection 1A (graded)', overrides: { graded: true, usageKey: undefined } },
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

// `CourseOutlineSubtree` renders `SubsectionRow`, which reads
// `CompetencyAssociationsContext` for the already-associated marking and
// the select control - most tests below care about the outline rendering
// itself, not that data layer, so a lightly-mocked provider (with its
// default `associatedObjectIds`/`associateSubsection`) is enough; a few
// near the end override those two fields directly to exercise that layer.
const renderSubtree = (contextOverrides: Parameters<typeof buildMockCompetencyAssociationsContextValue>[0] = {}) =>
  render(
    <MockCompetencyAssociationsProvider value={contextOverrides}>
      <CourseOutlineSubtree courseId={courseId} />
    </MockCompetencyAssociationsProvider>,
  );

describe('<CourseOutlineSubtree />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('renders a loading state while the outline request is pending', () => {
    axiosMock.onGet(outlineApiUrl).reply(() => new Promise(() => {}));
    renderSubtree();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders a scoped inline error, not the panel-level error, when the outline request fails', async () => {
    axiosMock.onGet(outlineApiUrl).reply(500);
    renderSubtree();

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
      renderSubtree();

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
      renderSubtree();

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
      renderSubtree();

      expect(await screen.findByText('This course has no gradeable subsections.')).toBeInTheDocument();
      expect(screen.queryByText('Section 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Section 2')).not.toBeInTheDocument();
    },
  );

  it('renders the whole-course no-gradeable-subsections message when there are no subsections at all', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, noSubsectionsOutline);
    renderSubtree();

    expect(await screen.findByText('This course has no gradeable subsections.')).toBeInTheDocument();
  });

  it('does nothing when a section with no graded subsections is clicked', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(outlineApiUrl).reply(200, partiallyGradedOutline);
    renderSubtree();

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
      const { unmount } = renderSubtree();

      await screen.findByText('Section 1');
      expect(axiosMock.history.get).toHaveLength(1);

      // Simulate the parent CourseRow collapsing (unmount) then re-expanding
      // (remount) the same course while still within the query cache's normal
      // staleTime. With `refetchOnMount: false`, this must serve the cached
      // data without firing a second request.
      unmount();
      renderSubtree();

      await screen.findByText('Section 1');
      expect(axiosMock.history.get).toHaveLength(1);
    },
  );

  it(
    'marks a subsection as already associated by its real id - the field the real course_index response '
      + 'actually populates, never the always-undefined usageKey',
    async () => {
      const user = userEvent.setup();
      axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
      renderSubtree({ associatedObjectIds: new Set(['sub-1a']) });

      // Expand both sections' graded subsections: `sub-1a` (Section 1) and
      // `sub-2a` (Section 2) - `sub-1b` is ungraded, so it never renders a
      // row at all (see the "shows a disclosure icon..." test above).
      const expandButtons = await screen.findAllByRole('button', { name: 'Expand' });
      await user.click(expandButtons[0]);
      await user.click(screen.getByRole('button', { name: 'Expand' }));

      expect(screen.getByRole('button', { name: 'Subsection 1A (graded)' })).toHaveAttribute(
        'data-associated',
        'true',
      );
      // A sibling row whose id isn't in the set stays unmarked - proves the
      // lookup is a real per-row match, not something that's always true.
      expect(screen.getByRole('button', { name: 'Subsection 2A (graded)' })).toHaveAttribute(
        'data-associated',
        'false',
      );
    },
  );

  it(
    'calls associateSubsection with the subsection\'s real id when a selectable row is clicked - not the '
      + 'usageKey field the real API never populates',
    async () => {
      const user = userEvent.setup();
      const associateSubsection = jest.fn();
      axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
      renderSubtree({ associateSubsection });

      await user.click((await screen.findAllByRole('button', { name: 'Expand' }))[0]);
      await user.click(screen.getByRole('button', { name: 'Subsection 1A (graded)' }));

      expect(associateSubsection).toHaveBeenCalledWith('sub-1a', courseId);
    },
  );
});
