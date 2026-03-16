import { render, screen, waitFor } from '@testing-library/react';
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
    renderSignatory({ ...defaultProps, handleChange });
    const input = screen.getByPlaceholderText(messages.namePlaceholder.defaultMessage);
    const newInputValue = 'Jane Doe';

    expect(handleChange).not.toHaveBeenCalled();
    expect(input.value).not.toBe(newInputValue);
    await user.type(input, newInputValue);

    await waitFor(() => {
      // This is not a great test; handleChange() gets called for each key press:
      expect(handleChange).toHaveBeenCalledTimes(newInputValue.length);
      // And the input value never actually changes because it's a controlled component
      // and we pass the name in as a prop, which hasn't changed.
      // expect(input.value).toBe(newInputValue);
    });
  });

  it('opens image upload modal on button click', async () => {
    const user = userEvent.setup();
    const { getByRole, queryByTestId } = renderSignatory(defaultProps);
    const replaceButton = getByRole(
      'button',
      { name: messages.uploadImageButton.defaultMessage.replace('{uploadText}', messages.uploadModalReplace.defaultMessage) },
    );

    expect(queryByTestId('dropzone-container')).not.toBeInTheDocument();

    await user.click(replaceButton);

    expect(queryByTestId('dropzone-container')).toBeInTheDocument();
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
