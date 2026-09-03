import { userEvent } from '@testing-library/user-event';
import { initializeMocks, render, screen } from '@src/testUtils';
import AppSettingsModalBase, { AppSettingsModalBaseProps } from './AppSettingsModalBase';

const onClose = jest.fn();

const baseProps: AppSettingsModalBaseProps = {
  title: 'App Settings',
  onClose,
  variant: 'default',
  isMobile: false,
  isOpen: true,
  children: <div>content</div>,
};

const renderComponent = (props: Partial<AppSettingsModalBaseProps> = {}) =>
  render(
    <AppSettingsModalBase {...baseProps} {...props} />,
  );

describe('AppSettingsModalBase', () => {
  beforeEach(() => {
    initializeMocks();
    onClose.mockClear();
  });

  it('renders the title, children, footer, and disclaimer', () => {
    renderComponent({
      children: <div>Modal body content</div>,
      footer: <button type="button">Save</button>,
      disclaimer: <p>Some disclaimer text</p>,
    });

    expect(screen.getByTestId('modal-title')).toHaveTextContent('App Settings');
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
    expect(screen.getByText('Some disclaimer text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('does not render the close button when not on mobile', () => {
    renderComponent({ isMobile: false });

    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('renders the close button and calls onClose when on mobile', async () => {
    const user = userEvent.setup();
    renderComponent({ isMobile: true });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render the modal when isOpen is false', () => {
    renderComponent({ isOpen: false });

    expect(screen.queryByTestId('modal-title')).not.toBeInTheDocument();
  });
});
