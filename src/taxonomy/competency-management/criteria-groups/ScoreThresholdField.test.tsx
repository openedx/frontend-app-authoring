import { initializeMocks, render, screen } from '@src/testUtils';
import ScoreThresholdField from './ScoreThresholdField';

describe('<ScoreThresholdField />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders "or higher" for a gte rule, as plain text with no control', () => {
    render(<ScoreThresholdField rulePayload={{ op: 'gte', value: 0.7, scale: 'percent' }} />);

    expect(screen.getByText('70% or higher').closest('.score-threshold-field')).toHaveTextContent(
      'With a score of 70% or higher',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders a decorative chevron that is hidden from assistive tech', () => {
    const { container } = render(<ScoreThresholdField rulePayload={{ op: 'gte', value: 0.7, scale: 'percent' }} />);
    const chevron = container.querySelector('.score-threshold-field__chevron svg');

    expect(chevron).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.score-threshold-field__chevron')).not.toHaveAttribute('tabindex');
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

  it('rounds a fractional value to the nearest whole percent', () => {
    render(<ScoreThresholdField rulePayload={{ op: 'gte', value: 0.666, scale: 'percent' }} />);
    expect(screen.getByText('67% or higher')).toBeInTheDocument();
  });
});
