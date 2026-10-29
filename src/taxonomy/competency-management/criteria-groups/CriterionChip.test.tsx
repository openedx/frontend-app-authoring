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

  it('renders a trailing remove icon that is hidden from assistive tech and not interactive', () => {
    const { container } = render(<CriterionChip displayName="Subsection 1" />);
    const icon = container.querySelector('.pgn__chip__icon-after')!;

    expect(icon).toBeInTheDocument();
    expect(icon.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelector('[tabindex]')).not.toBeInTheDocument();
  });
});
