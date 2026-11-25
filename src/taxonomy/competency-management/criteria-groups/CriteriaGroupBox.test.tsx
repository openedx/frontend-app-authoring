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
      <CriteriaGroupBox
        group={group}
        subsectionNamesByUsageKey={subsectionNamesByUsageKey}
        canEdit={canEdit}
        position={1}
        courseName="Demo Course"
      />
    </MockCompetencyAssociationsProvider>,
  )
);

const headerButton = () => screen.getByRole('button', { name: 'By completing any of the following' });
// The first match is the saved box; a placeholder box, when shown, comes after it.
const ruleBoxButton = () => screen.getAllByRole('button', { name: /^With a score of/ })[0];

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

  it('calls selectGroup with its own id when the header is clicked', async () => {
    const selectGroup = jest.fn();
    renderBox({ selectGroup });

    await user.click(headerButton());
    expect(selectGroup).toHaveBeenCalledWith(10);
  });

  it.each(['{Enter}', ' '])('calls selectGroup once when the header is activated with %j', async (key) => {
    const selectGroup = jest.fn();
    renderBox({ selectGroup });

    await user.tab();
    expect(headerButton()).toHaveFocus();
    await user.keyboard(key);
    expect(selectGroup).toHaveBeenCalledTimes(1);
    expect(selectGroup).toHaveBeenCalledWith(10);
  });

  it.each([
    { name: 'nothing is selected', selection: null, header: 'false', ruleBox: 'false' },
    { name: 'another group is selected', selection: { groupId: 11, ruleKey }, header: 'false', ruleBox: 'false' },
    {
      name: 'the group is selected without a rule key',
      selection: { groupId: 10, ruleKey: null },
      header: 'true',
      ruleBox: 'false',
    },
    { name: 'the group\'s rule box is selected', selection: { groupId: 10, ruleKey }, header: 'true', ruleBox: 'true' },
  ])('marks the header and rule box current when $name', ({ selection, header, ruleBox }) => {
    renderBox({ selection });

    expect(headerButton()).toHaveAttribute('aria-current', header);
    expect(ruleBoxButton()).toHaveAttribute('aria-current', ruleBox);
  });

  it('never nests a button inside another', () => {
    renderBox();

    screen.getAllByRole('button').forEach((button) => {
      expect(within(button).queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('clicking a rule box selects only the rule box, not also the group', async () => {
    const selectGroup = jest.fn();
    const selectRuleBox = jest.fn();
    renderBox({ selectGroup, selectRuleBox });

    await user.click(ruleBoxButton());

    expect(selectRuleBox).toHaveBeenCalledTimes(1);
    expect(selectGroup).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'nothing is selected', selection: null, scrolledElement: null },
    { name: 'another group is selected', selection: { groupId: 11, ruleKey }, scrolledElement: null },
    {
      name: 'the group is selected without a rule key',
      selection: { groupId: 10, ruleKey: null },
      scrolledElement: 'placeholder rule box',
    },
    {
      name: 'the selected rule key matches no box',
      selection: { groupId: 10, ruleKey: 'stale' },
      scrolledElement: 'group',
    },
    { name: 'a rule box in the group is selected', selection: { groupId: 10, ruleKey }, scrolledElement: 'rule box' },
  ])('scrolls once, and only the right element, when $name: $scrolledElement', ({ selection, scrolledElement }) => {
    const { container } = renderBox({ selection });

    if (scrolledElement === null) {
      expect(scrollIntoView).not.toHaveBeenCalled();
      return;
    }
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    const expectedElements = {
      group: container.querySelector('.criteria-group-box'),
      'rule box': ruleBoxButton().closest('.rule-box'),
      'placeholder rule box': container.querySelectorAll('.rule-box')[1],
    };
    const expectedElement = expectedElements[scrolledElement as keyof typeof expectedElements];
    expect(scrollIntoView.mock.contexts[0]).toBe(expectedElement);
  });
});
