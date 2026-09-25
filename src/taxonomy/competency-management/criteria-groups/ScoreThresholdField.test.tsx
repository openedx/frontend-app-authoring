import { initializeMocks, render, screen } from '@src/testUtils';
import ScoreThresholdField from './ScoreThresholdField';

describe('<ScoreThresholdField />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders "or higher" for a gte rule, as plain text with no control', () => {
    render(<ScoreThresholdField rulePayload={{ op: 'gte', value: 0.7, scale: 'percent' }} />);

    expect(screen.getByText('With a score of 70% or higher')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders "or lower" for a lte rule', () => {
    render(<ScoreThresholdField rulePayload={{ op: 'lte', value: 0.5, scale: 'percent' }} />);
    expect(screen.getByText('With a score of 50% or lower')).toBeInTheDocument();
  });

  it('renders no suffix for an eq rule', () => {
    render(<ScoreThresholdField rulePayload={{ op: 'eq', value: 1, scale: 'percent' }} />);
    expect(screen.getByText('With a score of 100%')).toBeInTheDocument();
    expect(screen.queryByText(/or higher|or lower/)).not.toBeInTheDocument();
  });

  it('rounds a fractional value to the nearest whole percent', () => {
    render(<ScoreThresholdField rulePayload={{ op: 'gte', value: 0.666, scale: 'percent' }} />);
    expect(screen.getByText('With a score of 67% or higher')).toBeInTheDocument();
  });
});
