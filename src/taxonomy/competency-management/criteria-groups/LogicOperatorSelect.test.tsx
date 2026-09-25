import {
  fireEvent,
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import LogicOperatorSelect from './LogicOperatorSelect';

const labels = { and: 'all', or: 'any' };

describe('<LogicOperatorSelect />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders plain, non-interactive text when no onChange is given', () => {
    render(<LogicOperatorSelect value="and" labels={labels} />);

    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the \'or\' label\'s text when value is \'or\'', () => {
    render(<LogicOperatorSelect value="or" labels={labels} />);
    expect(screen.getByText('any')).toBeInTheDocument();
  });

  it('renders an interactive control and calls onChange when given', () => {
    const onChange = jest.fn();
    render(<LogicOperatorSelect value="and" labels={labels} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'all' }));
    fireEvent.click(screen.getByText('any'));

    expect(onChange).toHaveBeenCalledWith('or');
  });

  it(
    'keeps showing the prior label after a rejected save, since the trigger is controlled by value, not by '
      + 'the click that was made',
    () => {
      const onChange = jest.fn();
      const { container, rerender } = render(<LogicOperatorSelect value="and" labels={labels} onChange={onChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'all' }));
      fireEvent.click(screen.getByText('any'));
      expect(onChange).toHaveBeenCalledWith('or');

      // A rejected save never updates `group.logicOperator` - simulated
      // here by re-rendering with `value` unchanged, exactly what the real
      // caller does when the mutation's `onError` fires and no local
      // rollback of its own is needed (see this component's own docstring).
      // The trigger itself (`.dropdown-toggle`, not the still-mounted-but-
      // hidden menu items) is checked directly, since Paragon's `Dropdown`
      // keeps its closed menu's items in the DOM rather than removing them.
      rerender(<LogicOperatorSelect value="and" labels={labels} onChange={onChange} />);

      expect(container.querySelector('.dropdown-toggle')).toHaveTextContent('all');
    },
  );
});
