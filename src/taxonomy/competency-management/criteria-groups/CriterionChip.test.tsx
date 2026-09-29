import { initializeMocks, render, screen } from '@src/testUtils';
import CriterionChip from './CriterionChip';

describe('<CriterionChip />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the given display name', () => {
    render(<CriterionChip displayName="Subsection 1" />);
    expect(screen.getByText('Subsection 1')).toBeInTheDocument();
  });
});
