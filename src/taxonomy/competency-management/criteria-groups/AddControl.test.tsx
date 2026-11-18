import {
  fireEvent,
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
import AddControl from './AddControl';

const placeholderText = 'Fill in the empty box before adding another.';
const loadingText = 'Wait for the course list to finish loading before adding another.';
const savingText = 'Wait for the save to finish before adding another.';
const deletingText = 'Wait for the removal to finish before adding another.';

describe('<AddControl />', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    initializeMocks();
    user = userEvent.setup();
  });

  it.each([
    ['Rule', 'Add Rule'],
    ['Rule Group', 'Add Rule Group'],
  ])('names the "%s" control exactly "%s" and calls onClick when enabled', async (label, accessibleLabel) => {
    const onClick = jest.fn();
    render(<AddControl label={label} accessibleLabel={accessibleLabel} onClick={onClick} disabledReason={null} />);

    const button = screen.getByRole('button', { name: accessibleLabel });
    expect(button).not.toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toHaveAccessibleDescription();
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe.each([
    ['placeholder' as const, placeholderText],
    ['saving' as const, savingText],
    ['loading' as const, loadingText],
    ['deleting' as const, deletingText],
  ])('when disabled for "%s"', (disabledReason, text) => {
    let onClick: jest.Mock;
    let button: HTMLElement;

    beforeEach(() => {
      onClick = jest.fn();
      render(
        <AddControl label="Rule" accessibleLabel="Add Rule" onClick={onClick} disabledReason={disabledReason} />,
      );
      button = screen.getByRole('button', { name: 'Add Rule' });
    });

    it('is aria-disabled, not natively disabled, and describes the reason', () => {
      expect(button).toHaveAttribute('aria-disabled', 'true');
      // The native `disabled` attribute must be absent, which keeps the button focusable.
      expect(button).not.toBeDisabled();
      expect(button).toHaveAccessibleDescription(text);
    });

    it('opens the tooltip on focus and closes it on blur', async () => {
      await user.tab();
      expect(button).toHaveFocus();
      expect(await screen.findByRole('tooltip')).toHaveTextContent(text);
      expect(button).toHaveAccessibleDescription(text);
      expect(button).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id);

      await user.tab();
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
      expect(button).toHaveAccessibleDescription(text);
    });

    it('closes the tooltip with Escape, keeps focus on the control and keeps the description', async () => {
      await user.tab();
      expect(await screen.findByRole('tooltip')).toHaveTextContent(text);

      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
      expect(button).toHaveFocus();
      expect(button).toHaveAccessibleDescription(text);
    });

    it('closes a tooltip opened by hover with Escape and keeps it closed while the pointer stays', async () => {
      await user.hover(button);
      expect(await screen.findByRole('tooltip')).toHaveTextContent(text);
      expect(button).not.toHaveFocus();

      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
      // user-event's pointer doesn't set `relatedTarget`, which `OverlayTrigger` reads to ignore moves within the button.
      const child = button.firstElementChild as HTMLElement;
      fireEvent.mouseOut(button, { relatedTarget: child });
      fireEvent.mouseOver(child, { relatedTarget: button });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      fireEvent.mouseOut(child, { relatedTarget: button });
      fireEvent.mouseOver(button, { relatedTarget: child });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      expect(button).toHaveAccessibleDescription(text);
    });

    it('closes a hover-opened tooltip with Escape while focus is in an element that stops the key press', async () => {
      render(
        <div role="presentation" onKeyDown={(event) => event.stopPropagation()}>
          <input aria-label="Other field" />
        </div>,
      );
      await user.click(screen.getByRole('textbox', { name: 'Other field' }));
      await user.hover(button);
      expect(await screen.findByRole('tooltip')).toHaveTextContent(text);

      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    });

    it('opens the tooltip again after Escape once the pointer leaves and returns', async () => {
      await user.hover(button);
      await screen.findByRole('tooltip');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());

      await user.unhover(button);
      await user.hover(button);

      expect(await screen.findByRole('tooltip')).toHaveTextContent(text);
    });

    it('opens the tooltip again after Escape once focus leaves and returns', async () => {
      await user.tab();
      await screen.findByRole('tooltip');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());

      await user.tab();
      expect(button).not.toHaveFocus();
      await user.tab({ shift: true });

      expect(button).toHaveFocus();
      expect(await screen.findByRole('tooltip')).toHaveTextContent(text);
    });

    it('keeps the tooltip open and does nothing on Enter and Space', async () => {
      await user.tab();
      expect(await screen.findByRole('tooltip')).toHaveTextContent(text);

      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(screen.getByRole('tooltip')).toHaveTextContent(text);
      expect(button).toHaveFocus();
      expect(onClick).not.toHaveBeenCalled();
    });

    it('ignores click, Enter and Space', async () => {
      await user.click(button);
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  it('does nothing on Escape for an enabled control', async () => {
    render(<AddControl label="Rule" accessibleLabel="Add Rule" onClick={jest.fn()} disabledReason={null} />);
    const button = screen.getByRole('button', { name: 'Add Rule' });
    await user.tab();
    expect(button).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('closes the tooltip when the control becomes enabled while it is open', async () => {
    const props = { label: 'Rule', accessibleLabel: 'Add Rule', onClick: jest.fn() };
    const { rerender } = render(<AddControl {...props} disabledReason="saving" />);
    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();

    rerender(<AddControl {...props} disabledReason={null} />);

    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });
});
