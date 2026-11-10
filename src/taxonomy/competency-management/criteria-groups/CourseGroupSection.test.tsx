import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import { courseOutlineQueryKeys } from '@src/course-outline/data/queryKeys';
import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
import {
  courseA,
  courseOther,
  criterion,
  group,
  mockScrollIntoView,
  MockCompetencyAssociationsProvider,
  twoGroupsResponse,
} from '../__mocks__';
import type { MockCompetencyAssociationsOverrides } from '../__mocks__';
import type { CourseCompetencyCriteriaGroup } from '../data/types';
import { buildCompetencyCriteriaGroupsIndex } from '../utils';
import CourseGroupSection from './CourseGroupSection';

let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];
let queryClient: ReturnType<typeof initializeMocks>['queryClient'];

const courseKey = courseA;
const outlineApiUrl = getCourseOutlineIndexApiUrl(courseKey);

// Course A's two leaf groups (10, 11), each holding one criterion on a subsection in the outline below.
const response = {
  ...twoGroupsResponse,
  criteria: [criterion(101, 'sub-1a', 10), criterion(102, 'sub-2a', 11)],
};

const index = buildCompetencyCriteriaGroupsIndex(response);
const [courseGroup] = index.courseGroups;

const threeGroupsIndex = buildCompetencyCriteriaGroupsIndex({
  groups: [...twoGroupsResponse.groups, group(12, 1, null, 2)],
  criteria: response.criteria,
});
const [threeGroupsCourseGroup] = threeGroupsIndex.courseGroups;

const ruleKeyOfDefault = 'grade:gte:0.7:percent';

// `usageKey: undefined` mirrors the `course_index` response, which never populates it.
const outlineFixture = buildOutlineIndex({
  sections: [
    {
      id: 'section-1',
      displayName: 'Section 1',
      children: [{ id: 'sub-1a', displayName: 'Subsection 1A', overrides: { usageKey: undefined } }],
    },
    {
      id: 'section-2',
      displayName: 'Section 2',
      children: [{ id: 'sub-2a', displayName: 'Subsection 2A', overrides: { usageKey: undefined } }],
    },
  ],
  overrides: { courseStructure: { displayName: 'Demo Course' } },
});

const renderSection = (
  contextOverrides: MockCompetencyAssociationsOverrides = {},
  section: CourseCompetencyCriteriaGroup = courseGroup,
) => (
  render(
    <MockCompetencyAssociationsProvider value={{ groupsIndex: index, canEditCourse: () => false, ...contextOverrides }}>
      <CourseGroupSection courseGroup={section} />
    </MockCompetencyAssociationsProvider>,
  )
);

describe('<CourseGroupSection />', () => {
  mockScrollIntoView();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    ({ axiosMock, queryClient } = initializeMocks());
    user = userEvent.setup();
  });

  it('resolves its heading and chip names from its own outline fetch', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    renderSection();

    expect(await screen.findByRole('heading', { name: 'From within Demo Course ...' })).toBeInTheDocument();
    expect(screen.getByText('Subsection 1A')).toBeInTheDocument();
    expect(screen.getByText('Subsection 2A')).toBeInTheDocument();
  });

  it('renders nothing when its outline request fails', async () => {
    axiosMock.onGet(outlineApiUrl).reply(403);
    renderSection();

    await waitFor(() => {
      expect(queryClient.getQueryState(courseOutlineQueryKeys.index(courseKey))?.status).toBe('error');
    });
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each(
    [
      ['OR', 'Or'],
      ['AND', 'And'],
    ] as const,
  )(
    'puts the same %s connector between each adjacent pair of its three bottom-tier groups',
    async (logicOperator, label) => {
      axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
      renderSection({ groupsIndex: threeGroupsIndex }, { ...threeGroupsCourseGroup, logicOperator });

      await screen.findByText('Subsection 1A');
      expect(screen.getAllByRole('button', { name: 'By completing any of the following' })).toHaveLength(3);
      expect(screen.getAllByText(label)).toHaveLength(2);
      expect(screen.queryByText(logicOperator === 'OR' ? 'And' : 'Or')).not.toBeInTheDocument();
    },
  );

  it('marks only the focused group and its rule box when two groups share the default rule key', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    renderSection({ focus: { groupId: 10, ruleKey: ruleKeyOfDefault } });

    await screen.findByText('Subsection 1A');
    const [firstHeader, secondHeader] = screen.getAllByRole('button', { name: 'By completing any of the following' });
    const [firstRuleBox, secondRuleBox] = screen.getAllByRole('button', { name: 'With a score of 70% or higher' });
    expect(firstHeader).toHaveAttribute('aria-current', 'true');
    expect(secondHeader).toHaveAttribute('aria-current', 'false');
    expect(firstRuleBox).toHaveAttribute('aria-current', 'true');
    expect(secondRuleBox).toHaveAttribute('aria-current', 'false');
    expect(firstHeader.parentElement).toHaveClass('criteria-group-box--focused');
    expect(secondHeader.parentElement).not.toHaveClass('criteria-group-box--focused');
    expect(firstRuleBox.parentElement).toHaveClass('rule-box--focused');
    expect(secondRuleBox.parentElement).not.toHaveClass('rule-box--focused');
  });

  it('collapses and re-expands independently via its own toggle', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    renderSection();

    await user.click(await screen.findByRole('button', { name: 'Collapse Demo Course' }));
    expect(screen.queryByText('Subsection 1A')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand Demo Course' }));
    expect(screen.getByText('Subsection 1A')).toBeInTheDocument();
  });

  it('reopens a collapsed card when the focus moves into it', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    const { rerender } = renderSection();

    await user.click(await screen.findByRole('button', { name: 'Collapse Demo Course' }));
    expect(screen.queryByText('Subsection 1A')).not.toBeInTheDocument();

    rerender(
      <MockCompetencyAssociationsProvider
        value={{ groupsIndex: index, focus: { groupId: 10, ruleKey: ruleKeyOfDefault } }}
      >
        <CourseGroupSection courseGroup={courseGroup} />
      </MockCompetencyAssociationsProvider>,
    );

    expect(await screen.findByText('Subsection 1A')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse Demo Course' })).toBeInTheDocument();
  });

  it('reopens a collapsed card on its own course\'s expansion even when the focus was already inside it', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    const focus = { groupId: 10, ruleKey: ruleKeyOfDefault };
    const sectionWith = (expansionCountByCourseId: Record<string, number>) => (
      <MockCompetencyAssociationsProvider value={{ groupsIndex: index, focus, expansionCountByCourseId }}>
        <CourseGroupSection courseGroup={courseGroup} />
      </MockCompetencyAssociationsProvider>
    );
    const { rerender } = render(sectionWith({}));

    await user.click(await screen.findByRole('button', { name: 'Collapse Demo Course' }));
    expect(screen.queryByText('Subsection 1A')).not.toBeInTheDocument();

    rerender(sectionWith({ [courseOther]: 1 }));
    expect(screen.queryByText('Subsection 1A')).not.toBeInTheDocument();

    rerender(sectionWith({ [courseKey]: 1 }));
    expect(await screen.findByText('Subsection 1A')).toBeInTheDocument();
  });

  it('stays collapsed when the focus moves to a group outside it', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    const { rerender } = renderSection();

    await user.click(await screen.findByRole('button', { name: 'Collapse Demo Course' }));

    rerender(
      <MockCompetencyAssociationsProvider
        value={{ groupsIndex: index, focus: { groupId: 999, ruleKey: null } }}
      >
        <CourseGroupSection courseGroup={courseGroup} />
      </MockCompetencyAssociationsProvider>,
    );

    expect(screen.queryByText('Subsection 1A')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand Demo Course' })).toBeInTheDocument();
  });

  it.each([
    [10, true],
    [999, false],
  ])('marks itself focused only when it contains the focused group (focused group %i)', async (groupId, isFocused) => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    renderSection({ focus: { groupId, ruleKey: null } });

    const card = (await screen.findByRole('heading')).closest('.course-group-section');
    if (isFocused) {
      expect(card).toHaveClass('course-group-section--focused');
    } else {
      expect(card).not.toHaveClass('course-group-section--focused');
    }
  });

  it(
    'renders a placeholder group as a third card with its own connector, when it belongs to this course',
    async () => {
      axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
      const { container } = renderSection({
        focus: { groupId: null, ruleKey: null },
        canEditCourse: () => true,
        placeholder: { parentRuleGroupId: courseGroup.id, logicOperator: 'OR', rulePayload: null },
      });

      await screen.findByText('Demo Course');
      expect(container.querySelectorAll('.criteria-group-box')).toHaveLength(3);
      expect(screen.getAllByText('Or')).toHaveLength(2);
    },
  );

  it('does not render a placeholder group that belongs to a different course-level group', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    const { container } = renderSection({
      focus: { groupId: null, ruleKey: null },
      placeholder: { parentRuleGroupId: 999, logicOperator: 'OR', rulePayload: null },
    });

    await screen.findByText('Demo Course');
    expect(container.querySelectorAll('.criteria-group-box')).toHaveLength(2);
    expect(screen.getAllByText('Or')).toHaveLength(1);
  });

  it('renders exactly one "Add Rule Group" control, which starts a placeholder under this course-level group', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    const addPlaceholderGroup = jest.fn();
    renderSection({ addPlaceholderGroup, canEditCourse: () => true });

    await screen.findByText('Demo Course');
    const addRuleGroupButtons = screen.getAllByRole('button', { name: 'Add Rule Group' });
    expect(addRuleGroupButtons).toHaveLength(1);

    await user.click(addRuleGroupButtons[0]);
    expect(addPlaceholderGroup).toHaveBeenCalledWith(courseGroup.id);
  });

  it.each([
    ['a placeholder already exists', { hasPlaceholder: true }, 'Fill in the empty box before adding another.'],
    [
      'a rule is being saved',
      { isAssociating: true },
      'Saving the new rule. Wait for it to finish before adding another.',
    ],
  ])('disables "Add Rule Group" and explains why while %s', async (_name, overrides, text) => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    const addPlaceholderGroup = jest.fn();
    renderSection({ ...overrides, addPlaceholderGroup, canEditCourse: () => true });

    await screen.findByText('Demo Course');
    const button = screen.getByRole('button', { name: 'Add Rule Group' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAccessibleDescription(text);

    await user.click(button);
    expect(addPlaceholderGroup).not.toHaveBeenCalled();
  });

  it('hides "Add Rule Group" when the author cannot edit this course', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    renderSection();

    await screen.findByText('Demo Course');
    expect(screen.queryByRole('button', { name: 'Add Rule Group' })).not.toBeInTheDocument();
  });

  it.each([
    ['a placeholder group under it', {
      focus: { groupId: null, ruleKey: null },
      placeholder: { parentRuleGroupId: courseGroup.id, logicOperator: 'OR' as const, rulePayload: null },
    }],
    ['a placeholder rule box in one of its groups', { focus: { groupId: 10, ruleKey: null } }],
  ])('discards the placeholder when collapsing a section holding %s', async (_label, overrides) => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    const discardPlaceholder = jest.fn();
    renderSection({ ...overrides, discardPlaceholder });

    await screen.findByText('Demo Course');
    await user.click(screen.getByRole('button', { name: 'Collapse Demo Course' }));

    expect(discardPlaceholder).toHaveBeenCalledTimes(1);
  });

  it('does not discard a placeholder that belongs to another section when collapsing', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    const discardPlaceholder = jest.fn();
    renderSection({
      focus: { groupId: null, ruleKey: null },
      placeholder: { parentRuleGroupId: 999, logicOperator: 'OR', rulePayload: null },
      discardPlaceholder,
    });

    await screen.findByText('Demo Course');
    await user.click(screen.getByRole('button', { name: 'Collapse Demo Course' }));

    expect(discardPlaceholder).not.toHaveBeenCalled();
  });

  it('does not discard the placeholder again when the section is expanded', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    const discardPlaceholder = jest.fn();
    renderSection({ focus: { groupId: 10, ruleKey: null }, discardPlaceholder });

    await screen.findByText('Demo Course');
    await user.click(screen.getByRole('button', { name: 'Collapse Demo Course' }));
    await user.click(screen.getByRole('button', { name: 'Expand Demo Course' }));

    expect(discardPlaceholder).toHaveBeenCalledTimes(1);
  });

  it('marks itself focused when the focused placeholder group belongs to it', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    const { container, unmount } = renderSection({
      focus: { groupId: null, ruleKey: null },
      placeholder: { parentRuleGroupId: courseGroup.id, logicOperator: 'OR', rulePayload: null },
    });

    await screen.findByText('Demo Course');
    expect(container.querySelector('.course-group-section')).toHaveClass('course-group-section--focused');

    unmount();
    const { container: other } = renderSection({
      focus: { groupId: null, ruleKey: null },
      placeholder: { parentRuleGroupId: 999, logicOperator: 'OR', rulePayload: null },
    });
    await screen.findByText('Demo Course');
    expect(other.querySelector('.course-group-section')).not.toHaveClass('course-group-section--focused');
  });
});
