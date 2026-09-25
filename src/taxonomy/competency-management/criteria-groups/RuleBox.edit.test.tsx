import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
import { buildMockCompetencyAssociationsContextValue, MockCompetencyAssociationsProvider } from '../testHelpers';
import type { CompetencyCriterion } from '../data/types';
import RuleBox from './RuleBox';

const criteria: CompetencyCriterion[] = [
  {
    id: 1,
    objectId: 'block-a',
    competencyCriteriaGroupId: 10,
    ruleProfileId: null,
    ruleTypeOverride: 'grade',
    rulePayloadOverride: { op: 'gte', value: 0.7, scale: 'percent' },
  },
];

const rule = { ruleType: 'grade', rulePayload: { op: 'gte' as const, value: 0.7, scale: 'percent' as const } };

const renderRuleBox = (
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

  it('renders the score as plain text, not an input, when canEdit is false', () => {
    renderRuleBox({}, { canEdit: false });

    expect(screen.getByText('With a score of 70% or higher')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders the score as plain text, not an input, when canEdit is omitted (default false)', () => {
    renderRuleBox();

    expect(screen.getByText('With a score of 70% or higher')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it(
    'commits an edited score by calling updateRuleScore with the group id and every criterion id in the box',
    async () => {
      const user = userEvent.setup();
      const updateRuleScore = jest.fn().mockResolvedValue(undefined);
      renderRuleBox({ updateRuleScore }, { canEdit: true });

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '85');
      await user.keyboard('{Enter}');

      expect(updateRuleScore).toHaveBeenCalledWith(10, [1], { op: 'gte', value: 0.85, scale: 'percent' });
    },
  );

  it('blocks the commit and shows the inline message when getInlineValidationMessage flags a duplicate', async () => {
    const user = userEvent.setup();
    const updateRuleScore = jest.fn().mockResolvedValue(undefined);
    const getInlineValidationMessage = jest.fn().mockReturnValue(
      'Another rule box in this group already uses this score.',
    );
    renderRuleBox({ updateRuleScore }, { canEdit: true, getInlineValidationMessage });

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '85');
    await user.keyboard('{Enter}');

    expect(updateRuleScore).not.toHaveBeenCalled();
    expect(screen.getByText('Another rule box in this group already uses this score.')).toBeInTheDocument();
  });

  it('does not call updateRuleScore when the input round-trips to the same displayed percent', async () => {
    const user = userEvent.setup();
    const updateRuleScore = jest.fn().mockResolvedValue(undefined);
    renderRuleBox({ updateRuleScore }, { canEdit: true });

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '70');
    await user.keyboard('{Enter}');

    expect(updateRuleScore).not.toHaveBeenCalled();
  });

  it('reverts the input to the prop value when the commit is rejected', async () => {
    const user = userEvent.setup();
    const updateRuleScore = jest.fn().mockRejectedValue(new Error('save failed'));
    renderRuleBox({ updateRuleScore }, { canEdit: true });

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '85');
    await user.keyboard('{Enter}');

    expect(updateRuleScore).toHaveBeenCalledWith(10, [1], { op: 'gte', value: 0.85, scale: 'percent' });
    await waitFor(() => expect(input).toHaveValue('70'));
  });

  it('does not call focusRuleBox when the score input itself is clicked', async () => {
    const user = userEvent.setup();
    const focusRuleBox = jest.fn();
    renderRuleBox({ focusRuleBox }, { canEdit: true });

    await user.click(screen.getByRole('textbox'));

    expect(focusRuleBox).not.toHaveBeenCalled();
  });
});
