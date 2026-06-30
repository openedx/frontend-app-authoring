import MockAdapter from 'axios-mock-adapter';
import {
  render,
  screen,
  within,
  initializeMocks,
  userEvent,
} from '@src/testUtils';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { CertificatesProvider } from '@src/certificates/context';

import { getCertificatesApiUrl, getUpdateCertificateApiUrl } from '../data/api';
import { certificatesDataMock } from '../__mocks__';
import commonMessages from '../messages';
import messages from './messages';
import CertificateDetails, { type CertificateDetialsProps } from './CertificateDetails';

let axiosMock: MockAdapter;
const courseId = 'course-123';
const certificate = certificatesDataMock.certificates[0];

const defaultProps: CertificateDetialsProps = {
  certificateId: certificate.id,
  detailsCourseTitle: certificatesDataMock.courseTitle,
  detailsCourseNumber: certificatesDataMock.courseNumber,
};

const renderComponent = (props = defaultProps) =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <CertificatesProvider>
        <CertificateDetails {...props} />
      </CertificatesProvider>
    </CourseAuthoringProvider>,
  );

describe('CertificateDetails', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, certificatesDataMock);
  });

  it('renders correctly with course title and section heading', async () => {
    renderComponent();

    expect(await screen.findByText(messages.detailsSectionTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(certificatesDataMock.courseTitle)).toBeInTheDocument();
  });

  it('opens confirm modal on delete button click', async () => {
    const user = userEvent.setup();
    renderComponent();

    await screen.findByText(messages.detailsSectionTitle.defaultMessage);
    await user.click(screen.getByRole('button', { name: commonMessages.deleteTooltip.defaultMessage }));

    expect(screen.getByText(messages.deleteCertificateConfirmationTitle.defaultMessage)).toBeInTheDocument();
  });

  it('calls delete API on confirm modal action', async () => {
    const user = userEvent.setup();
    renderComponent();

    await screen.findByText(messages.detailsSectionTitle.defaultMessage);

    axiosMock
      .onDelete(getUpdateCertificateApiUrl(courseId, certificate.id))
      .reply(200);
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, { ...certificatesDataMock, certificates: [] });

    await user.click(screen.getByRole('button', { name: commonMessages.deleteTooltip.defaultMessage }));

    const confirmModal = screen.getByRole('dialog');
    await user.click(within(confirmModal).getByRole('button', { name: commonMessages.deleteTooltip.defaultMessage }));

    expect(axiosMock.history.delete).toHaveLength(1);
    expect(axiosMock.history.delete[0].url).toContain(String(certificate.id));
  });

  it('shows course title override when provided', async () => {
    const courseTitleOverride = 'Overridden Title';
    renderComponent({ ...defaultProps, courseTitleOverride });

    await screen.findByText(messages.detailsSectionTitle.defaultMessage);
    expect(screen.getByText(courseTitleOverride)).toBeInTheDocument();
  });
});
