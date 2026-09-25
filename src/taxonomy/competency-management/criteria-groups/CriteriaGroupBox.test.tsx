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

// The leaf group (10) of the provider's default groups index, which holds one criterion on 'existing-sub'.
const group = singleGroupResponse.groups.find(({ id }) => id === 10) as BottomTierCompetencyCriteriaGroup;

const ruleKey = 'grade:gte:0.7:percent';

const renderBox = (
  contextOverrides: MockCompetencyAssociationsOverrides = {},
  subsectionNamesByUsageKey: Record<string, string> = {},
  canEdit: boolean = false,
) => (
  render(
    <MockCompetencyAssociationsProvider value={contextOverrides}>
      <CriteriaGroupBox group={group} subsectionNamesByUsageKey={subsectionNamesByUsageKey} canEdit={canEdit} />
    </MockCompetencyAssociationsProvider>,
  )
);

const headerButton = () => screen.getByRole('button', { name: 'By completing any of the following' });
const ruleBoxButton = () => screen.getByRole('button', { name: /^With a score of/ });

describe('<CriteriaGroupBox />', () => {
  const scrollIntoView = mockScrollIntoView();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    initializeMocks();
    user = userEvent.setup();
  });

  it('renders the group\'s any/all sentence as its header and its rule box chips', () => {
    renderBox({}, { 'existing-sub': 'Subsection A' });

    expect(headerButton()).toBeInTheDocument();
    expect(screen.getByText('Subsection A')).toBeInTheDocument();
  });

  it('calls focusGroup with its own id when the header is clicked', async () => {
    const focusGroup = jest.fn();
    renderBox({ focusGroup });

    await user.click(headerButton());
    expect(focusGroup).toHaveBeenCalledWith(10);
  });

  it.each(['{Enter}', ' '])('calls focusGroup once when the header is activated with %j', async (key) => {
    const focusGroup = jest.fn();
    renderBox({ focusGroup });

    await user.tab();
    expect(headerButton()).toHaveFocus();
    await user.keyboard(key);
    expect(focusGroup).toHaveBeenCalledTimes(1);
    expect(focusGroup).toHaveBeenCalledWith(10);
  });

  it.each([
    { name: 'nothing is focused', focus: null, header: 'false', ruleBox: 'false' },
    { name: 'another group is focused', focus: { groupId: 11, ruleKey }, header: 'false', ruleBox: 'false' },
    {
      name: 'the group is focused without a rule key',
      focus: { groupId: 10, ruleKey: null },
      header: 'true',
      ruleBox: 'false',
    },
    { name: 'the group\'s rule box is focused', focus: { groupId: 10, ruleKey }, header: 'true', ruleBox: 'true' },
  ])('marks the header and rule box current when $name', ({ focus, header, ruleBox }) => {
    renderBox({ focus });

    expect(headerButton()).toHaveAttribute('aria-current', header);
    expect(ruleBoxButton()).toHaveAttribute('aria-current', ruleBox);
  });

  it('never nests a button inside another', () => {
    renderBox();

    screen.getAllByRole('button').forEach((button) => {
      expect(within(button).queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('clicking a rule box focuses only the rule box, not also the group', async () => {
    const focusGroup = jest.fn();
    const focusRuleBox = jest.fn();
    renderBox({ focusGroup, focusRuleBox });

    await user.click(ruleBoxButton());

    expect(focusRuleBox).toHaveBeenCalledTimes(1);
    expect(focusGroup).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'nothing is focused', focus: null, scrolledElement: null },
    { name: 'another group is focused', focus: { groupId: 11, ruleKey }, scrolledElement: null },
    {
      name: 'the group is focused without a rule key',
      focus: { groupId: 10, ruleKey: null },
      scrolledElement: 'group',
    },
    { name: 'the focused rule key matches no box', focus: { groupId: 10, ruleKey: 'stale' }, scrolledElement: 'group' },
    { name: 'a rule box in the group is focused', focus: { groupId: 10, ruleKey }, scrolledElement: 'rule box' },
  ])('scrolls once, and only the right element, when $name: $scrolledElement', ({ focus, scrolledElement }) => {
    const { container } = renderBox({ focus });

    if (scrolledElement === null) {
      expect(scrollIntoView).not.toHaveBeenCalled();
      return;
    }
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    const expectedElement = scrolledElement === 'group'
      ? container.querySelector('.criteria-group-box')
      : ruleBoxButton().closest('.rule-box');
    expect(scrollIntoView.mock.contexts[0]).toBe(expectedElement);
  });
});
