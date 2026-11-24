import {
  initializeMocks,
  render,
  screen,
  userEvent,
} from '@src/testUtils';
import { criterion, MockCompetencyAssociationsProvider } from '@src/taxonomy/competency-management/__mocks__';
import type { MockCompetencyAssociationsOverrides } from '@src/taxonomy/competency-management/__mocks__';
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
    const removeCriterion = jest.fn();
    renderList(
      {
        criteria: [criterion(1, 'block-a', 10), criterion(2, 'block-b', 10)],
        subsectionNamesByUsageKey: { 'block-a': 'Subsection A', 'block-b': 'Subsection B' },
        canEdit: true,
      },
      { removeCriterion },
    );

    await user.click(screen.getByRole('button', { name: 'Remove the association with Subsection B' }));

    expect(removeCriterion).toHaveBeenCalledTimes(1);
    expect(removeCriterion).toHaveBeenCalledWith(2, 'group');
  });

  it('takes the remove button out of the tab order while a delete is in flight', () => {
    renderList(
      {
        criteria: [criterion(1, 'block-a', 10)],
        subsectionNamesByUsageKey: { 'block-a': 'Subsection A' },
        canEdit: true,
      },
      { isDeletingGroupOrCriterion: true },
    );

    expect(screen.getByRole('button', { name: 'Remove the association with Subsection A' }))
      .toHaveAttribute('tabindex', '-1');
  });

  it('takes the remove button out of the tab order while an association is being created', () => {
    renderList(
      {
        criteria: [criterion(1, 'block-a', 10)],
        subsectionNamesByUsageKey: { 'block-a': 'Subsection A' },
        canEdit: true,
      },
      { isAssociating: true },
    );

    expect(screen.getByRole('button', { name: 'Remove the association with Subsection A' }))
      .toHaveAttribute('tabindex', '-1');
  });
});
