import {
  initializeMocks,
  render,
  screen,
  userEvent,
} from '@src/testUtils';
import { criterion, MockCompetencyAssociationsProvider } from '../__mocks__';
import type { MockCompetencyAssociationsOverrides } from '../__mocks__';
import CriterionChipList from './CriterionChipList';
import type { CriterionChipListProps } from './CriterionChipList';

const renderList = (props: CriterionChipListProps, contextOverrides: MockCompetencyAssociationsOverrides = {}) => (
  render(
    <MockCompetencyAssociationsProvider value={contextOverrides}>
      <CriterionChipList {...props} />
    </MockCompetencyAssociationsProvider>,
  )
);

describe('<CriterionChipList />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders one chip per criterion, using the resolved subsection name', () => {
    renderList({
      criteria: [criterion(1, 'block-a', 10), criterion(2, 'block-b', 10)],
      subsectionNamesByUsageKey: { 'block-a': 'Subsection A', 'block-b': 'Subsection B' },
    });

    expect(screen.getByText('Subsection A')).toBeInTheDocument();
    expect(screen.getByText('Subsection B')).toBeInTheDocument();
  });

  it('shows the "Content unavailable" warning label when a criterion\'s objectId isn\'t in the resolved names', () => {
    renderList({ criteria: [criterion(1, 'deleted-block', 10)], subsectionNamesByUsageKey: {} });

    expect(screen.getByText('Content unavailable')).toBeInTheDocument();
  });

  it('shows no remove button on a chip unless canEdit is set', () => {
    renderList({ criteria: [criterion(1, 'block-a', 10)], subsectionNamesByUsageKey: { 'block-a': 'Subsection A' } });

    expect(screen.queryByRole('button', { name: /^Remove the association/ })).not.toBeInTheDocument();
  });

  it('removes the association of the chip whose remove button is clicked', async () => {
    const user = userEvent.setup();
    const removeAssociation = jest.fn();
    renderList(
      {
        criteria: [criterion(1, 'block-a', 10), criterion(2, 'block-b', 10)],
        subsectionNamesByUsageKey: { 'block-a': 'Subsection A', 'block-b': 'Subsection B' },
        canEdit: true,
      },
      { removeAssociation },
    );

    await user.click(screen.getByRole('button', { name: 'Remove the association with Subsection B' }));

    expect(removeAssociation).toHaveBeenCalledTimes(1);
    expect(removeAssociation).toHaveBeenCalledWith(2, 'group');
  });

  it('takes the remove button out of the tab order while a delete is in flight', () => {
    renderList(
      {
        criteria: [criterion(1, 'block-a', 10)],
        subsectionNamesByUsageKey: { 'block-a': 'Subsection A' },
        canEdit: true,
      },
      { isDeleting: true },
    );

    expect(screen.getByRole('button', { name: 'Remove the association with Subsection A' }))
      .toHaveAttribute('tabindex', '-1');
  });
});
