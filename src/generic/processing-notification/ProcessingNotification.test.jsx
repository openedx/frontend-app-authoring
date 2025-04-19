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

  it('renders successfully', async () => {
    render(<ProcessingNotification {...props} close={() => {}} />);
    await screen.findByText(props.title);
    const undo = await screen.findByText('Undo');
    const alert = await screen.findAllByRole('alert', { hidden: true });
    expect(alert[1].classList.contains('processing-notification-hide-close-button')).toBeFalsy();
    await userEvent.click(undo);
    expect(mockUndo).toHaveBeenCalled();
  });

  it('add hide-close-button class if no close action is passed', async () => {
    render(<ProcessingNotification {...props} />);
    await screen.findByText(props.title);
    const alert = await screen.findAllByRole('alert', { hidden: true });
    expect(alert[1].classList.contains('processing-notification-hide-close-button')).toBeTruthy();
  });
});
