import {
  render,
  screen,
  initializeMocks,
  userEvent,
} from '@src/testUtils';
import { CertificatesProvider, useCertificatesContext } from '@src/certificates/context';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { useCourseUserPermissions } from '@src/authz/hooks';
import { MODE_STATES } from '../data/constants';
import messages from '../messages';
import EmptyCertificatesWithModes from './EmptyCertificatesWithModes';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';

const ComponentModeDisplay = () => {
  const { componentMode } = useCertificatesContext();
  return <div data-testid="component-mode">{componentMode}</div>;
};

jest.mock('@src/authz/hooks', () => ({
  useCourseUserPermissions: jest.fn(),
}));

const mockPermissions = (overrides = {}) =>
  jest.mocked(useCourseUserPermissions).mockReturnValue({
    isLoading: false,
    isAuthzEnabled: true,
    canViewCertificates: true,
    canManageCertificates: true,
    ...overrides,
  } as ReturnType<typeof useCourseUserPermissions>);

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId="1">
      <CertificatesProvider>
        <EmptyCertificatesWithModes />
        <ComponentModeDisplay />
      </CertificatesProvider>
    </CourseAuthoringProvider>,
  );

describe('EmptyCertificatesWithModes', () => {
  beforeEach(() => {
    initializeMocks();
    mockWaffleFlags({ enableAuthzCourseAuthoring: false });
    mockPermissions();
  });

  it('renders correctly', () => {
    renderComponent();

    expect(screen.getByText(messages.noCertificatesText.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.setupCertificateBtn.defaultMessage })).toBeInTheDocument();
  });

  it('switches to create mode when the button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    expect(screen.getByTestId('component-mode')).toHaveTextContent(MODE_STATES.noModes);

    await user.click(screen.getByRole('button', { name: messages.setupCertificateBtn.defaultMessage }));

    expect(screen.getByTestId('component-mode')).toHaveTextContent(MODE_STATES.create);
  });

  it('hides add button in view-only mode', () => {
    mockPermissions({ canManageCertificates: false });
    renderComponent();

    expect(screen.getByText(messages.noCertificatesText.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.setupCertificateBtn.defaultMessage })).not
      .toBeInTheDocument();
  });
});
