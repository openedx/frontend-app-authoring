import { initializeMocks, render, screen, userEvent } from '@src/testUtils';
import AddControl from './AddControl';

const placeholderText = 'Fill in the empty box before adding another.';
const savingText = 'Saving the new rule. Wait for it to finish before adding another.';

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

  it.each([
    ['placeholder' as const, placeholderText],
    ['saving' as const, savingText],
  ])('stays focusable and explains itself when disabled for "%s"', async (disabledReason, text) => {
    const onClick = jest.fn();
    render(
      <AddControl label="Rule" accessibleLabel="Add Rule" onClick={onClick} disabledReason={disabledReason} />,
    );

    const button = screen.getByRole('button', { name: 'Add Rule' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    expect(button).toHaveAccessibleDescription(text);

    await user.tab();
    expect(button).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(text);

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
