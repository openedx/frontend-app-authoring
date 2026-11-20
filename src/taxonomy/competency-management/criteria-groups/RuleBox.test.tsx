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

  it('calls selectRuleBox with its own groupId and ruleKey when clicked', async () => {
    const selectRuleBox = jest.fn();
    renderRuleBox({ selectRuleBox });

    await user.click(screen.getByRole('button'));
    expect(selectRuleBox).toHaveBeenCalledWith(10, ruleKey);
  });

  it.each(['{Enter}', ' '])('calls selectRuleBox once when its control is activated with %j', async (key) => {
    const selectRuleBox = jest.fn();
    renderRuleBox({ selectRuleBox });

    await user.tab();
    await user.keyboard(key);
    expect(selectRuleBox).toHaveBeenCalledTimes(1);
    expect(selectRuleBox).toHaveBeenCalledWith(10, ruleKey);
  });

  it.each([
    { name: 'no selection', selection: null, isSelected: false },
    {
      name: 'a different box in its group',
      selection: { groupId: 10, ruleKey: 'grade:lte:0.5:percent' },
      isSelected: false,
    },
    { name: 'the same rule key in a different group', selection: { groupId: 11, ruleKey }, isSelected: false },
    { name: 'this box', selection: { groupId: 10, ruleKey }, isSelected: true },
  ])('marks itself current and scrolls into view only for $name: $isSelected', ({ selection, isSelected }) => {
    renderRuleBox({ selection });

    expect(screen.getByRole('button')).toHaveAttribute('aria-current', String(isSelected));
    expect(scrollIntoView).toHaveBeenCalledTimes(isSelected ? 1 : 0);
  });
});
