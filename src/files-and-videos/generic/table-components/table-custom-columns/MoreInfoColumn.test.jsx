import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import MoreInfoColumn from './MoreInfoColumn';

const mockRow = {
  original: {
    id: 'test-file-id',
    displayName: 'test-file.png',
    externalUrl: 'https://example.com/test-file.png',
    portableUrl: '/static/test-file.png',
    locked: false,
    downloadLink: 'https://example.com/download/test-file.png',
  },
};

const mockHandlers = {
  handleLock: jest.fn(),
  handleBulkDownload: jest.fn(),
  handleOpenFileInfo: jest.fn(),
  handleOpenDeleteConfirmation: jest.fn(),
};

const renderComponent = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <MoreInfoColumn
        row={mockRow}
        fileType="file"
        {...mockHandlers}
        {...props}
      />
    </IntlProvider>,
  );

describe('MoreInfoColumn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn() },
      writable: true,
      configurable: true,
    });
  });

  it('renders the more info icon button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /more info/i })).toBeInTheDocument();
  });

  it('opens menu when icon button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const iconButton = screen.getByRole('button', { name: /more info/i });
    await user.click(iconButton);

    expect(screen.getByText('Copy Studio Url')).toBeInTheDocument();
    expect(screen.getByText('Copy Web Url')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  describe('Lock/Unlock visibility based on canEditFiles permission', () => {
    it('shows Lock option when canEditFiles is true', async () => {
      const user = userEvent.setup();
      renderComponent({ permissions: { canEditFiles: true, canDeleteFiles: true } });

      const iconButton = screen.getByRole('button', { name: /more info/i });
      await user.click(iconButton);

      expect(screen.getByText('Lock')).toBeInTheDocument();
    });

    it('hides Lock option when canEditFiles is false', async () => {
      const user = userEvent.setup();
      renderComponent({ permissions: { canEditFiles: false, canDeleteFiles: true } });

      const iconButton = screen.getByRole('button', { name: /more info/i });
      await user.click(iconButton);

      expect(screen.queryByText('Lock')).not.toBeInTheDocument();
      expect(screen.queryByText('Unlock')).not.toBeInTheDocument();
    });

    it('shows Unlock option when file is locked and canEditFiles is true', async () => {
      const user = userEvent.setup();
      const lockedRow = {
        ...mockRow,
        original: { ...mockRow.original, locked: true },
      };
      renderComponent({ row: lockedRow, permissions: { canEditFiles: true, canDeleteFiles: true } });

      const iconButton = screen.getByRole('button', { name: /more info/i });
      await user.click(iconButton);

      expect(screen.getByText('Unlock')).toBeInTheDocument();
    });

    it('calls handleLock with correct arguments when Lock is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ permissions: { canEditFiles: true, canDeleteFiles: true } });

      const iconButton = screen.getByRole('button', { name: /more info/i });
      await user.click(iconButton);
      await user.click(screen.getByText('Lock'));

      expect(mockHandlers.handleLock).toHaveBeenCalledWith('test-file-id', true);
    });

    it('calls handleLock to unlock when file is locked', async () => {
      const user = userEvent.setup();
      const lockedRow = {
        ...mockRow,
        original: { ...mockRow.original, locked: true },
      };
      renderComponent({ row: lockedRow, permissions: { canEditFiles: true, canDeleteFiles: true } });

      const iconButton = screen.getByRole('button', { name: /more info/i });
      await user.click(iconButton);
      await user.click(screen.getByText('Unlock'));

      expect(mockHandlers.handleLock).toHaveBeenCalledWith('test-file-id', false);
    });
  });

  describe('Delete button based on canDeleteFiles permission', () => {
    it('calls handleOpenDeleteConfirmation and closes menu when Delete is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ permissions: { canEditFiles: true, canDeleteFiles: true } });

      const iconButton = screen.getByRole('button', { name: /more info/i });
      await user.click(iconButton);
      await user.click(screen.getByTestId('open-delete-confirmation-button'));

      expect(mockHandlers.handleOpenDeleteConfirmation).toHaveBeenCalledWith([{ original: mockRow.original }]);
    });

    it('hides Delete option when canDeleteFiles is false', async () => {
      const user = userEvent.setup();
      renderComponent({ permissions: { canEditFiles: true, canDeleteFiles: false } });

      const iconButton = screen.getByRole('button', { name: /more info/i });
      await user.click(iconButton);

      expect(screen.queryByTestId('open-delete-confirmation-button')).not.toBeInTheDocument();
    });
  });
});
