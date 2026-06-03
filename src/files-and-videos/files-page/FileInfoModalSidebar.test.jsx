import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import FileInfoModalSidebar from './FileInfoModalSidebar';

const mockAsset = {
  id: 'test-file-id',
  displayName: 'test-file.png',
  wrapperType: 'image',
  externalUrl: 'https://example.com/test-file.png',
  portableUrl: '/static/test-file.png',
  locked: false,
  thumbnail: 'https://example.com/thumbnail.png',
  dateAdded: '2024-01-15T10:30:00Z',
  fileSize: 1024000,
  usageLocations: [],
};

const mockHandleLockedAsset = jest.fn();

const renderComponent = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <FileInfoModalSidebar
        asset={mockAsset}
        handleLockedAsset={mockHandleLockedAsset}
        {...props}
      />
    </IntlProvider>,
  );

describe('FileInfoModalSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
  });

  it('renders asset information correctly', () => {
    renderComponent();

    expect(screen.getByText('Date added')).toBeInTheDocument();
    expect(screen.getByText('File size')).toBeInTheDocument();
    expect(screen.getByText('Studio URL')).toBeInTheDocument();
    expect(screen.getByText('Web URL')).toBeInTheDocument();
    expect(screen.getByText('Lock file')).toBeInTheDocument();
  });

  it('hides Lock file section when canLockFile is false', () => {
    renderComponent({ canLockFile: false });

    expect(screen.getByText('Date added')).toBeInTheDocument();
    expect(screen.getByText('Studio URL')).toBeInTheDocument();
    expect(screen.queryByText('Lock file')).not.toBeInTheDocument();
  });

  it('shows Lock file section when canLockFile is true', () => {
    renderComponent({ canLockFile: true });

    expect(screen.getByText('Lock file')).toBeInTheDocument();
  });

  it('displays the portable URL', () => {
    renderComponent();
    expect(screen.getByText('/static/test-file.png')).toBeInTheDocument();
  });

  it('displays the external URL', () => {
    renderComponent();
    expect(screen.getByText('https://example.com/test-file.png')).toBeInTheDocument();
  });
});
