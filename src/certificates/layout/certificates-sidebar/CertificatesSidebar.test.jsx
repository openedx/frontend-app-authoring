// @ts-check
import CertificatesSidebar from './CertificatesSidebar';
import messages from './messages';
import { initializeMocks, render, waitFor } from '../../../testUtils';

const courseId = 'course-123';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

const renderComponent = (props) => render(<CertificatesSidebar courseId={courseId} {...props} />);

describe('CertificatesSidebar', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders correctly', async () => {
    const { getByText } = renderComponent();
    await waitFor(() => {
      expect(getByText(messages.workingWithCertificatesTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.workingWithCertificatesFirstParagraph.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.workingWithCertificatesSecondParagraph.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.workingWithCertificatesThirdParagraph.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.issuingCertificatesTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.issuingCertificatesFirstParagraph.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.issuingCertificatesSecondParagraph.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.learnMoreBtn.defaultMessage)).toBeInTheDocument();
    });
  });
});
