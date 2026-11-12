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
    const suggestion = {
      rulePayload: { op: 'gte' as const, value: 0.75, scale: 'percent' as const },
      onApply: jest.fn(),
    };
    // Found by text: the open dialog marks the rest of the page `aria-hidden`, which empties its accessible name.
    const pill = () => screen.getByText('70% or higher').closest('button')!;
    const typeScore = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, text);
      return input;
    };

    it('renders the sentence as a button that opens a dialog, closed at first', () => {
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} />);

      expect(pill()).toHaveAttribute('aria-haspopup', 'dialog');
      expect(pill()).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens the dialog on click, with the input focused and its value selected', async () => {
      const user = userEvent.setup();
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} />);

      await user.click(pill());

      expect(screen.getByRole('dialog', { name: 'Competency Completion Rule' })).toBeInTheDocument();
      expect(pill()).toHaveAttribute('aria-expanded', 'true');
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await waitFor(() => expect(input).toHaveFocus());
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(input.value.length);
    });

    it('opens on mount with the input focused when autoOpen is set', async () => {
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} autoOpen />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await waitFor(() => expect(screen.getByRole('textbox')).toHaveFocus());
    });

    it('focuses the pill on mount, with the popover closed, when focusPillOnMount is set', async () => {
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} focusPillOnMount />);

      await waitFor(() => expect(pill()).toHaveFocus());
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('commits the typed percent, as a fraction, on Enter, closes, and refocuses the pill', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

      await user.click(pill());
      await typeScore(user, '85');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith({ op: 'gte', value: 0.85, scale: 'percent' });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(pill()).toHaveFocus();
      expect(pill()).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes on Escape without committing, and refocuses the pill', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

      await user.click(pill());
      await typeScore(user, '99');
      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onChange).not.toHaveBeenCalled();
      expect(pill()).toHaveFocus();
    });

    it('discards a typed change on Escape with focus on the operator toggle', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

      await user.click(pill());
      await typeScore(user, '90');
      await user.tab({ shift: true });
      expect(screen.getByRole('button', { name: 'Comparison, or higher' })).toHaveFocus();
      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onChange).not.toHaveBeenCalled();
      expect(pill()).toHaveTextContent('70% or higher');
    });

    it('stays open with the persisted value when a click outside commits a change that is rejected', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockRejectedValue(new Error('save failed'));
      render(
        <>
          <ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />
          <button type="button">elsewhere</button>
        </>,
      );

      await user.click(pill());
      const input = await typeScore(user, '90');
      await user.click(screen.getByText('elsewhere'));

      await waitFor(() => expect(input).toHaveValue('70'));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('commits a changed valid value and closes on a click outside', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(
        <>
          <ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />
          <button type="button">elsewhere</button>
        </>,
      );

      await user.click(pill());
      await typeScore(user, '90');
      await user.click(screen.getByText('elsewhere'));

      expect(onChange).toHaveBeenCalledWith({ op: 'gte', value: 0.9, scale: 'percent' });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('stays open, shows the message and does not commit on a click outside with an invalid value', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(
        <>
          <ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />
          <button type="button">elsewhere</button>
        </>,
      );

      await user.click(pill());
      await typeScore(user, '150');
      await user.click(screen.getByText('elsewhere'));

      expect(onChange).not.toHaveBeenCalled();
      expect(await screen.findByText('Enter a whole number from 0 to 100.')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not call onChange on a click outside when nothing changed', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(
        <>
          <ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />
          <button type="button">elsewhere</button>
        </>,
      );

      await user.click(pill());
      await user.click(screen.getByText('elsewhere'));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onChange).not.toHaveBeenCalled();
    });

    it('passes the candidate payload to getInlineValidationMessage and blocks the commit with its message', async () => {
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

      await user.click(pill());
      await typeScore(user, '85');
      await user.keyboard('{Enter}');

      expect(getInlineValidationMessage).toHaveBeenCalledWith({ op: 'gte', value: 0.85, scale: 'percent' });
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText('Duplicate score.')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('opens on hintIsError with the suggestion link focused', async () => {
      render(
        <ScoreThresholdField
          rulePayload={rulePayload70Percent}
          onChange={jest.fn()}
          hint="Taken."
          hintIsError
          suggestion={suggestion}
        />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await waitFor(() => expect(screen.getByRole('button', { name: 'Use 75% or higher' })).toHaveFocus());
      expect(screen.getByRole('textbox')).toBeInvalid();
      expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Taken.');
    });

    it('focuses the input on hintIsError when there is no suggestion', async () => {
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} hint="Taken." hintIsError />);

      await waitFor(() => expect(screen.getByRole('textbox')).toHaveFocus());
    });

    it('reopens on a rejection after the popover was closed', async () => {
      const user = userEvent.setup();
      const ui = (hintIsError: boolean, rejectionCount: number) => (
        <ScoreThresholdField
          rulePayload={rulePayload70Percent}
          onChange={jest.fn()}
          hint="Taken."
          hintIsError={hintIsError}
          rejectionCount={rejectionCount}
          suggestion={suggestion}
        />
      );
      const { rerender } = render(ui(false, 0));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(ui(true, 1));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      rerender(ui(true, 2));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await waitFor(() => expect(screen.getByRole('button', { name: 'Use 75% or higher' })).toHaveFocus());
    });

    it('refocuses the suggestion link when the rejection count changes while open', async () => {
      const user = userEvent.setup();
      const ui = (rejectionCount: number) => (
        <ScoreThresholdField
          rulePayload={rulePayload70Percent}
          onChange={jest.fn()}
          hint="Taken."
          hintIsError
          rejectionCount={rejectionCount}
          suggestion={suggestion}
        />
      );
      const { rerender } = render(ui(1));
      const link = () => screen.getByRole('button', { name: 'Use 75% or higher' });
      await waitFor(() => expect(link()).toHaveFocus());

      await user.click(screen.getByRole('textbox'));
      expect(link()).not.toHaveFocus();

      rerender(ui(2));
      await waitFor(() => expect(link()).toHaveFocus());
    });

    it('applies the suggestion when its link is clicked', async () => {
      const user = userEvent.setup();
      const onApply = jest.fn();
      render(
        <ScoreThresholdField
          rulePayload={rulePayload70Percent}
          onChange={jest.fn()}
          hint="Taken."
          hintIsError
          suggestion={{ ...suggestion, onApply }}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Use 75% or higher' }));

      expect(onApply).toHaveBeenCalledTimes(1);
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
