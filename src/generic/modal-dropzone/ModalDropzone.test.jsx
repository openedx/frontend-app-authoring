import { AppProvider } from '@edx/frontend-platform/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { uploadAssets, getUploadAssetsUrl } from './data/api';
import initializeStore from '../../store';
import ModalDropzone from './ModalDropzone';
import messages from './messages';

let store;
let axiosMock;
const courseId = 'course-123';
const file = new File(['test'], 'test.png', { type: 'image/png' });
const fileData = new FormData();
fileData.append('file', file);
const baseUrl = process.env.STUDIO_BASE_URL || 'http://localhost:18010';

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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    jest.clearAllMocks();
  });

  afterEach(() => {
    axiosMock.reset();
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
    const { getByRole } = render(<RootWrapper {...props} />);
    const dropzoneInput = getByRole('presentation', { hidden: true }).firstChild;

    const uploadButton = getByRole('button', { name: messages.uploadModal.defaultMessage });
    expect(uploadButton).toBeDisabled();
    userEvent.upload(dropzoneInput, file);

    await waitFor(() => {
      expect(dropzoneInput.files[0]).toStrictEqual(file);
      expect(dropzoneInput.files).toHaveLength(1);
      expect(uploadButton).not.toBeDisabled();
    });
  });

  it('should successfully upload an asset and return the URL', async () => {
    const mockUrl = `${baseUrl}/assets/course-123/test-file.png`;
    axiosMock.onPost(getUploadAssetsUrl(courseId).href).reply(200, {
      asset: { url: mockUrl },
    });
    const response = await uploadAssets(courseId, fileData, () => {});

    expect(response.asset.url).toBe(mockUrl);

    const { getByRole, getByAltText } = render(<RootWrapper {...props} />);
    const dropzoneInput = getByRole('presentation', { hidden: true }).firstChild;
    const uploadButton = getByRole('button', { name: messages.uploadModal.defaultMessage });

    userEvent.upload(dropzoneInput, file);

    await waitFor(() => {
      expect(uploadButton).not.toBeDisabled();
    });

    userEvent.click(uploadButton);

    await waitFor(() => {
      expect(getByAltText(messages.uploadImageDropzoneAlt.defaultMessage)).toBeInTheDocument();
    });
  });

  it('should handle an upload error', async () => {
    axiosMock.onPost(getUploadAssetsUrl(courseId).href).networkError();

    await expect(uploadAssets(courseId, fileData, () => {})).rejects.toThrow('Network Error');
  });

  it('displays a custom error message when the file size exceeds the limit', async () => {
    const maxSizeInBytes = 20 * 1000 * 1000;
    const expectedErrorMessage = 'Custom error message';

    const { getByText, getByRole } = render(
      <RootWrapper {...props} maxSize={maxSizeInBytes} invalidFileSizeMore={expectedErrorMessage} />,
    );
    const dropzoneInput = getByRole('presentation', { hidden: true });

    const fileToUpload = new File(
      [new ArrayBuffer(maxSizeInBytes + 1)],
      'test-file.png',
      { type: 'image/png' },
    );

    userEvent.upload(dropzoneInput.firstChild, fileToUpload);

    await waitFor(() => {
      expect(getByText(expectedErrorMessage)).toBeInTheDocument();
    });
  });
});
