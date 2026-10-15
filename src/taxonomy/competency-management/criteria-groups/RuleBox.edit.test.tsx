import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
import { mockScrollIntoView, MockCompetencyAssociationsProvider, criterion, gteRule } from '../__mocks__';
import type { MockCompetencyAssociationsOverrides } from '../__mocks__';
import RuleBox from './RuleBox';

const criteria = [criterion(1, 'block-a', 10)];
const rule = { ruleType: 'grade', rulePayload: gteRule };

const renderRuleBox = (
  contextOverrides: MockCompetencyAssociationsOverrides = {},
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

const typeScore = async (user: ReturnType<typeof userEvent.setup>, score: string) => {
  const input = screen.getByRole('textbox');
  await user.clear(input);
  await user.type(input, score);
  await user.keyboard('{Enter}');
  return input;
};

describe('<RuleBox /> editing (#794)', () => {
  mockScrollIntoView();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    initializeMocks();
    user = userEvent.setup();
  });

  it('renders the score as plain text, not an input, when canEdit is omitted', () => {
    renderRuleBox();

    expect(screen.getByRole('button', { name: 'With a score of 70% or higher' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('commits an edited score with the group id and every criterion id in the box', async () => {
    const updateRuleScore = jest.fn().mockResolvedValue(undefined);
    renderRuleBox({ updateRuleScore }, { canEdit: true });

    await typeScore(user, '85');

    expect(updateRuleScore).toHaveBeenCalledWith(10, [1], { op: 'gte', value: 0.85, scale: 'percent' });
  });

  it('blocks the commit and shows the message when getInlineValidationMessage flags a duplicate', async () => {
    const updateRuleScore = jest.fn().mockResolvedValue(undefined);
    const getInlineValidationMessage = jest.fn().mockReturnValue(
      'Another rule box in this group already uses this score.',
    );
    renderRuleBox({ updateRuleScore }, { canEdit: true, getInlineValidationMessage });

    await typeScore(user, '85');

    expect(updateRuleScore).not.toHaveBeenCalled();
    expect(screen.getByText('Another rule box in this group already uses this score.')).toBeInTheDocument();
  });

  it('does not call updateRuleScore when the input round-trips to the same displayed percent', async () => {
    const updateRuleScore = jest.fn().mockResolvedValue(undefined);
    renderRuleBox({ updateRuleScore }, { canEdit: true });

    await typeScore(user, '70');

    expect(updateRuleScore).not.toHaveBeenCalled();
  });

  it('reverts the input to the saved value when the commit is rejected', async () => {
    const updateRuleScore = jest.fn().mockRejectedValue(new Error('save failed'));
    renderRuleBox({ updateRuleScore }, { canEdit: true });

    const input = await typeScore(user, '85');

    expect(updateRuleScore).toHaveBeenCalledWith(10, [1], { op: 'gte', value: 0.85, scale: 'percent' });
    await waitFor(() => expect(input).toHaveValue('70'));
  });

  it('focuses the rule box when its select button is clicked, not when the score input is', async () => {
    const focusRuleBox = jest.fn();
    renderRuleBox({ focusRuleBox }, { canEdit: true });

    await user.click(screen.getByRole('textbox'));
    expect(focusRuleBox).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Select this rule' }));
    expect(focusRuleBox).toHaveBeenCalledWith(10, 'grade:gte:0.7:percent');
  });
});
