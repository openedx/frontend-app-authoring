import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import {
  initializeMocks,
  render,
  screen,
  userEvent,
  within,
} from '@src/testUtils';
import { MockCompetencyAssociationsProvider } from '../__mocks__';
import type { MockCompetencyAssociationsOverrides } from '../__mocks__';
import { buildCompetencyCriteriaGroupsIndex } from '../utils';
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
        // `usageKey: undefined` mirrors the real `course_index` response, so the tests need `.id`.
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

const loadedIndex = buildCompetencyCriteriaGroupsIndex({ groups: [], criteria: [] });

const renderSubtree = () => render(<CourseOutlineSubtree courseId={courseId} />);

const renderSubtreeWithAssociations = (contextOverrides: MockCompetencyAssociationsOverrides = {}) =>
  render(
    <MockCompetencyAssociationsProvider value={{ groupsIndex: loadedIndex, ...contextOverrides }}>
      <CourseOutlineSubtree courseId={courseId} />
    </MockCompetencyAssociationsProvider>,
  );

const expandFirstSection = async () => {
  await userEvent.setup().click((await screen.findAllByRole('button', { name: 'Expand' }))[0]);
};

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
      renderSubtreeWithAssociations();

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

      expect(screen.getByText('Subsection 1A (graded)')).toBeInTheDocument();
      expect(screen.getByText('Subsection 2A (graded)')).toBeInTheDocument();

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
      renderSubtreeWithAssociations();

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
      expect(screen.getByText('Subsection 1A (graded)')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(2); // the collapse icon + the subsection's pill
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

      // Simulate the parent CourseRow collapsing then re-expanding the same
      // course within the query cache's staleTime: must serve cached data.
      unmount();
      renderSubtree();

      await screen.findByText('Section 1');
      expect(axiosMock.history.get).toHaveLength(1);
    },
  );

  describe('subsection pill', () => {
    it('shows the applied pill, and no add button, only on the subsections already associated', async () => {
      axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
      renderSubtreeWithAssociations({ associatedObjectIds: new Set(['sub-1a']), competencyExternalId: 'EXT-042' });

      const user = userEvent.setup();
      const expandButtons = await screen.findAllByRole('button', { name: 'Expand' });
      await user.click(expandButtons[0]);
      await user.click(screen.getByRole('button', { name: 'Expand' }));

      expect(screen.getAllByText('Associated')).toHaveLength(1);
      expect(screen.getByText('Competency ID: EXT-042')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Subsection 1A/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Associate EXT-042 with Subsection 2A (graded)' }))
        .toBeInTheDocument();
    });

    it('hides the competency id from assistive tech on the applied pill and states it in screen-reader text', async () => {
      axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
      renderSubtreeWithAssociations({ associatedObjectIds: new Set(['sub-1a']), competencyExternalId: 'EXT-042' });
      await expandFirstSection();

      expect(await screen.findByText('EXT-042')).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByText('Competency ID: EXT-042')).toBeInTheDocument();
      expect(screen.getByText('Associated')).toBeInTheDocument();
    });

    it('omits the competency id from the applied pill when the competency has none', async () => {
      axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
      renderSubtreeWithAssociations({ associatedObjectIds: new Set(['sub-1a']), competencyExternalId: null });
      await expandFirstSection();

      expect(await screen.findByText('Associated')).toBeInTheDocument();
      expect(screen.queryByText('Competency ID:', { exact: false })).not.toBeInTheDocument();
    });

    it('associates by the subsection\'s id when its pill is clicked, but not when its name is clicked', async () => {
      const user = userEvent.setup();
      const associateSubsection = jest.fn();
      axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
      renderSubtreeWithAssociations({ associateSubsection, competencyExternalId: 'EXT-042' });
      await expandFirstSection();

      await user.click(await screen.findByText('Subsection 1A (graded)'));
      expect(associateSubsection).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Associate EXT-042 with Subsection 1A (graded)' }));
      expect(associateSubsection).toHaveBeenCalledTimes(1);
      expect(associateSubsection).toHaveBeenCalledWith('sub-1a', courseId);
    });

    it('names the pill button without an id when the competency has no external id', async () => {
      axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
      renderSubtreeWithAssociations({ competencyExternalId: null });
      await expandFirstSection();

      expect(await screen.findByRole('button', { name: 'Associate this competency with Subsection 1A (graded)' }))
        .toBeInTheDocument();
    });

    it('shows the applied pill but no add button when the course cannot be edited', async () => {
      axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
      renderSubtreeWithAssociations({
        canEditCourse: () => false,
        associatedObjectIds: new Set(['sub-1a']),
        competencyExternalId: 'EXT-042',
      });
      const user = userEvent.setup();
      const expandButtons = await screen.findAllByRole('button', { name: 'Expand' });
      await user.click(expandButtons[0]);
      await user.click(screen.getByRole('button', { name: 'Expand' }));

      expect(screen.getByText('Associated')).toBeInTheDocument();
      expect(screen.getByText('Subsection 2A (graded)')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Associate/ })).not.toBeInTheDocument();
    });

    it.each([
      ['canEditCourse is false', { canEditCourse: () => false }],
      ['status is pending', { status: 'pending' as const }],
      ['status is error', { status: 'error' as const }],
    ])('shows no add button on an unassociated subsection when %s', async (_name, overrides) => {
      axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
      renderSubtreeWithAssociations(overrides);
      await expandFirstSection();

      expect(await screen.findByText('Subsection 1A (graded)')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Associate/ })).not.toBeInTheDocument();
    });

    it('disables the add button and ignores clicks while a create is in flight', async () => {
      const user = userEvent.setup();
      const associateSubsection = jest.fn();
      axiosMock.onGet(outlineApiUrl).reply(200, mixedOutline);
      renderSubtreeWithAssociations({ associateSubsection, isAssociating: true, competencyExternalId: 'EXT-042' });
      await expandFirstSection();

      const addButton = await screen.findByRole('button', { name: 'Associate EXT-042 with Subsection 1A (graded)' });
      await user.click(addButton);

      expect(addButton).toBeDisabled();
      expect(associateSubsection).not.toHaveBeenCalled();
    });
  });
});
