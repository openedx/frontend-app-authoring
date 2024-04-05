import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { executeThunk } from '../../utils';
import initializeStore from '../../store';
import { MODE_STATES } from '../data/constants';
import { getCertificatesApiUrl, getCertificateApiUrl } from '../data/api';
import { fetchCertificates, createCourseCertificate } from '../data/thunks';
import { certificatesDataMock } from '../__mocks__';
import detailsMessages from '../certificate-details/messages';
import signatoryMessages from '../certificate-signatories/messages';
import messages from '../messages';
import CertificateCreateForm from './CertificateCreateForm';

const courseId = 'course-123';
let store;
let axiosMock;

const renderComponent = () => render(
  <Provider store={store}>
    <IntlProvider locale="en">
      <CertificateCreateForm courseId={courseId} />
    </IntlProvider>
  </Provider>,
);

const initialState = {
  certificates: {
    certificatesData: {
      certificates: [],
      hasCertificateModes: true,
    },
    componentMode: MODE_STATES.create,
  },
};

describe('CertificateCreateForm', () => {
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
      .reply(200, {
        ...certificatesDataMock,
        certificates: [],
      });
    await executeThunk(fetchCertificates(courseId), store.dispatch);
  });

  it('renders with empty fields', () => {
    const { getByPlaceholderText } = renderComponent();

    expect(getByPlaceholderText(detailsMessages.detailsCourseTitleOverride.defaultMessage).value).toBe('');
    expect(getByPlaceholderText(signatoryMessages.namePlaceholder.defaultMessage).value).toBe('');
    expect(getByPlaceholderText(signatoryMessages.titlePlaceholder.defaultMessage).value).toBe('');
    expect(getByPlaceholderText(signatoryMessages.organizationPlaceholder.defaultMessage).value).toBe('');
    expect(getByPlaceholderText(signatoryMessages.imagePlaceholder.defaultMessage).value).toBe('');
  });

  it('creates a new certificate', async () => {
    const courseTitleOverrideValue = 'Create Course Title';
    const signatoryNameValue = 'Create signatory name';
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

    const { getByPlaceholderText, getByRole, getByDisplayValue } = renderComponent();

    userEvent.type(
      getByPlaceholderText(detailsMessages.detailsCourseTitleOverride.defaultMessage),
      courseTitleOverrideValue,
    );
    userEvent.type(
      getByPlaceholderText(signatoryMessages.namePlaceholder.defaultMessage),
      signatoryNameValue,
    );
    userEvent.click(getByRole('button', { name: messages.cardCreate.defaultMessage }));

    axiosMock.onPost(
      getCertificateApiUrl(courseId),
    ).reply(200, newCertificateData);
    await executeThunk(createCourseCertificate(courseId, newCertificateData), store.dispatch);

    await waitFor(() => {
      expect(getByDisplayValue(courseTitleOverrideValue)).toBeInTheDocument();
      expect(getByDisplayValue(signatoryNameValue)).toBeInTheDocument();
    });
  });

  it('cancel certificates creation', async () => {
    const { getByRole } = renderComponent();
    userEvent.click(getByRole('button', { name: messages.cardCancel.defaultMessage }));

    await waitFor(() => {
      expect(store.getState().certificates.componentMode).toBe(MODE_STATES.noCertificates);
    });
  });

  it('there is no delete signatory button if signatories length is less then 2', async () => {
    const { queryAllByRole } = renderComponent();
    const deleteIcons = queryAllByRole('button', { name: messages.deleteTooltip.defaultMessage });

    await waitFor(() => {
      expect(deleteIcons.length).toBe(0);
    });
  });

  it('add and delete signatory', async () => {
    const {
      getAllByRole, queryAllByRole, getByText, getByRole,
    } = renderComponent();

    const addSignatoryBtn = getByText(signatoryMessages.addSignatoryButton.defaultMessage);

    userEvent.click(addSignatoryBtn);

    const deleteIcons = getAllByRole('button', { name: messages.deleteTooltip.defaultMessage });

    await waitFor(() => {
      expect(deleteIcons.length).toBe(2);
    });

    userEvent.click(deleteIcons[0]);

    const confirModal = getByRole('dialog');
    const deleteModalButton = within(confirModal).getByRole('button', { name: messages.deleteTooltip.defaultMessage });

    userEvent.click(deleteIcons[0]);
    userEvent.click(deleteModalButton);

    await waitFor(() => {
      expect(queryAllByRole('button', { name: messages.deleteTooltip.defaultMessage }).length).toBe(0);
    });
  });
});
