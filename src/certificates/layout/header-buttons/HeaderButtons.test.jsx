import { Provider } from 'react-redux';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { executeThunk } from '../../../utils';
import initializeStore from '../../../store';
import { MODE_STATES } from '../../data/constants';
import { getCertificatesApiUrl, getUpdateCertificateApiUrl } from '../../data/api';
import { fetchCertificates, updateCertificateActiveStatus } from '../../data/thunks';
import { certificatesDataMock } from '../../__mocks__';
import messages from '../../messages';
import HeaderButtons from './HeaderButtons';

let axiosMock;
let store;
const courseId = 'course-123';

const renderComponent = (props) => render(
  <Provider store={store} messages={{}}>
    <IntlProvider locale="en">
      <HeaderButtons {...props} />
    </IntlProvider>
  </Provider>,
);

const initialState = {
  certificates: {
    certificatesData: {},
    componentMode: MODE_STATES.editAll,
  },
};

describe('HeaderButtons Component', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore(initialState);
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, certificatesDataMock);
    await executeThunk(fetchCertificates(courseId), store.dispatch);
  });

  it('updates preview URL param based on selected dropdown item', async () => {
    const { getByRole } = renderComponent();
    const previewLink = getByRole('link', { name: messages.headingActionsPreview.defaultMessage });

    expect(previewLink).toHaveAttribute('href', expect.stringContaining(certificatesDataMock.courseModes[0]));

    const dropdownButton = getByRole('button', { name: certificatesDataMock.courseModes[0] });
    userEvent.click(dropdownButton);

    const verifiedMode = await getByRole('button', { name: certificatesDataMock.courseModes[1] });
    userEvent.click(verifiedMode);

    await waitFor(() => {
      expect(previewLink).toHaveAttribute('href', expect.stringContaining(certificatesDataMock.courseModes[1]));
    });
  });

  it('activates certificate when button is clicked', async () => {
    const newCertificateData = {
      ...certificatesDataMock,
      isActive: true,
    };

    const { getByRole, queryByRole } = renderComponent();

    const activationButton = getByRole('button', { name: messages.headingActionsActivate.defaultMessage });
    userEvent.click(activationButton);

    axiosMock.onPost(
      getUpdateCertificateApiUrl(courseId, certificatesDataMock.certificates[0].id),
    ).reply(200);
    await executeThunk(updateCertificateActiveStatus(courseId), store.dispatch);
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, newCertificateData);
    await executeThunk(fetchCertificates(courseId), store.dispatch);

    await waitFor(() => {
      expect(store.getState().certificates.certificatesData.isActive).toBe(true);
      expect(getByRole('button', { name: messages.headingActionsDeactivate.defaultMessage })).toBeInTheDocument();
      expect(queryByRole('button', { name: messages.headingActionsActivate.defaultMessage })).not.toBeInTheDocument();
    });
  });

  it('deactivates certificate when button is clicked', async () => {
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, { ...certificatesDataMock, isActive: true });
    await executeThunk(fetchCertificates(courseId), store.dispatch);

    const newCertificateData = {
      ...certificatesDataMock,
      isActive: false,
    };

    const { getByRole, queryByRole } = renderComponent();

    const deactivateButton = getByRole('button', { name: messages.headingActionsDeactivate.defaultMessage });
    userEvent.click(deactivateButton);

    axiosMock.onPost(
      getUpdateCertificateApiUrl(courseId, certificatesDataMock.certificates[0].id),
    ).reply(200);
    await executeThunk(updateCertificateActiveStatus(courseId), store.dispatch);
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, newCertificateData);
    await executeThunk(fetchCertificates(courseId), store.dispatch);

    await waitFor(() => {
      expect(store.getState().certificates.certificatesData.isActive).toBe(false);
      expect(getByRole('button', { name: messages.headingActionsActivate.defaultMessage })).toBeInTheDocument();
      expect(queryByRole('button', { name: messages.headingActionsDeactivate.defaultMessage })).not.toBeInTheDocument();
    });
  });
});
