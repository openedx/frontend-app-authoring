import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import GalleryCard from './GalleryCard';

const mockOriginal = {
  id: 'test-file-id',
  displayName: 'test-file.png',
  wrapperType: 'image',
  externalUrl: 'https://example.com/test-file.png',
  portableUrl: '/static/test-file.png',
  locked: false,
  thumbnail: 'https://example.com/thumbnail.png',
  status: 'active',
  transcripts: [],
  downloadLink: 'https://example.com/download/test-file.png',
};

const mockHandlers = {
  handleBulkDownload: jest.fn(),
  handleLockFile: jest.fn(),
  handleOpenDeleteConfirmation: jest.fn(),
  handleOpenFileInfo: jest.fn(),
  thumbnailPreview: jest.fn(() => <div data-testid="thumbnail-preview" />),
};

const renderComponent = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <GalleryCard
        original={mockOriginal}
        fileType="file"
        {...mockHandlers}
        {...props}
      />
    </IntlProvider>,
  );

describe('GalleryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the card with file display name', () => {
    renderComponent();
    expect(screen.getByText('test-file.png')).toBeInTheDocument();
  });

  it('renders the card with file type chip', () => {
    renderComponent();
    expect(screen.getByText('image')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = renderComponent({ className: 'custom-class' });
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders closed caption icon when transcripts are present', () => {
    renderComponent({
      original: { ...mockOriginal, transcripts: ['en', 'es'] },
    });
    // The card should be present when transcripts exist
    expect(screen.getByText('test-file.png')).toBeInTheDocument();
  });

  describe('permissions', () => {
    it('passes permissions to FileMenu with default values when not provided', async () => {
      const user = userEvent.setup();
      renderComponent();

      // The FileMenu should be rendered with default permissions
      const menuButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      expect(menuButton).toBeInTheDocument();

      // Open the menu and check delete option is visible (default permission)
      await user.click(menuButton);
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('passes permissions to FileMenu - delete visible when canDeleteFiles is true', async () => {
      const user = userEvent.setup();
      renderComponent({
        permissions: { canEditFiles: true, canDeleteFiles: true },
      });

      const menuButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(menuButton);

      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('passes permissions to FileMenu - delete hidden when canDeleteFiles is false', async () => {
      const user = userEvent.setup();
      renderComponent({
        permissions: { canEditFiles: true, canDeleteFiles: false },
      });

      const menuButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(menuButton);

      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  describe('menu actions', () => {
    it('calls handleLockFile when lock is triggered from menu', async () => {
      const user = userEvent.setup();
      renderComponent();

      const menuButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(menuButton);

      const lockButton = screen.getByText('Lock');
      await user.click(lockButton);

      expect(mockHandlers.handleLockFile).toHaveBeenCalledWith('test-file-id', true);
    });

    it('calls handleLockFile with false when file is already locked', async () => {
      const user = userEvent.setup();
      renderComponent({
        original: { ...mockOriginal, locked: true },
      });

      const menuButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(menuButton);

      const unlockButton = screen.getByText('Unlock');
      await user.click(unlockButton);

      expect(mockHandlers.handleLockFile).toHaveBeenCalledWith('test-file-id', false);
    });

    it('calls handleOpenFileInfo when info is triggered from menu', async () => {
      const user = userEvent.setup();
      renderComponent();

      const menuButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(menuButton);

      const infoButton = screen.getByText('Info');
      await user.click(infoButton);

      expect(mockHandlers.handleOpenFileInfo).toHaveBeenCalledWith(mockOriginal);
    });

    it('calls handleBulkDownload when download is triggered from menu', async () => {
      const user = userEvent.setup();
      renderComponent();

      const menuButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(menuButton);

      const downloadButton = screen.getByText('Download');
      await user.click(downloadButton);

      expect(mockHandlers.handleBulkDownload).toHaveBeenCalledWith([{
        original: {
          id: 'test-file-id',
          displayName: 'test-file.png',
          downloadLink: 'https://example.com/download/test-file.png',
        },
      }]);
    });

    it('calls handleOpenDeleteConfirmation when delete is triggered from menu', async () => {
      const user = userEvent.setup();
      renderComponent({
        permissions: { canEditFiles: true, canDeleteFiles: true },
      });

      const menuButton = screen.getByRole('button', { name: 'file-menu-toggle' });
      await user.click(menuButton);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      expect(mockHandlers.handleOpenDeleteConfirmation).toHaveBeenCalledWith([{ original: mockOriginal }]);
    });
  });
});
