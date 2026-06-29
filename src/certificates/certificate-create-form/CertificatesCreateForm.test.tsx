import {
  render,
  screen,
  within,
  initializeMocks,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { CertificatesProvider, useCertificatesContext } from '@src/certificates/context';

import { getCertificatesApiUrl, getCertificateApiUrl } from '../data/api';
import { certificatesDataMock } from '../__mocks__';
import { MODE_STATES } from '../data/constants';
import detailsMessages from '../certificate-details/messages';
import signatoryMessages from '../certificate-signatories/messages';
import messages from '../messages';
import CertificateCreateForm from './CertificateCreateForm';

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
        <CertificateCreateForm />
        <ComponentModeDisplay />
      </CertificatesProvider>
    </CourseAuthoringProvider>,
  );

describe('CertificateCreateForm', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, {
        ...certificatesDataMock,
        certificates: [],
      });
  });

  it('renders with empty fields', async () => {
    renderComponent();

    expect(await screen.findByPlaceholderText(detailsMessages.detailsCourseTitleOverride.defaultMessage)).toHaveValue(
      '',
    );
    expect(screen.getByPlaceholderText(signatoryMessages.namePlaceholder.defaultMessage)).toHaveValue('');
    expect(screen.getByPlaceholderText(signatoryMessages.titlePlaceholder.defaultMessage)).toHaveValue('');
    expect(screen.getByPlaceholderText(signatoryMessages.organizationPlaceholder.defaultMessage)).toHaveValue('');
    expect(screen.getByPlaceholderText(signatoryMessages.imagePlaceholder.defaultMessage)).toHaveValue('');
  });

  it('creates a new certificate', async () => {
    const courseTitleOverrideValue = 'Create Course Title';
    const signatoryNameValue = 'Create signatory name';
    const newCertificateData = {
      ...certificatesDataMock,
      courseTitle: courseTitleOverrideValue,
      certificates: [{
        ...certificatesDataMock.certificates[0],
        signatories: [{
          ...certificatesDataMock.certificates[0].signatories[0],
          name: signatoryNameValue,
        }],
      }],
    };

    const user = userEvent.setup();
    renderComponent();

    await user.type(
      await screen.findByPlaceholderText(detailsMessages.detailsCourseTitleOverride.defaultMessage),
      courseTitleOverrideValue,
    );
    await user.type(
      screen.getByPlaceholderText(signatoryMessages.namePlaceholder.defaultMessage),
      signatoryNameValue,
    );

    axiosMock.onPost(getCertificateApiUrl(courseId)).reply(200, newCertificateData);
    axiosMock.onGet(getCertificatesApiUrl(courseId)).reply(200, newCertificateData);

    await user.click(screen.getByRole('button', { name: messages.cardCreate.defaultMessage }));

    expect(screen.getByDisplayValue(courseTitleOverrideValue)).toBeInTheDocument();
    expect(screen.getByDisplayValue(signatoryNameValue)).toBeInTheDocument();
  });

  it('cancel certificates creation', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(await screen.findByRole('button', { name: messages.cardCancel.defaultMessage }));

    expect(screen.getByTestId('component-mode')).toHaveTextContent(MODE_STATES.noCertificates);
  });

  it('there is no delete signatory button if signatories length is less than 2', async () => {
    renderComponent();

    await screen.findByPlaceholderText(signatoryMessages.namePlaceholder.defaultMessage);

    expect(screen.queryAllByRole('button', { name: messages.deleteTooltip.defaultMessage })).toHaveLength(0);
  });

  it('add and delete signatory', async () => {
    const user = userEvent.setup();
    const { queryAllByRole } = renderComponent();

    const addSignatoryBtn = await screen.findByText(signatoryMessages.addSignatoryButton.defaultMessage);
    await user.click(addSignatoryBtn);

    const deleteIcons = await screen.findAllByRole('button', { name: messages.deleteTooltip.defaultMessage });

    expect(deleteIcons.length).toBe(2);

    await user.click(deleteIcons[0]);

    const confirModal = screen.getByRole('dialog');
    const deleteModalButton = within(confirModal).getByRole('button', { name: messages.deleteTooltip.defaultMessage });

    await user.click(deleteIcons[0]);
    await user.click(deleteModalButton);

    expect(queryAllByRole('button', { name: messages.deleteTooltip.defaultMessage }).length).toBe(0);
  });
});
