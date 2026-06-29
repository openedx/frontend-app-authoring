import { initializeMocks, render, screen, waitFor } from '@src/testUtils';
import userEvent from '@testing-library/user-event';

import { signatoriesMock } from '../../__mocks__';
import commonMessages from '../../messages';
import messages from '../messages';
import SignatoryForm from './SignatoryForm';

const defaultProps = {
  index: 0,
  ...signatoriesMock[0],
  showDeleteButton: true,
  isEdit: true,
  handleChange: jest.fn(),
  handleBlur: jest.fn(),
  setFieldValue: jest.fn(),
  handleDeleteSignatory: jest.fn(),
  handleCancelUpdateSignatory: jest.fn(),
};

const renderSignatoryForm = (props = defaultProps) => render(<SignatoryForm {...props} />);

describe('SignatoryForm Component', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders form fields in edit mode', () => {
    renderSignatoryForm();

    expect(screen.getByPlaceholderText(messages.namePlaceholder.defaultMessage)).toBeInTheDocument();
  });

  it('handles input change', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    renderSignatoryForm({ ...defaultProps, handleChange });
    const input = screen.getByPlaceholderText(messages.namePlaceholder.defaultMessage);
    const newInputValue = 'Jane Doe';

    expect(handleChange).not.toHaveBeenCalled();
    await user.type(input, newInputValue);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledTimes(newInputValue.length);
    });
  });

  it('opens image upload modal on button click', async () => {
    const user = userEvent.setup();
    renderSignatoryForm();
    const replaceButton = screen.getByRole(
      'button',
      {
        name: messages.uploadImageButton.defaultMessage.replace(
          '{uploadText}',
          messages.uploadModalReplace.defaultMessage,
        ),
      },
    );

    expect(screen.queryByTestId('dropzone-container')).not.toBeInTheDocument();

    await user.click(replaceButton);

    expect(screen.queryByTestId('dropzone-container')).toBeInTheDocument();
  });

  it('shows confirm modal on delete icon click', async () => {
    const user = userEvent.setup();
    renderSignatoryForm();
    const deleteIcon = screen.getByLabelText(commonMessages.deleteTooltip.defaultMessage);

    await user.click(deleteIcon);

    expect(screen.getByText(messages.deleteSignatoryConfirmationMessage.defaultMessage)).toBeInTheDocument();
  });

  it('cancels deletion of a signatory', async () => {
    const user = userEvent.setup();
    renderSignatoryForm();

    const deleteIcon = screen.getByRole('button', { name: commonMessages.deleteTooltip.defaultMessage });
    await user.click(deleteIcon);

    const cancelButton = screen.getByRole('button', { name: commonMessages.cardCancel.defaultMessage });
    await user.click(cancelButton);

    expect(defaultProps.handleDeleteSignatory).not.toHaveBeenCalled();
  });

  it('does not render save button when isEdit=false', () => {
    renderSignatoryForm({ ...defaultProps, isEdit: false });

    expect(screen.queryByRole('button', { name: commonMessages.saveTooltip.defaultMessage })).not.toBeInTheDocument();
  });

  it('renders Replace button when there is a signatureImagePath', () => {
    renderSignatoryForm({ ...defaultProps, isEdit: false });

    expect(screen.getByRole('button', {
      name: messages.uploadImageButton.defaultMessage.replace(
        '{uploadText}',
        messages.uploadModalReplace.defaultMessage,
      ),
    })).toBeInTheDocument();
    expect(screen.queryByRole('button', {
      name: messages.uploadImageButton.defaultMessage.replace('{uploadText}', messages.uploadModal.defaultMessage),
    })).not.toBeInTheDocument();
  });

  it('renders Upload button when there is no signatureImagePath', () => {
    renderSignatoryForm({ ...defaultProps, signatureImagePath: '', isEdit: false });

    expect(screen.getByRole('button', {
      name: messages.uploadImageButton.defaultMessage.replace('{uploadText}', messages.uploadModal.defaultMessage),
    })).toBeInTheDocument();
    expect(screen.queryByRole('button', {
      name: messages.uploadImageButton.defaultMessage.replace(
        '{uploadText}',
        messages.uploadModalReplace.defaultMessage,
      ),
    })).not.toBeInTheDocument();
  });
});
