import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import FileMenu from './FileMenu';

const mockHandlers = {
  handleLock: jest.fn(),
  onDownload: jest.fn(),
  openAssetInfo: jest.fn(),
  openDeleteConfirmation: jest.fn(),
};

const defaultProps = {
  id: 'test-file-id',
  externalUrl: 'https://example.com/test-file.png',
  portableUrl: '/static/test-file.png',
  locked: false,
  fileType: 'file',
  ...mockHandlers,
};

const renderComponent = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <FileMenu {...defaultProps} {...props} />
    </IntlProvider>,
  );

describe('FileMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn() },
      writable: true,
      configurable: true,
    });
  });

  it('renders the menu toggle button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: 'file-menu-toggle' })).toBeInTheDocument();
  });

  it('opens dropdown menu when toggle is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const toggleButton = screen.getByRole('button', { name: 'file-menu-toggle' });
    await user.click(toggleButton);

    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  describe('Lock/Unlock visibility based on canEditFiles permission', () => {
    it('shows Lock option when canEditFiles is true', async () => {
      const user = userEvent.setup();
      renderComponent({ permissions: { canEditFiles: true, canDeleteFiles: true } });

      const toggleButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(toggleButton);

      expect(screen.getByText('Lock')).toBeInTheDocument();
    });

    it('hides Lock option when canEditFiles is false', async () => {
      const user = userEvent.setup();
      renderComponent({ permissions: { canEditFiles: false, canDeleteFiles: true } });

      const toggleButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(toggleButton);

      expect(screen.queryByText('Lock')).not.toBeInTheDocument();
      expect(screen.queryByText('Unlock')).not.toBeInTheDocument();
    });

    it('shows Unlock option when file is locked and canEditFiles is true', async () => {
      const user = userEvent.setup();
      renderComponent({ locked: true, permissions: { canEditFiles: true, canDeleteFiles: true } });

      const toggleButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(toggleButton);

      expect(screen.getByText('Unlock')).toBeInTheDocument();
    });
  });

  describe('Copy url and Download visibility based on canEditFiles permission', () => {
    it('shows copy url and download options when canEditFiles is true', async () => {
      const user = userEvent.setup();
      renderComponent({ permissions: { canEditFiles: true, canDeleteFiles: true } });

      const toggleButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(toggleButton);

      expect(screen.getByText('Copy Studio Url')).toBeInTheDocument();
      expect(screen.getByText('Copy Web Url')).toBeInTheDocument();
      expect(screen.getByText('Download')).toBeInTheDocument();
    });

    it('hides copy url and download options when canEditFiles is false', async () => {
      const user = userEvent.setup();
      renderComponent({ permissions: { canEditFiles: false, canDeleteFiles: true } });

      const toggleButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(toggleButton);

      expect(screen.queryByText('Copy Studio Url')).not.toBeInTheDocument();
      expect(screen.queryByText('Copy Web Url')).not.toBeInTheDocument();
      expect(screen.queryByText('Download')).not.toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('shows copy video id option for videos when canEditFiles is true', async () => {
      const user = userEvent.setup();
      renderComponent({ fileType: 'video', permissions: { canEditFiles: true, canDeleteFiles: true } });

      const toggleButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(toggleButton);

      expect(screen.getByText('Copy video ID')).toBeInTheDocument();
      expect(screen.getByText('Download')).toBeInTheDocument();
    });

    it('hides copy video id option for videos when canEditFiles is false', async () => {
      const user = userEvent.setup();
      renderComponent({ fileType: 'video', permissions: { canEditFiles: false, canDeleteFiles: true } });

      const toggleButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(toggleButton);

      expect(screen.queryByText('Copy video ID')).not.toBeInTheDocument();
      expect(screen.queryByText('Download')).not.toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
    });
  });
});
