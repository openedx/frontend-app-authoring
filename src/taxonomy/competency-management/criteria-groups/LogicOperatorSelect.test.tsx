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

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('any'));

    expect(onChange).toHaveBeenCalledWith('or');
  });
});
