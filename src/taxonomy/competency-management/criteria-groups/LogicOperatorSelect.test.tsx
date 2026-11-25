import {
  initializeMocks,
  render,
  screen,
  userEvent,
} from '@src/testUtils';
import LogicOperatorSelect from './LogicOperatorSelect';

const labels = { and: 'all', or: 'any' };

describe('<LogicOperatorSelect />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it.each(
    [
      ['AND', 'all'],
      ['OR', 'any'],
    ] as const,
  )('renders the %s label as plain text with no control', (value, label) => {
    render(<LogicOperatorSelect value={value} labels={labels} />);

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders an interactive control and calls onChange when given', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<LogicOperatorSelect value="AND" labels={labels} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'all' }));
    await user.click(screen.getByText('any'));

    expect(onChange).toHaveBeenCalledWith('OR');
  });

  it('keeps showing the value\'s label after a rejected save, since the trigger renders from value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container, rerender } = render(<LogicOperatorSelect value="AND" labels={labels} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'all' }));
    await user.click(screen.getByText('any'));
    expect(onChange).toHaveBeenCalledWith('OR');

    rerender(<LogicOperatorSelect value="AND" labels={labels} onChange={onChange} />);

    expect(container.querySelector('.dropdown-toggle')).toHaveTextContent('all');
  });
});
