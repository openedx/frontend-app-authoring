import { Provider } from 'react-redux';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { executeThunk } from '../../utils';
import initializeStore from '../../store';
import { MODE_STATES } from '../data/constants';
import { getCertificatesApiUrl, getUpdateCertificateApiUrl } from '../data/api';
import { fetchCertificates, updateCourseCertificate } from '../data/thunks';
import { certificatesMock, certificatesDataMock } from '../__mocks__';
import signatoryMessages from '../certificate-signatories/messages';
import messages from '../messages';
import CertificatesList from './CertificatesList';

let axiosMock;
let store;
const courseId = 'course-123';

const renderComponent = () => render(
  <Provider store={store}>
    <IntlProvider locale="en">
      <CertificatesList courseId="course-123" />
    </IntlProvider>
  </Provider>,
);

describe('CertificatesList Component', () => {
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
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, {
        ...certificatesDataMock,
        certificates: certificatesMock,
      });
    await executeThunk(fetchCertificates(courseId), store.dispatch);
  });

  it('renders each certificate', () => {
    const { getByText } = renderComponent();

    certificatesMock.forEach((certificate) => {
      certificate.signatories.forEach((signatory) => {
        expect(getByText(signatory.name)).toBeInTheDocument();
        expect(getByText(signatory.title)).toBeInTheDocument();
        expect(getByText(signatory.organization)).toBeInTheDocument();
      });
    });
  });

  it('update certificate', async () => {
    const {
      getByText, queryByText, getByPlaceholderText, getByRole, getAllByLabelText,
    } = renderComponent();

    const signatoryNameValue = 'Updated signatory name';
    const newCertificateData = {
      ...certificatesDataMock,
      certificates: [{
        ...certificatesMock[0],
        signatories: [{
          ...certificatesMock[0].signatories[0],
          name: signatoryNameValue,
        }],
      }],
    };

    const editButtons = getAllByLabelText(messages.editTooltip.defaultMessage);

    userEvent.click(editButtons[1]);

    const nameInput = getByPlaceholderText(signatoryMessages.namePlaceholder.defaultMessage);
    userEvent.clear(nameInput);
    userEvent.type(nameInput, signatoryNameValue);

    userEvent.click(getByRole('button', { name: messages.saveTooltip.defaultMessage }));

    axiosMock
      .onPost(getUpdateCertificateApiUrl(courseId, certificatesMock.id))
      .reply(200, newCertificateData);
    await executeThunk(updateCourseCertificate(courseId, newCertificateData), store.dispatch);

    await waitFor(() => {
      expect(getByText(newCertificateData.certificates[0].signatories[0].name)).toBeInTheDocument();
      expect(queryByText(certificatesDataMock.certificates[0].signatories[0].name)).not.toBeInTheDocument();
    });
  });

  it('toggle edit signatory', async () => {
    const {
      getAllByLabelText, queryByPlaceholderText, getByTestId, getByPlaceholderText,
    } = renderComponent();
    const editButtons = getAllByLabelText(messages.editTooltip.defaultMessage);

    expect(editButtons.length).toBe(3);

    userEvent.click(editButtons[1]);

    await waitFor(() => {
      expect(getByPlaceholderText(signatoryMessages.namePlaceholder.defaultMessage)).toBeInTheDocument();
    });

    userEvent.click(within(getByTestId('signatory-form')).getByRole('button', { name: messages.cardCancel.defaultMessage }));

    await waitFor(() => {
      expect(queryByPlaceholderText(signatoryMessages.namePlaceholder.defaultMessage)).not.toBeInTheDocument();
    });
  });

  it('toggle certificate edit all', async () => {
    const { getByTestId } = renderComponent();
    const detailsSection = getByTestId('certificate-details');
    const editButton = within(detailsSection).getByLabelText(messages.editTooltip.defaultMessage);
    userEvent.click(editButton);

    await waitFor(() => {
      expect(store.getState().certificates.componentMode).toBe(MODE_STATES.editAll);
    });
  });
});
