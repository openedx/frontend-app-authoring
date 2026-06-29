import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import CertificatesSidebar from './CertificatesSidebar';
import messages from './messages';
import { initializeMocks, render, screen } from '@src/testUtils';

const courseId = 'course-123';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

const renderComponent = (props) =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <CertificatesSidebar courseId={courseId} {...props} />
    </CourseAuthoringProvider>,
  );

describe('CertificatesSidebar', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders correctly', async () => {
    renderComponent({});

    expect(await screen.findByText(messages.workingWithCertificatesTitle.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(messages.workingWithCertificatesFirstParagraph.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(messages.workingWithCertificatesSecondParagraph.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(messages.workingWithCertificatesThirdParagraph.defaultMessage)).toBeInTheDocument();

    expect(screen.getByText(messages.issuingCertificatesTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.issuingCertificatesFirstParagraph.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.issuingCertificatesSecondParagraph.defaultMessage)).toBeInTheDocument();

    expect(screen.getByText(messages.learnMoreBtn.defaultMessage)).toBeInTheDocument();
  });
});
