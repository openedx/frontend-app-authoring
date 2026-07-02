import {
  render,
  screen,
  initializeMocks,
  userEvent,
} from '@src/testUtils';
import { CertificatesProvider, useCertificatesContext } from '@src/certificates/context';
import { MODE_STATES } from '../data/constants';
import messages from '../messages';
import EmptyCertificatesWithModes from './EmptyCertificatesWithModes';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';

const ComponentModeDisplay = () => {
  const { componentMode } = useCertificatesContext();
  return <div data-testid="component-mode">{componentMode}</div>;
};

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
});
