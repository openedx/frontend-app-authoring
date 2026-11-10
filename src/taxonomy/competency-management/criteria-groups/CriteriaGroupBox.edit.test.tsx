import {
  initializeMocks,
  render,
  screen,
  userEvent,
  within,
} from '@src/testUtils';
import { mockScrollIntoView, MockCompetencyAssociationsProvider, singleGroupResponse } from '../__mocks__';
import type { MockCompetencyAssociationsOverrides } from '../__mocks__';
import type { BottomTierCompetencyCriteriaGroup } from '../data/types';
import CriteriaGroupBox from './CriteriaGroupBox';

const group = singleGroupResponse.groups.find(({ id }) => id === 10) as BottomTierCompetencyCriteriaGroup;

const renderBox = (contextOverrides: MockCompetencyAssociationsOverrides = {}, canEdit: boolean = true) => (
  render(
    <MockCompetencyAssociationsProvider value={contextOverrides}>
      <CriteriaGroupBox group={group} subsectionNamesByUsageKey={{}} canEdit={canEdit} />
    </MockCompetencyAssociationsProvider>,
  )
);

describe('<CriteriaGroupBox /> editing (#794)', () => {
  const scrollIntoView = mockScrollIntoView();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    initializeMocks();
    user = userEvent.setup();
  });

  it('renders the any/all label as plain text with no dropdown when canEdit is false', () => {
    const { container } = renderBox({}, false);

    expect(screen.getByRole('button', { name: 'By completing any of the following' })).toBeInTheDocument();
    expect(container.querySelector('.dropdown-toggle')).not.toBeInTheDocument();
  });

  it('calls updateGroupOperator with the group id and the selected operator when canEdit is true', async () => {
    const updateGroupOperator = jest.fn();
    renderBox({ updateGroupOperator });

    await user.click(screen.getByRole('button', { name: 'any' }));
    await user.click(screen.getByText('all'));

    expect(updateGroupOperator).toHaveBeenCalledWith(10, 'AND');
  });

  it('focuses the group when its select button is clicked', async () => {
    const focusGroup = jest.fn();
    renderBox({ focusGroup });

    await user.click(screen.getByRole('button', { name: 'By completing any of the following' }));

    expect(focusGroup).toHaveBeenCalledWith(10);
  });

  it('does not focus the group when the operator dropdown is used', async () => {
    const focusGroup = jest.fn();
    renderBox({ focusGroup });

    await user.click(screen.getByRole('button', { name: 'any' }));

    expect(focusGroup).not.toHaveBeenCalled();
  });

  it('never nests a button inside another', () => {
    renderBox();

    screen.getAllByRole('button').forEach((button) => {
      expect(within(button).queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('"Add Rule" starts a placeholder rule box in the card\'s own group', async () => {
    const addPlaceholderRuleBox = jest.fn();
    renderBox({ addPlaceholderRuleBox });

    await user.click(screen.getByRole('button', { name: 'Add Rule' }));

    expect(addPlaceholderRuleBox).toHaveBeenCalledWith(10);
  });

  it.each([
    ['a placeholder already exists', { hasPlaceholder: true }, 'Fill in the empty box before adding another.'],
    [
      'a rule is being saved',
      { isAssociating: true },
      'Saving the new rule. Wait for it to finish before adding another.',
    ],
  ])('disables "Add Rule" and explains why while %s', async (_name, overrides, text) => {
    const addPlaceholderRuleBox = jest.fn();
    renderBox({ ...overrides, addPlaceholderRuleBox });

    const addRuleButton = screen.getByRole('button', { name: 'Add Rule' });
    expect(addRuleButton).toHaveAttribute('aria-disabled', 'true');
    expect(addRuleButton).toHaveAccessibleDescription(text);

    await user.click(addRuleButton);
    expect(addPlaceholderRuleBox).not.toHaveBeenCalled();
  });

  it('hides "Add Rule" when canEdit is false', () => {
    renderBox({}, false);

    expect(screen.queryByRole('button', { name: 'Add Rule' })).not.toBeInTheDocument();
  });

  it('edits a placeholder card\'s operator through setPlaceholderLogicOperator, not updateGroupOperator', async () => {
    const setPlaceholderLogicOperator = jest.fn();
    const updateGroupOperator = jest.fn();
    render(
      <MockCompetencyAssociationsProvider
        value={{
          focus: { groupId: null, ruleKey: null },
          placeholder: { parentRuleGroupId: 1, logicOperator: 'AND', rulePayload: null },
          setPlaceholderLogicOperator,
          updateGroupOperator,
        }}
      >
        <CriteriaGroupBox subsectionNamesByUsageKey={{}} canEdit />
      </MockCompetencyAssociationsProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'all' }));
    await user.click(screen.getByText('any'));

    expect(setPlaceholderLogicOperator).toHaveBeenCalledWith('OR');
    expect(updateGroupOperator).not.toHaveBeenCalled();
  });

  it('does not scroll the group itself when focused with a placeholder rule box, which scrolls instead', () => {
    renderBox({ focus: { groupId: 10, ruleKey: null } });

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toHaveClass('rule-box');
  });
});
