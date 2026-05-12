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
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
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
});
