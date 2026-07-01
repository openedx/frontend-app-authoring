import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import CertificatesSidebar from './CertificatesSidebar';
import messages from './messages';
import {
  findByDeepTextContent,
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';

const courseId = 'course-123';

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
    expect(await findByDeepTextContent(/select Edit or the delete icon/)).toBeInTheDocument();
    expect(await findByDeepTextContent(/select Preview certificate/)).toBeInTheDocument();

    expect(screen.getByText(messages.issuingCertificatesTitle.defaultMessage)).toBeInTheDocument();
    expect(await findByDeepTextContent(/selects Activate/)).toBeInTheDocument();
    expect(await findByDeepTextContent(/Do not delete certificates after a course has started/)).toBeInTheDocument();

    expect(screen.getByText(messages.learnMoreBtn.defaultMessage)).toBeInTheDocument();
  });
});
