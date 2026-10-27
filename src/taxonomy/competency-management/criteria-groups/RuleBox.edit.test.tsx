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

const scoreSettingsButton = () => screen.getByRole('button', { name: 'With a score of 70% or higher' });

const typeScore = async (user: ReturnType<typeof userEvent.setup>, score: string) => {
  await user.click(scoreSettingsButton());
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

  it('renders the score as plain text, not a score settings button, when canEdit is omitted', () => {
    renderRuleBox();

    expect(screen.getByRole('button', { name: 'With a score of 70% or higher' })).not.toHaveAttribute('aria-haspopup');
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
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('selects the rule box when its select button is clicked, not when the score settings button is', async () => {
    const selectRuleBox = jest.fn();
    renderRuleBox({ selectRuleBox }, { canEdit: true });

    await user.click(scoreSettingsButton());
    expect(selectRuleBox).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: 'Select this rule' }));
    expect(selectRuleBox).toHaveBeenCalledWith(10, 'grade:gte:0.7:percent');
  });

  it('shows each chip\'s remove button only when the author can edit', () => {
    const { unmount } = renderRuleBox({}, { canEdit: true });
    expect(screen.getByRole('button', { name: 'Remove the association with Subsection A' })).toBeInTheDocument();
    unmount();

    renderRuleBox({}, { canEdit: false });
    expect(screen.queryByRole('button', { name: 'Remove the association with Subsection A' })).not.toBeInTheDocument();
  });

  it('removes the chip\'s criterion without selecting the rule box when its remove button is clicked', async () => {
    const selectRuleBox = jest.fn();
    const removeCriterion = jest.fn();
    renderRuleBox({ selectRuleBox, removeCriterion }, { canEdit: true });

    // The remove button sits inside the rule box's clickable area.
    await user.click(screen.getByRole('button', { name: 'Remove the association with Subsection A' }));

    expect(removeCriterion).toHaveBeenCalledWith(1, 'group');
    expect(selectRuleBox).not.toHaveBeenCalled();
  });

  describe('rule box menu (#833)', () => {
    const savedMenuName = 'More actions for the rule with a score of 70% or higher';
    const placeholderMenuName = 'More actions for the new rule';

    it('shows a menu button named after the box\'s score only when the author can edit', () => {
      const { unmount } = renderRuleBox({}, { canEdit: true });
      expect(screen.getByRole('button', { name: savedMenuName })).toBeInTheDocument();
      unmount();

      renderRuleBox({}, { canEdit: false });
      expect(screen.queryByRole('button', { name: savedMenuName })).not.toBeInTheDocument();
    });

    it('calls deleteRuleBox with its group and key, without focusing the box, when Remove rule is chosen', async () => {
      const user = userEvent.setup();
      const deleteRuleBox = jest.fn();
      const removePlaceholderRuleBox = jest.fn();
      const selectRuleBox = jest.fn();
      renderRuleBox({ deleteRuleBox, removePlaceholderRuleBox, selectRuleBox }, { canEdit: true });

      await user.click(screen.getByRole('button', { name: savedMenuName }));
      await user.click(screen.getByRole('button', { name: 'Remove rule' }));

      expect(deleteRuleBox).toHaveBeenCalledTimes(1);
      expect(deleteRuleBox).toHaveBeenCalledWith(10, 'grade:gte:0.7:percent');
      expect(removePlaceholderRuleBox).not.toHaveBeenCalled();
      expect(selectRuleBox).not.toHaveBeenCalled();
    });

    it('lets the placeholder rule box in a saved group discard itself without calling deleteRuleBox', async () => {
      const user = userEvent.setup();
      const deleteRuleBox = jest.fn();
      const removePlaceholderRuleBox = jest.fn();
      renderRuleBox(
        { deleteRuleBox, removePlaceholderRuleBox },
        { canEdit: true, ruleKey: null, criteria: [] },
      );

      await user.click(screen.getByRole('button', { name: placeholderMenuName }));
      await user.click(screen.getByRole('button', { name: 'Remove rule' }));

      expect(removePlaceholderRuleBox).toHaveBeenCalledTimes(1);
      expect(deleteRuleBox).not.toHaveBeenCalled();
    });

    it.each(['{Enter}', ' '])('opens from the keyboard and removes the rule with %j', async (activationKey) => {
      const user = userEvent.setup();
      const deleteRuleBox = jest.fn();
      renderRuleBox({ deleteRuleBox }, { canEdit: true });

      await user.tab();
      expect(screen.getByRole('button', { name: 'Select this rule' })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'With a score of 70% or higher' })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: savedMenuName })).toHaveFocus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('button', { name: 'Remove rule' })).toHaveFocus();
      await user.keyboard(activationKey);

      expect(deleteRuleBox).toHaveBeenCalledWith(10, 'grade:gte:0.7:percent');
    });
  });
});
