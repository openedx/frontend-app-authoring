import { AppProvider } from '@edx/frontend-platform/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../../store';
import ModalDropzone from './ModalDropzone';
import messages from './messages';

let store;

const mockOnClose = jest.fn();
const mockOnCancel = jest.fn();
const mockOnChange = jest.fn();
const mockOnSavingStatus = jest.fn();

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <AppProvider store={store}>
      <ModalDropzone {...props} />
    </AppProvider>
  </IntlProvider>
);

const props = {
  isOpen: true,
  fileTypes: ['png'],
  onClose: mockOnClose,
  onCancel: mockOnCancel,
  onChange: mockOnChange,
  onSavingStatus: mockOnSavingStatus,
};

describe('<ModalDropzone />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
    jest.clearAllMocks();
  });

  it('renders successfully when open', () => {
    const { getByText } = render(<RootWrapper {...props} />);

    expect(getByText(messages.uploadImageDropzoneText.defaultMessage)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const { getByText } = render(<RootWrapper {...props} />);
    userEvent.click(getByText(messages.cancelModal.defaultMessage));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const { getByText } = render(<RootWrapper {...props} />);
    userEvent.click(getByText(messages.cancelModal.defaultMessage));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables the upload button initially', () => {
    const { getByText } = render(<RootWrapper {...props} />);
    const uploadButton = getByText(messages.uploadModal.defaultMessage);

    expect(uploadButton).toBeDisabled();
  });

  it('enables the upload button after a file is selected', async () => {
    const { getByText, getByRole } = render(<RootWrapper {...props} />);
    const dropzoneInput = getByRole('presentation', { hidden: true });

    const file = new File(['dummy content'], 'test-file.png', { type: 'image/png' });

    userEvent.upload(dropzoneInput.firstChild, file);

    await waitFor(() => {
      const uploadButton = getByText(messages.uploadModal.defaultMessage);
      expect(uploadButton).not.toBeDisabled();
    });
  });

  it('displays an error message when the file size exceeds the limit', async () => {
    const maxSizeInBytes = 20 * 1000 * 1000;

    const { getByText, getByRole } = render(<RootWrapper {...props} maxSize={maxSizeInBytes} />);
    const dropzoneInput = getByRole('presentation', { hidden: true });

    const file = new File(
      [new ArrayBuffer(maxSizeInBytes + 1)],
      'test-file.png',
      { type: 'image/png' },
    );

    userEvent.upload(dropzoneInput.firstChild, file);

    await waitFor(() => {
      // Assert that the error message is displayed
      const maxSizeInMB = maxSizeInBytes / (1000 * 1000);
      const expectedErrorMessage = messages.uploadImageDropzoneInvalidSizeMore
        .defaultMessage.replace('{maxSize}', maxSizeInMB);
      expect(getByText(expectedErrorMessage)).toBeInTheDocument();
    });
  });

  it('displays a custom error message when the file size exceeds the limit', async () => {
    const maxSizeInBytes = 20 * 1000 * 1000;
    const expectedErrorMessage = 'Custom error message';

    const { getByText, getByRole } = render(
      <RootWrapper {...props} maxSize={maxSizeInBytes} invalidFileSizeMore={expectedErrorMessage} />,
    );
    const dropzoneInput = getByRole('presentation', { hidden: true });

    const file = new File(
      [new ArrayBuffer(maxSizeInBytes + 1)],
      'test-file.png',
      { type: 'image/png' },
    );

    userEvent.upload(dropzoneInput.firstChild, file);

    await waitFor(() => {
      expect(getByText(expectedErrorMessage)).toBeInTheDocument();
    });
  });
});
