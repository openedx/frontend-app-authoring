import { Provider, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';

import initializeStore from '../../store';
import { MODE_STATES } from '../data/constants';
import { deleteCourseCertificate } from '../data/thunks';
import commonMessages from '../messages';
import messages from './messages';
import CertificateDetails from './CertificateDetails';

let store;
const courseId = 'course-v1:edX+DemoX+Demo_Course';
const certificateId = 123;

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('../data/thunks', () => ({
  deleteCourseCertificate: jest.fn(),
}));

const renderComponent = (props) => render(
  <Provider store={store}>
    <IntlProvider locale="en">
      <CertificateDetails {...props} />
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
  let mockDispatch;

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
    useParams.mockReturnValue({ courseId });
    mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    useParams.mockClear();
    mockDispatch.mockClear();
  });

  it('renders correctly in view mode', () => {
    const { getByText } = renderComponent(defaultProps);

    expect(getByText(messages.detailsSectionTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(defaultProps.detailsCourseTitle)).toBeInTheDocument();
  });

  it('opens confirm modal on delete button click', () => {
    const { getByRole, getByText } = renderComponent(defaultProps);
    const deleteButton = getByRole('button', { name: commonMessages.deleteTooltip.defaultMessage });
    userEvent.click(deleteButton);

    expect(getByText(messages.deleteCertificateConfirmationTitle.defaultMessage)).toBeInTheDocument();
  });

  it('dispatches delete action on confirm modal action', async () => {
    const props = { ...defaultProps, courseId, certificateId };
    const { getByRole } = renderComponent(props);
    const deleteButton = getByRole('button', { name: commonMessages.deleteTooltip.defaultMessage });
    userEvent.click(deleteButton);

    await waitFor(() => {
      const confirmActionButton = getByRole('button', { name: commonMessages.deleteTooltip.defaultMessage });
      userEvent.click(confirmActionButton);
    });

    expect(mockDispatch).toHaveBeenCalledWith(deleteCourseCertificate(courseId, certificateId));
  });

  it('shows course title override in view mode', () => {
    const courseTitleOverride = 'Overridden Title';
    const props = { ...defaultProps, courseTitleOverride };
    const { getByText } = renderComponent(props);

    expect(getByText(courseTitleOverride)).toBeInTheDocument();
  });
});
