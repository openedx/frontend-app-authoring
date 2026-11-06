import { initializeMocks, render, screen } from '@src/testUtils';
import ScoreThresholdField from './ScoreThresholdField';

describe('<ScoreThresholdField />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders "or higher" for a gte rule, as plain text with no control', () => {
    const { container } = render(<ScoreThresholdField rulePayload={{ op: 'gte', value: 0.7, scale: 'percent' }} />);

    expect(screen.getByText('70% or higher').closest('.score-threshold-field')).toHaveTextContent(
      'With a score of 70% or higher',
    );
    expect(container.querySelector('input, select, textarea, button')).toBeNull();
  });

  it('renders "or lower" for a lte rule', () => {
    render(<ScoreThresholdField rulePayload={{ op: 'lte', value: 0.5, scale: 'percent' }} />);
    expect(screen.getByText('50% or lower')).toBeInTheDocument();
  });

  it('renders no suffix for an eq rule', () => {
    render(<ScoreThresholdField rulePayload={{ op: 'eq', value: 1, scale: 'percent' }} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.queryByText(/or higher|or lower/)).not.toBeInTheDocument();
  });

  it.each([
    [0.666, '67%'],
    [0.855, '86%'],
    [0.7, '70%'],
  ])('shows the value %s as %s, rounded to a whole number', (value, expected) => {
    render(<ScoreThresholdField rulePayload={{ op: 'gte', value, scale: 'percent' }} />);
    expect(screen.getByText(`${expected} or higher`)).toBeInTheDocument();
  });
});
