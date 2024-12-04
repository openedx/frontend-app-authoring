import { capitalize } from 'lodash';
import userEvent from '@testing-library/user-event';
import { initializeMocks, render, screen } from '../../testUtils';
import { NOTIFICATION_MESSAGES } from '../../constants';
import ProcessingNotification from '.';

const mockUndo = jest.fn();

const props = {
  title: NOTIFICATION_MESSAGES.saving,
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
    expect(screen.getByText(capitalize(props.title))).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByRole('alert').querySelector('.processing-notification-hide-close-button')).not.toBeInTheDocument();
    userEvent.click(screen.getByText('Undo'));
    expect(mockUndo).toHaveBeenCalled();
  });

  it('renders with `disableCapitalize`', () => {
    const title = 'ThIs IS a Test. OK?';
    render(<ProcessingNotification {...props} close={() => {}} title={title} disableCapitalize />);
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByRole('alert').querySelector('.processing-notification-hide-close-button')).not.toBeInTheDocument();
  });

  it('add hide-close-button class if no close action is passed', () => {
    render(<ProcessingNotification {...props} />);
    expect(screen.getByText(capitalize(props.title))).toBeInTheDocument();
    expect(screen.getByRole('alert').querySelector('.processing-notification-hide-close-button')).toBeInTheDocument();
  });
});
