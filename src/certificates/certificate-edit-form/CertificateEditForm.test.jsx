import { Provider } from 'react-redux';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { RequestStatus } from '../../data/constants';
import { executeThunk } from '../../utils';
import initializeStore from '../../store';
import { getCertificatesApiUrl, getUpdateCertificateApiUrl } from '../data/api';
import { fetchCertificates, deleteCourseCertificate, updateCourseCertificate } from '../data/thunks';
import { certificatesDataMock } from '../__mocks__';
import { MODE_STATES } from '../data/constants';
import messagesDetails from '../certificate-details/messages';
import messages from '../messages';
import CertificateEditForm from './CertificateEditForm';

let axiosMock;
let store;
const courseId = 'course-123';

const renderComponent = () => render(
  <Provider store={store}>
    <IntlProvider locale="en">
      <CertificateEditForm courseId="course-123" />
    </IntlProvider>
  </Provider>,
);

const initialState = {
  certificates: {
    certificatesData: {},
    componentMode: MODE_STATES.editAll,
  },
};

describe('CertificateEditForm Component', () => {
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

  it('submits the form with updated certificate details', async () => {
    const courseTitleOverrideValue = 'Updated Course Title';
    const signatoryNameValue = 'Updated signatory name';
    const newCertificateData = {
      ...certificatesDataMock,
      courseTitle: courseTitleOverrideValue,
      certificates: [{
        ...certificatesDataMock.certificates[0],
        signatories: [{
          ...certificatesDataMock.certificates[0].signatories[0],
          name: signatoryNameValue,
        }],
      }],
    };

    const { getByDisplayValue, getByRole, getByPlaceholderText } = renderComponent();

    userEvent.type(
      getByPlaceholderText(messagesDetails.detailsCourseTitleOverride.defaultMessage),
      courseTitleOverrideValue,
    );

    userEvent.click(getByRole('button', { name: messages.saveTooltip.defaultMessage }));

    axiosMock.onPost(
      getUpdateCertificateApiUrl(courseId, certificatesDataMock.certificates[0].id),
    ).reply(200, newCertificateData);
    await executeThunk(updateCourseCertificate(courseId, newCertificateData), store.dispatch);

    await waitFor(() => {
      expect(getByDisplayValue(
        certificatesDataMock.certificates[0].courseTitle + courseTitleOverrideValue,
      )).toBeInTheDocument();
    });
  });

  it('deletes a certificate and updates the store', async () => {
    axiosMock.onDelete(
      getUpdateCertificateApiUrl(courseId, certificatesDataMock.certificates[0].id),
    ).reply(200);

    const { getByRole } = renderComponent();

    userEvent.click(getByRole('button', { name: messages.deleteTooltip.defaultMessage }));

    const confirmDeleteModal = getByRole('dialog');
    userEvent.click(within(confirmDeleteModal).getByRole('button', { name: messages.deleteTooltip.defaultMessage }));

    await executeThunk(deleteCourseCertificate(courseId, certificatesDataMock.certificates[0].id), store.dispatch);

    await waitFor(() => {
      expect(store.getState().certificates.certificatesData.certificates.length).toBe(0);
    });
  });

  it('updates loading status if delete fails', async () => {
    axiosMock.onDelete(
      getUpdateCertificateApiUrl(courseId, certificatesDataMock.certificates[0].id),
    ).reply(404);

    const { getByRole } = renderComponent();

    userEvent.click(getByRole('button', { name: messages.deleteTooltip.defaultMessage }));

    const confirmDeleteModal = getByRole('dialog');
    userEvent.click(within(confirmDeleteModal).getByRole('button', { name: messages.deleteTooltip.defaultMessage }));

    await executeThunk(deleteCourseCertificate(courseId, certificatesDataMock.certificates[0].id), store.dispatch);

    await waitFor(() => {
      expect(store.getState().certificates.savingStatus).toBe(RequestStatus.FAILED);
    });
  });

  it('cancel edit form', async () => {
    const { getByRole } = renderComponent();

    expect(store.getState().certificates.componentMode).toBe(MODE_STATES.editAll);

    userEvent.click(getByRole('button', { name: messages.cardCancel.defaultMessage }));

    expect(store.getState().certificates.componentMode).toBe(MODE_STATES.view);
  });
});
