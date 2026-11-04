import userEvent from '@testing-library/user-event';
import { initializeMocks, render, screen } from '@src/testUtils';
import ToastNotification from '.';

const mockUndo = jest.fn();

const TestIcon = () => <svg data-testid="test-icon" />;

const props = {
  title: 'ThIs IS a Test. OK?',
  isShow: true,
  action: {
    label: 'Undo',
    onClick: mockUndo,
  },
};

describe('<ToastNotification />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders successfully', async () => {
    const user = userEvent.setup();
    render(<ToastNotification {...props} close={() => {}} />);
    await screen.findByText(props.title);
    const undo = await screen.findByText('Undo');
    const alert = await screen.findByRole('alert', { hidden: true });
    expect(alert.classList.contains('toast-notification-hide-close-button')).toBeFalsy();
    await user.click(undo);
    expect(mockUndo).toHaveBeenCalled();
  });

  it('add hide-close-button class if no close action is passed', async () => {
    render(<ToastNotification {...props} />);
    await screen.findByText(props.title);
    const alert = await screen.findByRole('alert', { hidden: true });
    expect(alert.classList.contains('toast-notification-hide-close-button')).toBeTruthy();
  });

  it('renders the spinning gear icon by default', async () => {
    const { container } = render(<ToastNotification {...props} />);
    await screen.findByText(props.title);
    expect(container.ownerDocument.querySelector('.toast-notification-spinner')).toBeInTheDocument();
  });

  it('renders the toast icon instead of the spinner', async () => {
    render(<ToastNotification {...props} icon={TestIcon} />);
    await screen.findByText(props.title);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(document.querySelector('.toast-notification-spinner')).not.toBeInTheDocument();
  });
});
