import { render, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../../store';
import CertificatesSidebar from './CertificatesSidebar';
import messages from './messages';

const courseId = 'course-123';
let store;

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

const renderComponent = (props) => render(
  <AppProvider store={store} messages={{}}>
    <IntlProvider locale="en">
      <CertificatesSidebar courseId={courseId} {...props} />
    </IntlProvider>
  </AppProvider>,
);

describe('CertificatesSidebar', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
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
