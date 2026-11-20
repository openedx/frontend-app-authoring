import {
  initializeMocks,
  render,
  screen,
  userEvent,
  within,
} from '@src/testUtils';
import {
  buildMockCompetencyAssociationsContextValue,
  mockScrollIntoView,
  MockCompetencyAssociationsProvider,
  singleGroupResponse,
} from '../__mocks__';
import type { MockCompetencyAssociationsOverrides } from '../__mocks__';
import type { BottomTierCompetencyCriteriaGroup } from '../data/types';
import { CompetencyAssociationsContext } from '../CompetencyAssociationsContext';
import CriteriaGroupBox from './CriteriaGroupBox';

const group = singleGroupResponse.groups.find(({ id }) => id === 10) as BottomTierCompetencyCriteriaGroup;

const renderBox = (contextOverrides: MockCompetencyAssociationsOverrides = {}, canEdit: boolean = true) => (
  render(
    <MockCompetencyAssociationsProvider value={contextOverrides}>
      <CriteriaGroupBox
        group={group}
        subsectionNamesByUsageKey={{}}
        canEdit={canEdit}
        position={2}
        courseName="Demo Course"
      />
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

  afterEach(() => {
    jest.restoreAllMocks();
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

  it('selects the group when its select button is clicked', async () => {
    const selectGroup = jest.fn();
    renderBox({ selectGroup });

    await user.click(screen.getByRole('button', { name: 'By completing any of the following' }));

    expect(selectGroup).toHaveBeenCalledWith(10);
  });

  it('does not select the group when the operator dropdown is used', async () => {
    const selectGroup = jest.fn();
    renderBox({ selectGroup });

    await user.click(screen.getByRole('button', { name: 'any' }));

    expect(selectGroup).not.toHaveBeenCalled();
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
      'Wait for the save to finish before adding another.',
    ],
    [
      'a group is being removed',
      { isDeletingGroupOrCriterion: true },
      'Wait for the removal to finish before adding another.',
    ],
    [
      'a rule is being saved and a placeholder exists',
      { isAssociating: true, hasPlaceholder: true },
      'Wait for the save to finish before adding another.',
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

  it.each(
    [
      ['AND', 'all', 'any', 'OR'],
      ['OR', 'any', 'all', 'AND'],
    ] as const,
  )(
    'edits a placeholder card\'s operator from %s through setPlaceholderLogicOperator, not updateGroupOperator',
    async (current, currentLabel, pickedLabel, expected) => {
      const setPlaceholderLogicOperator = jest.fn();
      const updateGroupOperator = jest.fn();
      render(
        <MockCompetencyAssociationsProvider
          value={{
            selection: { groupId: null, ruleKey: null },
            placeholder: { parentRuleGroupId: 1, logicOperator: current, rulePayload: null, justAdded: false },
            setPlaceholderLogicOperator,
            updateGroupOperator,
          }}
        >
          <CriteriaGroupBox subsectionNamesByUsageKey={{}} canEdit position={3} courseName="Demo Course" />
        </MockCompetencyAssociationsProvider>,
      );

      await user.click(screen.getByRole('button', { name: currentLabel }));
      await user.click(screen.getByText(pickedLabel));

      expect(setPlaceholderLogicOperator).toHaveBeenCalledWith(expected);
      expect(updateGroupOperator).not.toHaveBeenCalled();
    },
  );

  it('renders no add control and no rule boxes when the panel failed, even with a loaded group index', () => {
    const loaded = buildMockCompetencyAssociationsContextValue();
    render(
      <CompetencyAssociationsContext.Provider value={{ ...loaded, status: 'error', error: new Error('boom') }}>
        <CriteriaGroupBox group={group} subsectionNamesByUsageKey={{}} canEdit position={2} courseName="Demo Course" />
      </CompetencyAssociationsContext.Provider>,
    );

    expect(screen.queryByRole('button', { name: 'Add Rule' })).not.toBeInTheDocument();
    expect(document.querySelector('.rule-box')).not.toBeInTheDocument();
  });

  it('scrolls the placeholder rule box once, not the group', () => {
    renderBox({ selection: { groupId: 10, ruleKey: null } });

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toHaveClass('rule-box');
  });

  describe('delete control', () => {
    const openMenu = (name = 'More actions for rule group 2 in Demo Course') => (
      user.click(screen.getByRole('button', { name }))
    );

    it('calls deleteGroup with its own id, without selecting the group, when Remove group is chosen', async () => {
      const deleteGroup = jest.fn();
      const selectGroup = jest.fn();
      renderBox({ deleteGroup, selectGroup });

      await openMenu();
      await user.click(screen.getByRole('button', { name: 'Remove group' }));

      expect(deleteGroup).toHaveBeenCalledWith(10);
      expect(selectGroup).not.toHaveBeenCalled();
    });

    it('renders no menu when canEdit is false', () => {
      renderBox({}, false);

      expect(screen.queryByRole('button', { name: 'More actions for rule group 2 in Demo Course' })).not
        .toBeInTheDocument();
    });

    it.each([
      ['a delete', { isDeletingGroupOrCriterion: true }],
      ['a create', { isAssociating: true }],
    ])('disables the menu button while %s is in flight', (_name, overrides) => {
      renderBox(overrides);

      expect(screen.getByRole('button', { name: 'More actions for rule group 2 in Demo Course' })).toBeDisabled();
    });

    it('lets the placeholder group\'s menu discard it without calling deleteGroup', async () => {
      const deleteGroup = jest.fn();
      const discardPlaceholderGroup = jest.fn();
      render(
        <MockCompetencyAssociationsProvider
          value={{ selection: { groupId: null, ruleKey: null }, deleteGroup, discardPlaceholderGroup }}
        >
          <CriteriaGroupBox subsectionNamesByUsageKey={{}} canEdit position={3} courseName="Demo Course" />
        </MockCompetencyAssociationsProvider>,
      );

      await openMenu('More actions for the new rule group in Demo Course');
      await user.click(screen.getByRole('button', { name: 'Remove group' }));

      expect(discardPlaceholderGroup).toHaveBeenCalledTimes(1);
      expect(deleteGroup).not.toHaveBeenCalled();
    });

    it.each([
      ['editable', true],
      ['read-only', false],
    ])(
      'takes keyboard focus on its header button when a request names it, then consumes the request (%s)',
      (_name, canEdit) => {
        const consumeKeyboardFocusRequest = jest.fn();
        renderBox(
          { keyboardFocusRequest: { kind: 'group', groupId: 10, selectionMoved: true }, consumeKeyboardFocusRequest },
          canEdit,
        );

        expect(screen.getByRole('button', { name: 'By completing any of the following' })).toHaveFocus();
        expect(consumeKeyboardFocusRequest).toHaveBeenCalledTimes(1);
      },
    );

    it.each([true, false])(
      'focuses the select button, scrolling only when selection did not move (selectionMoved: %s)',
      (selectionMoved) => {
        const focus = jest.spyOn(HTMLButtonElement.prototype, 'focus');
        renderBox({ keyboardFocusRequest: { kind: 'group', groupId: 10, selectionMoved } });

        expect(focus).toHaveBeenCalledWith({ preventScroll: selectionMoved });
      },
    );

    it('takes keyboard focus on its menu button when a menu request names it, then consumes the request', () => {
      const consumeKeyboardFocusRequest = jest.fn();
      renderBox({ keyboardFocusRequest: { kind: 'menu', groupId: 10 }, consumeKeyboardFocusRequest });

      expect(screen.getByRole('button', { name: 'More actions for rule group 2 in Demo Course' })).toHaveFocus();
      expect(consumeKeyboardFocusRequest).toHaveBeenCalledTimes(1);
    });

    it('leaves a menu request pending while the menu button is still disabled', () => {
      const consumeKeyboardFocusRequest = jest.fn();
      renderBox({
        keyboardFocusRequest: { kind: 'menu', groupId: 10 },
        consumeKeyboardFocusRequest,
        isDeletingGroupOrCriterion: true,
      });

      expect(consumeKeyboardFocusRequest).not.toHaveBeenCalled();
    });

    it('ignores a menu request that names another group', () => {
      const consumeKeyboardFocusRequest = jest.fn();
      renderBox({ keyboardFocusRequest: { kind: 'menu', groupId: 99 }, consumeKeyboardFocusRequest });

      expect(screen.getByRole('button', { name: 'More actions for rule group 2 in Demo Course' })).not.toHaveFocus();
      expect(consumeKeyboardFocusRequest).not.toHaveBeenCalled();
    });

    it('ignores a keyboard focus request that names another group', () => {
      const consumeKeyboardFocusRequest = jest.fn();
      renderBox({
        keyboardFocusRequest: { kind: 'group', groupId: 99, selectionMoved: true },
        consumeKeyboardFocusRequest,
      });

      expect(screen.getByRole('button', { name: 'By completing any of the following' })).not.toHaveFocus();
      expect(consumeKeyboardFocusRequest).not.toHaveBeenCalled();
    });
  });
});
