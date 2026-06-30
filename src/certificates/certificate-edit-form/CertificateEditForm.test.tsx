import {
  render,
  screen,
  within,
  initializeMocks,
  userEvent,
} from '@src/testUtils';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { CertificatesProvider, useCertificatesContext } from '@src/certificates/context';

import { getCertificatesApiUrl, getUpdateCertificateApiUrl } from '../data/api';
import { certificatesDataMock } from '../__mocks__';
import { MODE_STATES } from '../data/constants';
import messagesDetails from '../certificate-details/messages';
import messages from '../messages';
import CertificateEditForm from './CertificateEditForm';

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
        <CertificateEditForm />
        <ComponentModeDisplay />
      </CertificatesProvider>
    </CourseAuthoringProvider>,
  );

describe('CertificateEditForm Component', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, certificatesDataMock);
  });

  it('submits the form with updated certificate details', async () => {
    const courseTitleOverrideValue = 'Updated Course Title';
    const newCertificateData = {
      ...certificatesDataMock,
      certificates: [{
        ...certificatesDataMock.certificates[0],
        courseTitle: courseTitleOverrideValue,
      }],
    };
    const user = userEvent.setup();
    renderComponent();

    const titleInput = await screen.findByPlaceholderText(
      messagesDetails.detailsCourseTitleOverride.defaultMessage,
    );
    await user.type(titleInput, courseTitleOverrideValue);

    axiosMock
      .onPost(getUpdateCertificateApiUrl(courseId, certificatesDataMock.certificates[0].id))
      .reply(200, newCertificateData);
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, newCertificateData);

    await user.click(screen.getByRole('button', { name: messages.saveTooltip.defaultMessage }));

    expect(screen.getByDisplayValue(
      certificatesDataMock.certificates[0].courseTitle + courseTitleOverrideValue,
    )).toBeInTheDocument();
  });

  it('deletes a certificate', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Wait for the initial data to load before setting up delete mocks
    await screen.findByRole('button', { name: messages.deleteTooltip.defaultMessage });

    axiosMock
      .onDelete(getUpdateCertificateApiUrl(courseId, certificatesDataMock.certificates[0].id))
      .reply(200);
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, { ...certificatesDataMock, certificates: [] });

    await user.click(screen.getByRole('button', { name: messages.deleteTooltip.defaultMessage }));

    const confirmDeleteModal = screen.getByRole('dialog');
    await user.click(within(confirmDeleteModal).getByRole('button', { name: messages.deleteTooltip.defaultMessage }));

    expect(screen.queryByTestId('certificates-edit-form')).not.toBeInTheDocument();
  });

  it('keeps certificate visible if delete fails', async () => {
    const user = userEvent.setup();
    renderComponent();

    await screen.findByRole('button', { name: messages.deleteTooltip.defaultMessage });

    axiosMock
      .onDelete(getUpdateCertificateApiUrl(courseId, certificatesDataMock.certificates[0].id))
      .reply(404);

    await user.click(screen.getByRole('button', { name: messages.deleteTooltip.defaultMessage }));

    const confirmDeleteModal = screen.getByRole('dialog');
    await user.click(within(confirmDeleteModal).getByRole('button', { name: messages.deleteTooltip.defaultMessage }));

    expect(screen.getByTestId('certificates-edit-form')).toBeInTheDocument();
  });

  it('cancel edit form sets mode to view', async () => {
    const user = userEvent.setup();
    renderComponent();

    await screen.findByRole('button', { name: messages.cardCancel.defaultMessage });

    await user.click(screen.getByRole('button', { name: messages.cardCancel.defaultMessage }));

    expect(screen.getByTestId('component-mode')).toHaveTextContent(MODE_STATES.view);
  });
});
