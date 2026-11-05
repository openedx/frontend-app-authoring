import { initializeMocks, render, screen } from '@src/testUtils';
import { criterion } from '../__mocks__';
import CriterionChipList from './CriterionChipList';

describe('<CriterionChipList />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders one chip per criterion, using the resolved subsection name', () => {
    const criteria = [
      criterion(1, 'block-a', 10),
      criterion(2, 'block-b', 10),
    ];
    render(
      <CriterionChipList
        criteria={criteria}
        subsectionNamesByUsageKey={{ 'block-a': 'Subsection A', 'block-b': 'Subsection B' }}
      />,
    );

    expect(screen.getByText('Subsection A')).toBeInTheDocument();
    expect(screen.getByText('Subsection B')).toBeInTheDocument();
  });

  it('shows the "Content unavailable" warning label when a criterion\'s objectId isn\'t in the resolved names', () => {
    render(
      <CriterionChipList
        criteria={[criterion(1, 'deleted-block', 10)]}
        subsectionNamesByUsageKey={{}}
      />,
    );

    expect(screen.getByText('Content unavailable')).toBeInTheDocument();
  });
});
