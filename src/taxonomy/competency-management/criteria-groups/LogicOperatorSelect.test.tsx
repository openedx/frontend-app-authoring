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
    render(<LogicOperatorSelect value="AND" labels={labels} />);

    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the \'OR\' label\'s text when value is \'OR\'', () => {
    render(<LogicOperatorSelect value="OR" labels={labels} />);
    expect(screen.getByText('any')).toBeInTheDocument();
  });

  it('renders an interactive control and calls onChange when given', () => {
    const onChange = jest.fn();
    render(<LogicOperatorSelect value="AND" labels={labels} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('any'));

    expect(onChange).toHaveBeenCalledWith('OR');
  });
});
