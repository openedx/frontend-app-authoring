import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
import { createIntl } from 'react-intl';
import ScoreThresholdField, { formatScoreSummary } from './ScoreThresholdField';
import messages from './messages';

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

  describe('editable (onChange given)', () => {
    const rulePayload70Percent = { op: 'gte' as const, value: 0.7, scale: 'percent' as const };

    it('commits the typed percent, as a fraction, on Enter - op/scale pinned unchanged', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

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
          <ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />
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
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

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
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '85');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith({ op: 'gte', value: 0.85, scale: 'percent' });
      await waitFor(() => expect(input).toHaveValue('70'));
    });

    it('ignores a second commit attempt (e.g. blur right after Enter) while the first is still in flight', async () => {
      const user = userEvent.setup();
      let resolveOnChange: () => void;
      const onChange = jest.fn().mockImplementation(() =>
        new Promise<void>((resolve) => {
          resolveOnChange = resolve;
        })
      );
      render(
        <>
          <ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />
          <button type="button">elsewhere</button>
        </>,
      );

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '85');
      await user.keyboard('{Enter}');
      // Enter's own commit is now in flight (its mutation promise hasn't
      // resolved yet) - a second attempt, from blurring right after, must
      // not issue a second, possibly-out-of-order, request.
      expect(input).toBeDisabled();
      await user.click(screen.getByRole('button', { name: 'elsewhere' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      resolveOnChange!();
      await waitFor(() => expect(input).not.toBeDisabled());
    });

    it('blocks the commit and shows the inline message when getInlineValidationMessage returns one', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      const getInlineValidationMessage = jest.fn().mockReturnValue('Duplicate score.');
      render(
        <ScoreThresholdField
          rulePayload={rulePayload70Percent}
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
          <ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />
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
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '70');
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('reverts, rather than committing 0%, when the input is cleared entirely', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('70');
    });

    it('blocks the commit and shows the range message for a value above 100', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '150');
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText('Enter a whole number from 0 to 100.')).toBeInTheDocument();
    });

    it('blocks the commit and shows the range message for a negative value', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '-5');
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText('Enter a whole number from 0 to 100.')).toBeInTheDocument();
    });

    it('blocks the commit and shows the range message for a decimal value', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '85.5');
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText('Enter a whole number from 0 to 100.')).toBeInTheDocument();
    });

    it('focuses and selects the input on mount when autoFocusSelect is set', () => {
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} autoFocusSelect />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).toHaveFocus();
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(input.value.length);
    });

    it('does not take focus on mount by default', () => {
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} />);
      expect(screen.getByRole('textbox')).not.toHaveFocus();
    });

    it('describes the input by the hint', () => {
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} hint="Pick another." />);

      expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Pick another.');
      expect(screen.getByRole('textbox')).not.toBeInvalid();
    });

    it('marks the input invalid when the hint is an error', () => {
      render(
        <ScoreThresholdField
          rulePayload={rulePayload70Percent}
          onChange={jest.fn()}
          hint="Pick another."
          hintIsError
        />,
      );

      expect(screen.getByRole('textbox')).toBeInvalid();
      expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Pick another.');
    });

    it('shows only the commit-time validation message when both it and a hint apply', async () => {
      const user = userEvent.setup();
      render(
        <ScoreThresholdField
          rulePayload={rulePayload70Percent}
          onChange={jest.fn()}
          getInlineValidationMessage={() => 'Taken.'}
          hint="Pick another."
        />,
      );

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '85');
      await user.keyboard('{Enter}');

      expect(screen.getByText('Taken.')).toBeInTheDocument();
      expect(screen.queryByText('Pick another.')).not.toBeInTheDocument();
    });
  });

  describe('formatScoreSummary', () => {
    it.each(
      [
        ['gte', 0.75, '75% or higher'],
        ['lte', 0.4, '40% or lower'],
        ['eq', 0.5, '50%'],
      ] as const,
    )('formats %s %s as "%s"', (op, value, expected) => {
      const intl = createIntl({ locale: 'en' });
      expect(formatScoreSummary(intl, { op, value, scale: 'percent' })).toBe(expected);
    });

    it('does not depend on the label message having a <threshold> tag', () => {
      const intl = createIntl({
        locale: 'en-GB',
        defaultLocale: 'en',
        messages: { [messages.scoreThresholdLabel.id]: 'A translation with no placeholders' },
      });
      expect(formatScoreSummary(intl, { op: 'gte', value: 0.75, scale: 'percent' })).toBe('75% or higher');
    });
  });
});
