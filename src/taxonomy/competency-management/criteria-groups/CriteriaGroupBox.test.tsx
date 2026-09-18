import {
  fireEvent,
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import { buildMockCompetencyAssociationsContextValue, MockCompetencyAssociationsProvider } from '../testHelpers';
import type {
  BottomTierCompetencyCriteriaGroup,
  CompetencyCriteriaGroupsResponse,
  CompetencyRuleProfile,
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

const group: BottomTierCompetencyCriteriaGroup = {
  id: 10,
  parentId: 1,
  depth: 2,
  ordering: 0,
  logicOperator: 'and',
};

const response: CompetencyCriteriaGroupsResponse = {
  groups: [group],
  criteria: [
    {
      id: 101,
      objectId: 'block-a',
      competencyCriteriaGroupId: 10,
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
) => (
  render(
    <MockCompetencyAssociationsProvider value={{ index, systemDefaultProfile, ...contextOverrides }}>
      <CriteriaGroupBox group={group} subsectionNamesByUsageKey={subsectionNamesByUsageKey} />
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

  it('renders the group\'s any/all label as plain text with no control', () => {
    const { container } = renderBox({}, { 'block-a': 'Subsection A' });

    // The header sentence is split across sibling text nodes (plain text +
    // the any/all `<span>`), so its full text is checked via textContent
    // rather than `getByText`, which doesn't match text split across nodes.
    expect(container.querySelector('.criteria-group-box__header')).toHaveTextContent(
      'By completing all of the following',
    );
    // Two `role="button"` elements exist (the group's own container and the
    // one rendered rule box) - neither is a `SelectMenu` trigger, since no
    // `onChange` was given to the any/all control.
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByText('Subsection A')).toBeInTheDocument();
  });

  it('calls focusGroup with its own id when the group container itself is clicked', () => {
    const focusGroup = jest.fn();
    const { container } = renderBox({ focusGroup });

    fireEvent.click(container.querySelector('.criteria-group-box__header')!);
    expect(focusGroup).toHaveBeenCalledWith(10);
  });

  it('clicking a rule box inside focuses only the rule box, not also the group', () => {
    const focusGroup = jest.fn();
    const focusRuleBox = jest.fn();
    renderBox({ focusGroup, focusRuleBox });

    // The rule box is the second `role="button"` (the group container is first).
    fireEvent.click(screen.getAllByRole('button')[1]);

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
