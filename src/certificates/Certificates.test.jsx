import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { RequestStatus } from '../data/constants';
import { executeThunk } from '../utils';
import initializeStore from '../store';
import { getCertificatesApiUrl } from './data/api';
import { fetchCertificates } from './data/thunks';
import { certificatesDataMock } from './__mocks__';
import Certificates from './Certificates';
import messages from './messages';

let axiosMock;
let store;
const courseId = 'course-123';

const renderComponent = (props) => render(
  <AppProvider store={store} messages={{}}>
    <IntlProvider locale="en">
      <Certificates courseId={courseId} {...props} />
    </IntlProvider>
  </AppProvider>,
);

describe('Certificates', () => {
  beforeEach(async () => {
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
  });

  it('renders WithoutModes when there are certificates but no certificate modes', async () => {
    const noModesMock = {
      ...certificatesDataMock,
      courseModes: [],
      hasCertificateModes: false,
    };

    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, noModesMock);
    await executeThunk(fetchCertificates(courseId), store.dispatch);

    const { getByText, queryByRole } = renderComponent();

    await waitFor(() => {
      expect(getByText(messages.withoutModesText.defaultMessage)).toBeInTheDocument();
      expect(queryByRole('button', { name: messages.headingActionsPreview.defaultMessage })).not.toBeInTheDocument();
    });
  });

  it('renders WithoutModes when there are no certificate modes', async () => {
    const noModesMock = {
      ...certificatesDataMock,
      certificates: [],
      courseModes: [],
      hasCertificateModes: false,
    };

    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, noModesMock);
    await executeThunk(fetchCertificates(courseId), store.dispatch);

    const { getByText, queryByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(messages.withoutModesText.defaultMessage)).toBeInTheDocument();
      expect(queryByText(messages.noCertificatesText.defaultMessage)).not.toBeInTheDocument();
    });
  });

  it('renders WithModesWithoutCertificates when there are modes but no certificates', async () => {
    const noCertificatesMock = {
      ...certificatesDataMock,
      certificates: [],
    };

    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, noCertificatesMock);
    await executeThunk(fetchCertificates(courseId), store.dispatch);

    const { getByText, queryByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(messages.noCertificatesText.defaultMessage)).toBeInTheDocument();
      expect(queryByText(messages.withoutModesText.defaultMessage)).not.toBeInTheDocument();
    });
  });

  it('renders CertificatesList when there are modes and certificates', async () => {
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, certificatesDataMock);
    await executeThunk(fetchCertificates(courseId), store.dispatch);

    const { getByText, queryByText, getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('certificates-list')).toBeInTheDocument();
      expect(getByText(certificatesDataMock.courseTitle)).toBeInTheDocument();
      expect(getByText(certificatesDataMock.certificates[0].signatories[0].name)).toBeInTheDocument();
      expect(queryByText(messages.noCertificatesText.defaultMessage)).not.toBeInTheDocument();
      expect(queryByText(messages.withoutModesText.defaultMessage)).not.toBeInTheDocument();
    });
  });

  it('renders CertificateCreateForm when there is componentMode = MODE_STATES.create', async () => {
    const noCertificatesMock = {
      ...certificatesDataMock,
      certificates: [],
    };

    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, noCertificatesMock);
    await executeThunk(fetchCertificates(courseId), store.dispatch);

    const { queryByTestId, getByTestId, getByRole } = renderComponent();

    await waitFor(() => {
      const addCertificateButton = getByRole('button', { name: messages.setupCertificateBtn.defaultMessage });
      userEvent.click(addCertificateButton);
    });

    expect(getByTestId('certificates-create-form')).toBeInTheDocument();
    expect(getByTestId('certificate-details-form')).toBeInTheDocument();
    expect(getByTestId('signatory-form')).toBeInTheDocument();
    expect(queryByTestId('certificate-details')).not.toBeInTheDocument();
    expect(queryByTestId('signatory')).not.toBeInTheDocument();
  });

  it('renders CertificateEditForm when there is componentMode = MODE_STATES.editAll', async () => {
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, certificatesDataMock);
    await executeThunk(fetchCertificates(courseId), store.dispatch);

    const { queryByTestId, getByTestId, getAllByLabelText } = renderComponent();

    await waitFor(() => {
      const editCertificateButton = getAllByLabelText(messages.editTooltip.defaultMessage)[0];
      userEvent.click(editCertificateButton);
    });

    expect(getByTestId('certificates-edit-form')).toBeInTheDocument();
    expect(getByTestId('certificate-details-form')).toBeInTheDocument();
    expect(getByTestId('signatory-form')).toBeInTheDocument();
    expect(queryByTestId('certificate-details')).not.toBeInTheDocument();
    expect(queryByTestId('signatory')).not.toBeInTheDocument();
  });

  it('renders placeholder if request fails', async () => {
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(403, certificatesDataMock);

    const { getByTestId } = renderComponent();

    await executeThunk(fetchCertificates(courseId), store.dispatch);

    expect(getByTestId('request-denied-placeholder')).toBeInTheDocument();
  });

  it('updates loading status if request fails', async () => {
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(404, certificatesDataMock);

    renderComponent();

    await executeThunk(fetchCertificates(courseId), store.dispatch);

    expect(store.getState().certificates.loadingStatus).toBe(RequestStatus.FAILED);
  });
});
