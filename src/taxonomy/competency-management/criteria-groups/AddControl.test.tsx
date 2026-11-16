import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
import AddControl from './AddControl';

const placeholderText = 'Fill in the empty box before adding another.';
const savingText = 'Wait for the save to finish before adding another.';

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

    it('ignores click, Enter and Space', async () => {
      await user.click(button);
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      expect(onClick).not.toHaveBeenCalled();
    });
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
