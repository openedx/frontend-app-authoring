import {
  initializeMocks,
  render,
  screen,
  userEvent,
} from '@src/testUtils';
import { buildMockCompetencyAssociationsContextValue, MockCompetencyAssociationsProvider } from '../testHelpers';
import type { CompetencyCriterion } from '../data/types';
import RuleBox from './RuleBox';

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

const render70PercentRuleBox = (
  contextOverrides: Parameters<typeof buildMockCompetencyAssociationsContextValue>[0] = {},
  props: Partial<React.ComponentProps<typeof RuleBox>> = {},
) => (
  render(
    <MockCompetencyAssociationsProvider value={contextOverrides}>
      <RuleBox
        groupId={10}
        ruleKey="grade:gte:0.7:percent"
        rule={rule}
        criteria={criteria}
        subsectionNamesByUsageKey={{ 'block-a': 'Subsection A' }}
        {...props}
      />
    </MockCompetencyAssociationsProvider>,
  )
);

describe('<RuleBox /> editing (#794)', () => {
  beforeEach(() => {
    initializeMocks();
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the score as plain text, not an input, when canEdit is omitted (default false)', () => {
    render70PercentRuleBox();

    expect(screen.getByText('70% or higher').closest('.score-threshold-field')).toHaveTextContent(
      'With a score of 70% or higher',
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it(
    'commits an edited score by calling updateRuleScore with the group id and every criterion id in the box',
    async () => {
      const user = userEvent.setup();
      const updateRuleScore = jest.fn().mockResolvedValue(undefined);
      render70PercentRuleBox({ updateRuleScore }, { canEdit: true });

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '85');
      await user.keyboard('{Enter}');

      expect(updateRuleScore).toHaveBeenCalledWith(10, [1], { op: 'gte', value: 0.85, scale: 'percent' });
    },
  );

  it('does not call focusRuleBox when the score input itself is clicked', async () => {
    const user = userEvent.setup();
    const focusRuleBox = jest.fn();
    render70PercentRuleBox({ focusRuleBox }, { canEdit: true });

    await user.click(screen.getByRole('textbox'));

    expect(focusRuleBox).not.toHaveBeenCalled();
  });
});
