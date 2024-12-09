import userEvent from '@testing-library/user-event';
import { initializeMocks, render, screen } from '../../testUtils';
import ProcessingNotification from '.';

const mockUndo = jest.fn();

const props = {
  title: 'ThIs IS a Test. OK?',
  isShow: true,
  action: {
    label: 'Undo',
    onClick: mockUndo,
  },
};

describe('<ProcessingNotification />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders successfully', () => {
    render(<ProcessingNotification {...props} close={() => {}} />);
    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByRole('alert').querySelector('.processing-notification-hide-close-button')).not.toBeInTheDocument();
    userEvent.click(screen.getByText('Undo'));
    expect(mockUndo).toHaveBeenCalled();
  });

  it('add hide-close-button class if no close action is passed', () => {
    render(<ProcessingNotification {...props} />);
    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByRole('alert').querySelector('.processing-notification-hide-close-button')).toBeInTheDocument();
  });
});
