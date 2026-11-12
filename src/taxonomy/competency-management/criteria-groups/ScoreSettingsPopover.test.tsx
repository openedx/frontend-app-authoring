import type { ComponentProps, MutableRefObject } from 'react';
import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
import ScoreSettingsPopover from './ScoreSettingsPopover';

type Props = ComponentProps<typeof ScoreSettingsPopover>;

const gte70 = { op: 'gte' as const, value: 0.7, scale: 'percent' as const };

describe('<ScoreSettingsPopover />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  const renderPopover = (props: Partial<Props> = {}) => {
    const onCommit = jest.fn().mockResolvedValue(undefined);
    const onRequestClose = jest.fn();
    render(
      <ScoreSettingsPopover
        rulePayload={gte70}
        onCommit={onCommit}
        onRequestClose={onRequestClose}
        initialFocus="input"
        {...props}
      />,
    );
    return { onCommit, onRequestClose };
  };

  const typeScore = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, text);
    return input;
  };

  it('renders the heading, the operator, the percent and "%"', () => {
    renderPopover();

    expect(screen.getByRole('dialog', { name: 'Competency Completion Rule' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Comparison, or higher' })).toHaveTextContent('>=');
    expect(screen.getByRole('textbox')).toHaveValue('70');
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('shows "<=" in the toggle for a lte rule', () => {
    renderPopover({ rulePayload: { ...gte70, op: 'lte' } });
    expect(screen.getByRole('button', { name: 'Comparison, or lower' })).toHaveTextContent('<=');
  });

  it('commits the typed percent on Enter and requests close', async () => {
    const user = userEvent.setup();
    const { onCommit, onRequestClose } = renderPopover();

    await typeScore(user, '85');
    await user.keyboard('{Enter}');

    expect(onCommit).toHaveBeenCalledWith({ op: 'gte', value: 0.85, scale: 'percent' });
    await waitFor(() => expect(onRequestClose).toHaveBeenCalledTimes(1));
  });

  it('commits op "lte" with the unchanged value after choosing "<="', async () => {
    const user = userEvent.setup();
    const { onCommit, onRequestClose } = renderPopover();

    await user.click(screen.getByRole('button', { name: 'Comparison, or higher' }));
    await user.click(screen.getByRole('button', { name: 'or lower' }));
    expect(screen.getByRole('button', { name: 'Comparison, or lower' })).toHaveTextContent('<=');
    expect(onCommit).not.toHaveBeenCalled();

    await user.click(screen.getByRole('textbox'));
    await user.keyboard('{Enter}');

    expect(onCommit).toHaveBeenCalledWith({ op: 'lte', value: 0.7, scale: 'percent' });
    await waitFor(() => expect(onRequestClose).toHaveBeenCalled());
  });

  it('requests close without committing when Enter is pressed with nothing changed', async () => {
    const user = userEvent.setup();
    const { onCommit, onRequestClose } = renderPopover();

    await user.click(screen.getByRole('textbox'));
    await user.keyboard('{Enter}');

    expect(onCommit).not.toHaveBeenCalled();
    await waitFor(() => expect(onRequestClose).toHaveBeenCalledTimes(1));
  });

  it('reverts the input on Escape and requests close without committing', async () => {
    const user = userEvent.setup();
    const { onCommit, onRequestClose } = renderPopover();

    const input = await typeScore(user, '99');
    await user.keyboard('{Escape}');

    expect(input).toHaveValue('70');
    expect(onCommit).not.toHaveBeenCalled();
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it.each(['101', '-1', '2.5'])('blocks the commit and shows the range message for %s', async (typed) => {
    const user = userEvent.setup();
    const commitRef: MutableRefObject<(() => Promise<boolean>) | null> = { current: null };
    const { onCommit, onRequestClose } = renderPopover({ commitRef });

    await typeScore(user, typed);
    await user.keyboard('{Enter}');

    expect(screen.getByText('Enter a whole number from 0 to 100.')).toBeInTheDocument();
    expect(onCommit).not.toHaveBeenCalled();
    expect(onRequestClose).not.toHaveBeenCalled();
    await expect(commitRef.current!()).resolves.toBe(false);
  });

  it('blocks the commit and shows the message when getInlineValidationMessage returns one', async () => {
    const user = userEvent.setup();
    const getInlineValidationMessage = jest.fn().mockReturnValue('Duplicate score.');
    const { onCommit, onRequestClose } = renderPopover({ getInlineValidationMessage });

    await typeScore(user, '85');
    await user.keyboard('{Enter}');

    expect(getInlineValidationMessage).toHaveBeenCalledWith({ op: 'gte', value: 0.85, scale: 'percent' });
    expect(screen.getByText('Duplicate score.')).toBeInTheDocument();
    expect(onCommit).not.toHaveBeenCalled();
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('reverts the input and stays open when the commit is rejected', async () => {
    const user = userEvent.setup();
    const onCommit = jest.fn().mockRejectedValue(new Error('save failed'));
    const { onRequestClose } = renderPopover({ onCommit });

    const input = await typeScore(user, '85');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(input).toHaveValue('70'));
    expect(input).toHaveFocus();
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('ignores a second commit while one is in flight', async () => {
    const user = userEvent.setup();
    const commitRef: MutableRefObject<(() => Promise<boolean>) | null> = { current: null };
    let resolveCommit: () => void;
    const onCommit = jest.fn().mockImplementation(() =>
      new Promise<void>((resolve) => {
        resolveCommit = resolve;
      })
    );
    const { onRequestClose } = renderPopover({ onCommit, commitRef });

    await typeScore(user, '85');
    await user.keyboard('{Enter}');
    await expect(commitRef.current!()).resolves.toBe(false);

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onRequestClose).not.toHaveBeenCalled();
    resolveCommit!();
    await waitFor(() => expect(screen.getByRole('textbox')).not.toBeDisabled());
  });

  it.each(['', 'abc'])('reverts on Enter and closes without committing for the input "%s"', async (typed) => {
    const user = userEvent.setup();
    const commitRef: MutableRefObject<(() => Promise<boolean>) | null> = { current: null };
    const { onCommit, onRequestClose } = renderPopover({ commitRef });

    const input = screen.getByRole('textbox');
    await user.clear(input);
    if (typed) {
      await user.type(input, typed);
    }
    await user.keyboard('{Enter}');

    expect(input).toHaveValue('70');
    expect(onCommit).not.toHaveBeenCalled();
    await waitFor(() => expect(onRequestClose).toHaveBeenCalledTimes(1));
    await expect(commitRef.current!()).resolves.toBe(true);
  });

  it('commits through commitRef and resolves true for a changed valid value', async () => {
    const user = userEvent.setup();
    const commitRef: MutableRefObject<(() => Promise<boolean>) | null> = { current: null };
    const { onCommit } = renderPopover({ commitRef });

    await typeScore(user, '85');
    await expect(commitRef.current!()).resolves.toBe(true);

    expect(onCommit).toHaveBeenCalledWith({ op: 'gte', value: 0.85, scale: 'percent' });
  });

  it('resolves true through commitRef without committing when nothing changed', async () => {
    const commitRef: MutableRefObject<(() => Promise<boolean>) | null> = { current: null };
    const { onCommit } = renderPopover({ commitRef });

    await expect(commitRef.current!()).resolves.toBe(true);

    expect(onCommit).not.toHaveBeenCalled();
  });

  it('clears commitRef on unmount', () => {
    const commitRef: MutableRefObject<(() => Promise<boolean>) | null> = { current: null };
    const onCommit = jest.fn();
    const { unmount } = render(
      <ScoreSettingsPopover
        rulePayload={gte70}
        onCommit={onCommit}
        onRequestClose={jest.fn()}
        initialFocus="input"
        commitRef={commitRef}
      />,
    );
    expect(commitRef.current).not.toBeNull();

    unmount();

    expect(commitRef.current).toBeNull();
  });

  it('describes the input by the validation message', async () => {
    const user = userEvent.setup();
    renderPopover({ hint: 'Pick another.' });

    await typeScore(user, '150');
    await user.keyboard('{Enter}');

    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Enter a whole number from 0 to 100.');
  });

  it('describes the input by the hint', () => {
    renderPopover({ hint: 'Pick another.' });

    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Pick another.');
    expect(screen.getByRole('textbox')).not.toBeInvalid();
  });

  it('marks the input invalid when the hint is an error', () => {
    renderPopover({ hint: 'Pick another.', hintIsError: true });

    expect(screen.getByRole('textbox')).toBeInvalid();
    expect(screen.getByText('Pick another.').closest('.pgn__form-text-invalid')).not.toBeNull();
  });

  it('shows only the validation message when both it and a hint apply', async () => {
    const user = userEvent.setup();
    renderPopover({ getInlineValidationMessage: () => 'Taken.', hint: 'Pick another.' });

    await typeScore(user, '85');
    await user.keyboard('{Enter}');

    expect(screen.getByText('Taken.')).toBeInTheDocument();
    expect(screen.queryByText('Pick another.')).not.toBeInTheDocument();
  });

  it('renders the suggestion link and calls onApply when it is clicked', async () => {
    const user = userEvent.setup();
    const onApply = jest.fn();
    renderPopover({ suggestion: { rulePayload: { ...gte70, value: 0.8 }, onApply } });

    await user.click(screen.getByRole('button', { name: 'Use 80% or higher' }));

    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('puts data-autofocus on the input when initialFocus is "input"', () => {
    renderPopover({ suggestion: { rulePayload: { ...gte70, value: 0.8 }, onApply: jest.fn() } });

    expect(screen.getByRole('textbox')).toHaveAttribute('data-autofocus');
    expect(screen.getByRole('button', { name: 'Use 80% or higher' })).not.toHaveAttribute('data-autofocus');
  });

  it('puts data-autofocus on the link when initialFocus is "suggestion"', () => {
    renderPopover({
      initialFocus: 'suggestion',
      suggestion: { rulePayload: { ...gte70, value: 0.8 }, onApply: jest.fn() },
    });

    expect(screen.getByRole('button', { name: 'Use 80% or higher' })).toHaveAttribute('data-autofocus');
    expect(screen.getByRole('textbox')).not.toHaveAttribute('data-autofocus');
  });

  it('puts data-autofocus on the input when initialFocus is "suggestion" but there is no suggestion', () => {
    renderPopover({ initialFocus: 'suggestion' });
    expect(screen.getByRole('textbox')).toHaveAttribute('data-autofocus');
  });

  it('selects the whole value when the input is focused', async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole('textbox'));

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(2);
  });

  it('shows "=" for an eq rule and offers only ">=" and "<=" as enabled items', async () => {
    const user = userEvent.setup();
    renderPopover({ rulePayload: { ...gte70, op: 'eq' } });

    const toggle = screen.getByRole('button', { name: 'Comparison, equal to' });
    expect(toggle).toHaveTextContent('=');
    await user.click(toggle);

    expect(screen.getByRole('button', { name: 'or higher' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'or lower' })).toBeEnabled();
    const current = screen.getByRole('button', { name: '=' });
    expect(current).toBeDisabled();
    expect(current).toHaveClass('active');
  });
});
