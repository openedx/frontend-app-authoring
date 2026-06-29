import {
  render,
  within,
  screen,
  initializeMocks,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { CertificatesProvider, useCertificatesContext } from '@src/certificates/context';
import { MODE_STATES } from '../data/constants';
import { getCertificatesApiUrl, getUpdateCertificateApiUrl } from '../data/api';
import { certificatesMock, certificatesDataMock } from '../__mocks__';
import signatoryMessages from '../certificate-signatories/messages';
import messages from '../messages';
import CertificatesList from './CertificatesList';

let axiosMock;
const courseId = 'course-123';

const ComponentModeDisplay = () => {
  const { componentMode } = useCertificatesContext();
  return <div data-testid="component-mode">{componentMode}</div>;
};

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <CertificatesProvider>
        <CertificatesList />
        <ComponentModeDisplay />
      </CertificatesProvider>
    </CourseAuthoringProvider>,
  );

describe('CertificatesList Component', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, {
        ...certificatesDataMock,
        certificates: certificatesMock,
      });
  });

  it('renders each certificate', async () => {
    renderComponent();

    for (const certificate of certificatesMock) {
      for (const signatory of certificate.signatories) {
        // eslint-disable-next-line no-await-in-loop
        expect(await screen.findByText(signatory.name)).toBeInTheDocument();
        expect(screen.getByText(signatory.title)).toBeInTheDocument();
        expect(screen.getByText(signatory.organization)).toBeInTheDocument();
      }
    }
  });

  it('update certificate', async () => {
    const user = userEvent.setup();
    renderComponent();

    const signatoryNameValue = 'Updated signatory name';
    const newCertificateData = {
      ...certificatesDataMock,
      certificates: [{
        ...certificatesMock[0],
        signatories: [{
          ...certificatesMock[0].signatories[0],
          name: signatoryNameValue,
        }],
      }],
    };

    const editButtons = await screen.findAllByLabelText(messages.editTooltip.defaultMessage);
    await user.click(editButtons[1]);

    const nameInput = screen.getByPlaceholderText(signatoryMessages.namePlaceholder.defaultMessage);
    await user.clear(nameInput);
    await user.type(nameInput, signatoryNameValue);

    axiosMock
      .onPost(getUpdateCertificateApiUrl(courseId, certificatesMock[0].id))
      .reply(200, newCertificateData);

    await user.click(screen.getByRole('button', { name: messages.saveTooltip.defaultMessage }));

    expect(screen.getByText(signatoryNameValue)).toBeInTheDocument();
  });

  it('toggle edit signatory', async () => {
    const user = userEvent.setup();
    renderComponent();

    const editButtons = await screen.findAllByLabelText(messages.editTooltip.defaultMessage);
    expect(editButtons.length).toBe(3);

    await user.click(editButtons[1]);

    expect(screen.getByPlaceholderText(signatoryMessages.namePlaceholder.defaultMessage)).toBeInTheDocument();

    await user.click(
      within(screen.getByTestId('signatory-form')).getByRole('button', { name: messages.cardCancel.defaultMessage }),
    );

    expect(screen.queryByPlaceholderText(signatoryMessages.namePlaceholder.defaultMessage)).not.toBeInTheDocument();
  });

  it('toggle certificate edit all', async () => {
    const user = userEvent.setup();
    renderComponent();

    const detailsSection = await screen.findByTestId('certificate-details');
    const editButton = within(detailsSection).getByLabelText(messages.editTooltip.defaultMessage);
    await user.click(editButton);

    expect(screen.getByTestId('component-mode')).toHaveTextContent(MODE_STATES.editAll);
  });
});
