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
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
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
});
