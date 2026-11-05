import { initializeMocks, render, screen, userEvent } from '@src/testUtils';
import {
  buildMockCompetencyAssociationsContextValue,
  mockScrollIntoView,
  MockCompetencyAssociationsProvider,
} from '../__mocks__';
import type { CompetencyCriterion } from '../data/types';
import RuleBox from './RuleBox';

const ruleKey = 'grade:gte:0.7:percent';

const criteria: CompetencyCriterion[] = [
  {
    id: 1,
    objectId: 'block-a',
    groupId: 10,
    ruleProfileId: null,
    ruleTypeOverride: 'grade',
    rulePayloadOverride: { op: 'gte', value: 0.7, scale: 'percent' },
  },
];

const rule = { ruleType: 'grade', rulePayload: { op: 'gte' as const, value: 0.7, scale: 'percent' as const } };

const renderRuleBox = (contextOverrides: Parameters<typeof buildMockCompetencyAssociationsContextValue>[0] = {}) => (
  render(
    <MockCompetencyAssociationsProvider value={contextOverrides}>
      <RuleBox
        groupId={10}
        ruleKey={ruleKey}
        rule={rule}
        criteria={criteria}
        subsectionNamesByUsageKey={{ 'block-a': 'Subsection A' }}
      />
    </MockCompetencyAssociationsProvider>,
  )
);

describe('<RuleBox />', () => {
  const scrollIntoView = mockScrollIntoView();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    initializeMocks();
    user = userEvent.setup();
  });

  it('renders the given rule\'s score threshold and its chips', () => {
    renderRuleBox();

    expect(screen.getByRole('button', { name: 'With a score of 70% or higher' })).toBeInTheDocument();
    expect(screen.getByText('Subsection A')).toBeInTheDocument();
  });

  it('keeps the chips outside its control', () => {
    renderRuleBox();

    expect(screen.getByRole('button')).not.toContainElement(screen.getByText('Subsection A'));
  });

  it('calls focusRuleBox with its own groupId and ruleKey when clicked', async () => {
    const focusRuleBox = jest.fn();
    renderRuleBox({ focusRuleBox });

    await user.click(screen.getByRole('button'));
    expect(focusRuleBox).toHaveBeenCalledWith(10, ruleKey);
  });

  it.each(['{Enter}', ' '])('calls focusRuleBox once when its control is activated with %j', async (key) => {
    const focusRuleBox = jest.fn();
    renderRuleBox({ focusRuleBox });

    await user.tab();
    await user.keyboard(key);
    expect(focusRuleBox).toHaveBeenCalledTimes(1);
    expect(focusRuleBox).toHaveBeenCalledWith(10, ruleKey);
  });

  it.each([
    { name: 'no focus', focus: null, isFocused: false },
    {
      name: 'a different box in its group',
      focus: { groupId: 10, ruleKey: 'grade:lte:0.5:percent' },
      isFocused: false,
    },
    { name: 'the same rule key in a different group', focus: { groupId: 11, ruleKey }, isFocused: false },
    { name: 'this box', focus: { groupId: 10, ruleKey }, isFocused: true },
  ])('marks itself current and scrolls into view only for $name: $isFocused', ({ focus, isFocused }) => {
    renderRuleBox({ focus });

    expect(screen.getByRole('button')).toHaveAttribute('aria-current', String(isFocused));
    expect(scrollIntoView).toHaveBeenCalledTimes(isFocused ? 1 : 0);
  });
});
