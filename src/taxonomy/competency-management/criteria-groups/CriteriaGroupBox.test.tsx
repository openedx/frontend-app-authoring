import {
  fireEvent,
  initializeMocks,
  render,
  screen,
  within,
} from '@src/testUtils';
import { buildMockCompetencyAssociationsContextValue, MockCompetencyAssociationsProvider } from '../testHelpers';
import type {
  BottomTierCompetencyCriteriaGroup,
  CompetencyCriteriaGroupsResponse,
  CompetencyRuleProfile,
  CourseCompetencyCriteriaGroup,
} from '../data/types';
import { buildCompetencyCriteriaGroupsIndex } from '../utils';
import CriteriaGroupBox from './CriteriaGroupBox';

const systemDefaultProfile: CompetencyRuleProfile = {
  id: 1,
  scopeType: 'system_default',
  ruleType: 'grade',
  rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
  archived: false,
};

// A real course-level parent for the bottom-tier group below - a bottom-tier
// group never exists without one in the real API response. Without this,
// any `canEdit`/course-id resolution derived from the tree would silently
// default to false, and a "renders read-only" test would keep passing for
// the wrong reason.
const courseGroup: CourseCompetencyCriteriaGroup = {
  id: 1,
  parentId: null,
  tagId: 42,
  courseKey: 'course-v1:OrgX+CS101+2024',
  name: 'course',
  ordering: 0,
  logicOperator: 'AND',
  archived: false,
};

const group: BottomTierCompetencyCriteriaGroup = {
  id: 10,
  parentId: 1,
  tagId: 42,
  courseKey: null,
  name: 'leaf',
  ordering: 0,
  logicOperator: 'AND',
  archived: false,
};

const response: CompetencyCriteriaGroupsResponse = {
  groups: [courseGroup, group],
  criteria: [
    {
      id: 101,
      objectId: 'block-a',
      groupId: 10,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
    },
  ],
};

const index = buildCompetencyCriteriaGroupsIndex(response);

const renderBox = (
  contextOverrides: Parameters<typeof buildMockCompetencyAssociationsContextValue>[0] = {},
  subsectionNamesByUsageKey: Record<string, string> = {},
  // Defaults to `true`, matching `testHelpers.tsx`'s own `canEditCourse: () => true`
  // convention (tests default to "editable," and opt out explicitly).
  canEdit: boolean = true,
) => (
  render(
    <MockCompetencyAssociationsProvider value={{ index, systemDefaultProfile, ...contextOverrides }}>
      <CriteriaGroupBox group={group} subsectionNamesByUsageKey={subsectionNamesByUsageKey} canEdit={canEdit} />
    </MockCompetencyAssociationsProvider>,
  )
);

describe('<CriteriaGroupBox />', () => {
  beforeEach(() => {
    initializeMocks();
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the group\'s any/all label as plain text with no control when canEdit is false', () => {
    const { container } = renderBox({}, { 'block-a': 'Subsection A' }, false);

    // The header sentence is split across sibling text nodes (plain text +
    // the any/all `<span>`), so its full text is checked via textContent
    // rather than `getByText`, which doesn't match text split across nodes.
    expect(container.querySelector('.criteria-group-box__header')).toHaveTextContent(
      'By completing all of the following',
    );
    // No `role="button"` elements at all: neither the header band nor the
    // rule box carry that role (see `CriteriaGroupBox.tsx`'s own comment on
    // why), and there's no `Dropdown` trigger since `canEdit` is false here.
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByText('Subsection A')).toBeInTheDocument();
  });

  it('calls focusGroup with its own id when the header band is clicked', () => {
    const focusGroup = jest.fn();
    const { container } = renderBox({ focusGroup });

    fireEvent.click(container.querySelector('.criteria-group-box__header')!);
    expect(focusGroup).toHaveBeenCalledWith(10);
  });

  it('calls focusGroup when the header band is activated with Enter or Space', () => {
    const focusGroup = jest.fn();
    const { container } = renderBox({ focusGroup });
    const header = container.querySelector('.criteria-group-box__header')!;

    fireEvent.keyDown(header, { key: 'Enter' });
    fireEvent.keyDown(header, { key: ' ' });

    expect(focusGroup).toHaveBeenCalledTimes(2);
    expect(focusGroup).toHaveBeenCalledWith(10);
  });

  it('exposes focus state via aria-current on the header band and the rule box', () => {
    const { container, unmount } = renderBox();
    const header = container.querySelector('.criteria-group-box__header')!;
    const ruleBox = container.querySelector('.rule-box')!;
    expect([header, ruleBox].map((el) => el.getAttribute('aria-current'))).toEqual(['false', 'false']);
    unmount();

    const { container: focusedContainer } = renderBox({ focus: { groupId: 10, ruleKey: null } });
    const focusedHeader = focusedContainer.querySelector('.criteria-group-box__header')!;
    const focusedRuleBox = focusedContainer.querySelector('.rule-box')!;
    expect([focusedHeader, focusedRuleBox].map((el) => el.getAttribute('aria-current'))).toEqual(['true', 'false']);
  });

  it('never nests an element with role button inside another', () => {
    // Neither the header band nor the rule box carry `role="button"`
    // themselves (see `CriteriaGroupBox.tsx`'s own comment on why), so the
    // any/all `Dropdown` trigger - the only `role="button"` element that
    // exists once `canEdit` is true - is never nested inside another one.
    // With `canEdit` false there is no `role="button"` element at all, so
    // this invariant is only meaningfully exercised here.
    renderBox();

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((button) => {
      expect(within(button).queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('clicking a rule box inside focuses only the rule box, not also the group', () => {
    const focusGroup = jest.fn();
    const focusRuleBox = jest.fn();
    const { container } = renderBox({ focusGroup, focusRuleBox });

    fireEvent.click(container.querySelector('.rule-box')!);

    expect(focusRuleBox).toHaveBeenCalledTimes(1);
    expect(focusGroup).not.toHaveBeenCalled();
  });

  it('scrolls the group container into view when it is focused with no rule box focused', () => {
    renderBox({ focus: { groupId: 10, ruleKey: null } });
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('does not scroll the group container when a rule box within it is the focused one', () => {
    renderBox({ focus: { groupId: 10, ruleKey: 'grade:gte:0.7:percent' } });

    // The rule box itself still scrolls (it's the innermost focused
    // element), but the group container must not also call it a second time.
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
  });
});
