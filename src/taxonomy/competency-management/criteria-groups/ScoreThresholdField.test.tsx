import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
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

  describe('editable (onChange given)', () => {
    const rulePayload = { op: 'gte' as const, value: 0.7, scale: 'percent' as const };

    it('commits the typed percent, as a fraction, on Enter - op/scale pinned unchanged', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '85');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith({ op: 'gte', value: 0.85, scale: 'percent' });
    });

    it('commits the typed percent on blur', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(
        <>
          <ScoreThresholdField rulePayload={rulePayload} onChange={onChange} />
          <button type="button">elsewhere</button>
        </>,
      );

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '90');
      await user.click(screen.getByRole('button', { name: 'elsewhere' }));

      expect(onChange).toHaveBeenCalledWith({ op: 'gte', value: 0.9, scale: 'percent' });
    });

    it('Escape reverts the input to the last-persisted value without committing', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '99');
      await user.keyboard('{Escape}');

      expect(input).toHaveValue('70');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('reverts the input to the prop value when the commit is rejected', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockRejectedValue(new Error('save failed'));
      render(<ScoreThresholdField rulePayload={rulePayload} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '85');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith({ op: 'gte', value: 0.85, scale: 'percent' });
      await waitFor(() => expect(input).toHaveValue('70'));
    });

    it('blocks the commit and shows the inline message when getInlineValidationMessage returns one', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      const getInlineValidationMessage = jest.fn().mockReturnValue('Duplicate score.');
      render(
        <ScoreThresholdField
          rulePayload={rulePayload}
          onChange={onChange}
          getInlineValidationMessage={getInlineValidationMessage}
        />,
      );

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '85');
      await user.keyboard('{Enter}');

      expect(getInlineValidationMessage).toHaveBeenCalledWith('85');
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText('Duplicate score.')).toBeInTheDocument();
    });

    it('does not call onChange on blur when the input still matches the persisted value', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(
        <>
          <ScoreThresholdField rulePayload={rulePayload} onChange={onChange} />
          <button type="button">elsewhere</button>
        </>,
      );

      // Focus and blur without typing anything - a plain tab-through.
      await user.click(screen.getByRole('textbox'));
      await user.click(screen.getByRole('button', { name: 'elsewhere' }));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not call onChange when the typed value round-trips to the same displayed percent', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '70');
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('reverts, rather than committing 0%, when the input is cleared entirely', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('70');
    });
  });
});
