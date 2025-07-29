// @ts-check
import userEvent from '@testing-library/user-event';

import { initializeMocks, render, waitFor } from '../testUtils';
import { RequestStatus } from '../data/constants';
import { executeThunk } from '../utils';
import { getCertificatesApiUrl } from './data/api';
import { fetchCertificates } from './data/thunks';
import { certificatesDataMock } from './__mocks__';
import Certificates from './Certificates';
import messages from './messages';

let axiosMock;
let store;
const courseId = 'course-123';

const renderComponent = (props) => render(<Certificates courseId={courseId} {...props} />);

describe('Certificates', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
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

    const user = userEvent.setup();

    const { queryByTestId, getByTestId, getByRole } = renderComponent();

    await waitFor(async () => {
      const addCertificateButton = getByRole('button', { name: messages.setupCertificateBtn.defaultMessage });
      await user.click(addCertificateButton);
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

    const user = userEvent.setup();

    const { queryByTestId, getByTestId, getAllByLabelText } = renderComponent();

    await waitFor(async () => {
      const editCertificateButton = getAllByLabelText(messages.editTooltip.defaultMessage)[0];
      await user.click(editCertificateButton);
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
