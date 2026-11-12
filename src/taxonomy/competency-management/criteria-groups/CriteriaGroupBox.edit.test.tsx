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
  mockScrollIntoView();
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
});
