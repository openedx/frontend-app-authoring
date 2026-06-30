import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { CertificatesProvider } from '@src/certificates/context';
import { initializeMocks, render, screen, userEvent } from '../testUtils';
import { getCertificatesApiUrl } from './data/api';
import { certificatesDataMock } from './__mocks__';
import Certificates from './Certificates';
import messages from './messages';

let axiosMock;
const courseId = 'course-123';

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <CertificatesProvider>
        <Certificates />
      </CertificatesProvider>
    </CourseAuthoringProvider>,
  );

describe('Certificates', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
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

    renderComponent();

    expect(await screen.findByText(messages.withoutModesText.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.headingActionsPreview.defaultMessage })).not
      .toBeInTheDocument();
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

    renderComponent();

    expect(await screen.findByText(messages.withoutModesText.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText(messages.noCertificatesText.defaultMessage)).not.toBeInTheDocument();
  });

  it('renders WithModesWithoutCertificates when there are modes but no certificates', async () => {
    const noCertificatesMock = {
      ...certificatesDataMock,
      certificates: [],
    };

    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, noCertificatesMock);

    renderComponent();

    expect(await screen.findByText(messages.noCertificatesText.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText(messages.withoutModesText.defaultMessage)).not.toBeInTheDocument();
  });

  it('renders CertificatesList when there are modes and certificates', async () => {
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, certificatesDataMock);

    renderComponent();

    expect(await screen.findByTestId('certificates-list')).toBeInTheDocument();
    expect(screen.getByText(certificatesDataMock.courseTitle)).toBeInTheDocument();
    expect(screen.getByText(certificatesDataMock.certificates[0].signatories[0].name)).toBeInTheDocument();
    expect(screen.queryByText(messages.noCertificatesText.defaultMessage)).not.toBeInTheDocument();
    expect(screen.queryByText(messages.withoutModesText.defaultMessage)).not.toBeInTheDocument();
  });

  it('renders CertificateCreateForm when there is componentMode = MODE_STATES.create', async () => {
    const noCertificatesMock = {
      ...certificatesDataMock,
      certificates: [],
    };

    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, noCertificatesMock);

    const user = userEvent.setup();
    renderComponent();

    const addCertificateButton = await screen.findByRole('button', {
      name: messages.setupCertificateBtn.defaultMessage,
    });
    await user.click(addCertificateButton);

    expect(screen.getByTestId('certificates-create-form')).toBeInTheDocument();
    expect(screen.getByTestId('certificate-details-form')).toBeInTheDocument();
    expect(screen.getByTestId('signatory-form')).toBeInTheDocument();
    expect(screen.queryByTestId('certificate-details')).not.toBeInTheDocument();
    expect(screen.queryByTestId('signatory')).not.toBeInTheDocument();
  });

  it('renders CertificateEditForm when there is componentMode = MODE_STATES.editAll', async () => {
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, certificatesDataMock);

    const user = userEvent.setup();
    renderComponent();

    const editCertificateButton = await screen.findAllByLabelText(messages.editTooltip.defaultMessage);
    await user.click(editCertificateButton[0]);

    expect(screen.getByTestId('certificates-edit-form')).toBeInTheDocument();
    expect(screen.getByTestId('certificate-details-form')).toBeInTheDocument();
    expect(screen.getByTestId('signatory-form')).toBeInTheDocument();
    expect(screen.queryByTestId('certificate-details')).not.toBeInTheDocument();
    expect(screen.queryByTestId('signatory')).not.toBeInTheDocument();
  });

  it('renders placeholder if request fails with 403', async () => {
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(403, certificatesDataMock);

    renderComponent();

    expect(await screen.findByTestId('request-denied-placeholder')).toBeInTheDocument();
  });

  it('does not render placeholder if request fails with non-403 error', async () => {
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(404, certificatesDataMock);

    renderComponent();

    expect(screen.queryByTestId('request-denied-placeholder')).not.toBeInTheDocument();
  });
});
