import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';

import initializeStore from '../../../store';
import { signatoriesMock } from '../../__mocks__';
import commonMessages from '../../messages';
import messages from '../messages';
import SignatoryForm from './SignatoryForm';

let store;

const renderSignatory = (props) => render(
  <Provider store={store}>
    <IntlProvider locale="en">
      <SignatoryForm {...props} />
    </IntlProvider>,
  </Provider>,
);

const initialState = {
  certificates: {
    certificatesData: {
      certificates: [],
      hasCertificateModes: true,
    },
  },
};

const defaultProps = {
  ...signatoriesMock[0],
  showDeleteButton: true,
  isEdit: true,
  handleChange: jest.fn(),
  handleBlur: jest.fn(),
  setFieldValue: jest.fn(),
  handleDeleteSignatory: jest.fn(),
  handleCancelUpdateSignatory: jest.fn(),
};

describe('Signatory Component', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore(initialState);
  });
  it('renders in CREATE mode', () => {
    const { queryByTestId, getByPlaceholderText } = renderSignatory(defaultProps);

    expect(queryByTestId('signatory-view')).not.toBeInTheDocument();
    expect(getByPlaceholderText(messages.namePlaceholder.defaultMessage)).toBeInTheDocument();
  });

  it('handles input change', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const { getByPlaceholderText } = renderSignatory({ ...defaultProps, handleChange });
    const input = getByPlaceholderText(messages.namePlaceholder.defaultMessage);
    const newInputValue = 'Jane Doe';

    await user.type(input, newInputValue, { name: 'signatories[0].name' });

    waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(expect.anything());
      expect(input.value).toBe(newInputValue);
    });
  });

  it('opens image upload modal on button click', async () => {
    const user = userEvent.setup();
    const { getByRole, queryByRole } = renderSignatory(defaultProps);
    const replaceButton = getByRole(
      'button',
      { name: messages.uploadImageButton.defaultMessage.replace('{uploadText}', messages.uploadModalReplace.defaultMessage) },
    );

    expect(queryByRole('presentation')).not.toBeInTheDocument();

    await user.click(replaceButton);

    expect(getByRole('presentation')).toBeInTheDocument();
  });

  it('shows confirm modal on delete icon click', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByText } = renderSignatory(defaultProps);
    const deleteIcon = getByLabelText(commonMessages.deleteTooltip.defaultMessage);

    await user.click(deleteIcon);

    expect(getByText(messages.deleteSignatoryConfirmationMessage.defaultMessage)).toBeInTheDocument();
  });

  it('cancels deletion of a signatory', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderSignatory(defaultProps);

    const deleteIcon = getByRole('button', { name: commonMessages.deleteTooltip.defaultMessage });
    await user.click(deleteIcon);

    const cancelButton = getByRole('button', { name: commonMessages.cardCancel.defaultMessage });
    await user.click(cancelButton);

    expect(defaultProps.handleDeleteSignatory).not.toHaveBeenCalled();
  });

  it('renders without save button with isEdit=false', () => {
    const { queryByRole } = renderSignatory({ ...defaultProps, isEdit: false });

    const deleteIcon = queryByRole('button', { name: commonMessages.saveTooltip.defaultMessage });

    expect(deleteIcon).not.toBeInTheDocument();
  });

  it('renders button with Replace text if there is a signatureImagePath', () => {
    const newProps = {
      ...defaultProps,
      isEdit: false,
    };

    const { getByRole, queryByRole } = renderSignatory(newProps);

    const replaceButton = getByRole(
      'button',
      { name: messages.uploadImageButton.defaultMessage.replace('{uploadText}', messages.uploadModalReplace.defaultMessage) },
    );
    const uploadButton = queryByRole(
      'button',
      { name: messages.uploadImageButton.defaultMessage.replace('{uploadText}', messages.uploadModal.defaultMessage) },
    );

    expect(replaceButton).toBeInTheDocument();
    expect(uploadButton).not.toBeInTheDocument();
  });

  it('renders button with Upload text if there is no signatureImagePath', () => {
    const newProps = {
      ...defaultProps,
      signatureImagePath: '',
      isEdit: false,
    };

    const { getByRole, queryByRole } = renderSignatory(newProps);

    const uploadButton = getByRole(
      'button',
      { name: messages.uploadImageButton.defaultMessage.replace('{uploadText}', messages.uploadModal.defaultMessage) },
    );
    const replaceButton = queryByRole(
      'button',
      { name: messages.uploadImageButton.defaultMessage.replace('{uploadText}', messages.uploadModalReplace.defaultMessage) },
    );

    expect(uploadButton).toBeInTheDocument();
    expect(replaceButton).not.toBeInTheDocument();
  });
});
