import {
  render, screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import Checker from '.';

const props = {
  hasSingleAnswer: true,
  answer: {
    id: 1,
    correct: true,
  },
  setAnswer: jest.fn(),
};
describe('Checker component', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('renders with single answer', () => {
    render(<Checker {...props} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('radio')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  test('renders with multiple answers', () => {
    render(<Checker {...props} hasSingleAnswer={false} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  test('renders with disabled radio', () => {
    render(<Checker {...props} disabled />);
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  test('calls setAnswer when radio button is clicked', () => {
    render(<Checker {...props} />);
    expect(screen.getByRole('radio')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio'), { target: { checked: !props.answer.correct } });
    expect(props.setAnswer).toHaveBeenCalledWith({ correct: true });
  });
});
