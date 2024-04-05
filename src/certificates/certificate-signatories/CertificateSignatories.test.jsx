import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';

import initializeStore from '../../store';
import { MODE_STATES } from '../data/constants';
import { signatoriesMock } from '../__mocks__';
import commonMessages from '../messages';
import messages from './messages';
import useEditSignatory from './hooks/useEditSignatory';
import useCreateSignatory from './hooks/useCreateSignatory';
import CertificateSignatories from './CertificateSignatories';

let store;

const mockArrayHelpers = {
  push: jest.fn(),
  remove: jest.fn(),
};

jest.mock('./hooks/useEditSignatory');

jest.mock('./hooks/useCreateSignatory');

const renderComponent = (props) => render(
  <Provider store={store}>
    <IntlProvider locale="en">
      <CertificateSignatories {...props} />
    </IntlProvider>,
  </Provider>,
);

const defaultProps = {
  signatories: signatoriesMock,
  handleChange: jest.fn(),
  handleBlur: jest.fn(),
  setFieldValue: jest.fn(),
  arrayHelpers: mockArrayHelpers,
  isForm: true,
  resetForm: jest.fn(),
  editModes: {},
  setEditModes: jest.fn(),
};

const initialState = {
  certificates: {
    certificatesData: {
      certificates: [],
      hasCertificateModes: true,
    },
    componentMode: MODE_STATES.create,
  },
};

describe('CertificateSignatories', () => {
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
    useEditSignatory.mockReturnValue({
      toggleEditSignatory: jest.fn(),
      handleDeleteSignatory: jest.fn(),
      handleCancelUpdateSignatory: jest.fn(),
    });

    useCreateSignatory.mockReturnValue({
      handleAddSignatory: jest.fn(),
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('renders signatory components for each signatory', () => {
    const { getByText } = renderComponent({ ...defaultProps, isForm: false });

    signatoriesMock.forEach(signatory => {
      expect(getByText(signatory.name)).toBeInTheDocument();
      expect(getByText(signatory.title)).toBeInTheDocument();
      expect(getByText(signatory.organization)).toBeInTheDocument();
    });
  });

  it('adds a new signatory when add button is clicked', () => {
    const { getByText } = renderComponent({ ...defaultProps, isForm: true });

    userEvent.click(getByText(messages.addSignatoryButton.defaultMessage));
    expect(useCreateSignatory().handleAddSignatory).toHaveBeenCalled();
  });

  it('calls remove for the correct signatory when delete icon is clicked', async () => {
    const { getAllByRole } = renderComponent(defaultProps);

    const deleteIcons = getAllByRole('button', { name: commonMessages.deleteTooltip.defaultMessage });
    expect(deleteIcons.length).toBe(signatoriesMock.length);

    userEvent.click(deleteIcons[0]);

    waitFor(() => {
      expect(mockArrayHelpers.remove).toHaveBeenCalledWith(0);
    });
  });
});
