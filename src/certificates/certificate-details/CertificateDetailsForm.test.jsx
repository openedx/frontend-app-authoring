import { Provider } from 'react-redux';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';

import initializeStore from '../../store';
import { MODE_STATES } from '../data/constants';
import commonMessages from '../messages';
import messages from './messages';
import CertificateDetailsForm from './CertificateDetailsForm';

let store;

const renderComponent = (props) => render(
  <Provider store={store}>
    <IntlProvider locale="en">
      <CertificateDetailsForm {...props} />
    </IntlProvider>
  </Provider>,
);

const defaultProps = {
  componentMode: MODE_STATES.view,
  detailsCourseTitle: 'Course Title',
  detailsCourseNumber: 'Course Number',
  handleChange: jest.fn(),
  handleBlur: jest.fn(),
};

const initialState = {
  certificates: {
    certificatesData: {
      certificates: [],
      hasCertificateModes: false,
    },
  },
};

describe('CertificateDetails', () => {
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

  it('renders correctly in create mode', () => {
    const { getByText, getByPlaceholderText } = renderComponent(defaultProps);

    expect(getByText(messages.detailsSectionTitle.defaultMessage)).toBeInTheDocument();
    expect(getByPlaceholderText(messages.detailsCourseTitleOverride.defaultMessage)).toBeInTheDocument();
  });

  it('handles input change in create mode', async () => {
    const { getByPlaceholderText } = renderComponent(defaultProps);
    const input = getByPlaceholderText(messages.detailsCourseTitleOverride.defaultMessage);
    const newInputValue = 'New Title';

    userEvent.type(input, newInputValue);

    waitFor(() => {
      expect(input.value).toBe(newInputValue);
    });
  });

  it('does not show delete button in create mode', () => {
    const { queryByRole } = renderComponent(defaultProps);

    expect(queryByRole('button', { name: commonMessages.deleteTooltip.defaultMessage })).not.toBeInTheDocument();
  });
});
