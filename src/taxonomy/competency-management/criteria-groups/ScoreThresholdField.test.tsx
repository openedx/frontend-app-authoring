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
    const { container } = render(<ScoreThresholdField rulePayload={{ op: 'gte', value: 0.7, scale: 'percent' }} />);

    expect(screen.getByText('70% or higher').closest('.score-threshold-field__label')).toHaveTextContent(
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
    const scoreSettingsButton = () => screen.getByText('70% or higher').closest('button')!;
    const typeScore = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, text);
      return input;
    };

    it('renders the sentence as a button that opens a dialog, closed at first', () => {
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} />);

      expect(scoreSettingsButton()).toHaveAttribute('aria-haspopup', 'dialog');
      expect(scoreSettingsButton()).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(scoreSettingsButton().nextElementSibling).toBeNull();
    });

    it('puts the button sentence in the label element the stylesheet targets', () => {
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} />);

      const label = scoreSettingsButton().querySelector('.score-threshold-field__label')!;
      expect(label).toHaveTextContent('With a score of 70% or higher');
      expect(label.parentElement).toBe(scoreSettingsButton());
      expect(label).not.toContainElement(scoreSettingsButton().querySelector('svg'));
    });

    it('opens the dialog on click, with the input focused and its value selected', async () => {
      const user = userEvent.setup();
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} />);

      await user.click(scoreSettingsButton());

      expect(screen.getByRole('dialog', { name: 'Competency Completion Rule' })).toBeInTheDocument();
      expect(scoreSettingsButton()).toHaveAttribute('aria-expanded', 'true');
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await waitFor(() => expect(input).toHaveFocus());
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(input.value.length);
    });

    it('opens on mount with the input focused when autoOpen is set', async () => {
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} autoOpen />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await waitFor(() => expect(input).toHaveFocus());
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(input.value.length);
    });

    it('focuses the score settings button on mount, with the popover closed, when focusButtonOnMount is set', async () => {
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={jest.fn()} focusButtonOnMount />);

      await waitFor(() => expect(scoreSettingsButton()).toHaveFocus());
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('commits the typed percent, as a fraction, on Enter, closes, and refocuses the score settings button', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

      await user.click(scoreSettingsButton());
      await typeScore(user, '85');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith({ op: 'gte', value: 0.85, scale: 'percent' });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(scoreSettingsButton()).toHaveFocus();
      expect(scoreSettingsButton()).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes on Escape without committing, and refocuses the score settings button', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

      await user.click(scoreSettingsButton());
      await typeScore(user, '99');
      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onChange).not.toHaveBeenCalled();
      expect(scoreSettingsButton()).toHaveFocus();
    });

    it('keeps the dialog open and commits nothing on Escape while the comparison menu is open', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn().mockResolvedValue(undefined);
      render(<ScoreThresholdField rulePayload={rulePayload70Percent} onChange={onChange} />);

      await user.click(scoreSettingsButton());
      await typeScore(user, '80');
      await user.click(screen.getByRole('button', { name: 'Comparison, or higher' }));
      await user.keyboard('{Escape}');

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onChange).not.toHaveBeenCalled();
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

      await user.click(scoreSettingsButton());
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

      await user.click(scoreSettingsButton());
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

      await user.click(scoreSettingsButton());
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

      await user.click(scoreSettingsButton());
      await user.click(screen.getByText('elsewhere'));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onChange).not.toHaveBeenCalled();
    });

    it('opens on hintIsError with the suggestion link focused', async () => {
      render(
        <ScoreThresholdField
          rulePayload={rulePayload70Percent}
          onChange={jest.fn()}
          scoreTakenHint="Taken."
          hintIsError
          scoreSuggestion={suggestion}
        />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await waitFor(() => expect(screen.getByRole('button', { name: 'Use 75% or higher' })).toHaveFocus());
      expect(screen.getByRole('textbox')).toBeInvalid();
      expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Taken.');
    });

    it('focuses the input on hintIsError when there is no suggestion', async () => {
      render(
        <ScoreThresholdField
          rulePayload={rulePayload70Percent}
          onChange={jest.fn()}
          scoreTakenHint="Taken."
          hintIsError
        />,
      );

      await waitFor(() => expect(screen.getByRole('textbox')).toHaveFocus());
      expect(screen.getByText('Taken.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Use / })).toBeNull();
    });

    it('reopens on a rejection after the popover was closed', async () => {
      const user = userEvent.setup();
      const ui = (hintIsError: boolean, rejectionCount: number) => (
        <ScoreThresholdField
          rulePayload={rulePayload70Percent}
          onChange={jest.fn()}
          scoreTakenHint="Taken."
          hintIsError={hintIsError}
          rejectionCount={rejectionCount}
          scoreSuggestion={suggestion}
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
  });
});
