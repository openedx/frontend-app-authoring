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
      { isDeletingGroupOrRuleBoxOrCriterion: true },
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

  it('marks only the unresolved criterion as unavailable in a mixed list', () => {
    renderList({
      criteria: [criterion(1, 'block-a', 10), criterion(2, 'deleted-block', 10)],
      subsectionNamesByUsageKey: { 'block-a': 'Subsection A' },
      courseName: 'Course A',
    });

    expect(screen.getByText('Subsection A')).toBeInTheDocument();
    expect(screen.getAllByText('Content unavailable in Course A')).toHaveLength(1);
  });

  it('renders every criterion when all of them are unavailable', () => {
    renderList({
      criteria: [criterion(1, 'gone-a', 10), criterion(2, 'gone-b', 10)],
      subsectionNamesByUsageKey: {},
      courseName: 'Course A',
    });

    expect(screen.getAllByText('Content unavailable in Course A')).toHaveLength(2);
  });

  it('removes an unavailable chip\'s criterion by its id', async () => {
    const user = userEvent.setup();
    const removeCriterion = jest.fn();
    renderList(
      {
        criteria: [criterion(1, 'deleted-block', 10)],
        subsectionNamesByUsageKey: {},
        courseName: 'Course A',
        canEdit: true,
      },
      { removeCriterion },
    );

    await user.click(screen.getByRole('button', { name: 'Remove the association with Content unavailable' }));

    expect(removeCriterion).toHaveBeenCalledWith(1, 'group');
  });
});
